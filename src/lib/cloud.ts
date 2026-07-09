import JSZip from 'jszip';
import { db } from './db';
import initSqlJs from 'sql.js';

// Local WASM path for maximum reliability in private environments
const SQL_WASM_PATH = '/sql-wasm.wasm';
const SQL_WASM_CDN_PATH = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.1/sql-wasm.wasm';
export const MAX_BACKUP_ZIP_SIZE = 1024 * 1024 * 1024;
export const MAX_BACKUP_ENTRIES = 2000;
export const MAX_DB_SIZE = 200 * 1024 * 1024;
export const MAX_CONFIG_SIZE = 2560 * 1024;
export const MAX_COVER_SIZE = 100 * 1024 * 1024;
export const MAX_RESTORE_GAMES = 20000;

export class CloudSync {
  static async getSQL() {
    try {
      return await initSqlJs({
        locateFile: () => SQL_WASM_PATH
      });
    } catch (err) {
      console.error('SQL WASM Loading failed:', err);
      try {
        return await initSqlJs({
          locateFile: () => SQL_WASM_CDN_PATH
        });
      } catch (fallbackErr) {
        console.error('SQL WASM CDN fallback failed:', fallbackErr);
        throw new Error('SQL_WASM_LOAD_FAILED', { cause: fallbackErr });
      }
    }
  }

  static async exportToZip(projectId: string, config: unknown) {
    const zip = new JSZip();
    const SQL = await this.getSQL();
    const sqlDb = new SQL.Database();
    
    sqlDb.run(`
      CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        score INTEGER NOT NULL,
        comment TEXT,
        vndb_url TEXT,
        cover_image_path TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    const games = await db.games.where('projectId').equals(projectId).toArray();
    const dataFolder = zip.folder("data")!;
    const coversFolder = dataFolder.folder("covers")!;

    for (const game of games) {
      const coverPath = game.coverImage ? `data/covers/${game.vndbId || crypto.randomUUID()}.jpg` : "";
      sqlDb.run(`
        INSERT INTO games (title, score, comment, vndb_url, cover_image_path, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [game.title, game.score, game.comment, game.vndbId ? `https://vndb.org/${game.vndbId}` : "", coverPath, game.createdAt, game.updatedAt]);

      if (game.coverImage) {
        coversFolder.file(coverPath.split('/').pop()!, game.coverImage);
      }
    }

    const dbData = sqlDb.export();
    dataFolder.file("vnlist.db", dbData);
    dataFolder.file("config.json", JSON.stringify(config, null, 2));

    return await zip.generateAsync({ type: "blob" });
  }

  static async importFromZip(blob: Blob) {
    if (blob.size > MAX_BACKUP_ZIP_SIZE) {
      throw new Error("INVALID_BACKUP: Backup file is too large");
    }

    const zip = await JSZip.loadAsync(blob);
    if (Object.keys(zip.files).length > MAX_BACKUP_ENTRIES) {
      throw new Error("INVALID_BACKUP: Too many files in backup");
    }
    
    let dbFile = zip.file("data/vnlist.db") || zip.file("vnlist.db");
    const configFile = zip.file("data/config.json") || zip.file("config.json");
    
    if (!dbFile) {
        const dbFiles = zip.file(/\.db$/);
        if (dbFiles.length > 0) dbFile = dbFiles[0];
    }

    if (!dbFile) throw new Error("INVALID_BACKUP: No database file found");

    const SQL = await this.getSQL();
    const dbBuffer = await dbFile.async("uint8array");
    
    if (dbBuffer.length === 0) throw new Error("INVALID_BACKUP: Database file is empty");
    if (dbBuffer.length > MAX_DB_SIZE) throw new Error("INVALID_BACKUP: Database file is too large");
    
    const sqlDb = new SQL.Database(dbBuffer);
    
    let config = { colors: {}, language: "ko", theme: "dark", bg_color: "#121212" };
    if (configFile) {
      try {
        const configStr = await configFile.async("string");
        if (new TextEncoder().encode(configStr).length > MAX_CONFIG_SIZE) {
          throw new Error("Config file is too large");
        }
        config = { ...config, ...JSON.parse(configStr) };
      } catch (e) { console.error("Config parse error", e); }
    }

    const newProjectId = crypto.randomUUID();
    return { sqlDb, config, newProjectId, zip };
  }
}

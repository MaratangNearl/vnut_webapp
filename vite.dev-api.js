const TARGET_VNDB_URL = 'https://api.vndb.org/kana/vn';
const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED_IMAGE_HOSTS = new Set(['t.vndb.org']);
const ALLOWED_FIELDS = 'title, alttitle, image.url';

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    ...headers,
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error('REQUEST_BODY_TOO_LARGE');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function isValidVndbBody(body) {
  if (body?.fields !== ALLOWED_FIELDS) return false;
  if (!Array.isArray(body.filters) || body.filters.length !== 3) return false;
  const [field, operator, value] = body.filters;
  return field === 'id' && operator === '=' && typeof value === 'string' && /^v\d+$/.test(value);
}

async function handleVndb(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 204, '', { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return;
  }

  if (req.method !== 'POST') {
    send(res, 405, 'Method Not Allowed');
    return;
  }

  let bodyText;
  try {
    bodyText = await readBody(req);
    const body = JSON.parse(bodyText);
    if (!isValidVndbBody(body)) {
      send(res, 400, 'Invalid VNDB request');
      return;
    }
  } catch (err) {
    send(res, err instanceof SyntaxError ? 400 : 413, err instanceof SyntaxError ? 'Invalid JSON' : 'Request body too large');
    return;
  }

  try {
    const response = await fetch(TARGET_VNDB_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyText,
    });
    const text = await response.text();
    send(res, response.status, text, { 'Content-Type': response.headers.get('Content-Type') || 'application/json' });
  } catch {
    send(res, 500, 'VNDB API Proxy Error');
  }
}

async function handleImage(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 204, '', { 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return;
  }

  if (req.method !== 'GET' || !req.url) {
    send(res, 405, 'Method Not Allowed');
    return;
  }

  const requestUrl = new URL(req.url, 'http://localhost');
  const imageUrl = requestUrl.searchParams.get('url');
  if (!imageUrl) {
    send(res, 400, 'Missing image URL');
    return;
  }

  let parsedImageUrl;
  try {
    parsedImageUrl = new URL(imageUrl);
  } catch {
    send(res, 400, 'Invalid image URL');
    return;
  }

  if (parsedImageUrl.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.has(parsedImageUrl.hostname)) {
    send(res, 400, 'Image host is not allowed');
    return;
  }

  try {
    const response = await fetch(parsedImageUrl);
    const contentType = response.headers.get('Content-Type') || '';
    if (!response.ok || !contentType.toLowerCase().startsWith('image/')) {
      send(res, 502, 'Invalid image response');
      return;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    send(res, response.status, imageBuffer, { 'Content-Type': contentType });
  } catch {
    send(res, 500, 'Image Proxy Error');
  }
}

export function devApiPlugin() {
  return {
    name: 'vnut-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/vndb', (req, res) => {
        void handleVndb(req, res);
      });
      server.middlewares.use('/api/image', (req, res) => {
        void handleImage(req, res);
      });
    },
  };
}

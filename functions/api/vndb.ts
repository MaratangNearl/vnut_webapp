const TARGET_URL = "https://api.vndb.org/kana/vn";
const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED_ORIGINS = new Set([
  "https://vnut.yohane-aqours.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
const ALLOWED_FIELDS = "title, alttitle, image.url";

type VndbRequestBody = {
  filters?: unknown;
  fields?: unknown;
};

function withCors(request: Request, response: Response) {
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

function isValidVndbBody(body: VndbRequestBody) {
  if (body.fields !== ALLOWED_FIELDS) return false;
  if (!Array.isArray(body.filters) || body.filters.length !== 3) return false;
  const [field, operator, value] = body.filters;
  return field === "id" && operator === "=" && typeof value === "string" && /^v\d+$/.test(value);
}

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "OPTIONS") {
    return withCors(context.request, new Response(null, { status: 204 }));
  }

  if (context.request.method !== "POST") {
    return withCors(context.request, new Response("Method Not Allowed", { status: 405 }));
  }

  const contentLength = Number(context.request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return withCors(context.request, new Response("Request body too large", { status: 413 }));
  }


  // 1. Clone request to read body for Cache Key without consuming the main stream
  const clonedRequestForBody = context.request.clone();
  let bodyText: string;
  try {
    bodyText = await clonedRequestForBody.text();
  } catch {
    return withCors(context.request, new Response("Invalid request body", { status: 400 }));
  }

  if (new TextEncoder().encode(bodyText).length > MAX_BODY_BYTES) {
    return withCors(context.request, new Response("Request body too large", { status: 413 }));
  }

  try {
    const body = JSON.parse(bodyText) as VndbRequestBody;
    if (!isValidVndbBody(body)) {
      return withCors(context.request, new Response("Invalid VNDB request", { status: 400 }));
    }
  } catch {
    return withCors(context.request, new Response("Invalid JSON", { status: 400 }));
  }

  // 2. Generate a unique hash for the request body (since it's a POST request)
  let bodyHash = "default";
  if (bodyText) {
    const msgBuffer = new TextEncoder().encode(bodyText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    bodyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // 3. Create a GET request as the Cache Key
  const cacheUrl = new URL(context.request.url);
  cacheUrl.pathname = `${cacheUrl.pathname}/${bodyHash}`;
  const cacheKey = new Request(cacheUrl.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });

  const cache = caches.default;

  // 4. Try to fetch from Cloudflare Cache API
  try {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      // Create a new response from the cached one to append custom X-Cache header
      const newResponse = new Response(cachedResponse.body, cachedResponse);
      newResponse.headers.set("X-Cache", "HIT");
      return withCors(context.request, newResponse);
    }
  } catch (cacheErr) {
    console.error("Cache Match Error:", cacheErr);
  }

  // 5. If Cache Miss, fetch from origin (VNDB)
  // Create a new request to VNDB
  const newRequest = new Request(TARGET_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: bodyText, // Use the body string we already extracted
  });

  try {
    const response = await fetch(newRequest);

    // We only cache successful 200 OK responses
    if (response.ok) {
      const responseToCache = new Response(response.clone().body, response);
      // Set Cache-Control header so Cloudflare knows to cache it
      // s-maxage=2592000 caches at CDN edge for 30 days
      responseToCache.headers.set("Cache-Control", "public, s-maxage=2592000, max-age=2592000");

      try {
        // Store in cache
        context.waitUntil(cache.put(cacheKey, responseToCache));
      } catch (cachePutErr) {
        console.error("Cache Put Error:", cachePutErr);
      }
    }

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Cache", "MISS");
    return withCors(context.request, newResponse);
  } catch {
    return withCors(context.request, new Response("VNDB API Proxy Error", { status: 500 }));
  }
};

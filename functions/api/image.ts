const ALLOWED_IMAGE_HOSTS = new Set(["t.vndb.org"]);
const ALLOWED_ORIGINS = new Set([
  "https://vnut.yohane-aqours.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function withCors(request: Request, response: Response) {
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "OPTIONS") {
    return withCors(context.request, new Response(null, { status: 204 }));
  }

  if (context.request.method !== "GET") {
    return withCors(context.request, new Response("Method Not Allowed", { status: 405 }));
  }

  const url = new URL(context.request.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return withCors(context.request, new Response("Missing image URL", { status: 400 }));
  }

  let parsedImageUrl: URL;
  try {
    parsedImageUrl = new URL(imageUrl);
  } catch {
    return withCors(context.request, new Response("Invalid image URL", { status: 400 }));
  }

  if (parsedImageUrl.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(parsedImageUrl.hostname)) {
    return withCors(context.request, new Response("Image host is not allowed", { status: 400 }));
  }

  try {
    const response = await fetch(parsedImageUrl.toString());
    const contentType = response.headers.get("Content-Type") || "";
    if (!response.ok || !contentType.toLowerCase().startsWith("image/")) {
      return withCors(context.request, new Response("Invalid image response", { status: 502 }));
    }

    const newResponse = new Response(response.body, response);
    return withCors(context.request, newResponse);
  } catch {
    return withCors(context.request, new Response("Image Proxy Error", { status: 500 }));
  }
};

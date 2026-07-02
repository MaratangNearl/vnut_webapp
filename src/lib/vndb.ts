type VndbResponse = {
  results?: Array<{
    title: string;
    alttitle?: string;
    image?: {
      url?: string;
    };
  }>;
};

export async function fetchVnInfo(vnId: string) {
  const response = await fetch("/api/vndb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filters: ["id", "=", vnId],
      fields: "title, alttitle, image.url"
    })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message ? `Failed to fetch VN info: ${message}` : "Failed to fetch VN info");
  }
  const data = await response.json() as VndbResponse;

  if (data.results && data.results.length > 0) {
    const vn = data.results[0];
    let imageBlob: Blob | undefined;

    if (vn.image?.url) {
      // Use image proxy
      const imgResp = await fetch(`/api/image?url=${encodeURIComponent(vn.image.url)}`);
      if (imgResp.ok) {
        imageBlob = await imgResp.blob();
      }
    }

    return {
      title: vn.title,
      alttitle: vn.alttitle,
      imageBlob
    };
  }

  throw new Error("VN not found");
}

import { createPublicClient } from "@/utils/supabase/public";

export const runtime = "nodejs";

type MediaRow = {
  image_url: string | null;
  media_type?: string | null;
};

function decodeDataUrl(url: string) {
  const commaIndex = url.indexOf(",");
  if (!url.startsWith("data:") || commaIndex < 0) return null;

  const metadata = url.slice(5, commaIndex);
  const payload = url.slice(commaIndex + 1);
  const [mimeType = "application/octet-stream"] = metadata.split(";");
  const body = metadata.includes(";base64") ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload));

  return { body, mimeType };
}

function mediaResponse(request: Request, url: string) {
  if (url.startsWith("data:")) {
    const decoded = decodeDataUrl(url);
    if (!decoded) return new Response("Invalid media", { status: 400 });

    return new Response(decoded.body, {
      headers: {
        "Content-Type": decoded.mimeType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  const target = new URL(url, request.url);
  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      Location: target.toString(),
    },
  });
}

async function getProductMedia(productId: string, index: number): Promise<MediaRow | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("image_url, media_type")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .range(index, index)
    .maybeSingle();

  if (error || !data) return null;
  return data as MediaRow;
}

async function getBlogMedia(blogId: string, index: number): Promise<MediaRow | null> {
  const supabase = createPublicClient();
  const galleryResult = await supabase
    .from("blog_images")
    .select("image_url")
    .eq("blog_id", blogId)
    .order("sort_order", { ascending: true })
    .range(index, index)
    .maybeSingle();

  if (!galleryResult.error && galleryResult.data) return galleryResult.data as MediaRow;
  if (index !== 0) return null;

  const { data, error } = await supabase
    .from("blogs")
    .select("image_url")
    .eq("id", blogId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as MediaRow;
}

export async function GET(request: Request, { params }: { params: Promise<{ kind: string; id: string; index: string }> }) {
  const { kind, id, index } = await params;
  const mediaIndex = Number(index);

  if (!Number.isInteger(mediaIndex) || mediaIndex < 0) {
    return new Response("Invalid media index", { status: 400 });
  }

  const media = kind === "product"
    ? await getProductMedia(id, mediaIndex)
    : kind === "blog"
      ? await getBlogMedia(id, mediaIndex)
      : null;

  if (!media?.image_url) return new Response("Media not found", { status: 404 });

  return mediaResponse(request, media.image_url);
}

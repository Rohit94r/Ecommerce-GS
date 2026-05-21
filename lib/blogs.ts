import { unstable_cache } from "next/cache";
import { blogMediaRoute, isDataUrl } from "@/lib/media";
import type { Blog } from "@/types";
import { createPublicClient } from "@/utils/supabase/public";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
  blog_images?: BlogImageRow[] | null;
};

type BlogImageRow = {
  image_url: string;
  sort_order: number | null;
};

const defaultImage = "/media/Home-banner2.png";
const blogsCache = {
  revalidate: 60,
  tags: ["blogs"],
};

function mapBlog(row: BlogRow): Blog {
  const images = (row.blog_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image, index) => (isDataUrl(image.image_url) ? blogMediaRoute(row.id, index) : image.image_url))
    .filter(Boolean);
  const fallbackImage = row.image_url ? (isDataUrl(row.image_url) ? blogMediaRoute(row.id, 0) : row.image_url) : defaultImage;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    image: images[0] ?? fallbackImage,
    images: images.length ? images : [fallbackImage],
    created_at: row.created_at,
  };
}

async function selectPublishedBlogs() {
  const supabase = createPublicClient();
  const result = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, content, image_url, created_at, blog_images(image_url, sort_order)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (!result.error) return result;

  return supabase
    .from("blogs")
    .select("id, title, slug, excerpt, content, image_url, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
}

async function selectPublishedBlog(slug: string) {
  const supabase = createPublicClient();
  const result = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, content, image_url, created_at, blog_images(image_url, sort_order)")
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (!result.error) return result;

  return supabase
    .from("blogs")
    .select("id, title, slug, excerpt, content, image_url, created_at")
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();
}

async function fetchPublishedBlogs() {
  try {
    const { data, error } = await selectPublishedBlogs();

    if (error || !data) return [];
    return (data as BlogRow[]).map(mapBlog);
  } catch {
    return [];
  }
}

async function fetchPublishedBlog(slug: string) {
  try {
    const { data, error } = await selectPublishedBlog(slug);

    if (error || !data) return null;
    return mapBlog(data as BlogRow);
  } catch {
    return null;
  }
}

export const getPublishedBlogs = unstable_cache(fetchPublishedBlogs, ["published-blogs"], blogsCache);
export const getPublishedBlog = unstable_cache(fetchPublishedBlog, ["published-blog"], blogsCache);

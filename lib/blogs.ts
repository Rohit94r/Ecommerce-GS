import { createClient } from "@/utils/supabase/server";
import type { Blog } from "@/types";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

const defaultImage = "/media/Home-banner2.png";

function mapBlog(row: BlogRow): Blog {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    image: row.image_url ?? defaultImage,
    created_at: row.created_at,
  };
}

export async function getPublishedBlogs() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, content, image_url, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as BlogRow[]).map(mapBlog);
  } catch {
    return [];
  }
}

export async function getPublishedBlog(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, content, image_url, created_at")
      .eq("is_published", true)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapBlog(data as BlogRow);
  } catch {
    return null;
  }
}

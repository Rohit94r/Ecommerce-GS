import { testimonials } from "@/lib/dummyData";
import { createClient } from "@/utils/supabase/server";
import type { GoogleReview } from "@/types";

type GoogleReviewRow = {
  id: string;
  reviewer_name: string;
  area: string | null;
  rating: number | string;
  review: string;
  source: string | null;
  is_featured: boolean | null;
  created_at: string;
};

function fallbackReviews(): GoogleReview[] {
  return testimonials.map((testimonial) => ({
    id: testimonial.id,
    reviewer_name: testimonial.name,
    area: testimonial.area,
    rating: testimonial.rating,
    review: testimonial.quote,
    source: "Google",
    is_featured: true,
    created_at: new Date().toISOString(),
  }));
}

function mapReview(row: GoogleReviewRow): GoogleReview {
  return {
    id: row.id,
    reviewer_name: row.reviewer_name,
    area: row.area ?? "Mumbai",
    rating: Number(row.rating),
    review: row.review,
    source: row.source ?? "Google",
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at,
  };
}

export async function getFeaturedGoogleReviews() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("google_reviews")
      .select("id, reviewer_name, area, rating, review, source, is_featured, created_at")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data?.length) return fallbackReviews();

    return (data as GoogleReviewRow[]).map(mapReview);
  } catch {
    return fallbackReviews();
  }
}

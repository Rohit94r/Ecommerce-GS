import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/BlogCard";
import { SiteShell } from "@/components/layout/SiteShell";
import { blogs } from "@/lib/dummyData";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides for medical equipment Mumbai, wheelchair on rent Mumbai and oxygen cylinder Mumbai decisions.",
};

export default function BlogPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#047068]">Healthcare guides</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">Blog</h1>
          <p className="mt-3 max-w-2xl text-slate-600">SEO-friendly educational content for home care, rentals and equipment planning.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

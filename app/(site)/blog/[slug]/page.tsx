import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { getBlog } from "@/lib/dummyData";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlog(slug);
  return {
    title: blog ? blog.title : "Blog",
    description: blog?.excerpt ?? "Healthcare equipment guide from Gargi Surgical & Healthcare.",
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = getBlog(slug);
  if (!blog) notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#047068]">
          {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950 md:text-5xl">{blog.title}</h1>
        <p className="mt-4 text-xl leading-8 text-slate-600">{blog.excerpt}</p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-md bg-slate-100 shadow-sm">
          <Image src={blog.image} alt={blog.title} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
        </div>
        <div className="mt-8 max-w-none text-lg leading-9 text-slate-700">
          <p>{blog.content}</p>
        </div>
      </article>
    </SiteShell>
  );
}

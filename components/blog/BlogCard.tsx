import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/types";

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blog/${blog.slug}`}>
        <div className="relative aspect-[16/10] bg-slate-100">
          <Image src={blog.image} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        </div>
      </Link>
      <div className="p-5">
        <p className="text-sm font-bold text-[#047068]">{new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        <Link href={`/blog/${blog.slug}`}>
          <h2 className="mt-2 text-xl font-black text-slate-950 transition hover:text-[#047068]">{blog.title}</h2>
        </Link>
        <p className="mt-3 text-sm leading-6 text-slate-600">{blog.excerpt}</p>
      </div>
    </article>
  );
}

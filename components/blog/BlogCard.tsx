import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/types";

export function BlogCard({ blog, priority = false }: { blog: Blog; priority?: boolean }) {
  const images = blog.images?.length ? blog.images : [blog.image];
  const coverImage = images[0];

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#047068]/10">
      <Link href={`/blog/${blog.slug}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image src={coverImage} alt={blog.title} fill priority={priority && !coverImage.startsWith("data:")} unoptimized={coverImage.startsWith("data:")} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 ease-out group-hover:scale-105" />
          {images.length > 1 ? (
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              {images.slice(1, 4).map((image, index) => (
                <span key={`${image}-${index}`} className="relative h-11 w-11 overflow-hidden rounded-md border border-white/80 bg-white shadow-sm">
                  <Image src={image} alt={`${blog.title} preview ${index + 2}`} fill unoptimized={image.startsWith("data:")} sizes="44px" className="object-cover" />
                </span>
              ))}
              <span className="ml-auto rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#047068] shadow-sm">
                {images.length} photos
              </span>
            </div>
          ) : null}
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

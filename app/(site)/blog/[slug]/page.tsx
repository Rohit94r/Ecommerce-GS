import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { getPublishedBlog } from "@/lib/blogs";

function isDataUrl(url: string) {
  return url.startsWith("data:");
}

function looksLikeHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

function BlogContent({ content }: { content: string }) {
  const className = "mt-8 max-w-none text-lg leading-9 text-slate-700 [&_a]:font-bold [&_a]:text-[#047068] [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-black [&_li]:mb-2 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_strong]:font-black [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6";

  if (looksLikeHtml(content)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <div className={`${className} whitespace-pre-line`}>{content}</div>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublishedBlog(slug);
  return {
    title: blog ? blog.title : "Blog",
    description: blog?.excerpt ?? "Healthcare equipment guide from Gargi Surgical & Healthcare.",
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getPublishedBlog(slug);
  if (!blog) notFound();
  const images = blog.images?.length ? blog.images : [blog.image];
  const heroImage = images[0];

  return (
    <SiteShell>
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#047068]">
          {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950 md:text-5xl">{blog.title}</h1>
        <p className="mt-4 text-xl leading-8 text-slate-600">{blog.excerpt}</p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-md bg-slate-100 shadow-sm">
          <Image src={heroImage} alt={blog.title} fill priority={!isDataUrl(heroImage)} unoptimized={isDataUrl(heroImage)} sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
        </div>
        {images.length > 1 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {images.slice(1).map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                <Image src={image} alt={`${blog.title} photo ${index + 2}`} fill unoptimized={isDataUrl(image)} sizes="(max-width: 640px) 100vw, 280px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
        <BlogContent content={blog.content} />
      </article>
    </SiteShell>
  );
}

import { AdminFormCard } from "@/components/dashboard/AdminFormCard";
import { AdminTable } from "@/components/dashboard/AdminTable";
import { blogs } from "@/lib/dummyData";

export default function AdminBlogsPage() {
  return (
    <>
      <AdminTable
        title="Blogs"
        headers={["Title", "Slug", "Created"]}
        rows={blogs.map((blog) => [blog.title, blog.slug, blog.created_at])}
      />
      <AdminFormCard title="Blog form UI" />
    </>
  );
}

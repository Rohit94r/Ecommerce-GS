import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function AdminFormCard({ title }: { title: string }) {
  return (
    <div className="mt-6 rounded-md border border-[#047068]/15 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input placeholder="Name or title" />
        <Input placeholder="Price / status" />
        <Textarea className="md:col-span-2" placeholder="Description or notes" />
      </div>
      <Button className="mt-5">Save draft</Button>
    </div>
  );
}

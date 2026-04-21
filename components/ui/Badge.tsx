import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "green",
  className,
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "red" | "slate";
  className?: string;
}) {
  const tones = {
    green: "bg-[#047068]/10 text-[#047068]",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}

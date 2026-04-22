export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#047068]">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">{title}</h2>
      {description ? <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}

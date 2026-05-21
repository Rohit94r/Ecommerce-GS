export function OutOfStockWatermark({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-white/55">
      <span className="-rotate-12 rounded-lg border-2 border-red-500/70 bg-white/90 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-red-600 shadow-sm">
        Out of Stock
      </span>
    </div>
  );
}

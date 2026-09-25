/**
 * CastSkeleton - Placeholder hiển thị trong fallback của <Suspense> khi CastList đang fetch
 * Kích thước phải khớp 100% với CastList thật để tránh CLS (Cumulative Layout Shift = 0)
 */
export default function CastSkeleton() {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="w-24 sm:w-28 shrink-0 space-y-1.5 animate-pulse"
        >
          <div className="w-24 sm:w-28 aspect-[3/4] rounded-md bg-zinc-800" />
          <div className="h-3 bg-zinc-700 rounded w-5/6 mx-auto" />
          <div className="h-2.5 bg-zinc-800 rounded w-4/6 mx-auto" />
        </div>
      ))}
    </div>
  );
}

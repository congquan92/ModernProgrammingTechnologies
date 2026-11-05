/**
 * CastSkeleton - Placeholder hiển thị trong fallback của <Suspense> khi CastList đang fetch
 * Giữ kích thước ảnh và hai dòng chữ như CastSlider khi có dữ liệu.
 */
export default function CastSkeleton() {
  return (
    <div data-stream="cast-fallback" aria-hidden="true" className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="w-28 sm:w-32 shrink-0 space-y-1.5 animate-pulse"
        >
          <div className="w-28 sm:w-32 aspect-[3/4] rounded-md bg-zinc-800" />
          <div className="h-4 bg-zinc-700 rounded w-5/6 mx-auto" />
          <div className="h-[15px] bg-zinc-800 rounded w-4/6 mx-auto" />
        </div>
      ))}
    </div>
  );
}

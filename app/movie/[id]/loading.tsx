/**
 * MovieDetailLoading (loading.tsx) - Skeleton hiển thị tức thì khi người dùng bấm chuyển sang trang chi tiết
 * Next.js App Router kích hoạt tự động ở cấp độ route segment (Tầng 1B)
 */
export default function MovieDetailLoading() {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Skeleton Backdrop Banner */}
      <div className="w-full h-[40vh] sm:h-[50vh] bg-zinc-900 animate-pulse" />

      <div className="container mx-auto px-4 sm:px-12 pb-16">
        <div className="flex flex-col md:flex-row gap-8 -mt-24 sm:-mt-36 relative z-10 animate-pulse">
          {/* Skeleton Poster aspect-[2/3] */}
          <div className="w-48 sm:w-64 md:w-72 lg:w-80 aspect-[2/3] shrink-0 rounded-md bg-zinc-800 self-start mx-auto md:mx-0 shadow-2xl" />

          {/* Skeleton Thông tin chi tiết */}
          <div className="flex-1 space-y-4 md:pt-16 py-2">
            <div className="h-10 bg-zinc-700 rounded w-3/4" />
            <div className="h-5 bg-zinc-800 rounded w-1/2" />
            <div className="flex gap-3 pt-1">
              <div className="h-7 w-24 bg-zinc-800 rounded" />
              <div className="h-7 w-20 bg-zinc-800 rounded" />
              <div className="h-7 w-28 bg-zinc-800 rounded" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-20 bg-zinc-800 rounded-full" />
              <div className="h-6 w-24 bg-zinc-800 rounded-full" />
              <div className="h-6 w-16 bg-zinc-800 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-zinc-800 rounded w-full" />
              <div className="h-4 bg-zinc-800 rounded w-5/6" />
              <div className="h-4 bg-zinc-800 rounded w-4/6" />
            </div>
          </div>
        </div>

        {/* Skeleton Cast Section */}
        <div className="mt-12 space-y-4">
          <div className="h-7 bg-zinc-800 rounded w-44 animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-24 sm:w-28 shrink-0 space-y-2 animate-pulse">
                <div className="aspect-[3/4] bg-zinc-800 rounded-md" />
                <div className="h-3 bg-zinc-700 rounded w-4/5 mx-auto" />
                <div className="h-2.5 bg-zinc-800 rounded w-3/5 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

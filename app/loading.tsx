import MovieCardSkeleton from "@/components/server/MovieCardSkeleton";

function SkeletonSection({ titleWidth = "w-64" }: { titleWidth?: string }) {
  return (
    <div className="space-y-5 animate-pulse">
      <div className={`h-8 ${titleWidth} bg-gray-800 rounded-md`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * HomeLoading (app/loading.tsx) - Tự động được Next.js App Router kích hoạt (Tầng 1B)
 * Hiển thị skeleton tức thì trong khi Server Component page.tsx đang fetch dữ liệu từ TMDB
 */
export default function HomeLoading() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-72 sm:h-96 rounded-2xl bg-gray-900/80 border border-gray-800 animate-pulse flex flex-col justify-end p-8 space-y-4">
        <div className="h-6 w-32 bg-yellow-500/20 rounded" />
        <div className="h-10 w-3/4 sm:w-1/2 bg-gray-700/80 rounded" />
        <div className="h-4 w-full sm:w-2/3 bg-gray-800 rounded" />
      </div>

      {/* Sections Skeleton */}
      <SkeletonSection titleWidth="w-72" />
      <SkeletonSection titleWidth="w-60" />
      <SkeletonSection titleWidth="w-80" />
    </main>
  );
}

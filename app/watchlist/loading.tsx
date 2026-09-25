export default function WatchlistLoading() {
    return (
        <div className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-12">
                {/* Header skeleton */}
                <div className="mb-8 space-y-2 border-b border-zinc-800 pb-5 animate-pulse">
                    <div className="h-9 bg-zinc-800 rounded w-60" />
                    <div className="h-4 bg-zinc-800/60 rounded w-36" />
                </div>

                {/* Grid cards skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-zinc-800 rounded-md animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

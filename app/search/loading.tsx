export default function SearchLoading() {
    return (
        <div className="min-h-screen bg-[#141414] pt-28 pb-20">
            <div className="container mx-auto px-4 sm:px-12">
                {/* Header skeleton */}
                <div className="mb-8 space-y-2 animate-pulse">
                    <div className="h-9 bg-zinc-800 rounded w-64" />
                    <div className="h-5 bg-zinc-800/60 rounded w-80" />
                </div>

                {/* SearchBar skeleton */}
                <div className="mb-10">
                    <div className="w-full max-w-2xl h-[52px] bg-[#242424] rounded-md animate-pulse" />
                </div>

                {/* Grid cards skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-zinc-800 rounded-md animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

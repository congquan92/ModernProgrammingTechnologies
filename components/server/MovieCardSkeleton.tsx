/**
 * MovieCardSkeleton - Khung xương loading cho MovieCard
 * Giữ tỷ lệ poster và chiều cao caption như MovieCard.
 */
export default function MovieCardSkeleton() {
    return (
        <div aria-hidden="true" className="overflow-hidden rounded-md bg-[#181818] animate-pulse">
            {/* Khung poster aspect-[2/3] */}
            <div className="aspect-[2/3] w-full bg-[#202020]" />

            {/* Dòng chữ skeleton */}
            <div className="p-2 sm:p-2.5 space-y-1">
                <div className="text-xs sm:text-sm font-bold bg-zinc-700 rounded w-4/5">&nbsp;</div>
                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                    <span className="bg-zinc-800 rounded w-1/4">&nbsp;</span>
                    <span className="border border-zinc-700 px-1 rounded text-[9px] bg-zinc-800 w-1/3">&nbsp;</span>
                </div>
            </div>
        </div>
    );
}

/**
 * MovieCardSkeleton - Khung xương loading cho MovieCard
 * Đảm bảo kích thước trùng khớp 100% với MovieCard thực tế để tránh nhảy giật giao diện (CLS = 0)
 */
export default function MovieCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl bg-gray-900/60 border border-gray-800 animate-pulse">
            {/* Khung poster aspect-[2/3] */}
            <div className="aspect-[2/3] w-full bg-gray-800/80" />

            {/* Dòng chữ skeleton */}
            <div className="p-3.5 space-y-2.5">
                <div className="h-4 bg-gray-700/80 rounded w-4/5" />
                <div className="flex justify-between items-center pt-1">
                    <div className="h-3 bg-gray-800 rounded w-1/4" />
                    <div className="h-3 bg-gray-800 rounded w-1/3" />
                </div>
            </div>
        </div>
    );
}

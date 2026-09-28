export interface FilterItem {
    id: string;
    label: string;
}

export const MOVIE_GENRES: FilterItem[] = [
    { id: "28", label: "Hành Động" },
    { id: "10749", label: "Tình Cảm" },
    { id: "35", label: "Hài Hước" },
    { id: "36", label: "Cổ Trang" },
    { id: "18", label: "Tâm Lý" },
    { id: "80", label: "Hình Sự" },
    { id: "10752", label: "Chiến Tranh" },
    { id: "10751", label: "Gia Đình" },
    { id: "878", label: "Viễn Tưởng" },
    { id: "12", label: "Phiêu Lưu" },
    { id: "27", label: "Kinh Dị" },
    { id: "10402", label: "Âm Nhạc" },
    { id: "14", label: "Thần Thoại" },
    { id: "99", label: "Tài Liệu" },
    { id: "9648", label: "Bí Ẩn" },
    { id: "53", label: "Giật Gân / Gây Cấn" },
    { id: "16", label: "Anime & Hoạt Hình" },
    { id: "10770", label: "Phim Chiếu TV" },
    { id: "37", label: "Miền Tây" },
    { id: "classic", label: "Kinh Điển" },
    { id: "tv", label: "TV Shows" },
];

export const COUNTRIES: FilterItem[] = [
    { id: "US", label: "Âu Mỹ" },
    { id: "KR", label: "Hàn Quốc" },
    { id: "CN", label: "Trung Quốc" },
    { id: "JP", label: "Nhật Bản" },
    { id: "TH", label: "Thái Lan" },
    { id: "VN", label: "Việt Nam" },
    { id: "TW", label: "Đài Loan" },
    { id: "HK", label: "Hồng Kông" },
    { id: "IN", label: "Ấn Độ" },
    { id: "GB", label: "Anh" },
    { id: "FR", label: "Pháp" },
    { id: "CA", label: "Canada" },
];

export const YEARS: FilterItem[] = [
    { id: "2026", label: "Năm 2026" },
    { id: "2025", label: "Năm 2025" },
    { id: "2024", label: "Năm 2024" },
    { id: "2023", label: "Năm 2023" },
    { id: "2022", label: "Năm 2022" },
    { id: "2021", label: "Năm 2021" },
    { id: "2020", label: "Năm 2020" },
    { id: "2019", label: "Năm 2019" },
    { id: "2018", label: "Năm 2018" },
    { id: "2017", label: "Năm 2017" },
    { id: "2016", label: "Năm 2016" },
    { id: "2015", label: "Năm 2015" },
    { id: "before-2015", label: "Trước Năm 2015" },
];

export const SORT_OPTIONS: FilterItem[] = [
    { id: "popularity.desc", label: "Phổ biến nhất" },
    { id: "vote_average.desc", label: "Đánh giá cao nhất" },
    { id: "primary_release_date.desc", label: "Mới phát hành" },
    { id: "revenue.desc", label: "Doanh thu cao" },
];

export const CONTENT_TYPES: FilterItem[] = [
    { id: "all", label: "Tất cả định dạng" },
    { id: "movie", label: "Phim lẻ" },
    { id: "tv", label: "Phim bộ (TV Series)" },
];

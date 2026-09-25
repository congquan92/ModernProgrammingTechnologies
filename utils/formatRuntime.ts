/**
 * Chuyển đổi thời lượng phim từ phút sang chuỗi hiển thị thân thiện tiếng Việt
 * Ví dụ:
 * - 148 -> "2 giờ 28 phút"
 * - 55  -> "55 phút"
 * - 120 -> "2 giờ"
 * - 0 hoặc âm -> "N/A"
 */
export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) {
    return "N/A";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} phút`;
  }

  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${remainingMinutes} phút`;
}

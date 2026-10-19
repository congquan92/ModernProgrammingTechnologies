"""Summarize prerendered home HTML without printing secrets or movie data."""

from html.parser import HTMLParser
from pathlib import Path


class HomeParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.heading_depth = 0
        self.headings = []
        self.image_alts = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("h1", "h2"):
            self.heading_depth += 1
        if tag == "img" and dict(attrs).get("alt"):
            self.image_alts += 1

    def handle_endtag(self, tag):
        if tag in ("h1", "h2"):
            self.heading_depth = max(0, self.heading_depth - 1)

    def handle_data(self, data):
        if self.heading_depth and data.strip():
            self.headings.append(data.strip())


path = Path(".next/server/app/index.html")
if not path.is_file():
    raise SystemExit("Missing prerendered home HTML; run npm run build first.")

source = path.read_text(encoding="utf-8")
parser = HomeParser()
parser.feed(source)
expected = (
    "Phim Thịnh Hành Trong Tuần",
    "Top 10 Phim Đánh Giá Cao Nhất",
    "Phim Đang Chiếu Rạp Dành Cho Bạn",
    "Có Thể Bạn Muốn Xem Lại",
)

print("source: .next/server/app/index.html (production build)")
print("prerendered_home_exists: true")
heading_count = sum(any(title in h for h in parser.headings) for title in expected)
print(f"expected_row_headings_in_html: {heading_count}/{len(expected)}")
print(f"images_with_alt_in_html: {parser.image_alts}")
print(f"api_key_query_in_html: {'api_key=' in source.lower()}")
if heading_count != len(expected) or parser.image_alts == 0 or "api_key=" in source.lower():
    raise SystemExit("Production HTML did not pass the expected server-render checks.")

"""Check production routes on localhost without printing movie data or secrets."""

from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen
import re

home = Path(".next/server/app/index.html").read_text(encoding="utf-8")
movie = re.search(r'href="/movie/(\d+)"', home)
if movie is None:
    raise SystemExit("No movie link found in prerendered home HTML.")

routes = (
    ("/", 200),
    (f"/movie/{movie.group(1)}", 200),
    ("/movie/not-a-number", (200, 404)),
    ("/watchlist", 200),
    ("/api/search?q=a", 200),
)

print("source: npm run start at localhost:3000")
for route, expected in routes:
    try:
        with urlopen("http://localhost:3000" + route, timeout=30) as response:
            status = response.status
            body = response.read().decode("utf-8", "replace")
    except HTTPError as error:
        status = error.code
        body = error.read().decode("utf-8", "replace")
    print(f"{route}: HTTP {status}; api_key_in_body={'api_key=' in body.lower()}")
    if route == "/movie/not-a-number":
        not_found_ui = "Không Tìm Thấy Bộ Phim Này" in body
        noindex = '<meta name="robots" content="noindex"' in body
        print(f"invalid_movie_not_found_ui: {not_found_ui}; noindex: {noindex}")
        if not (not_found_ui and noindex):
            raise SystemExit("Invalid movie route did not render noindexed not-found UI.")
    if status not in (expected if isinstance(expected, tuple) else (expected,)):
        raise SystemExit(f"Unexpected status for {route}: {status}, expected {expected}")

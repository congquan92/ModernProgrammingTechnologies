import { createServer } from "node:http";

const port = Number(process.env.EVIDENCE_PORT || 4100);
const counts = new Map();
const movie = (id = 550) => ({
  id,
  title: `Phim minh chứng ${id}`,
  name: `Phim minh chứng ${id}`,
  overview: "Dữ liệu giả chỉ dùng để kiểm tra Streaming và Data Cache.",
  release_date: "2024-01-01",
  first_air_date: "2024-01-01",
  runtime: 120,
  vote_average: 8,
  vote_count: 100,
  genre_ids: [18],
  genres: [{ id: 18, name: "Chính kịch" }],
  poster_path: null,
  backdrop_path: null,
});

const list = () => ({
  page: 1,
  total_pages: 1,
  total_results: 1,
  results: [movie()],
});

createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  const path = url.pathname.replace(/^\/3/, "");

  if (path === "/_counts") {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(Object.fromEntries(counts)));
    return;
  }

  const count = (counts.get(path) || 0) + 1;
  counts.set(path, count);
  const started = Date.now();
  process.stdout.write(`START ${path} #${count}\n`);

  let data;
  let delay = 0;
  const detail = path.match(/^\/movie\/(\d+)$/);
  const credits = path.match(/^\/movie\/(\d+)\/credits$/);
  const similar = path.match(/^\/movie\/(\d+)\/similar$/);
  const videos = path.match(/^\/movie\/(\d+)\/videos$/);

  if (detail) {
    data = movie(Number(detail[1]));
  } else if (credits) {
    delay = 2500;
    data = {
      id: Number(credits[1]),
      cast: [{ id: 1, name: "Diễn viên minh chứng", character: "Vai A", profile_path: null }],
    };
  } else if (similar) {
    delay = 4000;
    data = { ...list(), results: [movie(551)] };
  } else if (videos) {
    data = { id: Number(videos[1]), results: [] };
  } else {
    data = list();
  }

  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(data));
  process.stdout.write(`END   ${path} #${count} ${Date.now() - started}ms\n`);
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`Mock TMDB: http://127.0.0.1:${port}/3\n`);
  process.stdout.write("Chỉ dùng cho minh chứng; log không ghi api_key.\n");
});

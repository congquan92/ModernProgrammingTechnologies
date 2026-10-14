// Run with the localhost TMDB mock and production Next server.
const id = process.argv[2] || String(Date.now());
const started = performance.now();
const response = await fetch(`http://localhost:3000/movie/${id}`);
if (!response.ok || !response.body) {
  throw new Error(`Movie route returned HTTP ${response.status}`);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
let html = "";
const seen = new Set();
const markers = [
  [`main_movie_${id}`, `Phim minh chứng ${id}`],
  ["cast_fallback", "animate-pulse"],
  ["cast_result", "Diễn viên minh chứng"],
  ["similar_result", "Phim minh chứng 551"],
];

console.log(`route=/movie/${id} status=${response.status}`);
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  html += decoder.decode(value, { stream: true });
  for (const [name, needle] of markers) {
    if (!seen.has(name) && html.includes(needle)) {
      seen.add(name);
      console.log(`${name}: ${Math.round(performance.now() - started)}ms`);
    }
  }
}

for (const [name] of markers) {
  if (!seen.has(name)) throw new Error(`Missing streamed marker: ${name}`);
}

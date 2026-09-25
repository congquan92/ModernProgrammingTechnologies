import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MovieCard from "@/components/server/MovieCard";
import type { Movie } from "@/types/tmdb";

const mockMovie: Movie = {
  id: 550,
  title: "Fight Club",
  poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  backdrop_path: "/hZkgoQYus5vegHoetLkCJzVmTLo.jpg",
  vote_average: 8.4,
  vote_count: 26000,
  release_date: "1999-10-15",
  overview: "A ticking-time-bomb insomniac...",
};

describe("MovieCard Component (Tầng 2 - Component Testing)", () => {
  it("hiển thị chính xác tên phim", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("Fight Club")).toBeDefined();
  });

  it("hiển thị đúng điểm đánh giá", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("8.4")).toBeDefined();
  });

  it("hiển thị đúng năm phát hành trích xuất từ release_date", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("1999")).toBeDefined();
  });

  it("có đường dẫn href trỏ đúng đến dynamic route /movie/550", () => {
    render(<MovieCard movie={mockMovie} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/movie/550");
  });
});

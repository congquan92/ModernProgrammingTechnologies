import { describe, it, expect } from "vitest";
import { formatRuntime } from "@/utils/formatRuntime";

describe("formatRuntime() - Định dạng thời lượng phim (Tầng 2)", () => {
  it("trả về 'N/A' khi đầu vào là 0 hoặc undefined", () => {
    expect(formatRuntime(0)).toBe("N/A");
    expect(formatRuntime(undefined)).toBe("N/A");
    expect(formatRuntime(null)).toBe("N/A");
  });

  it("trả về 'N/A' khi đầu vào là số âm", () => {
    expect(formatRuntime(-15)).toBe("N/A");
  });

  it("chỉ hiển thị phút khi thời lượng dưới 60 phút", () => {
    expect(formatRuntime(45)).toBe("45 phút");
    expect(formatRuntime(59)).toBe("59 phút");
  });

  it("chỉ hiển thị giờ khi thời lượng tròn chục giờ", () => {
    expect(formatRuntime(60)).toBe("1 giờ");
    expect(formatRuntime(120)).toBe("2 giờ");
    expect(formatRuntime(180)).toBe("3 giờ");
  });

  it("hiển thị đầy đủ cả giờ và phút", () => {
    expect(formatRuntime(148)).toBe("2 giờ 28 phút");
    expect(formatRuntime(75)).toBe("1 giờ 15 phút");
  });

  it("xử lý đúng các phim có thời lượng dài", () => {
    expect(formatRuntime(189)).toBe("3 giờ 9 phút");
    expect(formatRuntime(201)).toBe("3 giờ 21 phút");
  });
});

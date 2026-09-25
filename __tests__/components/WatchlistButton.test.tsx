import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WatchlistButton from "@/components/client/WatchlistButton";

// Mock Server Action
vi.mock("@/app/actions/watchlist", () => ({
    toggleWatchlist: vi.fn().mockImplementation(async () => {
        return { isSaved: true };
    }),
}));

describe("WatchlistButton Component (Tầng 2 - Client Component Testing)", () => {
    it("hiển thị nhãn 'Lưu Xem Sau' khi phim chưa có trong danh sách", () => {
        render(<WatchlistButton movieId={101} initialSaved={false} />);
        expect(screen.getByText("Lưu Xem Sau")).toBeDefined();
    });

    it("hiển thị nhãn 'Đã Lưu' khi phim đã được lưu trong danh sách", () => {
        render(<WatchlistButton movieId={101} initialSaved={true} />);
        expect(screen.getByText("Đã Lưu")).toBeDefined();
    });

    it("hiển thị đúng aria-label cho chế độ compact", () => {
        render(<WatchlistButton movieId={101} initialSaved={true} variant="compact" />);
        const button = screen.getByRole("button", { name: "Xóa khỏi danh sách yêu thích" });
        expect(button).toBeDefined();
    });

    it("chuyển đổi trạng thái sang 'Đang lưu...' rồi 'Đã Lưu' khi người dùng click", async () => {
        render(<WatchlistButton movieId={101} initialSaved={false} />);
        const button = screen.getByRole("button");
        fireEvent.click(button);
        await waitFor(() => {
            expect(screen.getByText("Đã Lưu")).toBeDefined();
        });
    });
});

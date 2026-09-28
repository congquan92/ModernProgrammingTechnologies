# Kế Hoạch Loại Bỏ Toàn Bộ Testing & GitHub Actions CI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Loại bỏ hoàn toàn hệ thống kiểm thử tự động (Vitest, React Testing Library, thư mục `__tests__`, cấu hình test, test scripts, devDependencies liên quan) và đảm bảo không có GitHub Actions workflow nào tồn tại trong repository theo đúng yêu cầu người dùng.

**Architecture:** 
1. Xóa thư mục kiểm thử `__tests__/` cùng toàn bộ test files.
2. Xóa file cấu hình runner `vitest.config.mts`.
3. Cập nhật `package.json` để loại bỏ các scripts (`test`, `test:watch`) và các thư viện test devDependencies (`vitest`, `vite`, `@vitejs/plugin-react`, `@testing-library/*`, `jsdom`).
4. Cập nhật `tsconfig.json` dọn dẹp include pattern liên quan.
5. Kiểm tra và xác nhận không có thư mục `.github/workflows/`.
6. Cập nhật tài liệu `README.md` để đồng bộ (loại bỏ mục chạy lệnh `npm test`).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.

**Spec:** Yêu cầu từ người dùng: "loại bỏ mấy cái test đi vd như : _test_ , ....mấy cái liên quan á, + github action đồ nữa , không cần làm tới đó , yêu cầu loại bỏ + lên plan để duyệt trước".

## Global Constraints
- Không làm ảnh hưởng đến mã nguồn chạy ứng dụng (`app/`, `components/`, `services/`, `utils/`, `types/`).
- Lệnh `npm run build` và `npm run dev` phải hoạt động bình thường sau khi gỡ bỏ.
- Tuân thủ quy tắc an toàn dữ liệu: Cần người dùng phê duyệt trước khi thực thi xóa file.

## Review Focus
1. `npm run build` vẫn biên dịch thành công 100% không phát sinh lỗi tham chiếu hoặc thiếu kiểu dữ liệu.
2. Không còn bất kỳ file hoặc folder `__tests__` nào trong dự án.
3. Không còn file cấu hình test `vitest.config.mts`.
4. Không có folder `.github/workflows` hay cấu hình CI nào tồn tại.
5. `package.json` không còn script `test` và các package test rác.

---

### Task 1: Xóa thư mục test `__tests__/` và file cấu hình `vitest.config.mts`

**Files:**
- Delete: `__tests__/components/MovieCard.test.tsx`
- Delete: `__tests__/components/WatchlistButton.test.tsx`
- Delete: `__tests__/utils/formatRuntime.test.ts`
- Delete: `__tests__/`
- Delete: `vitest.config.mts`

**Interfaces:**
- Consumes: N/A
- Produces: Thư mục gốc sạch sẽ, không còn test runner config và test specs.

- [x] **Step 1: Xóa thư mục `__tests__` và cấu hình `vitest.config.mts`**
  Xóa hoàn toàn thư mục `__tests__` và file `vitest.config.mts`.

- [x] **Step 2: Xác minh các file test đã được xóa hoàn tất**
  Chạy lệnh kiểm tra file hệ thống đảm bảo `__tests__` và `vitest.config.mts` không còn tồn tại.

---

### Task 2: Dọn dẹp `package.json` và `tsconfig.json`

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: N/A
- Produces: File cấu hình npm và TypeScript tối giản, không chứa khai báo test runner.

- [x] **Step 1: Loại bỏ test scripts và devDependencies trong `package.json`**
  - Xóa scripts: `"test": "vitest run"`, `"test:watch": "vitest"`
  - Xóa devDependencies:
    - `"@testing-library/dom"`
    - `"@testing-library/jest-dom"`
    - `"@testing-library/react"`
    - `"@vitejs/plugin-react"`
    - `"jsdom"`
    - `"vite"`
    - `"vitest"`

- [x] **Step 2: Dọn dẹp include trong `tsconfig.json`**
  Loại bỏ `"**/*.mts"` (trước đó dùng cho `vitest.config.mts`) khỏi mảng `"include"`.

- [x] **Step 3: Chạy `npm install` hoặc cập nhật `package-lock.json`**
  Đồng bộ hóa `package-lock.json` để loại bỏ hoàn toàn các gói test khỏi dependency tree.

---

### Task 3: Xác minh GitHub Actions và cập nhật tài liệu

**Files:**
- Verify: `.github/workflows/` (đảm bảo không tồn tại)
- Modify: `README.md` (loại bỏ mục hướng dẫn `npm test` và kết quả Vitest 10/10)

**Interfaces:**
- Consumes: N/A
- Produces: Repository sạch, tài liệu phản ánh đúng trạng thái thực tế của dự án.

- [x] **Step 1: Kiểm tra thư mục `.github`**
  Xác nhận không có workflow CI nào trong `.github/workflows`.

- [x] **Step 2: Cập nhật `README.md`**
  Lược bỏ phần `## 7. Kiểm Thử Tự Động Với Vitest` và lệnh `npm test` để tránh hiểu lầm khi bàn giao hoặc chấm điểm.

- [x] **Step 3: Kiểm tra Build dự án xác nhận không có hồi quy**
  Chạy `npm run build` để chứng thực toàn bộ ứng dụng vẫn build thành công, không gặp lỗi.

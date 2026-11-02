# 📚 VocabVault — Sổ Tay Từ Vựng Tiếng Anh & Luyện Phát Âm

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-indigo?style=for-the-badge&logo=github)](https://pages.github.com/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20Passed-emerald?style=for-the-badge&logo=vitest)](https://vitest.dev/)

> **VocabVault** là trang web cá nhân mã nguồn mở giúp bạn ghi chép, quản lý toàn bộ từ vựng tiếng Anh theo thời gian, phát âm chuẩn người bản xứ (US, UK, AU), cung cấp **đường dẫn trực tiếp (Link Text)** cho từng từ để bạn có thể xem lại, chia sẻ vào Notion/Obsidian/Anki và học tập ngắt quãng (Spaced Repetition System - SRS).

---

## ✨ Điểm Nổi Bật (Key Features)

### 1. 🔊 Phát âm chuẩn bản xứ (Audio Pronunciation)
- **Âm thanh MP3 thực tế:** Tự động lấy file ghi âm phát âm thực tế từ Free Dictionary API / Cambridge.
- **Dự phòng Web Speech Synthesis:** Hỗ trợ phát âm ngay cả khi offline hoặc từ không có file mp3.
- **Tùy chỉnh giọng và tốc độ:**
  - 🇺🇸 Giọng Mỹ (en-US)
  - 🇬🇧 Giọng Anh (en-GB)
  - 🇦🇺 Giọng Úc (en-AU)
  - Tốc độ phát linh hoạt: `0.8x` (chậm nghe rõ âm) | `1.0x` (chuẩn) | `1.2x` (nhanh).
- Hiệu ứng sóng âm trực quan (Soundwave) khi phát âm thanh.

### 2. 🔗 Dễ Dàng Truy Cập Link Text Từng Từ (Deep Linking & Export)
- **Deep Linking độc nhất:** Mỗi từ đều có đường dẫn tĩnh riêng dạng `#word=<slug>` (Ví dụ: `https://<user>.github.io/<repo>/#word=serendipity`).
- **Nút "Copy Link" 1 chạm:** Sao chép liên kết vào bộ nhớ tạm kèm thông báo toast.
- **Thư mục Link Text đa định dạng:**
  - 📋 **Copy toàn bộ Markdown Links:** Dạng `[word](url): nghĩa tiếng Việt` để dán vào Obsidian / Notion.
  - 📋 **Copy toàn bộ Plain Text Links:** Dạng danh sách text thông thường.
  - 📊 **Xuất bảng Markdown:** Lưu file `VOCABULARY.md` để đọc trực tiếp trên GitHub.
  - 🗂️ **Xuất thẻ Anki (TSV/CSV):** 1-click import toàn bộ kho từ vào ứng dụng Anki.
  - 💾 **Tải file JSON backup:** Lưu giữ toàn bộ dữ liệu từ vựng.

### 3. 📥 Thêm Từ Dần Dần Vào GitHub (3 Cách Tiện Lợi)
Bạn có thể bổ sung từ mới dần dần vào repo theo các cách sau:
- **Cách 1: Thêm trực tiếp trên giao diện Web (Có tra từ điển tự động):**
  - Gõ từ tiếng Anh ➔ Bấm **"Tra tự động"** ➔ Tự điền phiên âm IPA, audio MP3, từ loại, định nghĩa tiếng Anh, câu ví dụ và từ đồng nghĩa.
  - Nhập nghĩa tiếng Việt ➔ Bấm **"Lưu từ vựng"**.
  - Có thể tải file `words.json` mới hoặc nhập GitHub Token để tự động commit lên GitHub từ trình duyệt!
- **Cách 2: Sử dụng lệnh CLI (nhanh nhất cho lập trình viên):**
  ```bash
  npm run add "perseverance" "sự kiên trì, bền bỉ"
  ```
  Script sẽ tự động tra cứu từ điển, cập nhật `data/words.json`, `public/words.json` và tạo lại `VOCABULARY.md`!
- **Cách 3: Sửa trực tiếp file `data/words.json` trên GitHub:**
  - Mở file `data/words.json` trên trình duyệt GitHub và bấm nút `Edit` (hoặc phím `.`).
  - Thêm từ mới theo mẫu JSON có sẵn rồi Commit. GitHub Actions sẽ tự động build và deploy phiên bản mới lên GitHub Pages trong ~30 giây!

### 4. 🧠 Thẻ Ghi Nhớ 3D & Ôn Tập Ngắt Quãng (Spaced Repetition System - SRS)
- Thuật toán **SuperMemo SM-2** tính toán thời điểm cần ôn lại từ vựng dựa trên 4 mức độ:
  - `1. Lại` (<1 ngày)
  - `2. Khó` (1 ngày)
  - `3. Tốt` (3 ngày)
  - `4. Dễ` (7 ngày)
- Lật thẻ ghi nhớ 3D mượt mà kèm phím tắt:
  - `Space`: Lật thẻ xem nghĩa
  - `P`: Nghe phát âm
  - `←` / `→`: Chuyển thẻ trước / sau
  - `1`, `2`, `3`, `4`: Đánh giá mức độ nhớ

### 5. ✍️ Chế Độ Luyện Tập & Nghe Viết Chính Tả (Dictation Quiz)
- **Trắc nghiệm chọn nghĩa:** 4 phương án ngẫu nhiên từ kho từ của bạn.
- **Nghe & Viết chính tả (Dictation):** Nghe phát âm chuẩn và gõ lại đúng từ vựng. Giúp cải thiện vượt trội kỹ năng nghe và nhớ chính tả.
- Hiệu ứng pháo hoa chúc mừng (Confetti) khi hoàn thành bài tập!

### 6. 🚀 Tự Động Hóa 100% Qua GitHub Pages & Actions
- File workflow `.github/workflows/deploy.yml` được cấu hình sẵn. Khi bạn `git push` từ mới vào nhánh `main`, trang web sẽ tự động cập nhật ngay lập tức.

---

## 📂 Cấu Trúc Dự Án (Repository Structure)

```
.
├── .github/
│   └── workflows/
│       ├── deploy.yml          # GitHub Actions tự động build & deploy lên GitHub Pages
│       └── test.yml            # Tự động chạy unit test & kiểm tra schema khi push/PR
├── data/
│   ├── words.json              # Kho từ vựng chính (Nguồn chân lý dữ liệu)
│   └── words.schema.json       # JSON Schema kiểm tra tính hợp lệ của từng từ
├── public/
│   ├── favicon.svg             # Favicon biểu tượng ứng dụng
│   └── words.json              # Bản sao phục vụ client nạp dữ liệu tĩnh
├── scripts/
│   ├── add_word.mjs            # CLI script: tự động tra cứu từ điển và thêm từ mới
│   ├── export_markdown.mjs     # Xuất dữ liệu ra file VOCABULARY.md
│   └── validate_words.mjs      # Kiểm tra schema dữ liệu data/words.json
├── src/
│   ├── components/
│   │   ├── AddWordModal.tsx    # Modal thêm từ mới với auto-lookup & GitHub Sync
│   │   ├── AudioButton.tsx     # Nút phát âm với hiệu ứng sóng âm thanh
│   │   ├── FlashcardView.tsx   # Giao diện Flashcards 3D với thuật toán SRS
│   │   ├── Navbar.tsx          # Thanh điều hướng, đổi giọng US/UK/AU, Dark Mode
│   │   ├── QuizView.tsx        # Trắc nghiệm & Nghe viết chính tả (Dictation)
│   │   ├── StatsModal.tsx      # Thống kê tiến độ học tập và mức độ thuộc từ
│   │   ├── TextListView.tsx    # Bảng danh mục Link Text, xuất Anki / Markdown
│   │   ├── Toast.tsx           # Thông báo popup phản hồi nhanh
│   │   ├── WordCard.tsx        # Thẻ hiển thị từ vựng với phát âm và thẻ tag
│   │   └── WordDetailModal.tsx # Chi tiết từ vựng với đường link trực tiếp (#word=...)
│   ├── hooks/
│   │   ├── useAudio.ts         # Hook quản lý phát âm (MP3 + Speech Synthesis)
│   │   ├── useLocalStorage.ts  # Lưu trữ tiến độ cá nhân vào LocalStorage
│   │   └── useWords.ts         # Quản lý danh sách từ, bộ lọc và đánh giá SRS
│   ├── services/
│   │   ├── dictionaryApi.ts    # Kết nối Free Dictionary API lấy phiên âm và audio
│   │   ├── githubSync.ts       # Commit trực tiếp từ trình duyệt qua GitHub REST API
│   │   └── srsAlgorithm.ts     # Thuật toán Spaced Repetition (SuperMemo SM-2)
│   ├── types/
│   │   └── word.ts             # Định nghĩa kiểu dữ liệu TypeScript
│   ├── utils/
│   │   ├── exportUtils.ts      # Tiện ích xuất Markdown, Text Link, Anki TSV
│   │   └── searchFilter.ts     # Công cụ tìm kiếm mờ (fuzzy) và sắp xếp
│   ├── App.tsx                 # Điều phối ứng dụng & Hash Routing
│   ├── index.css               # Phong cách Tailwind CSS và hiệu ứng 3D
│   └── main.tsx                # Điểm khởi động ứng dụng React
├── tests/
│   ├── dataValidation.test.ts  # Test tính hợp lệ của data/words.json
│   ├── exportUtils.test.ts     # Test các hàm xuất link text & Anki
│   ├── searchFilter.test.ts    # Test công cụ tìm kiếm và lọc từ
│   └── srsAlgorithm.test.ts    # Test thuật toán ôn tập ngắt quãng SM-2
├── VOCABULARY.md               # Bảng mục lục tất cả các từ vựng kèm link text
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Hướng Dẫn Sử Dụng (Quick Start)

### 1. Chạy thử nghiệm trên máy tính (Local Development)

```bash
# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Chạy môi trường phát triển (Dev server)
npm run dev
```
Truy cập địa chỉ `http://localhost:5173/` trên trình duyệt để trải nghiệm!

### 2. Chạy kiểm tra tự động (Unit Tests & Validation)

```bash
# Kiểm tra định dạng schema của data/words.json
npm run validate

# Chạy toàn bộ 20+ bài test tự động (Vitest)
npm run test

# Kiểm tra build sản phẩm
npm run build
```

### 3. Thêm từ mới qua dòng lệnh CLI

```bash
npm run add "resilience" "khả năng phục hồi, kiên cường vượt qua nghịch cảnh"
```

---

## 🌐 Hướng Dẫn Đưa Lên GitHub & Bật GitHub Pages Miễn Phí

Để có trang web online chạy vĩnh viễn trên tên miền của bạn (`https://<username>.github.io/<repo>/`):

1. **Khởi tạo và đẩy mã nguồn lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of VocabVault"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

2. **Kích hoạt GitHub Pages trong Settings:**
   - Truy cập vào repo của bạn trên GitHub: `https://github.com/<username>/<repo-name>/settings/pages`
   - Tại mục **Build and deployment** ➔ **Source**, chọn **GitHub Actions**.
   - GitHub Actions sẽ tự động chạy workflow `.github/workflows/deploy.yml` và xuất bản trang web của bạn chỉ trong giây lát!

3. **Thêm từ mới dần dần:**
   - Mỗi khi bạn sửa file `data/words.json` và push lên GitHub, website sẽ tự động build và cập nhật từ vựng mới nhất!

---

## 📄 Bản Quyền & Đóng Góp

Dự án được phát hành dưới giấy phép mã nguồn mở **[MIT License](LICENSE)**. Bạn được toàn quyền sử dụng, sửa đổi và chia sẻ cho mục đích cá nhân hoặc cộng đồng.

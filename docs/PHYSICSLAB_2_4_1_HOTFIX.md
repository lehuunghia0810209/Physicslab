# PhysicsLab 2.4.1 — Data Integrity Hotfix

**Trạng thái:** Source candidate đã được kiểm tra bằng unit tests; **chưa** xác nhận production release trên Windows hoặc Chromium trong phiên chỉnh sửa này. Không tự ý push/deploy nếu chưa qua release checks.

## Những thay đổi chính

- **AUD-002 — Progress:** Giữ nguyên raw `physicslab.progress.v1` nếu dữ liệu JSON hỏng hoặc schema version không hỗ trợ. Không tự ghi đè khi khởi tạo. Cho phép thao tác bằng bản nháp trong bộ nhớ; cấp `issue()/rescue()/isDamaged()` và hỗ trợ restore có chủ đích `allowDamaged`.
- **AUD-003 — Hai tab:** Progress và Learning kiểm tra snapshot `localStorage` trước mỗi lần ghi. Khi một tab khác đã cập nhật, bản cũ không ghi đè dữ liệu mới; thay đổi cục bộ vẫn có thể được xem để sao lưu. Experiment Studio tiếp tục dùng kiểm tra xung đột vốn có. Trạng thái thanh trên cập nhật khi có `storage` event.
- **AUD-004 — Unified Backup v2:** `src/core/unified-backup.js` hỗ trợ sao lưu `progress`, `learning` và `experiments` trong cùng JSON; validate đủ ba phần trước khi nhập, rollback các key đã ghi nếu một key ghi lỗi. Bản sao Progress v1 cũ vẫn được nhập nhưng **không** xóa kho Learning/Experiments. Khi nhập, trước khi ghi sẽ tải một bản **raw rescue** nguyên văn của ba key đang lưu. Nút Tools cho phép tải raw rescue riêng ngay cả khi JSON bị hỏng.
- **AUD-005 — Notes autosave:** Ghi chú Lesson Reader tự lưu có debounce 350 ms; flush khi `change`, `blur`, chuyển hash, `pagehide` và trước khi tạo backup.
- **Giữ tính năng:** 13 simulations, 15 laboratory experiments và 49 Lesson Readers; công thức/physics engines được giữ nguyên.

## Files thay đổi đáng chú ý

- `src/core/progress.js`, `src/core/learning-store.js`, `src/core/experiment-store.js`
- `src/core/unified-backup.js` (mới)
- `src/core/learning-session.js`, `src/core/experiment-session.js` (mới)
- `src/core/note-autosave.js` (mới)
- `src/main.js`, `src/pages/tools.js`, `src/pages/learning.js`, `src/pages/advanced-labs.js`
- `src/app/measurement-panel.js`, `src/app/lesson-reader.js`, `src/pages/lab-notebook.js`
- `tests/data-integrity-hotfix.test.js` (mới)
- `package.json` và `package-lock.json`: `2.4.1`

## Đã kiểm tra trong môi trường sửa nguồn

- `node scripts/check.mjs`: **PASS** — 210 JS modules; 462 relative imports; 593 named exports; lazy registry hợp lệ.
- `node --test tests/*.test.js`: **291/291 PASS** (0 failed, 0 skipped), gồm 10 test cases AUD-002–005 mới.
- `npm ci` không hoàn tất do vấn đề tải dependency/registry của môi trường này. **Chưa** có kết quả Vite production build, Browser QA và Offline QA độc lập cho bản sửa này. Không tuyên bố release check PASS.

## Hướng dẫn cập nhật trên Windows

1. **Sao lưu** repository hiện tại và lưu file dữ liệu từ Tools trên website đang chạy. ZIP này là **full source**, không có `.git`, `node_modules` và `dist`; giữ `.git` hiện tại, không sao chép `node_modules` từ bản cũ.
2. Giải nén vào một thư mục làm việc mới hoặc sao chép nội dung có chọn lọc vào `D:\EduLab\physicslab` trên nhánh Git riêng.
3. Trong PowerShell tại thư mục source: `npm ci`, tiếp `npm run check:release`.
4. Trên `localhost` kiểm tra Tools → **Sao lưu đầy đủ JSON**, **Khôi phục từ JSON**, **Cứu hộ dữ liệu gốc**; tạo ghi chú Learning rồi thử mở tab khác, thay đổi cùng một bài; xác nhận có thông báo xung đột thay vì mất dữ liệu.
5. Chỉ commit/push/deploy sau khi build/browser/offline PASS và kiểm tra thủ công ở desktop/mobile.

## Giới hạn cần biết

- LocalStorage không hỗ trợ giao dịch ACID nhiều key. Unified Backup import có validate trước và rollback kiểu best-effort; nếu trình duyệt từ chối cả thao tác rollback, phải dùng file cứu hộ đã tải. Không thể đảm bảo đồng bộ mạnh giữa các tab như backend có transaction.
- Nếu phát hiện dữ liệu Progress/Learning/Experiments không đọc được, **không** tạo bản sao tổng hợp rỗng thay thế; người dùng phải tải bản cứu hộ gốc và quyết định phục hồi.
- Kết quả file ZIP ở đây là bản sửa độc lập. Không sửa repository đang chạy trên máy của người dùng, không commit/push/deploy.

# PhysicsLab 1.2.1 Beta — Interactive Experience (PhET-inspired)

**Bản phát triển dựa trực tiếp trên PhysicsLab 1.2.0.** Giữ nguyên toàn bộ 13 mô phỏng, 16 bài học, 15 cấu hình Lab, 3D Explorer, giao diện tiếng Việt và dữ liệu `physicslab.progress.v1`. Đây **không phải** mã PhET được sao chép hoặc một bản PhET đổi tên.

## Thay đổi trong bản này

- **Khí lí tưởng:** hạt khí minh họa chuyển động và phản xạ, phụ thuộc nhiệt độ; piston kéo trực tiếp, thang biểu diễn logarit để thấy được thể tích nhỏ. Các phép đo, áp suất và nhiệt động lực học luôn lấy từ mô hình SI hiện có.
- **Mạch điện:** sơ đồ nối tiếp/song song đúng cấu trúc, trực quan dòng điện quy ước bằng các hạt chuyển động minh họa, chọn nhanh hai cách mắc, kéo và dùng phím mũi tên chỉnh điện trở. Điều khiển tạm dừng chuyển động; không làm giả số đo.
- **Phòng thí nghiệm:** danh mục 16 bàn thực hành tách riêng (Hooke chuyên sâu + 15 chủ đề); sơ đồ minh họa riêng cho từng thí nghiệm; kéo chấm trên sơ đồ để đổi đại lượng, đọc số đo và dụng cụ từ mô hình gốc; có hiệu chuẩn và sổ tay/CSV.
- **3D Explorer:** chỉnh lại khoảng cách chữ, số đo, khu vực canvas, bố cục tablet/desktop/mobile, giới hạn tràn bảng.
- **Test:** unit tests mở rộng, cập nhật browser checks tương ứng các tương tác mới.

**Chưa đạt parity với PhET:** Chưa phải bộ lắp mạch tự do hay môi trường thực nghiệm liên tục cho toàn bộ 15 adapter Lab; các cảnh generic là sơ đồ minh họa tương tác và kết quả đo được tính bằng mô hình. Muốn xây chức năng lắp thiết bị đa chiều như PhET cần thêm những bộ công cụ mô phỏng chuyên dụng.

## Chạy thử trước khi đẩy Cloudflare

```powershell
npm ci
npm run check
npm run dev -- --port 5188
# Terminal thứ hai
npm run check:browser
```

Chỉ đẩy GitHub sau khi cả build và browser tests thành công trên máy Windows và đã kiểm tra trực quan ở 320/390/768/1440px. Giữ nguyên `.git` và `node_modules` khi cập nhật mã nguồn, không xóa tiến độ trình duyệt. Xem `docs/PHET_EXPERIENCE_QA.md`.

---

# PhysicsLab 1.2 — Beta 1 UX Rework (Balanced)

> **PhysicsLab 1.2 — bản nguồn hướng tới phát hành chính thức.** Đã gộp phần việc β2 (tương tác sâu) và RC (chất lượng, accessibility, QA) vào một đợt phát triển. Kiểm thử lõi tự động PASS nhưng Vite build và browser acceptance vẫn cần xác nhận trên Windows vì môi trường bàn giao không có native Vite Linux và chặn Chromium localhost. **Không push production trước khi ba lệnh check/build/browser PASS.**

## Những thay đổi cuối cùng của 1.2

- **13 mô phỏng có hướng dẫn trực quan ba bước:** Thử, Quan sát, Giải thích; không ghi tiến độ giả, không thay đổi công thức. Bộ tương tác kéo thả của β1 UX Rework vẫn được giữ.
- **Graph Engine nâng cấp chung:** zoom 2×, 4×, 8× theo trục ngang, trở về vừa khung, điểm thăm dò, hỗ trợ bàn phím, xuất CSV các điểm thực do mô hình tạo ra; đường đồ thị được clip đúng vùng vẽ và giữ `fill:none`.
- **Virtual Lab Hooke:** thêm mô hình lệch điểm 0 có thể chọn, bù sai lệch trước khi ghi mẫu, xem ảnh hưởng của hiệu chuẩn; bảng đo hiển thị ước lượng bất định chuẩn u(k) từ độ chia lực kế và thước (mô hình bù sai lệch chỉ là giả định sư phạm). Đặt lại thiết lập không xóa sổ đo.
- **Learning 2.0:** yêu cầu thử nghiệm cụ thể được hiển thị ngay trong bài học, đồng bộ với hướng dẫn trên từng mô phỏng; giữ toàn bộ 16 bài và điều kiện hoàn thành thực.
- **3D Explorer:** thêm góc nhìn phối cảnh/bên/dọc B và bật/tắt vectơ; giữ nút Vừa khung, kéo-xoay, tua thời gian và hai cảnh hiện có.
- **Kiểm thử và bảo vệ tích hợp:** thêm hồi quy graph/calibration/learning, kiểm tra named exports trước build, mở rộng Playwright cho các chức năng mới. Giữ tương thích `physicslab.progress.v1`.

Xem [báo cáo nghiệm thu 1.2](docs/QA_1_2.md) và [trạng thái xác minh](docs/DEVELOPMENT_STATUS.md).


**PhysicsLab** là một website Vật lý tương tác, **độc lập**, bằng **tiếng Việt** dành cho học sinh THPT. Triết lý: **“Không chỉ đọc Vật lý — hãy nhìn thấy và tương tác với nó.”**

> **Trạng thái mã nguồn: `1.2.0` (cột mốc beta đầu tiên của lộ trình Balanced, chưa phải 1.2 stable).** Đã qua kiểm tra mã nguồn + 116 unit tests trong môi trường hiện tại (có bản vá Build Fix sửa thiếu export `updateNavigation`). Việc dựng Vite và kiểm thử trình duyệt thực tế cần xác nhận trên máy có đủ npm dependencies. Xem [báo cáo thử nghiệm](docs/TEST_REPORT.md).



## Cập nhật UX Rework từ Lab.zip

Bản này sửa lỗi đồ thị màu đen và lỗi tràn công thức Hero; làm mới phong cách chung của biểu đồ, workbench và controls, thêm thao tác kéo trực tiếp trên các mô phỏng, giữ nguyên nội dung và tiến độ. Các mô phỏng Cơ học, Sóng, Điện, Từ, Quang, Nhiệt có thêm điều khiển trực quan và/hoặc chỉ báo khoa học đồng bộ; Lab Hooke có thể kéo quả nặng. **Xem ma trận đầy đủ và các giới hạn tại [UX_REWORK_1_2.md](docs/UX_REWORK_1_2.md).**

> **Lưu ý nghiệm thu:** 116 unit tests PASS; Vite build/Playwright chưa được xác minh trên môi trường Linux vì ZIP gốc chứa dependency native Windows và thiếu Chromium. Trước khi deploy lên Cloudflare Pages, cần chạy `npm run check` và `npm run check:browser` trên Windows.

## Bản vá Build Fix cho 1.2 Beta 1

- Sửa lỗi Vite build `[MISSING_EXPORT] updateNavigation` từ shell/router. Giữ nguyên các tính năng được bàn giao trong bản 1.2 Beta 1.
- Bổ sung kiểm thử điều hướng để tránh làm mất export trong lần cải tiến giao diện tiếp theo.

## Nâng cấp mới trong 1.2 Beta 1

- **Biểu đồ khoa học có thể thăm dò:** rê chuột hoặc dùng Tab + phím mũi tên trái/phải để đọc điểm dữ liệu; Escape thoát chế độ thăm dò. Con trỏ mô phỏng chính vẫn đồng bộ theo thời gian.
- **So sánh thực nghiệm ném xiên:** dùng “Lưu làm mốc”, đổi tham số, xem hai quỹ đạo và hai đường trong 4 biểu đồ trên cùng thang; so sánh độ chênh tầm xa, độ cao và thời gian bay. Mốc chỉ tồn tại trong lần mở trang này.
- **Liên kết cấu hình cho giáo viên:** sao chép link chứa vận tốc, góc, độ cao, trọng trường (không bao gồm tiến độ hay điểm số). Mở link trên Cloudflare Pages sẽ dùng bộ tham số đó.
- **UI/UX:** đồ thị 2 cột trên desktop để đọc rõ; dark/light token đủ giá trị, nhãn dễ đọc, responsive và hỗ trợ reduced-motion như cũ.

Đây là đợt **1.2 Beta 1**. Ngoài các hạng mục của Alpha 1, bản này làm sạch thanh công cụ, di chuyển sao lưu dữ liệu sang trang Công cụ, tăng độ rõ minh họa thẻ mô phỏng trong dark mode và sửa lại hero card / visual language của khu vực Mô phỏng.

## Chạy trên Windows 11

Yêu cầu **Node.js >= 22.12**, npm, trình duyệt Chromium hoặc Edge, và kết nối để cài dependency lần đầu. Mở terminal tại thư mục mã nguồn:

```powershell
npm ci
npm run dev
```

Mở đường dẫn Vite đưa ra, mặc định `http://127.0.0.1:5173/`.

Nếu project đặt trong OneDrive và gặp `EPERM` với file native `.node`, hãy tắt tiến trình Vite/Node đang dùng file, tạm dừng đồng bộ OneDrive rồi cài lại; lý tưởng nhất chạy project ngoài OneDrive. **Không xóa mã nguồn hoặc dữ liệu học tập.**

## Nghiệm thu trước khi sử dụng chính thức

```powershell
npm run check:core
npm run check
npm run build
```

Kiểm tra browser (dùng terminal riêng):

```powershell
npm run dev -- --port 5188
```

Sau đó terminal thứ hai:

```powershell
npx playwright install chromium
npm run check:browser
```

`npm run check` gồm syntax/import tests, Node unit tests và Vite production build. `check:browser` có thể dùng biến môi trường `PHYSICSLAB_TEST_URL` để trỏ đến server khác. Các hình chụp và báo cáo nằm trong thư mục `work/` trên máy bạn.

## Tính năng

- **Tổng quan:** hoạt động gần đây, học tiếp bài chưa hoàn thành, tiến độ thực lấy từ toàn bộ danh sách bài học và Registry.
- **Thư viện:** 13 mô phỏng có thể mở, tìm tiếng Việt không dấu, phân loại chương trình và lớp. Mỗi mô phỏng tải động khi người dùng mở.
- **Cơ học:** ném xiên, Newton, mặt phẳng nghiêng, ma sát, công–động năng, va chạm, dao động.
- **Sóng:** sóng truyền/sóng dừng/giao thoa trên dây.
- **Điện học:** mạch Ohm nối tiếp/song song; điện trường và điện thế của điện tích điểm với hai điện tích kéo thả, đầu dò, vector, phép tính Coulomb.
- **Từ–Quang–Nhiệt:** Lorentz/cảm ứng, thấu kính mỏng, khí lí tưởng.
- **Learning:** 16 bài học tương tác theo lớp 10–12; có tìm/lọc theo lớp và chủ đề, checklist điều kiện thử nghiệm trước khi xác nhận, quiz/tiến độ.
- **Virtual Lab:** Hooke với dụng cụ có độ chia, ghi số liệu theo từng lò xo, đồ thị và hồi quy từ phép đo; 15 cấu hình thực nghiệm chung, phép đo, bảng dữ liệu, CSV/báo cáo.
- **3D Explorer:** tự căn khung quỹ đạo xoắn Lorentz (có nút “Vừa khung”) và hai mô hình phép chiếu 3D Canvas (xoắn ốc Lorentz, ném xiên), xoay/zoom/phát/tạm dừng/đặt lại; không cần WebGL.
- **Công cụ:** chuyển đổi đơn vị, phân tích phép đo và công thức Vật lý.
- **Điều hướng nhanh:** `Ctrl+K` / `Cmd+K` hoặc nút “Tìm nhanh”.
- **Giao diện:** light/dark, chế độ HS/GV (chỉ tùy chọn giao diện), trình chiếu cho giáo viên, đồng nhất typography/spacing, điều khiển chạm tối thiểu 44px, responsive và hỗ trợ giảm chuyển động.
- **Dữ liệu:** hỗ trợ xuất/nhập tiến độ cục bộ qua JSON trên desktop. Trước khi nhập dữ liệu nên xuất bản sao, vì nhập sẽ thay thế tiến độ của trình duyệt hiện tại. Không có tài khoản hay đồng bộ trực tuyến.

Tính toán sử dụng SI và mô hình có giả định rõ. Các đồ thị/vật thể dùng kết quả vật lý chứ không dùng số ngẫu nhiên nhằm giả lập đúng.

## Kỹ thuật

Vite, Vanilla JavaScript, ES Modules, CSS, Canvas/SVG, Node test runner, Playwright. Không sử dụng React, backend, tài khoản, monorepo hoặc tích hợp EduLab/ChemLab/MathLab. Tiến độ người học được lưu trong `localStorage` **trên thiết bị** và có kiểm tra dữ liệu đầu vào khi phục hồi.

## Tài liệu

- [Lộ trình PhysicsLab 1.2](docs/ROADMAP_1_2.md)
- [Lịch sử thay đổi](docs/CHANGELOG.md)
- [Trạng thái và phạm vi kiểm chứng](docs/DEVELOPMENT_STATUS.md)
- [Báo cáo kiểm thử / giới hạn](docs/TEST_REPORT.md)
- [Hướng dẫn kiến trúc](docs/ARCHITECTURE.md)

> **Bảo toàn tiến độ:** hãy sao lưu thư mục hiện tại trước khi thay nguồn. Thay mã nguồn không tự động xóa `localStorage` trong trình duyệt; đừng xóa dữ liệu website nếu muốn giữ điểm quiz/phiên học. Không đặt `node_modules/` của bản cũ vào ZIP mã nguồn mới.

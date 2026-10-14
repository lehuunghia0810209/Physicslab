> **PhysicsLab 2.4.1 — Data Integrity Hotfix (2026-10-14):** Đã vá AUD-002/003/004 và autosave AUD-005 trong mã nguồn. `node scripts/check.mjs` PASS (210 modules) và `node --test tests/*.test.js` **291/291 PASS**. Vite build/Browser/Offline **chưa xác minh lại** trong môi trường này vì chưa cài đủ dependency; **chưa Stable**. Changelog & hướng dẫn tại [`docs/PHYSICSLAB_2_4_1_HOTFIX.md`](docs/PHYSICSLAB_2_4_1_HOTFIX.md). Các checkpoint bên dưới là lịch sử các phiên trước.

> **AUD-001 fixed in source (2026-10-14):** Trang `#/learning` hiện dùng danh mục 49 bài Learning 3.0 theo lớp 10/11/12, tìm kiếm/chủ đề và tách 16 hoạt động khám phá cũ ra lối vào riêng. `npm run check:core`: **280/280 PASS**. Chưa xác nhận production build/Browser/Offline cho Patch này trên Windows; xem [`docs/audits/AUD_001_RESOLUTION.md`](docs/audits/AUD_001_RESOLUTION.md). Vẫn `2.4.0-dev`, chưa Stable.

> **Learning 3.0 QA Hardening (2026-10-14):** Sửa chấm đơn vị câu trả lời số, bảo toàn điểm kiểm tra khi chỉ luyện một câu hoặc ôn câu sai, cân bằng câu hỏi ôn tập giữa các bài và giải thích đúng/sai từng mệnh đề. `npm run check:core` **275/275 PASS**; Vite/Browser/Offline cần xác minh trên Windows. Xem [`docs/LEARNING_3_0_QA_HARDENING.md`](docs/LEARNING_3_0_QA_HARDENING.md). Vẫn là `2.4.0-dev`, chưa Stable.

> **PhysicsLab 2.4.0-dev · Learning 3.0 Full Curriculum Content checkpoint (2026-10-14):** 49/49 đơn vị học tập đã có nội dung Lesson Reader, 98 ví dụ và 245 câu hỏi. Code/schema + unit tests 269/269 PASS; Browser/Offline/Build của bản này **chờ Windows QA**, chưa Stable. Xem [`docs/LEARNING_3_0_CONTINUATION.md`](docs/LEARNING_3_0_CONTINUATION.md). Thông tin checkpoint A cũ ở đoạn dưới chỉ là lịch sử.

> **PhysicsLab 2.4.0-dev · Learning 3.0 checkpoint (2026-10-14):** lớp 10 đã hoàn thành **17/17 bài**; toàn hệ thống hiện có 19/49 bài Complete, 38 ví dụ và 95 câu hỏi được validate. Revision Home hỗ trợ đề không trùng, ôn câu sai và lưu kết quả. Lớp 11–12 còn 30 bài nên chưa phải Stable hoặc Learning 3.0 hoàn tất. Xem [`docs/PHYSICSLAB_LEARNING_3_0.md`](docs/PHYSICSLAB_LEARNING_3_0.md) và [`docs/THPT_CURRICULUM_COVERAGE.md`](docs/THPT_CURRICULUM_COVERAGE.md).

> **PhysicsLab 2.2.0-dev — Recovery checkpoint:** Chuẩn hóa thời gian đầu dò Helix/Ném xiên và sửa kiểm tra import nhầm `.import()` trong test. Xem `docs/PHYSICSLAB_2_2_RECOVERY.md`. Bản này chưa phải Stable.

> **PhysicsLab 2.1.0-dev — 3D Explorer + Advanced Interactive Laboratory (2026-10-13):** Hệ trục/vectơ/playback 3D theo model; tương tác trực tiếp và sổ đo CSV dùng chung cho nhóm Newton–Ma sát–Công năng lượng–Va chạm–Quang học. Xem `docs/PHYSICSLAB_2_1_UPGRADE.md` và `docs/PHYSICSLAB_2_1_PHASE_B.md`. Đây là development checkpoint, chưa phải Stable.

> **PhysicsLab 2.0.0-rc.1 — Release QA baseline:** 224/224 unit tests, Vite build, browser QA và offline QA đã PASS trên Windows trước khi mở nhánh phát triển 2.1. Firefox, thiết bị cảm ứng thật và profiling dài hạn vẫn là nghiệm thu thủ công trước Stable. Xem `docs/RELEASE_2_0_RC1.md`.

> **PhysicsLab 2.0.0-preview.1:** bước sửa lỗi và kiểm thử giao diện Mô phỏng, không phải bản Stable. Xem `docs/PHYSICSLAB_2_0_PREVIEW_QA.md`. Giữ nguyên 13 mô phỏng, 15 bàn thí nghiệm và dữ liệu cũ.

> **Simulation Remake phần 2/2 (2026-10-12):** Tiếp tục trên full source đợt 1; tập trung Điện trường, Từ trường, Quang học, Khí lí tưởng, bảo toàn Sóng & Mạch điện, đưa hiện tượng lên đầu trang ở đủ 13 mô phỏng. Xem [`docs/SIMULATION_FULL_REMAKE_PART_2.md`](docs/SIMULATION_FULL_REMAKE_PART_2.md) để biết tính năng và giới hạn QA. **Chưa phải Stable.**

> **Simulation Remake đợt 1/2 (2026-10-12):** 7 mô phỏng Cơ học được nâng cấp trực tiếp từ Phase A. Xem [`docs/SIMULATION_FULL_REMAKE_HALF_1.md`](docs/SIMULATION_FULL_REMAKE_HALF_1.md) để biết phạm vi, kiểm thử và những bước nghiệm thu Windows còn bắt buộc. Đây chưa phải PhysicsLab Stable.

# PhysicsLab 1.8 — Interactive Science Studio (Preview)

**Kế thừa đầy đủ bản 1.7**, với cải tiến trực tiếp cho Khám phá 3D, Công cụ Vật lý và cơ chế kéo thả ở Thí nghiệm Quang học. **Đây chưa phải bản 1.8 Stable**: production build Vite trên Windows vẫn cần người dùng xác minh.

- **Khám phá 3D:** camera Ném xiên tự vừa khung theo góc nhìn; mặt phẳng quy chiếu, vector vận tốc thật và cụm số đo thời gian/vị trí/tốc độ; xoay bằng pointer delta neo trạng thái gốc, Ctrl + cuộn zoom, Tab/bàn phím để điều khiển.
- **Công cụ → Thước thời gian và quỹ đạo:** học sinh trực tiếp kéo dấu trên quỹ đạo hoặc đồ thị x(t)/y(t), xem x, y, vₓ, vᵧ và cơ năng cùng thời điểm; phát/tạm dừng, chế độ Trái Đất/Ném ngang/Mặt Trăng, export CSV, điều khiển bàn phím và hỗ trợ mobile.
- **Virtual Lab → Thấu kính:** bỏ tỉ lệ hình vẽ thay đổi theo khoảng cách ảnh (nguồn gây nhảy khi kéo); dùng một tỉ lệ cố định, giữ nguyên phương trình thấu kính và các phép đo SI.
- **Kiểm thử hồi quy:** thêm kiểm thử 3D camera fitting, cơ năng Ném xiên, phép đo thời gian, tỉ lệ Quang học ổn định. Các thí nghiệm Mạch điện, Hooke, Khí, Mặt phẳng nghiêng, Sóng và 13 mô phỏng vẫn có mặt.

## Cài đặt trong VS Code trên Windows
1. Sao lưu `D:\EduLab\physicslab`, giữ nguyên `.git` và `node_modules`.
2. **Giải nén ZIP và chép tất cả nội dung ở cấp gốc ZIP** vào `D:\EduLab\physicslab`, chọn thay thế tệp cũ. Bản ZIP này không lồng một thư mục source khác.
3. Chạy `npm ci`, `npm run check`, `npm run dev -- --port 5188`.
4. Mở `http://127.0.0.1:5188/#/tools`, `#/explorer3d`, `#/lab`. Chạy `npm run check:browser` trước khi push lên GitHub / Cloudflare.

Đọc `docs/RELEASE_1_8.md` để xem phạm vi, bài kiểm thử đã chạy, giới hạn và checklist.

---

# PhysicsLab 1.6 · Virtual Lab 3.0 (Preview)

> **Cập nhật mới nhất:** xây sâu bàn Mặt phẳng nghiêng, Thấu kính hội tụ, Đo sóng trên dây và Giao thoa; 3 chuyên mục Cơ học / Quang học / Sóng. Các bàn Mạch điện, Hooke, Khí lí tưởng và 8 cảnh còn lại được giữ nguyên từ 1.5; tất cả 13 mô phỏng, Learning, Tools, 3D và tiến độ vẫn có mặt. Mở `docs/LAB_1_6_QA.md` để xem chức năng và giới hạn kiểm thử.

**Cài đặt:** Sao lưu dự án, giải nén Full Source 1.6 vào `D:\EduLab\physicslab` (giữ `.git` và dữ liệu trình duyệt); chạy `npm ci`, `npm run check`, `npm run dev -- --port 5188`. Truy cập `#/lab`. Đây là Preview; kiểm thử production Vite trên Windows trước khi cập nhật Cloudflare.

---

# PhysicsLab 1.5 · Virtual Lab Remake

> Xây trên Remake R4: 15 bàn thí nghiệm không trùng lặp (3 bàn chuyên dụng + 12 cảnh tương tác mới), giữ các chức năng học tập, 13 mô phỏng, 3D, Tools và tiến độ. Xem `docs/LAB_1_5_QA.md` về phạm vi, kiểm thử và giới hạn.

# PhysicsLab 1.3 — Remake R4 · Tích hợp tương tác & kiểm tra mô hình

**Nền tảng kế thừa:** Remake R3 có bàn Lắp mạch điện và Lò xo Hooke tương tác. Bản R4 giữ lại các hệ thống đó, 13 mô phỏng, 16 bài học và khóa localStorage hiện tại. Không cần tải bất kỳ PATCH hoặc bản cũ nào.

## Phần đã triển khai thật trong R4

- **Cơ học trực tiếp:** Ma sát, Công–động năng, Va chạm, Dao động dùng vật thể có thể cầm và kéo; thao tác thay đổi **đầu vào mô hình Vật lý thật** thay vì chỉ tua thời gian. Có bàn phím, chú thích và kiểm tra bảo toàn động lượng.
- **13 tình huống khám phá:** Mỗi mô phỏng có 3 tình huống chuẩn bị nhanh, một câu hỏi dự đoán và phần giải thích; các tình huống tác động đến chính slider/select của mô hình đang chạy, không hiện số liệu giả.
- **Khí lí tưởng:** Bơm/xả khí, gia nhiệt/làm lạnh, piston kéo được, đồng hồ áp suất trực tiếp; bổ sung bàn **Bình khí & piston** trong mục Thí nghiệm, tái sử dụng mô hình nhiệt động PV=nRT. Hạt khí chuyển động minh họa **định tính**, không phải mô phỏng va chạm vi mô định lượng.
- **Từ trường:** Thêm tay nắm kéo trực tiếp góc v/B và số vòng dây; sửa lỗi thay DOM khiến thanh trượt ngắt thao tác, sửa hướng mũi tên lực Lorentz hướng tâm theo vị trí quỹ đạo và dấu điện tích; ẩn mũi tên lực khi vận tốc song song từ trường.
- **Khám phá 3D:** Chọn nhanh 0°/45°/90° để so sánh dạng quỹ đạo, zoom linh hoạt hơn và cải thiện bố cục/khả năng đọc.
- **Phòng thí nghiệm:** Luồng Thử → Đo → Kết luận, dự đoán lý thuyết đặt trong hộp mở riêng để khuyến khích thực nghiệm trước, danh mục có bàn khí mới.
- **Giao diện:** Sửa độ thoáng bảng thông số, responsive, số đo và trạng thái focus. Bản R4 không nhập mã hay che nhãn PhET.

## Kết quả kiểm thử có thể tái lập

- `npm run check:core` → PASS (161/161 unit tests, kiểm tra module/imports/named exports).
- CSS: 27 stylesheet, không có lỗi parse bằng tinycss2.
- Kiểm thử khoa học mới: thay đổi lực/quãng đường bằng cử chỉ, va chạm bảo toàn động lượng, góc lực Lorentz, khí nRT, thử nhanh đủ 13 mô phỏng.
- **Chưa thể xác nhận `npm run build`** tại môi trường bàn giao vì không có gói Vite cục bộ và registry không sẵn để cài. **Chưa thể xác nhận browser tests/nhìn giao diện thực tế** vì môi trường Chromium chặn điều hướng địa chỉ localhost/file/data. Không gọi bản này là Stable.

## Phạm vi chưa hoàn tất

Đây là bản cải tiến tích hợp R4 **không phải remake sâu cả 13 mô phỏng đến mức tương đương PhET**. Cảnh tương tác của Ném xiên/Newton/Dốc/Sóng/Mạch điện/Điện trường/Thấu kính được kế thừa từ các bản trước, không viết lại mới trong R4; thí nghiệm khác ngoài Mạch điện, Hooke, Bình khí chủ yếu là bàn thí nghiệm có thiết bị minh họa và số đo theo công thức. Cần tiếp tục xây kiến trúc thao tác vật thể cho các phòng thí nghiệm còn lại và kiểm thử usability thật với học sinh/giáo viên.

## Nghiệm thu trên VS Code Windows

1. Sao lưu nguyên dự án `D:\EduLab\physicslab`; giải nén ZIP Full Source R4 chép đè vào đây, **giữ `.git`** và dữ liệu ngoài thư mục dự án. Không xóa localStorage nếu muốn giữ tiến độ.
2. Chạy `npm ci`, `npm run check` (bao gồm kiểm tra Vite build), `npm run dev -- --port 5188`.
3. Mở Terminal khác chạy `npm run check:browser`.
4. Thử trực tiếp Mô phỏng → Ma sát, Va chạm, Dao động, Công–động năng, Từ trường, Khí lí tưởng; Thí nghiệm → Mạch điện/Hooke/Bình khí; Khám phá 3D; kiểm tra Light/Dark, mobile, console và trải nghiệm kéo/thả.
5. **Chỉ push lên GitHub / cập nhật Cloudflare sau khi tất cả bước trên PASS**.

Chi tiết từng nhóm ở `docs/REMAKE_R4_AUDIT.md` và `docs/TEST_REPORT_REMAKE_R4.md`.

---

# PhysicsLab 1.3.0 Remake R3 — Interactive Hooke Workbench

**Bản này kế thừa đầy đủ Remake R2** (bàn lắp mạch DC, 13 mô phỏng hiện có, 16 bài học, 3D và Tools), không phải dự án mới. Trọng tâm R3 là xây lại sâu thí nghiệm Hooke, không thêm thanh kéo thay cho tương tác.

## Điểm mới ở R3

- Khay quả cân 100 g, 200 g và 500 g: bấm hoặc kéo thả vào giá treo, tháo toàn bộ, giới hạn 1 kg để vật không vượt vùng quan sát.
- Kéo quả cân thật trong SVG, thả vật để xem dao động tắt dần; mô hình sử dụng nghiệm giải tích của `x'' + 2γx' + (k/m)x = g`, không nội suy hoạt ảnh tùy ý.
- Thước độ dãn theo mét, vạch cân bằng, lực trọng trường và lực đàn hồi với vectơ cập nhật tức thời. Hỗ trợ tua dừng, đưa vật về cân bằng, bật/tắt vectơ.
- Sổ thí nghiệm vẫn sử dụng `hooke-lab` trong hệ thống tiến độ hiện có; ghi phép đo theo độ phân giải/hiệu chuẩn dụng cụ, thống kê k và đồ thị F–Δx, xuất CSV.
- Bố cục desktop/mobile, các khối chỉ số không tràn; mở rộng phần cấu hình lò xo/trọng trường/dụng cụ khi cần. Thao tác được cả bằng bàn phím.
- Bài học Hooke liên kết trực tiếp tới `#/lab/hooke`, không đưa học sinh vào mặc định mạch điện.

## Trạng thái kiểm thử

Chạy `npm run check:core` để kiểm tra mã JS/module và tất cả unit tests; `npm run check` chạy thêm Vite build. Trong môi trường tạo bản này, Vite chưa cài được nên **production build và full-browser kiểm thử chưa xác minh**. Không đẩy lên Cloudflare trước khi chạy và xem tương tác trên VS Code/Windows.

### Cài trên máy Windows

Sao lưu `D:\EduLab\physicslab`, giải nén full source vào thư mục hiện tại (giữ `.git`); chạy `npm ci`, `npm run check`, rồi `npm run dev -- --port 5188`. Mở Thí nghiệm → Lò xo Hooke. Bản R3 bao gồm đầy đủ các thay đổi R2; không cài thêm PATCH hay ZIP R2 sau khi giải nén R3.

---

# PhysicsLab 1.3.0 Remake R2 — Circuit Workbench

Website Vật lý THPT Việt Nam độc lập — Vite + Vanilla JS, mô phỏng tương tác, thí nghiệm ảo và tiến độ lưu cục bộ. **Giao diện và mã nguồn do PhysicsLab xây dựng, không lấy hoặc thay nhãn PhET.**

## Bản R2: Bàn lắp mạch điện tự do (không chỉ kéo tham số)

Mở **Thí nghiệm → Lắp mạch điện tương tác**. Mục này được ưu tiên khi mở trang thí nghiệm.

- Chọn/kéo thả 6 loại linh kiện: pin DC, bóng đèn, điện trở, công tắc, ampe kế, vôn kế.
- Kéo vị trí linh kiện trên bàn; chạm hai **đầu nối hình tròn** để tạo dây; có thể kéo từ đầu này sang đầu kia. Chọn dây để tháo, chọn linh kiện để xoay và điều chỉnh giá trị bằng ô nhập.
- 3 bố trí ban đầu: nối tiếp, song song và bàn trống. Tự đấu lại và thử mở/đóng công tắc. Hiệu ứng đèn sáng và chấm dòng điện cập nhật theo **công suất/dòng do bộ giải mạch DC tính**.
- Bộ giải sử dụng **modified nodal analysis** (định luật Kirchhoff + Ohm), nhiều nhánh nối tiếp/song song và các đảo mạch hở, phát hiện chập trực tiếp hai cực nguồn hoặc đấu nguồn lí tưởng xung đột.
- Ampe kế có điện trở trong 0,02 Ω, vôn kế 10 MΩ; các phép đo dụng cụ phụ thuộc **vị trí đấu dây** thay vì công thức cố định.
- Lưu sơ đồ và sổ tay đo trên thiết bị; xuất CSV; có hướng dẫn 3 thử thách. Mã nguồn có kiểm thử lõi mới cho phép so sánh với giá trị phân tích.
- Bàn mạch có thể cuộn ngang trên điện thoại để thao tác đủ lớn; SVG hỗ trợ điểm nối bằng Enter/Space và thao tác chạm.

**R2 là đợt phát triển theo từng thí nghiệm, chưa phải remake hoàn chỉnh của cả 13 mô phỏng và 17 thí nghiệm.** Những phần cũ vẫn hoạt động, dữ liệu học tập vẫn dùng khóa cũ `physicslab.progress.v1`. Bàn mạch mới dùng khóa riêng `physicslab.circuit-workbench.v1`.

**Giới hạn mô hình**: mạch một chiều thuần trở, bóng đèn giả định điện trở không đổi; bỏ qua nhiệt, điện trở dây, quá tải/sự cố vật lý ngoài cảnh báo mạch chập, điện dung và điện cảm. Các chấm chuyển động chỉ minh họa hướng dòng điện quy ước. Trong mạng dây lí tưởng tạo vòng, dòng qua từng đoạn dây riêng lẻ không xác định duy nhất.

## Các chức năng kế thừa từ R1

- **13 mô phỏng**: có thanh hướng dẫn tương tác, chế độ tập trung vào cảnh, truy cập đồ thị một chạm, các thao tác vật thể hiện có vẫn giữ nguyên. Nút `Tập trung quan sát` là một chế độ có thể thoát, không làm mất dữ liệu.
- **Mạch điện**: điều chỉnh điện áp bằng cách kéo nguồn trên sơ đồ, kéo điện trở, chuyển mạch nối tiếp/song song, xem đồng hồ A/V lấy số từ định luật Ohm.
- **Công cụ**: thêm bàn tổng hợp hai lực, kéo mũi tên F₁/F₂, xem hợp lực và hình chiếu theo định luật cộng vectơ.
- **Thí nghiệm**: 17 mục (gồm bàn lắp mạch mới) theo lĩnh vực, thẻ có minh họa dụng cụ riêng, tìm kiếm/lọc không dấu; trang thí nghiệm ưu tiên sân khấu trực quan; đọc dự đoán từ mô hình và ghi số đo bằng dụng cụ có độ chia. Hooke, CSV, báo cáo và hiệu chuẩn được bảo toàn.
- **3D**: vùng quan sát lớn hơn, bảng điều khiển phân cấp, công thức không tràn hộp, playback sát canvas, nền lưới có độ tương phản tốt hơn.
- **Điện thoại**: điều hướng dưới có đủ sáu mục cùng hàng.

## Trạng thái nghiệm thu

Đây là **Remake R2**, chưa được đánh dấu Stable. Bảng kiểm chứng và phạm vi còn lại ở [docs/REMAKE_SCOPE.md](docs/REMAKE_SCOPE.md). Dựng mạch thuần trở DC tùy ý đã được bổ sung trong R2 nhưng các hệ thống mô phỏng khác vẫn chưa được làm lại toàn diện, và chưa có kiểm chứng browser trên Windows trong lần bàn giao này.

## Chạy trên Windows

```powershell
npm ci
npm run check
npm run dev -- --port 5188
```

Mở Terminal thứ hai: `npm run check:browser`. Chỉ cập nhật Cloudflare sau khi unit/build/browser tests và kiểm thử bằng mắt thực tế hoàn tất.

Dữ liệu tiến độ giữ nguyên khóa `physicslab.progress.v1`. Không xóa dữ liệu trình duyệt khi cập nhật.

**Tham khảo thiết kế tương tác:** [PhET Interactive Simulations, University of Colorado Boulder](https://phet.colorado.edu/vi/simulations/filter?subjects=physics&type=html). PhysicsLab không phân phối lại mô phỏng PhET trong ZIP này.

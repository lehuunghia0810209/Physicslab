# BIÊN BẢN BÀN GIAO PHYSICSLAB — CHECKPOINT 1.9 → 2.2

> Tài liệu này mô tả đúng trạng thái mã nguồn tại checkpoint ngày **2026-10-12 (Asia/Saigon)**. Đây là biên bản bàn giao công việc đang thực hiện, **không phải xác nhận PhysicsLab 2.2 đã hoàn thành hoặc sẵn sàng phát hành Stable**.

## 1. Thông tin bàn giao

| Trường | Giá trị |
| --- | --- |
| Dự án | PhysicsLab |
| Thư mục làm việc | `D:\EduLab\physicslab` |
| Nhánh Git | `main` |
| Commit nền | `ef4803a` — `BETA 2` |
| Phiên bản trong `package.json` | `1.8.0-preview.1` |
| Trạng thái | Checkpoint đang phát triển, chưa phát hành |
| Ngày lập biên bản | 2026-10-12 |
| Người bàn giao | ........................................................ |
| Người tiếp nhận | ........................................................ |
| Ngày/giờ tiếp nhận | ........................................................ |

## 2. Tóm tắt điều hành

Mục tiêu dài hạn là nâng PhysicsLab từ nền hiện tại lên 2.2 theo thứ tự ưu tiên: **dễ sử dụng → đúng vật lý → UI/UX chuyên nghiệp → chuyển động mượt → hiệu năng và khả năng bảo trì**.

Đến checkpoint này, nhóm công việc đã hoàn thành gồm:

- Ổn định luồng Learning, Hooke, accessibility, lifecycle animation và browser acceptance.
- Hoàn thiện lát cắt đầu tiên của Classroom 2.0: Student Lab Notebook cho 15 thí nghiệm và Teacher Studio dùng chung cho 13 mô phỏng.
- Tạo offline production bằng service worker có cache theo nội dung và kiểm thử thay cache an toàn.
- Audit trải nghiệm 13 mô phỏng; hoàn thành **hai lát cắt deep-remake đầu tiên** cho Waves và Electric Circuits.
- Mở rộng browser acceptance đến 1920 px, kiểm tra mục tiêu tương tác 44 px kể cả SVG slider, và sửa các tay nắm trực tiếp bị nhỏ ở nhiều mô phỏng/công cụ.
- Chạy thành công unit tests, Vite production build, browser tests và offline tests ở checkpoint cuối.

Phần **chưa hoàn thành** là deep-remake 11 mô phỏng còn lại, đánh giá sâu các bàn thí nghiệm dùng chung yếu hơn, profiling CPU/FPS, PWA install/update UX và kiểm thử thủ công trên Firefox/thiết bị cảm ứng thật. Vì vậy không được đổi nhãn thành 2.2 Stable.

## 3. Trạng thái Git phải bảo toàn

Working tree hiện **không sạch** và chứa cả thay đổi đã stage, chưa stage và file chưa theo dõi:

- 104 mục trong `git status --porcelain`.
- 21 đường dẫn có thay đổi staged; 44 đường dẫn có thay đổi unstaged; 53 đường dẫn untracked. Một đường dẫn có thể vừa staged vừa unstaged nên các số này có thể chồng lắp.
- Có nhiều thay đổi thuộc toàn bộ quá trình nâng cấp, không chỉ riêng lát cắt Waves/Circuits.
- Chưa tạo commit mới, chưa push GitHub và chưa triển khai Cloudflare.

Yêu cầu với người tiếp nhận:

- [ ] Chạy `git status --short` trước mọi thao tác.
- [ ] Không dùng `git reset --hard`, `git clean`, `git checkout -- <file>` hoặc thao tác làm mất thay đổi.
- [ ] Không ghi đè các file staged/unstaged hiện có nếu chưa xem cả `git diff` và `git diff --cached`.
- [ ] Không xóa `.claude/`, `physics_extracted/` hoặc `circuit-smoke.html`; đây là nội dung untracked có sẵn và chưa được xác định để dọn.
- [ ] Không push/deploy nếu chưa có phê duyệt rõ ràng của chủ dự án.

## 4. Công việc đã thực hiện

### 4.1. Ổn định nền 1.9

#### Learning và dữ liệu tiến độ

- Sửa lỗi một lần chạy Projectile ngoài Learning vẫn có thể làm tiến độ bài học tăng.
- Tiến độ bước thực nghiệm giờ chỉ được xác nhận trong luồng Learning khi có dự đoán đã lưu, baseline khi mở từ bài học và bằng chứng tương tác/đo đạc thực tế.
- Duy trì schema versioned `physicslab.progress.v1`; không xóa dữ liệu tiến độ người dùng.
- Mở rộng schema để lưu notebook theo mã thí nghiệm, có vệ sinh chuỗi, giới hạn độ dài và self-assessment 1–5.

#### Hooke

- Bổ sung phản hồi live riêng khi thực hiện bù điểm không.
- Bảo toàn nguyên tắc mỗi lò xo có ID riêng; hồi quy `F = kΔx` chỉ gộp mẫu của cùng lò xo.
- Dữ liệu cũ thiếu ID vẫn được giữ nhưng không được dùng để trộn kết quả khoa học.

#### Accessibility và lifecycle

- Sửa mục tiêu tương tác dưới 44 px ở các control được phát hiện trong Lab/3D và các lát cắt sau.
- Bổ sung accessible name cho các slider vector còn thiếu.
- Browser suite theo dõi `requestAnimationFrame`; các route động phải tạo frame khi chạy và không để lại animation loop sau khi cleanup.
- Không nới lỏng assertion để làm test pass; các lỗi được sửa tại control/model/lifecycle tương ứng.

### 4.2. Student Lab Notebook — 15 thí nghiệm

- Tạo notebook local-first cho toàn bộ 15 thí nghiệm.
- Mỗi notebook có mục tiêu, giả thuyết, quan sát, kết luận và tự đánh giá.
- Notebook đọc bằng chứng từ measurement session hiện có thay vì tạo nguồn đo thứ hai.
- Hỗ trợ autosave, import/export JSON có validation và chế độ in/PDF-friendly.
- Dữ liệu vẫn nằm trên thiết bị; không có tài khoản, roster hoặc đồng bộ nhiều thiết bị.

Tệp chính:

- `src/pages/lab-notebook.js`
- `src/styles/lab-notebook.css`
- `src/core/progress.js`

### 4.3. Teacher Studio — 13 mô phỏng

- Tạo lớp khám phá/Teacher Studio dùng chung cho toàn bộ 13 mô phỏng.
- Giáo viên có thể lưu/khôi phục control state, tạm dừng ở điểm phân tích và bật/tắt measurements, vectors, graphs, explanations.
- Các layer trình bày không được sửa trạng thái vật lý.
- Cấu hình Teacher Studio được vệ sinh và lưu theo session `teacher-<simulation-id>`.
- Với Circuit Workbench, trạng thái mạch tự lưu bằng storage riêng; Teacher Studio hiển thị đúng cơ chế này thay vì giả vờ tạo snapshot control chuẩn.

Tệp chính:

- `src/app/simulation-studio.js`
- `src/styles/exploration-studio.css`
- `src/data/exploration-missions.js`
- `src/data/experiment-guides.js`

### 4.4. Offline production

- `vite.config.js` tạo `dist/sw.js` sau production build; cache version dựa trên hash của output.
- Service worker precache toàn bộ production output, gồm các chunk lazy của simulation, Learning, Lab, Tools và 3D Explorer.
- Cài đặt chỉ hoàn thành khi precache đầy đủ; cache PhysicsLab cũ chỉ bị xóa sau activation thành công để tránh làm mất bản offline đang dùng.
- Service worker chỉ đăng ký trong production từ `src/main.js`.
- `scripts/offline-check.cjs` kiểm tra shell và lazy route trong browser offline, các bundle quan trọng trong precache và việc thay cache.

Giới hạn còn lại: chưa có Web App Manifest và chưa có UI thông báo service worker mới đang chờ tab cũ đóng.

### 4.5. Audit PhET và kế hoạch remake

- Đã nghiên cứu trực tiếp các mẫu tương tác chính thức của PhET cho Forces and Motion: Basics, Wave on a String và Circuit Construction Kit: DC.
- Đã lập audit cho toàn bộ 13 mô phỏng và nguyên tắc nghiệm thu theo thao tác trực tiếp, mô hình, phản hồi, special states và responsive behavior.
- Không coi việc thêm slider/CSS/animation trang trí là deep-remake.

Tài liệu:

- `docs/SIMULATION_PHET_UX_AUDIT.md`
- `docs/SIMULATION_REMAKE_PLAN.md`
- `docs/SIMULATION_QA_REPORT.md`

### 4.6. Deep remake 1 — Waves

#### Mô hình vật lý

- `src/core/waves.js` có `createRopeWave` và `createWaveExperiment` cho sóng dây nhân quả.
- Tái sử dụng `ROPE_LENGTH`, `ropeDisplacement` và `waveSpeed` từ `src/core/lab-16-physics.js`; không tạo engine sóng thứ hai.
- Hỗ trợ xung do tay tạo, nguồn điều hòa, phản xạ đầu cố định/tự do, probe di chuyển và vận tốc phần tử tính số.
- Cùng một model cấp dữ liệu cho hình dây, readout và graph.
- Giữ các chế độ giải tích traveling, standing và interference đã có.

#### Tương tác và UX

- Pulse là chế độ mặc định; người học kéo trực tiếp nguồn để tạo xung.
- Nguồn và probe hỗ trợ pointer, keyboard, pointer capture và pointer cancel.
- Drag được tính từ model origin tại `pointerdown`, tránh tay nắm nhảy khi bắt đầu kéo.
- Có nút phát xung, chọn fixed/free boundary và progressive disclosure cho control không liên quan.
- Slider có aria value; mục tiêu chạm 44 px không làm phình artwork nhìn thấy.
- Tiêu đề graph cập nhật theo trạng thái probe/model.

#### Kiểm thử và bằng chứng

- Unit tests kiểm tra lan truyền xung/probe và dấu phản xạ ngược nhau giữa fixed/free end.
- Browser checks kéo nguồn bằng tay, điều khiển probe bằng bàn phím, đổi boundary và thử các mode giải tích.
- Ảnh: `work/wave-remake-desktop.png`, `work/wave-remake-mobile.png`.
- Đã sửa collision giữa nhãn nguồn và mốc 0 m; phase controls được ẩn trong pulse/harmonic khi không liên quan.

Tệp chính:

- `src/core/waves.js`
- `src/simulations/waves/index.js`
- `src/simulations/waves/waves.css`
- `tests/waves.test.js`

### 4.7. Deep remake 2 — Electric Circuits

#### Kiến trúc và mô hình

- Thay scene series/parallel cố định riêng trong `src/simulations/electricity/index.js` bằng `mountCircuitWorkbench` dùng chung.
- Dùng `solveBench` trong `src/core/circuit-workbench.js` làm nguồn tính Kirchhoff/MNA duy nhất; không tạo electrical engine thứ hai.
- Simulation và Virtual Lab chia sẻ/persist cùng trạng thái qua key `physicslab.circuit-workbench.v1`.
- `mountCircuitWorkbench` nhận thêm callback tùy chọn `onState` và `onRecord`; caller Lab cũ vẫn hoạt động.

#### Tương tác và special states

- Có thể thêm/kéo linh kiện, nối terminal, đóng/mở switch, dùng bulb, ammeter, voltmeter và preset.
- Hỗ trợ edit, rotate, delete, observations và CSV.
- Có phản hồi cho open circuit, short circuit và conflicting source.
- Circuit missions bấm đúng preset button thật thay vì chỉ thay control giả lập.

#### Kiểm thử và bằng chứng

- Browser test dựng mạch rỗng bằng 3 linh kiện + 3 dây, mở switch, kiểm tra trạng thái rồi kiểm tra dòng điện ở preset song song.
- Unit test cho action button trong exploration mission.
- Ảnh: `work/circuit-construction-desktop.png`.

Tệp chính:

- `src/core/circuit-workbench.js`
- `src/pages/circuit-workbench.js`
- `src/simulations/electricity/index.js`
- `src/simulations/electricity/electricity.css`
- `tests/circuit-workbench.test.js`
- `tests/exploration-missions.test.js`

### 4.8. Audit tay nắm tương tác 44 px

Browser matrix được mở rộng từ `1440/1024/768/390/360/320` thành `1920/1440/1024/768/390/360/320`. Selector kiểm tra target có thêm `[role=slider]`, nhờ đó phát hiện các SVG/direct handle trước đây bị bỏ sót.

Đã sửa hit target bằng vùng trong suốt, không làm lớn artwork, tại:

- Projectile: `src/simulations/projectile/scene.js`, `src/styles/simulation-experience.css`.
- Inclined Plane: `src/simulations/inclined/index.js`, `src/simulations/inclined/inclined.css`.
- Waves: `src/simulations/waves/*`.
- Magnetic Field: `src/simulations/magnetism/index.js`, `src/simulations/magnetism/magnetism.css`.
- Ideal Gas: `src/simulations/thermal/index.js`, `src/simulations/thermal/thermal.css`.
- Vector Playground: `src/pages/vector-playground.js`, `src/styles/remake-studio.css`.

Lưu ý: command trong `package.json` chạy `scripts/browser-check.cjs`. File `browser-check.cjs` ở root là một bản khác và hiện không chứa matrix 1920/[role=slider]. Không được xem hai file là đồng bộ; cần quyết định xóa bản root nếu chắc chắn không còn caller, hoặc hợp nhất có kiểm chứng.

## 5. Kiến trúc và hợp đồng dữ liệu cần giữ

| Khu vực | Hợp đồng cần bảo toàn |
| --- | --- |
| Physics core | `src/core/*.js` độc lập DOM; UI, readout và graph phải lấy từ cùng model. |
| Rendering/engines | Dùng lại `Timeline`, `GraphRenderer`, measurement/vector engines; route phải cleanup listener/RAF. |
| Simulation catalog | `src/data/registry.js` là nguồn sự thật cho 13 mô phỏng. |
| Lab catalog | `src/core/lab-experiments.js` là nguồn sự thật cho 15 thí nghiệm. |
| Progress | Giữ tương thích `physicslab.progress.v1`; mọi migration phải validate và có export/rollback. |
| Circuit state | Giữ `physicslab.circuit-workbench.v1`; Simulation và Lab dùng chung workbench/solver. |
| Learning evidence | Không ghi nhận bước thực nghiệm từ một simulation mở độc lập. |
| Teacher Studio | Chỉ thay lớp trình bày/control snapshot; không đổi kết quả vật lý hoặc dữ liệu Lab của học sinh. |
| Offline | Không xóa cache đang dùng trước khi cache thay thế cài thành công. |
| 3D Explorer | Hiện là Canvas 2D projection; không mô tả là WebGL/Three.js. |

## 6. Kết quả kiểm thử đã xác nhận

| Lệnh | Kết quả checkpoint | Phạm vi chính |
| --- | --- | --- |
| `npm run check` | PASS | 149 module JS qua syntax/import/export/lazy-registry checks; 189 unit tests; Vite build với 129 module transformed. |
| `npm run check:browser` | PASS | 13 simulation routes; 1920/1440/1024/768/390/360/320; không overflow; target ≥44 px; accessible names; gesture thật; không exception/console error/request failure; RAF cleanup; Waves/Circuits checks. |
| `npm run check:offline` | PASS | Production shell và lazy simulation chạy offline; Learning/Lab/Tools/3D được precache; cache cũ chỉ xóa sau thay thế hoàn chỉnh. |
| `npm run check:core` | PASS | 149 module checks và 189 unit tests sau chỉnh sửa microcopy Teacher Studio cuối cùng. |

Ghi chú nghiệm thu:

- `docs/browser-report.json` được tạo lại bởi browser acceptance và là báo cáo máy đọc gần nhất.
- Full browser suite đã chạy trước thay đổi cuối chỉ liên quan thông báo microcopy auto-persistence của Circuit Teacher Studio; sau thay đổi đó `check:core` đã pass.
- Không có kiểm thử nào được xóa hoặc nới điều kiện chỉ để đạt PASS.

## 7. Danh mục tài liệu/bằng chứng

| Tài liệu | Mục đích |
| --- | --- |
| `docs/EVOLUTION_1_9_TO_2_2.md` | Release gates, baseline, milestone và phần còn thiếu. |
| `docs/ARCHITECTURE.md` | Kiến trúc, state ownership, scientific principles, giới hạn. |
| `docs/KNOWN_ISSUES.md` | Các giới hạn phải công khai ở checkpoint. |
| `docs/SIMULATION_PHET_UX_AUDIT.md` | Benchmark tương tác và audit UX theo mô phỏng. |
| `docs/SIMULATION_REMAKE_PLAN.md` | Thứ tự và tiêu chí remake. |
| `docs/SIMULATION_QA_REPORT.md` | Ma trận trạng thái và evidence. |
| `docs/browser-report.json` | Kết quả browser automation gần nhất. |
| `work/wave-remake-desktop.png` | Evidence Waves desktop. |
| `work/wave-remake-mobile.png` | Evidence Waves mobile. |
| `work/circuit-construction-desktop.png` | Evidence Circuit construction. |

Ngoài ra còn các báo cáo/checkpoint lịch sử như `TEST_REPORT_REMAKE*.md`, `LAB_1_5_QA.md`, `LAB_1_6_QA.md`, `REMAKE_R4_AUDIT.md`. Khi có mâu thuẫn về số lượng, dùng runtime catalog và các tài liệu checkpoint mới ở bảng trên.

## 8. Phần chưa hoàn thành và rủi ro

### 8.1. 11 mô phỏng chưa deep-remake

Các mô phỏng sau mới ở trạng thái audit hoặc sửa target cục bộ, **không được mô tả là đã remake hoàn chỉnh**:

1. Projectile Motion.
2. Newton's Laws.
3. Inclined Plane.
4. Friction.
5. Work & Energy.
6. Collision/Momentum.
7. Oscillation.
8. Electric Field.
9. Magnetic Field.
10. Optics.
11. Ideal Gas.

Mỗi mô phỏng còn cần ít nhất: primary gesture rõ ràng, mô hình và special states đúng, scene/readout/graph đồng bộ, keyboard/touch, reset hợp lệ, route cleanup, responsive 320–1920, screenshot trước/sau và test hành vi thật.

### 8.2. Virtual Lab

- Ba workbench chuyên dụng và bốn shared bench sâu đang mạnh nhất.
- Các shared bench còn lại có Canvas/model/measurement thật nhưng chưa qua toàn bộ review 1.9 theo chuỗi apparatus → action → observation → measurement → analysis.

### 8.3. Hiệu năng, thiết bị và trình duyệt

- Chưa profiling CPU/FPS dài hạn trên máy cấu hình thấp.
- Chưa xác nhận Firefox và thiết bị touch thật.
- Browser automation hiện dựa trên Edge/Chromium trong môi trường phát triển.

### 8.4. Product/release

- Chưa có Web App Manifest hoặc update notification UI.
- 3D Explorer vẫn là Canvas projection, không phải engine 3D tổng quát.
- Student Notebook và Teacher Studio chỉ local-first, không có backend/roster/sync.
- Package vẫn là `1.8.0-preview.1`; chưa được phép đổi phiên bản chỉ vì checkpoint này.
- Working tree lớn và hỗn hợp; cần chia commit theo chức năng sau khi review, không gom mù một commit.

## 9. Thứ tự tiếp tục khuyến nghị

### Mốc A — Hoàn tất 1.9 cho simulation/lab

1. Remake Optics bằng cách tái sử dụng optical bench/drawing/model hiện có trong Lab; không tạo ray engine mới.
2. Remake Inclined Plane bằng release cart, direct manipulation và layer force/energy dùng chung model.
3. Làm Friction, Work/Energy và Collision theo cùng mechanics control/measurement patterns.
4. Làm Projectile, Newton và Oscillation; ưu tiên primary gesture và special states hơn trang trí.
5. Làm Electric Field, Magnetic Field và Ideal Gas; giữ model core hiện tại và thêm tương tác thực nghiệm trực tiếp.
6. Review 12 shared lab benches theo chuỗi thực nghiệm đầy đủ; ưu tiên bench có hành động còn phụ thuộc nhiều vào form control.

Sau **mỗi** hạng mục lớn:

```powershell
npm run check
npm run check:browser
npm run check:offline
```

Chỉ cần chạy offline ở các mốc có thay đổi build/chunk/service worker; nhưng phải chạy lại trước checkpoint/release. Nếu một lệnh fail, sửa nguyên nhân gốc trước khi chuyển sang mô phỏng tiếp theo.

### Mốc B — Classroom/Tools/3D hoàn thiện

1. Thử trọn luồng Learn → Predict → Experiment → Record → Explain → Self-check.
2. Kiểm tra import/export notebook bằng dữ liệu hỏng, dữ liệu dài và backup cũ.
3. Mở rộng tools chỉ khi dùng dữ liệu model thật: multi-run comparison, probe coordinates, SI export, fit-to-view/layer toggles.
4. Chỉ cân nhắc WebGL khi có scene cụ thể mà Canvas 2D không đáp ứng; không thêm dependency theo suy đoán.

### Mốc C — 2.2 release hardening

1. Profile CPU/FPS và memory ở route động lâu chạy.
2. Test Firefox, Edge/Chromium và ít nhất một điện thoại/tablet cảm ứng thật.
3. Hoàn thiện manifest/update UX nếu tiếp tục mục tiêu installable PWA.
4. Hợp nhất/xóa có kiểm chứng `browser-check.cjs` trùng ở root.
5. Đối chiếu README, changelog, architecture, known issues và runtime catalogs.
6. Review `git diff`/`git diff --cached`, chia commit có chủ đề, chạy toàn bộ acceptance rồi mới cân nhắc bump version.

## 10. Quy trình nhận việc nhanh

```powershell
Set-Location D:\EduLab\physicslab
git status --short
git diff --stat
git diff --cached --stat
npm install
npm run check
npm run check:browser
npm run check:offline
```

Không cần chạy `npm install` nếu `node_modules` hiện tại đã đúng lockfile; không tự nâng dependency trong lúc nhận bàn giao.

Các route cần smoke-test thủ công đầu tiên:

- Waves: tạo xung bằng kéo nguồn, đổi fixed/free, di chuyển probe, thử bàn phím.
- Electric Circuits: tạo mạch từ rỗng, nối dây, đóng/mở switch, thêm meter, thử open/short.
- Learning: mở mô phỏng ngoài bài học và xác nhận không làm tăng evidence.
- Lab Notebook: sửa/autosave/export/import/print một notebook.
- Teacher Studio: save/restore, pause, layer toggles; kiểm tra circuit auto-persistence.
- Rời từng route đang chạy và xác nhận không còn frame/console error.

## 11. Checklist nghiệm thu của người tiếp nhận

### Mã nguồn và dữ liệu

- [ ] Đã đọc `git status --short`, `git diff` và `git diff --cached`.
- [ ] Đã xác nhận branch `main`, base commit `ef4803a` và package `1.8.0-preview.1`.
- [ ] Đã sao lưu working tree trước khi chia commit hoặc rebase.
- [ ] Đã xác nhận progress/notebook/circuit state cũ vẫn đọc được.

### Chức năng

- [ ] Đã smoke-test Waves theo primary gesture.
- [ ] Đã dựng và vận hành mạch điện từ canvas trống.
- [ ] Đã kiểm tra Learning evidence không bị bypass.
- [ ] Đã kiểm tra Notebook và Teacher Studio.
- [ ] Đã kiểm tra route cleanup và offline lazy route.

### Kiểm thử

- [ ] `npm run check` PASS.
- [ ] `npm run check:browser` PASS.
- [ ] `npm run check:offline` PASS.
- [ ] Đã xem `docs/browser-report.json` và screenshots, không chỉ nhìn exit code.

### Phạm vi và phát hành

- [ ] Hiểu rằng chỉ Waves và Electric Circuits đã qua deep-remake checkpoint.
- [ ] Không mô tả 11 mô phỏng còn lại là đã hoàn thiện.
- [ ] Không bump version, push hoặc deploy khi chưa được duyệt.
- [ ] Đã ghi checkpoint mới vào docs nếu phải dừng giữa chừng.

## 12. Xác nhận bàn giao

**Người bàn giao**

- Họ tên: ........................................................................
- Xác nhận phạm vi: ........................................................................
- Ngày/giờ: ........................................................................
- Chữ ký: ........................................................................

**Người tiếp nhận**

- Họ tên: ........................................................................
- Đã nhận mã nguồn/working tree: Có / Không
- Đã chạy bộ kiểm thử: Có / Không / Sẽ chạy lại
- Vấn đề phát hiện thêm: ........................................................................
- Ngày/giờ: ........................................................................
- Chữ ký: ........................................................................

**Quyết định tiếp theo**

- Mô phỏng/lab tiếp tục: ........................................................................
- Người phụ trách: ........................................................................
- Mốc kiểm tra kế tiếp: ........................................................................
- Điều kiện được phép commit/push/deploy: ........................................................................

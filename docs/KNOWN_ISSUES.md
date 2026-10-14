**MỚI — AUD-001:** mã nguồn đã chuyển Learning Home sang catalog 49 bài reader-first và tách hoạt động khám phá cũ thành route `explore-*`; 280/280 core tests PASS. Browser, build và offline của Patch mới vẫn chờ kiểm chứng trên Windows. Xem [AUD_001_RESOLUTION.md](audits/AUD_001_RESOLUTION.md).

**Cập nhật 2026-10-14, QA Hardening:** sửa chấm câu số/đơn vị, bảo toàn điểm bài kiểm tra khi luyện câu lẻ và trộn đề đa bài; mã mới có 275/275 unit tests PASS. Production Browser/Offline QA của checkpoint **chưa chạy**, cần kiểm tra trên Windows. Nội dung học thuật vẫn cần giáo viên phản biện. Xem [LEARNING_3_0_QA_HARDENING.md](LEARNING_3_0_QA_HARDENING.md). Những dòng 19/49 dưới đây là trạng thái lịch sử.

**Checkpoint nội dung mới:** 49/49 đơn vị có Lesson Reader; vẫn còn các khoảng trống về mô phỏng định lượng và phản biện giáo viên, chưa kiểm chứng trình duyệt Windows/Firefox/PWA đa tab trên code mới. Những dòng 19/49 phía dưới thuộc checkpoint A cũ. Xem [LEARNING_3_0_CONTINUATION.md](LEARNING_3_0_CONTINUATION.md).

> 2.4.0-dev: 19/49 đơn vị là bài Learning 3.0 hoàn chỉnh (lớp 10 đạt 17/17); 14 đơn vị chưa có Simulation/Lab. Firefox, cảm ứng thật, screen reader, PWA nhiều tab và profiling dài hạn chưa xác minh.

# Known issues

- PhysicsLab code is `2.4.0-dev` (**not Stable**). 19 bài đã qua automated QA; 30 curriculum items lớp 11–12 còn cần biên soạn và toàn bộ nội dung mới vẫn cần giáo viên phản biện độc lập.
- Hooke intentionally models the linear elastic and damped-motion regime; non-linear springs and material failure are outside the current model.
- The 3D Explorer is a camera-fitted Canvas 2D projection, not WebGL. It now provides SI axes/grids, model-time playback and physical vectors for the two current scenes, but not arbitrary 3D construction, lighting or occlusion.
- The five Phase B priority simulations now have model-linked direct apparatus controls and a shared session measurement/CSV panel. The remaining simulation benches still vary in interaction depth and need real-student usability comparison; the new session table is not automatically copied into Student Notebook.
- Student notebooks and Teacher Studio are local-first and do not synchronize between devices or provide accounts/class rosters.
- PWA manifest, install icons and user-initiated update notice are implemented. Multi-tab upgrades, Firefox and touch devices still require real-device/manual verification.
- Animation-loop cleanup and automated 1920 px acceptance are covered, but full CPU/FPS profiling, real touch devices, and Firefox/cross-browser manual testing are not yet verified.
- All 13 simulation routes received changes through the two Simulation Remake rounds, but equivalence to PhET and usability on all physical devices have **not** been independently established; do not claim such equivalence.

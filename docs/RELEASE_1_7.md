# PhysicsLab 1.7

## Mục tiêu đợt này
- Sửa lỗi chồng chữ trên bàn thí nghiệm máng nghiêng.
- Sửa hiện tượng kéo tay nắm bị giật/nhảy ở bàn quang học.
- Giữ nguyên các tính năng 1.6 và không lặp lại kiểu lỗi UI chồng lấn / drag phản hồi không ổn định.

## Những gì đã sửa
1. **Máng nghiêng**
   - Tách vị trí nhãn `KÉO ĐẦU MÁNG` và `KÉO XE` khi hai tay nắm đứng gần nhau.
   - Thêm leader line để người dùng vẫn hiểu nhãn thuộc tay nắm nào.

2. **Thấu kính**
   - Bổ sung drag session ổn định: khi bắt đầu kéo, hệ quy chiếu kéo được neo theo trạng thái tại thời điểm pointerdown.
   - Giảm hiện tượng nhảy hình do vòng lặp phản hồi giữa thay đổi thông số và thay đổi hình vẽ.
   - Giữ trải nghiệm kéo tuyến tính hơn, dễ quan sát hơn.

3. **Phiên bản**
   - Nâng version package lên `1.7.0-simulation-engine.0`.
   - Cập nhật nhãn trong workbench sang PhysicsLab 1.7.

## Kiểm tra
- `check:core`: PASS (181/181)
- Build Vite: chưa xác minh được trong môi trường container hiện tại vì snapshot node_modules không đầy đủ cho CLI build, cần chạy lại trên máy local.

# Báo cáo kiểm thử trải nghiệm PhysicsLab

**Ngày kiểm thử:** 10/10/2026  
**Góc nhìn:** Giáo viên Vật lý THPT lần đầu sử dụng; có đối chiếu luồng học sinh tự học.  
**Kết luận nhanh:** Các luồng mô phỏng, đo đạc, bài học và công cụ chính hoạt động tốt trong kiểm thử. Có một lỗi hiển thị nghiêm trọng ở cảnh 3D hạt tích điện trong từ trường; ngoài ra còn một số điểm có thể gây khó dùng cho giáo viên và người mới.

## Phạm vi và cách kiểm thử

Đã thao tác trên trang Tổng quan, thư viện và tìm kiếm, 13 mô phỏng đang sẵn sàng, 16 bài khám phá, phòng thí nghiệm ảo, công cụ đổi đơn vị/phân tích số đo, trình khám phá 3D, lưu tiến độ, xuất CSV/báo cáo, giao diện sáng/tối và các trạng thái nhập liệu hợp lệ/không hợp lệ. Đã kiểm tra giao diện ở độ rộng 320, 360, 390, 768, 1024 và 1440 px.

Các luồng đã chạy gồm: tìm kiếm tiếng Việt không dấu; lọc và xóa bộ lọc; chạy/tạm dừng/đặt lại mô phỏng; preset, đồ thị và đồng bộ con trỏ; ghi phép đo/tải CSV; xử lý tham số sai; hoàn thành bài học và quiz; đo Hooke và các thí nghiệm trong phòng lab; mạch nối tiếp/song song; sóng; từ trường/cảm ứng; thấu kính; khí lí tưởng; đổi đơn vị; phân tích số đo; đổi chủ đề; thao tác trên canvas và các trạng thái biên. Các luồng này không phát sinh lỗi JavaScript, lỗi console mức error hoặc request thất bại trong lượt kiểm thử đã chạy.

## Phát hiện cần ưu tiên

| Mức độ | Khu vực | Vấn đề và cách tái hiện | Tác động đến người dùng | Đề xuất |
|---|---|---|---|---|
| **Cao** | Khám phá 3D → “Hạt tích điện trong từ trường” (cảnh mặc định) | Mở **Khám phá 3D**. Canvas gần như trống: chỉ thấy trục/từ trường và một phần lưới; không thấy đường xoắn ốc hay hạt màu cam. Thay góc, tốc độ hoặc vị trí quỹ đạo làm các số liệu đổi nhưng hình quỹ đạo vẫn không xuất hiện. Cảnh ném xiên ở cùng trang lại vẽ được quỹ đạo. Kiểm tra pixel canvas cũng cho thấy cảnh từ trường không có điểm hạt màu cam, trong khi cảnh ném xiên có cả đường và hạt. | Người mới không nhìn thấy hiện tượng chính mà tính năng 3D quảng bá; khó dùng để giảng lực Lorentz/chuyển động xoắn ốc. | Tự co giãn camera theo biên quỹ đạo; chỉ vẽ một số vòng xoắn phù hợp khung nhìn; thêm dấu mốc/điều khiển “vừa khung”. Kiểm tra cả đường đi và vị trí hạt sau mỗi lần đổi tham số. |

**Gợi ý kỹ thuật để tái hiện:** quỹ đạo được lấy trên khoảng pha `12π` tại [explorer3d.js](../src/pages/explorer3d.js#L97), trong khi lưới minh họa chỉ dựng quanh vùng `z = -18…18` tại [explorer3d.js](../src/pages/explorer3d.js#L81). Với thông số mặc định, thành phần vận tốc song song từ trường kéo quỹ đạo đi xa khỏi vùng nhìn. Đây có vẻ là nguyên nhân khiến đường và hạt nằm ngoài khung canvas.

## Điểm gây khó dùng / giới hạn cho đối tượng THPT

| Mức độ | Khu vực | Quan sát | Tác động và đề xuất |
|---|---|---|---|
| **Trung bình – giới hạn sản phẩm** | Trang Tổng quan và lưu tiến độ | Thanh đầu trang ghi “Học sinh / HS” và “Lưu trên thiết bị” cố định; không có chế độ giáo viên, lớp học, giao bài hoặc chia sẻ tiến độ trong các luồng đã kiểm tra. | Giáo viên dùng để trình chiếu vẫn bị đặt trong vai học sinh; tiến độ gắn với trình duyệt/thiết bị nên không thuận tiện khi đổi máy hoặc dùng chung lớp. Nên có lựa chọn vai trò giáo viên/học sinh và luồng trình chiếu/chia sẻ bài; nếu vẫn lưu cục bộ, cần nói rõ cách sao lưu/chuyển dữ liệu. |
| **Thấp** | Tìm nhanh trên màn hình hẹp | Ở các viewport 320–390 px, nút kính lúp “Tìm nhanh” có vùng bấm khoảng **41 × 44 px** sau khi ẩn chữ và phím tắt. Nút xuất hiện trên mọi trang. | Hơi nhỏ khi chạm trên điện thoại; dễ bấm hụt hơn các nút khác. Tăng `min-width` lên ít nhất 44 px hoặc giữ một nhãn ngắn. |
| **Thấp – cải thiện khám phá** | Học tập tương tác | Có 16 bài học thuộc nhiều khối lớp nhưng màn hình chọn bài không có tìm kiếm/lọc theo lớp hay chủ đề. | Giáo viên cần cuộn/đọc danh sách để tìm bài đúng lớp; bất tiện hơn thư viện mô phỏng vốn đã có tìm kiếm và lọc. Thêm lọc Lớp 10/11/12 và chủ đề sẽ giúp chuẩn bị bài nhanh hơn. |
| **Thấp – quy trình cho người mới** | Hoàn thành bài học | Bước “Tôi đã thực hiện thử nghiệm” chỉ được ghi nhận sau khi mở mô phỏng/thí nghiệm liên quan và có thao tác được theo dõi (đổi tham số hoặc ghi phép đo). Nút xác nhận vẫn hiển thị trước khi đủ điều kiện. | Người mới có thể bấm xác nhận ngay sau khi xem/chạy mô phỏng rồi không hiểu vì sao bước chưa hoàn thành. Có thể khóa nút đến khi đủ điều kiện và hiển thị checklist rõ ràng ngay tại bước 2. |

## Kết quả theo nhóm tính năng

- **Tổng quan và điều hướng:** tải trang, điều hướng, tìm nhanh bằng từ khóa có dấu/không dấu và đóng bằng Escape hoạt động.
- **Thư viện:** tìm kiếm, lọc lĩnh vực/lớp/trạng thái sẵn sàng, trạng thái không có kết quả và xóa bộ lọc hoạt động.
- **Mô phỏng:** các luồng đã thử cho ném xiên, Newton, mặt phẳng nghiêng, ma sát, công–động năng, va chạm, dao động, sóng, mạch điện, điện trường, từ trường, thấu kính và khí lí tưởng đều phản hồi tham số/đồ thị theo dự kiến. Ném xiên có ghi số đo và tải CSV; tham số không hợp lệ được từ chối.
- **Học tập:** lưu dự đoán, làm thí nghiệm, đối chiếu, quiz, phản hồi đúng/sai và tiến độ được kiểm tra; bài Hooke yêu cầu phép đo thực trong lab trước khi ghi hoàn thành.
- **Phòng thí nghiệm:** đã ghi số đo Hooke và thử luồng ghi dữ liệu của các thí nghiệm ảo; hồi quy và báo cáo/CSV được tạo trong các trường hợp đã thử.
- **Công cụ:** đổi đơn vị SI và phân tích phép đo lặp xử lý được dữ liệu hợp lệ lẫn dữ liệu sai.
- **Giao diện:** chế độ sáng/tối, tên điều khiển truy cập được, các trạng thái biên của đồ thị và các viewport đã kiểm tra đều hoạt động; không ghi nhận tràn ngang sau khi trang ổn định.

## Lưu ý về bộ kiểm thử

`scripts/browser-check.cjs` hiện dừng sớm tại dòng 97 vì `a[href="#/explorer3d"]` khớp cả liên kết điều hướng lẫn nút mở trình khám phá, gây lỗi strict-mode của Playwright. Tôi đã chạy tiếp phần kiểm thử bằng bộ chọn cụ thể hơn trong một bản thực thi tạm thời, không sửa mã ứng dụng. Bài kiểm tra vùng chạm 44 px cũng bắt được nút Tìm nhanh rộng 41 px; kiểm thử các nhóm còn lại hoàn tất sau khi tách riêng phát hiện này và lỗi render cảnh Helix nêu trên.

**Không sửa mã ứng dụng trong lượt này**; đây là báo cáo kiểm thử và đề xuất cải thiện.

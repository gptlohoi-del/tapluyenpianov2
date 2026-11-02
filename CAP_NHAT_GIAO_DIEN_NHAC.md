# Cập nhật luyện piano: giao diện, nốt rơi và âm thanh

## Có gì mới?

- Giữ nguyên thiết kế icon được cung cấp: `web/icons/icon-256-original.png` và `web/icons/icon-512.png` (bản gốc). Icon 192 px được thu nhỏ cho PWA. Trong Android build, thư mục `android-assets/res` được copy tự động sau khi Capacitor sinh project.
- Thanh điều khiển: thu gọn; có thanh trượt chiều cao theo pixel (68–150 px) và nút nổi ▴/▾ để ẩn/hiện.
- Cài đặt mở thành bảng bên phải. Khi kéo thanh trượt, thấy ngay thay đổi trên phần màn hình bên trái (không cần đóng cài đặt).
- Các thanh trượt: chiều cao bàn phím, px/phách của nốt rơi, BPM, count-in, chiều cao thanh điều khiển, độ nhạt phím đen. Các giá trị lưu cục bộ và được chuyển đổi từ cài đặt nốt rơi theo % cũ khi dùng lại.
- Hóa biểu gốc cố định ở đầu sheet. Khi transpose, hóa biểu thay đổi và **đổi sang màu tím**. Ký hiệu nốt trên sheet cũng được chuyển theo tông; tông gốc có màu nâu.
- Nốt rơi tính bằng cùng trục thời gian với vạch ô nhịp; bỏ ép chiều dài tối thiểu 20 px gây chồng nốt ngắn; có khe phân cách 5 px. Bổ sung vạch phách mờ, vạch ô nhịp và số ô đậm hơn; dải “Lặng” hiển thị bên trái cho tay phải, bên phải cho tay trái nếu được ký âm.
- Âm thanh WebAudio được xếp lịch trước 130 ms và bổ sung tiếng hòa âm / đuôi tiếng để đỡ rời rạc. **Chưa phải piano sample thực** và chưa được thử nghe trên mọi thiết bị.

## Cách phát hành

1. Tải mã nguồn của ZIP này lên repo GitHub, giữ nguyên cấu trúc thư mục.
2. Chạy Actions **Test and Deploy Piano Web (Pages)**. Bước build phát hành web/offline và ZIP OTA tạo tự động theo bài nhạc trong thư mục `songs/`.
3. Sau khi trang Pages được cập nhật, mở ứng dụng đang cài và chạy kiểm tra OTA nếu cơ chế OTA của APK hiện tại vẫn hoạt động; khi mã native không đổi, giao diện và chức năng web có thể cập nhật OTA.
4. **Đổi icon trên màn hình launcher Android yêu cầu phát hành APK mới và cài đè bằng cùng khóa ký** (OTA nội dung web không thể đổi icon launcher đã biên dịch trong APK). Chạy workflow **Build Piano V2 APK**, các icon được áp dụng tự động. Bản APK debug và release ký khác khóa không thể cài đè lên nhau.

## Thử nghiệm nên làm trên điện thoại Android thật

- Bài `viet-tiep-cau-chuyen-hoa-binh.mxl`: quan sát Si–Rê ở cuối ô 1, Mi đầu ô 2, điểm kết thúc giữa 3 nốt không chồng lấn; nhìn dải Lặng ở đầu ô 1.
- Chọn tông gốc, chuyển +1 rồi -1: kiểm tra dấu hóa biểu đổi màu và thay đổi theo tông.
- Chỉnh các thanh trong Setting: canvas phía sau thay đổi ngay. Thử nút nổi và thử bật/tắt thanh điều khiển.
- Thử tăng/giảm BPM, count-in, nghe ngắt nối ở 2 tốc độ (ví dụ 60 và 100 BPM). Nghe lại trên loa ngoài và tai nghe; tiếng vẫn là synth offline chứ chưa phải sample đàn thật.

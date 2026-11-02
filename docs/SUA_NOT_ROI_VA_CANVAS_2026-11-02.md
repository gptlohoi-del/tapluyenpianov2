# Piano V2 — sửa nốt rơi, dấu lặng, canvas (02/11/2026)

## Những mục đã sửa

1. **Cỡ chữ trên nốt rơi:** slider trong Cài đặt, từ **1 đến 28 px**, mặc định 12 px. Khi nốt quá ngắn hoặc cột phím hẹp, chữ sẽ tự co vừa khung để không tràn sang nốt bên cạnh.
2. **Độ bo góc nốt rơi:** slider từ **0 đến 20 px**, mặc định 5 px. 0 = góc vuông. Cả hai slider lưu cục bộ và cập nhật bản vẽ ngay khi thay đổi.
3. **Dấu lặng:** không vẽ dấu lặng ở ô nhịp 1 (measure đầu). Từ ô 2 trở đi, dấu lặng hiện như một thanh mờ có nét đứt, trên **cùng cột phím của nốt thuộc cùng tay kết thúc ngay trước dấu lặng**; không đặt cố định ở hai cạnh màn hình. Dấu lặng của bè phụ khi tay đó vẫn có nốt khác đang vang được bỏ qua. Nhiều dấu lặng liên tiếp được nối thành một dải. Nếu file không chứa nốt đứng trước tương ứng, dấu lặng không được đặt tùy tiện.
4. **Thời lượng và vạch ô nhịp:** chiều dài nốt rơi đúng theo `durationQuarter * pixelsPerQuarter`; bỏ khoảng trừ cố định 5 px khiến đầu nốt chưa chạm vạch chia ô.
5. **Khoảng trống khi ẩn thanh công cụ:** bỏ cách ghim `canvas.style.height` theo pixel cũ. `ResizeObserver` và sự kiện resize/orientationchange đồng bộ kích thước bộ đệm với vùng chứa, kể cả khi thanh công cụ thu gọn.

## Đường dẫn file chính

- `web/index.html`: giao diện Settings, canvas, xử lý nốt rơi và các tùy chỉnh.
- `web/falling-note-layout.js`: ghép thời gian dấu lặng vào nốt đứng trước.
- `tests/falling-note-layout.test.mjs`: kiểm tra dấu lặng đầu bài, cùng cột phím, bè phụ, dấu lặng liên tiếp.
- `tests/ui-upgrade.test.mjs`: kiểm tra slider và phản hồi kích thước canvas.

## Cách cập nhật

Sao chép toàn bộ nội dung ZIP vào repo đã clone bằng GitHub Desktop, giữ nguyên các thư mục, không chép đè `.git`. Commit và Push, rồi chạy `Test and Deploy Piano Web (Pages)` để phát hành web và cập nhật OTA khi trình cập nhật trong APK đang hoạt động. Không cần cài APK lại chỉ vì thay đổi mã web; sau cập nhật OTA đóng và mở lại app.

## Những giới hạn cần lưu ý

- Đã chạy kiểm thử tự động, tạo gói preview OTA và thử giao diện trong trình duyệt giả lập. Chưa có thử nghiệm trực tiếp trên điện thoại Android/WebView và loa thật.
- Dấu lặng chỉ hiển thị khi có vị trí ngay sau nốt trước được xác định từ MusicXML, nhằm tránh gán sai nốt/phím.
- Tất cả chức năng piano cũ, icon, biểu tượng tông và bố cục của bản cập nhật trước vẫn giữ lại.

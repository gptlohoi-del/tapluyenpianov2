# KẾ HOẠCH TÍCH HỢP APP HUB

1. Chỉ sử dụng mã web ở `web/` (sau build) làm module, không gộp `android/` độc lập vào App Hub.
2. Dùng `web/songs/index.json` và đường dẫn tương đối, không gọi GitHub API để liệt kê bài.
3. Chuyển `web/` sang `public/modules/tapluyenpiano-v2/`; thêm khai báo trong `modules.config.json`, đăng ký preload offline nếu App Hub dùng cơ chế tập tin chung.
4. Không chạy CapacitorUpdater của V2 bên trong App Hub: App Hub có cơ chế OTA riêng, nên thay `native-ota.bundle.js` bằng stub và bỏ đăng ký service worker của module nếu App Hub yêu cầu.
5. Đảm bảo URL tương đối và bộ giải nén JSZip, kiểm tra piano hoạt động khi mất Wi-Fi.
6. Không dùng keystore V2 để ký App Hub. Mã Android native hay MIDI nếu bổ sung sau này phải tích hợp riêng trong App Hub.

# LUYỆN PIANO V2 — repo thử nghiệm độc lập

Ứng dụng luyện piano offline bằng **MusicXML (.musicxml, .xml) và MXL (.mxl)**. Được xây trên trình vẽ nốt rơi/khuông nhạc của ứng dụng Tập luyện Piano trước đây, mở rộng nhận diện câu và điều khiển cảm ứng trên điện thoại.

## 1. Danh mục bài tự động

Chỉ cần thêm/xóa file trong **`songs/`**, rồi chạy GitHub Actions. Script `scripts/build-web.mjs` tự đồng bộ `web/songs/` và tạo `web/songs/index.json`; không cần khai báo tên bài. Có thể có thư mục con; không đưa `.sib` vào danh mục. Đã kèm các `.mxl` từ repo cũ **và** file 48 ô nhịp mới được gửi riêng.

## 2. Tính năng

- Câu theo lời/dấu câu (phần Intro được tách nếu có dẫn nhập rõ), hoặc theo khoảng im lặng/ô nhịp. Không coi mỗi dấu lặng một bè là điểm ngắt.
- Luôn giữ đoạn cuối tay trái dù tay phải nghỉ; chia câu bao phủ liên tục toàn bộ thời gian bản nhạc.
- Chỉnh thủ công mốc câu theo **phách đen tính từ 0**; chế độ lặp A–B theo **ô nhịp**; lưu cấu hình từng bài trên thiết bị.
- Nút câu trước/sau, BPM ±5, chọn tay, khuông nhạc/nốt rơi, phóng to vùng phím, chiều cao bàn phím, đếm nhịp, nghỉ giữa vòng lặp, tùy chọn tăng tốc BPM sau mỗi vòng.
- Phát âm tổng hợp Web Audio; hỗ trợ bản MusicXML 2 tay, các nốt và dấu lặng xen kẽ, hòa âm cơ bản.
- PWA offline, đóng gói thư viện JSZip tại chỗ, APK Android độc lập qua Capacitor, khóa ký APK cố định qua GitHub Secrets.
- OTA **chỉ đối với tệp web và bài hát**: GitHub Pages phát hành `web/ota/bundle.zip` và `latest.json`; APK kiểm tra khi khởi chạy, xác minh SHA256 và tải cập nhật qua Capgo Capacitor Updater. Native/permission/plugin vẫn cần APK mới.
- Cùng thư mục `web/` dùng làm gói module của App Hub (sau khi kiểm thử cơ chế offline/OTA của App Hub).

**Giới hạn cần biết:** MusicXML nâng cao (D.C./D.S., Segno/Coda, volta, pedal, grace notes, đổi tempo nhiều lần), bản nhạc phức tạp nhiều giọng và MIDI/micro chấm điểm **chưa** được xác thực đầy đủ. Ứng dụng tự phát mẫu nhạc; chưa nhận đầu vào từ đàn piano để chấm đúng sai. Phân đoạn tự động là **gợi ý**, có thể sửa thủ công. Trên điện thoại cần mở và thử với từng bài.

## 3. Tạo GitHub repo

1. Tạo repo **mới**, ví dụ `tapluyenpiano-v2`, chọn *Public* nếu muốn phát hành GitHub Pages và OTA tự tải công khai.
2. Giải nén ZIP này, đưa **toàn bộ nội dung bên trong thư mục `tapluyenpiano-v2/`** lên repo mới (cần giữ thư mục `.github/workflows/`). **Không** đưa file khóa `.jks` vào repo.
3. Vào Settings → Pages → Build and deployment → Source = **GitHub Actions**.
4. Vào tab Actions, chạy `Test and Deploy Piano Web (Pages)` để xuất bản PWA và gói OTA; chạy `Build Piano V2 APK` để tạo APK.
5. Lấy APK tại trang **Actions → lần chạy → Artifacts**. `piano-v2-debug-apk` là bản thử nghiệm. Khi khai báo khóa, sẽ có thêm `piano-v2-release-signed` (dùng bản Release này lâu dài).

## 4. Tạo khóa Release cố định trên PC (Windows)

Xem file **`docs/RELEASE_SIGNING_WINDOWS.md`**. Tạo khóa **một lần**, lưu lại file `.jks` và mật khẩu ở nơi an toàn; chuyển Base64 và nhập vào 4 GitHub Secrets:
`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.

> Cảnh báo: APK Debug và APK Release khác chứng chỉ. Không cài đè Release lên Debug với cùng `applicationId`; bạn có thể phải gỡ Debug khi chuyển lần đầu (sẽ mất dữ liệu riêng của bản Debug). Sau khi ổn định, luôn dùng Release cùng khóa.

## 5. Chạy thử trên máy tính

Nếu có Node.js 22 và npm, tại thư mục repo:

```bash
npm install
npm run build:web
npm test
python -m http.server 8000 --directory web
```

Mở `http://localhost:8000`. Nếu chỉ muốn xem nhanh không cần npm thì chạy `npm run build:preview` (sau khi cài Node) hoặc `node scripts/build-web.mjs`; chế độ đó không có OTA native thật.

## 6. Cập nhật ứng dụng

- Thêm bài `.mxl` vào `songs/`, hoặc sửa HTML/JS trong `web/`, rồi `git push`. Workflow Pages tạo lại danh sách, SW, ZIP OTA và `latest.json`.
- APK đã cài **tự kiểm tra OTA khi mở app có mạng**. Sau khi tải ZIP thành công, gói mới được chọn cho lần kích hoạt tiếp theo, tùy cơ chế của Capacitor Updater. Offline vẫn dùng bản đang có.
- Nếu sửa mã Android/SDK/plugin/permission, chạy workflow APK Release để cài **đè bằng cùng khóa ký** và versionCode mới. Không dùng OTA để thay native code.
- APK lấy từ GitHub Actions của repo mới; chưa có APK được xây trong file ZIP này.

## 7. App Hub sau này

Lấy **nội dung bên trong `web/`**, gắn thành `public/modules/tapluyenpiano-v2/`, cập nhật `modules.config.json`, workflow OTA và cache App Hub. Có thể bỏ `native-ota.bundle.js` khỏi gói App Hub để tránh hai bộ cập nhật độc lập. **Không** thay khóa ký APK App Hub bằng khóa V2. Kiểm thử đường dẫn `songs/` và Service Worker riêng trước khi công bố.

## 8. Kiểm thử

`npm test` kiểm tra bao phủ thời gian câu, không bỏ phần cuối tay trái, dấu lặng xen kẽ, tách Intro và tính hợp lệ mốc A–B. Kiểm thử thực tế trên Android, âm thanh, khóa màn hình, điện thoại quản trị, và tải OTA phải do bạn chạy APK từ Actions.

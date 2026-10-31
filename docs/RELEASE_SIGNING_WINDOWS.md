# KÝ APK RELEASE CỐ ĐỊNH — Windows PC

## 1. Tạo keystore

Cài Java JDK (hoặc Android Studio có `keytool`). Mở PowerShell, chạy:

```powershell
keytool -genkeypair -v -keystore tapluyenpiano-v2.jks -alias piano_v2 -keyalg RSA -keysize 3072 -validity 10000
```

Nhập mật khẩu keystore và thông tin chứng chỉ. Giữ cả **tập tin** và **mật khẩu** an toàn. Không gửi cho bất kỳ ai.

## 2. Chuyển file JKS thành Base64 (PowerShell)

Mở PowerShell ngay tại thư mục chứa file `.jks`:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path '.\tapluyenpiano-v2.jks'))) | Set-Content -NoNewline .\keystore-base64.txt
```

Mở file `keystore-base64.txt`, copy toàn bộ chuỗi; **không upload file này lên repo**.

## 3. Nhập GitHub Actions Secrets

Vào **repo mới** → **Settings → Secrets and variables → Actions → New repository secret**, tạo:

| Tên secret | Giá trị |
| --- | --- |
| `KEYSTORE_BASE64` | Toàn bộ chuỗi trong `keystore-base64.txt` |
| `KEYSTORE_PASSWORD` | Mật khẩu keystore |
| `KEY_ALIAS` | `piano_v2` (hoặc alias bạn đã chọn) |
| `KEY_PASSWORD` | Mật khẩu key (nếu dùng cùng password thì nhập y hệt) |

## 4. Xây APK

Actions → **Build Piano V2 APK** → **Run workflow** (hoặc đẩy commit mới). Workflow sẽ tạo bản `piano-v2-release-signed` nếu đủ bốn secrets. Kiểm tra lần đầu trên điện thoại trước khi chốt app.

**Không sử dụng lại khóa Debug.** Android chỉ cài cập nhật đè được khi có cùng `applicationId`, cùng chứng chỉ ký, và `versionCode` tăng. Hãy sao lưu ít nhất hai nơi được bảo vệ. Khi xây bản Release chính thức, chỉ cài các bản Release đã ký bằng khóa này.

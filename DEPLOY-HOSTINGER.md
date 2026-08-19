# Hướng dẫn Deploy lên Hostinger

Có 2 tình huống tuỳ vào gói hosting bạn đang có. Kiểm tra trước:

**Cách kiểm tra gói có hỗ trợ Node.js không:** Đăng nhập [hPanel](https://hpanel.hostinger.com) → vào website của bạn → tìm mục **Advanced → Node.js** (hoặc thanh tìm kiếm gõ "Node.js"). Nếu thấy màn hình "Create Application" → gói của bạn hỗ trợ Node.js, làm theo **Phương án A**. Nếu không thấy mục này (gói chỉ có PHP/HTML tĩnh) → làm theo **Phương án B**.

---

## Phương án A — Gói có hỗ trợ Node.js App (khuyến nghị)

### 1. Đưa code lên Hostinger

Cách đơn giản nhất là qua **Git** (hPanel hỗ trợ deploy trực tiếp từ GitHub):

1. hPanel → **Advanced → Git** → **Create a new repository**
2. Chọn **Clone from GitHub**, dán URL repo (ví dụ `https://github.com/<tên-bạn>/newtechcons-website.git`), chọn nhánh `main`
3. Nhấn **Create** — Hostinger sẽ tự pull code về

*(Nếu không có Git trên gói của bạn: nén toàn bộ project trừ `node_modules/` thành .zip, upload qua File Manager, rồi Extract.)*

### 2. Tạo Node.js Application

1. hPanel → **Advanced → Node.js** → **Create Application**
2. **Node.js version**: chọn 18.x hoặc mới hơn (khớp `engines.node` trong `package.json`)
3. **Application root**: trỏ đúng thư mục vừa clone/giải nén code vào (ví dụ `newtechcons-website`)
4. **Application startup file**: `server.js`
5. **Application URL**: chọn domain `newtechcons.com.vn` (hoặc domain bạn đang trỏ)
6. Nhấn **Create**

### 3. Cài dependencies

Trong màn hình quản lý Node.js App vừa tạo, có nút **Run NPM Install** — bấm để cài các gói trong `package.json`. (Tương đương lệnh `npm install` qua SSH nếu bạn có quyền SSH.)

### 4. Cấu hình biến môi trường (.env)

Trong màn hình Node.js App → mục **Environment variables**, thêm:

| Tên biến | Giá trị |
|---|---|
| `NODE_ENV` | `production` |
| `SMTP_HOST` | ví dụ `smtp.gmail.com` (bỏ qua nếu chưa cần gửi email) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | địa chỉ Gmail dùng để gửi |
| `SMTP_PASS` | **Mật khẩu ứng dụng** (App Password) của Gmail — không phải mật khẩu đăng nhập thường. Tạo tại https://myaccount.google.com/apppasswords |
| `CONTACT_TO_EMAIL` | `newtechcons.jc@gmail.com` |

> ⚠️ Không commit file `.env` thật lên GitHub. Chỉ nhập trực tiếp trong hPanel như trên.

### 5. Khởi động

Bấm **Restart** trong màn hình Node.js App. Hostinger sẽ tự chạy `node server.js` (hoặc lệnh trong mục "Startup file") và proxy domain của bạn vào cổng nội bộ đó — bạn không cần tự mở cổng.

### 6. Trỏ domain

Nếu domain `newtechcons.com.vn` chưa trỏ về Hostinger: hPanel → **Domains** → cập nhật nameserver hoặc bản ghi A theo hướng dẫn của Hostinger cho domain đó.

### 7. Cập nhật code sau này

Mỗi khi sửa code và push lên GitHub: hPanel → **Advanced → Git** → bấm **Pull/Deploy**, sau đó **Restart** lại Node.js App.

---

## Phương án B — Gói KHÔNG hỗ trợ Node.js (chỉ HTML tĩnh)

Nếu gói hosting của bạn chỉ chạy được HTML/PHP tĩnh, xuất trang chủ ra file HTML tĩnh rồi upload như website thường:

```bash
npm install
npm run build:static
```

Lệnh trên tạo thư mục `public-dist/` chứa `index.html` + toàn bộ ảnh/css/js sẵn sàng dùng.

1. hPanel → **File Manager** → vào thư mục `public_html`
2. Xoá file mặc định (nếu có), upload **toàn bộ nội dung bên trong** `public-dist/` (không upload cả thư mục `public-dist`, chỉ nội dung bên trong nó)
3. Xong — mở domain để kiểm tra

**Lưu ý quan trọng với bản tĩnh:** form liên hệ trên trang gọi `/api/contact`, nhưng bản tĩnh không có server Node.js để xử lý API này → **form sẽ báo lỗi khi khách bấm gửi**. Với bản tĩnh, nên:
- Đổi form sang dùng dịch vụ nhận form ngoài miễn phí như [Formspree](https://formspree.io) hoặc [Getform](https://getform.io) (chỉ cần đổi action của `<form>` trong `views/index.ejs` trước khi chạy `build:static`), **hoặc**
- Chấp nhận việc khách liên hệ qua số điện thoại / Zalo / email hiển thị sẵn trên trang (nút liên hệ nổi góc phải vẫn hoạt động bình thường vì chỉ là link `tel:`/`mailto:`/Zalo, không cần server).

Nếu về sau bạn nâng cấp gói hosting lên bản có Node.js, quay lại **Phương án A** để có form liên hệ gửi email đầy đủ.

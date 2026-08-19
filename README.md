# Newtechcons Website

Website chính thức của **Công ty Cổ phần Xây dựng và Công nghệ Newtechcons** — tư vấn pháp lý môi trường, thiết kế thi công, vận hành và bảo trì hệ thống xử lý nước thải, nước sạch, khí thải.

Xây dựng bằng **Node.js (Express + EJS)**.

## Cấu trúc thư mục

```
newtechcons-website/
├── server.js              # Server Express chính
├── data/site.js           # Thông tin công ty (sửa nội dung ở đây)
├── views/index.ejs        # Template trang chủ
├── public/
│   ├── css/style.css      # Toàn bộ style
│   ├── js/main.js         # Carousel, menu mobile, form liên hệ
│   ├── img/                # Ảnh thực tế từ hồ sơ năng lực
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/build-static.js # Xuất bản HTML tĩnh (dự phòng, xem DEPLOY-HOSTINGER.md)
├── .env.example            # Mẫu biến môi trường (copy thành .env)
└── package.json
```

## Chạy thử ở máy local

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm start
```

Mở http://localhost:3000

Chạy chế độ tự tải lại khi sửa code:

```bash
npm run dev
```

## Sửa nội dung

- **Thông tin công ty, SĐT, email, địa chỉ**: sửa trong [`data/site.js`](data/site.js)
- **Nội dung, câu chữ trên trang**: sửa trong [`views/index.ejs`](views/index.ejs)
- **Màu sắc, font, layout**: sửa trong [`public/css/style.css`](public/css/style.css) — các biến màu thương hiệu nằm ở đầu file (`--navy`, `--red`)
- **Ảnh**: thay file trong `public/img/` (giữ nguyên tên file, hoặc đổi tên và cập nhật đường dẫn trong `views/index.ejs`)

## Form liên hệ (gửi email)

Form liên hệ gọi `POST /api/contact`. Nếu chưa cấu hình SMTP trong `.env`, yêu cầu tư vấn vẫn được ghi log ở console server (không mất dữ liệu) nhưng **không gửi được email**. Để bật gửi email thật, điền `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL` trong `.env` (xem hướng dẫn trong `.env.example`).

## Deploy lên Hostinger

Xem hướng dẫn chi tiết từng bước tại [`DEPLOY-HOSTINGER.md`](DEPLOY-HOSTINGER.md).

## License

Mã nguồn riêng của Công ty CP Xây dựng và Công nghệ Newtechcons — không phải mã nguồn mở.

# Deploy lên Cloudflare Pages

Site đã được deploy: **https://newtechcons-website.pages.dev**

Deploy bằng Wrangler CLI (đăng nhập OAuth qua trình duyệt Cloudflare của bạn — Claude không có và không giữ mật khẩu Cloudflare của bạn ở bất kỳ đâu).

## Cấu trúc dùng cho Cloudflare Pages

- `public-dist/` — bản HTML tĩnh (tạo bằng `npm run build:static`), đây là phần được deploy làm site
- `functions/api/contact.js` — Cloudflare Pages Function xử lý form liên hệ (chạy trên edge runtime, dùng [Resend](https://resend.com) qua HTTPS API để gửi email — Cloudflare Workers không hỗ trợ SMTP thô như Nodemailer bên bản Hostinger)

## Deploy lại sau khi sửa nội dung

```bash
npm run build:static
npx wrangler pages deploy public-dist --project-name=newtechcons-website
```

Mỗi lần chạy sẽ tạo thêm 1 bản deploy mới; bản mới nhất tự động lên production tại `https://newtechcons-website.pages.dev` (và domain riêng nếu đã gắn — xem bên dưới).

## Bật form liên hệ gửi email thật (Resend)

Mặc định form vẫn "gửi thành công" trên giao diện nhưng **chưa gửi được email thật** cho tới khi cấu hình:

1. Tạo tài khoản miễn phí tại https://resend.com → lấy **API Key**
2. Cloudflare dashboard → **Workers & Pages** → project `newtechcons-website` → **Settings → Environment variables** → thêm cho môi trường **Production**:
   - `RESEND_API_KEY` = API key vừa tạo
   - `CONTACT_TO_EMAIL` = `newtechcons.jc@gmail.com`
   - `RESEND_FROM` = `Website Newtechcons <onboarding@resend.dev>` (dùng tạm địa chỉ này của Resend, hoặc domain riêng sau khi verify trên Resend)
3. Bấm **Save**, sau đó **Retry deployment** (hoặc chạy lại lệnh deploy ở trên) để áp dụng biến môi trường mới

> Bước này cần đăng nhập Resend + Cloudflare dashboard nên bạn tự thao tác — mình không nhập API key thay bạn được.

## Gắn domain riêng: newtechcons.net

1. Cloudflare dashboard → **Workers & Pages** → project `newtechcons-website` → tab **Custom domains** → **Set up a custom domain** → nhập `newtechcons.net` (và/hoặc `www.newtechcons.net`)
2. Cloudflare sẽ kiểm tra domain đã dùng Cloudflare làm DNS/nameserver chưa:
   - **Nếu `newtechcons.net` đã thêm vào Cloudflare** (Websites → Add a site, rồi đổi nameserver ở nơi bạn mua domain sang nameserver Cloudflare được cấp): domain sẽ gắn tự động, chỉ mất vài phút chờ DNS.
   - **Nếu domain đang ở nhà cung cấp khác** (chưa dùng Cloudflare DNS): Cloudflare sẽ hướng dẫn thêm domain vào Cloudflare trước (miễn phí), rồi đổi nameserver tại nơi bạn mua domain (GoDaddy, Mắt Bão, PA Vietnam, Cloudflare Registrar...) sang nameserver Cloudflare cấp. Bước đổi nameserver này cần đăng nhập tài khoản nơi bạn mua domain nên bạn tự thao tác.
3. Sau khi domain hoạt động, HTTPS được Cloudflare tự cấp miễn phí, không cần làm gì thêm.

Nếu bạn cho biết `newtechcons.net` mua ở đâu (Cloudflare Registrar, hay nơi khác), mình có thể hướng dẫn chính xác từng bước hơn cho nhà cung cấp đó.

## Domain phụ .pages.dev

Trong lúc chờ gắn domain riêng, site đã dùng được ngay tại:
**https://newtechcons-website.pages.dev**

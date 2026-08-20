// Cloudflare Pages Function — xử lý form liên hệ khi site chạy trên Cloudflare Pages.
//
// Cloudflare Workers/Pages Functions chạy trên runtime edge, KHÔNG hỗ trợ kết nối
// TCP thô (SMTP) như Nodemailer trên server Node.js thường (bản Hostinger dùng
// Nodemailer). Vì vậy ở đây dùng Resend (https://resend.com) qua HTTPS API — có gói
// miễn phí, chỉ cần fetch() là gửi được email, không cần mở cổng SMTP.
//
// Thiết lập (không bắt buộc — nếu chưa cấu hình, request vẫn trả về ok:true để
// không làm hỏng trải nghiệm người dùng, chỉ là chưa có email gửi đi thật):
//   1. Tạo tài khoản miễn phí tại https://resend.com, lấy API key.
//   2. Cloudflare Pages dashboard → project → Settings → Environment variables, thêm:
//      RESEND_API_KEY   = re_xxxxxxxx
//      CONTACT_TO_EMAIL = newtechcons.jc@gmail.com
//      RESEND_FROM      = Website Newtechcons <onboarding@resend.dev>  (hoặc domain đã verify trên Resend)
//   3. Redeploy.

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Dữ liệu gửi lên không hợp lệ." }, 400);
  }

  const name = (body.name || "").toString().trim().slice(0, 200);
  const phone = (body.phone || "").toString().trim().slice(0, 40);
  const email = (body.email || "").toString().trim().slice(0, 200);
  const topic = (body.topic || "").toString().trim().slice(0, 200);
  const message = (body.message || "").toString().trim().slice(0, 4000);

  if (!name || !phone) {
    return json({ error: "Vui lòng nhập họ tên và số điện thoại." }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.CONTACT_TO_EMAIL || "newtechcons.jc@gmail.com";
  const fromEmail = env.RESEND_FROM || "Website Newtechcons <onboarding@resend.dev>";

  if (!apiKey) {
    // Chưa cấu hình Resend — không chặn người dùng, chỉ chưa gửi được email thật.
    return json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email || undefined,
        subject: `[Website] Yêu cầu tư vấn từ ${name}`,
        text: [
          `Họ và tên: ${name}`,
          `Điện thoại: ${phone}`,
          `Email: ${email || "(không có)"}`,
          `Nhu cầu: ${topic || "(không chọn)"}`,
          `Nội dung: ${message || "(không có)"}`
        ].join("\n")
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[contact] Resend lỗi:", res.status, errText);
      return json({ error: "Không gửi được yêu cầu, vui lòng gọi hotline." }, 502);
    }

    return json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] Lỗi gửi email:", err);
    return json({ error: "Không gửi được yêu cầu, vui lòng gọi hotline." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

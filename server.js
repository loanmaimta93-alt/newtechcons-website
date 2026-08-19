require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const site = require("./data/site");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  helmet({
    contentSecurityPolicy: false // Google Fonts + Google Maps iframe; tighten later with explicit directives if needed.
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0
  })
);

// ---- Mailer (optional — falls back to console logging if SMTP is not configured) ----
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau ít phút." }
});

// ---- Routes ----
app.get("/", (req, res) => {
  res.render("index", { company: site.company, seo: site.seo });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, phone, email, topic, message } = req.body || {};

  if (!name || !String(name).trim() || !phone || !String(phone).trim()) {
    return res.status(400).json({ error: "Vui lòng nhập họ tên và số điện thoại." });
  }

  const payload = {
    name: String(name).trim().slice(0, 200),
    phone: String(phone).trim().slice(0, 40),
    email: email ? String(email).trim().slice(0, 200) : "",
    topic: topic ? String(topic).trim().slice(0, 200) : "",
    message: message ? String(message).trim().slice(0, 4000) : ""
  };

  try {
    if (transporter) {
      await transporter.sendMail({
        from: `"Website Newtechcons" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_TO_EMAIL || site.company.email,
        replyTo: payload.email || undefined,
        subject: `[Website] Yêu cầu tư vấn từ ${payload.name}`,
        text: [
          `Họ và tên: ${payload.name}`,
          `Điện thoại: ${payload.phone}`,
          `Email: ${payload.email || "(không có)"}`,
          `Nhu cầu: ${payload.topic || "(không chọn)"}`,
          `Nội dung: ${payload.message || "(không có)"}`
        ].join("\n")
      });
    } else {
      // No SMTP configured yet — log so the request isn't silently lost during setup/dev.
      console.log("[contact] SMTP chưa cấu hình — yêu cầu tư vấn nhận được:", payload);
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("[contact] Gửi email thất bại:", err.message);
    return res.status(500).json({ error: "Không gửi được yêu cầu, vui lòng gọi hotline." });
  }
});

app.get("/healthz", (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).send("Không tìm thấy trang.");
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau.");
});

app.listen(PORT, () => {
  console.log(`Newtechcons website đang chạy tại http://localhost:${PORT}`);
});

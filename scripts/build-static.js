// Xuất trang chủ ra HTML tĩnh (public-dist/) — dùng khi gói hosting Hostinger
// KHÔNG hỗ trợ chạy Node.js, chỉ hỗ trợ HTML/PHP tĩnh qua File Manager/FTP.
//
// Lưu ý: bản tĩnh này KHÔNG có API /api/contact (form liên hệ sẽ không gửi
// được email) — nếu dùng bản tĩnh, hãy trỏ action của form sang một dịch vụ
// nhận form ngoài (Formspree, Getform...) hoặc để khách liên hệ qua số điện
// thoại / Zalo / email hiển thị sẵn trên trang.
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const site = require("../data/site");

const OUT_DIR = path.join(__dirname, "..", "public-dist");

async function main() {
  const html = await ejs.renderFile(
    path.join(__dirname, "..", "views", "index.ejs"),
    { company: site.company, seo: site.seo }
  );

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html, "utf8");

  copyDir(path.join(__dirname, "..", "public"), OUT_DIR);

  console.log("Đã xuất bản tĩnh vào:", OUT_DIR);
  console.log("Upload TOÀN BỘ nội dung thư mục public-dist/ vào public_html trên Hostinger.");
}

function copyDir(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

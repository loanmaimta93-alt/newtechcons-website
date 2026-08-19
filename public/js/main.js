(function () {
  "use strict";

  // ---- Hero carousel ----
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dots button");
  var idx = 0,
    n = slides.length,
    timer;
  function show(i) {
    slides.forEach(function (s, j) {
      s.classList.toggle("active", j === i);
    });
    dots.forEach(function (d, j) {
      d.classList.toggle("active", j === i);
    });
    idx = i;
  }
  function next() {
    show((idx + 1) % n);
  }
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  }
  if (n > 0) {
    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        show(parseInt(d.dataset.i, 10));
        resetTimer();
      });
    });
    resetTimer();
  }

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (e) {
      e.classList.add("in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (e) {
      io.observe(e);
    });
  }

  // ---- Mobile menu ----
  var burger = document.querySelector(".burger");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (burger && mobileMenu) {
    var closeBtn = mobileMenu.querySelector(".close-btn");
    var links = mobileMenu.querySelectorAll("a");
    function openMenu() {
      mobileMenu.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      mobileMenu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    burger.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    links.forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  // ---- Contact form ----
  var form = document.querySelector("#contact-form");
  if (form) {
    var noteEl = form.querySelector(".form-note");
    var submitBtn = form.querySelector(".submit-btn");
    var defaultNote = noteEl ? noteEl.textContent : "";

    form.addEventListener("submit", function (evt) {
      evt.preventDefault();
      var data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        topic: form.topic.value,
        message: form.message.value.trim()
      };

      if (!data.name || !data.phone) {
        setNote("Vui lòng nhập họ tên và số điện thoại.", "err");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi...";
      setNote("", "");

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (result) {
          if (result.ok) {
            setNote("Đã gửi — Newtechcons sẽ liên hệ sớm nhất.", "ok");
            form.reset();
          } else {
            setNote(
              result.body && result.body.error
                ? result.body.error
                : "Có lỗi xảy ra, vui lòng gọi hotline để được hỗ trợ nhanh.",
              "err"
            );
          }
        })
        .catch(function () {
          setNote(
            "Không thể gửi yêu cầu lúc này. Vui lòng gọi hotline 0988 863 321.",
            "err"
          );
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Gửi yêu cầu tư vấn";
        });
    });

    function setNote(text, kind) {
      if (!noteEl) return;
      noteEl.textContent = text || defaultNote;
      noteEl.classList.remove("err", "ok");
      if (kind) noteEl.classList.add(kind);
    }
  }
})();

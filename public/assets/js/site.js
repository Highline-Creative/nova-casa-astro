/* Nova Casa Real Estate — shared front-end behavior (Astro build).
   Content (property data, FAQ, site text) is now rendered server-side by
   Astro from the CMS-editable content collections; this file only handles
   client-side interactions that have no reason to change: nav toggle,
   FAQ accordion, gallery/lightbox, WhatsApp link generation, contact form. */
(function () {
  "use strict";

  const isPt = document.documentElement.lang === "pt-BR";
  const WHATSAPP_NUMBER = window.__NOVA_CASA_WHATSAPP__ || "971502648417";

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initFaqAccordion();
    initContactForm();
    initGalleryAndLightbox();
    initWhatsappLinks();
    initYear();
  });

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => {
      const open = links.getAttribute("data-open") === "true";
      links.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  function initFaqAccordion() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const q = item.querySelector(".faq-q");
      const a = item.querySelector(".faq-a");
      if (!q || !a) return;

      if (item.getAttribute("data-open") === "true") {
        a.style.maxHeight = a.scrollHeight + "px";
      }

      q.addEventListener("click", () => {
        const isOpen = item.getAttribute("data-open") === "true";
        const list = item.closest(".faq-list");
        if (list) {
          list.querySelectorAll('.faq-item[data-open="true"]').forEach((other) => {
            if (other !== item) {
              other.setAttribute("data-open", "false");
              other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
              other.querySelector(".faq-a").style.maxHeight = null;
            }
          });
        }
        item.setAttribute("data-open", String(!isOpen));
        q.setAttribute("aria-expanded", String(!isOpen));
        a.style.maxHeight = isOpen ? null : a.scrollHeight + "px";
      });
    });
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = form.querySelector(".form-status");
    const contactEmail = form.getAttribute("data-contact-email") || "carla@novacasadubai.com";

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const phone = (data.get("phone") || "").toString().trim();
      const interest = (data.get("interest") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const botField = (data.get("bot-field") || "").toString().trim();

      if (botField) return;

      if (!name || !email || !message) {
        setStatus(status, "error", isPt ? "Por favor, preencha nome, e-mail e mensagem." : "Please fill in your name, email and message.");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Netlify Forms endpoint not available");
          setStatus(
            status,
            "success",
            isPt
              ? "Obrigado — sua mensagem foi enviada para a Nova Casa. A Carla vai te responder em breve."
              : "Thank you — your enquiry has been sent to Nova Casa. Carla will get back to you shortly."
          );
          form.reset();
        })
        .catch(() => sendViaMailto(name, email, phone, interest, message, status, form, contactEmail))
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function sendViaMailto(name, email, phone, interest, message, status, form, contactEmail) {
    const subject = encodeURIComponent(
      isPt ? `Contato pelo site — ${interest || "Geral"} — ${name}` : `Website enquiry — ${interest || "General"} — ${name}`
    );
    const bodyLines = [
      `${isPt ? "Nome" : "Name"}: ${name}`,
      `${isPt ? "E-mail" : "Email"}: ${email}`,
      phone ? `${isPt ? "Telefone" : "Phone"}: ${phone}` : null,
      interest ? `${isPt ? "Interesse" : "Interested in"}: ${interest}` : null,
      "",
      message,
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join("\n"));

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatus(
      status,
      "success",
      isPt
        ? `Abrindo seu e-mail para enviar essa mensagem à Nova Casa. Se nada abrir, escreva direto para ${contactEmail}.`
        : `Opening your email client to send this enquiry to Nova Casa. If nothing opens, email us directly at ${contactEmail}.`
    );
    form.reset();
  }

  function setStatus(el, state, msg) {
    if (!el) return;
    el.setAttribute("data-state", state);
    el.textContent = msg;
  }

  function initWhatsappLinks() {
    const pageUrl = window.location.href.split("#")[0];
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      const context = el.getAttribute("data-whatsapp") || "";
      const message = context
        ? isPt
          ? `Oi Carla, tenho interesse em: ${context}. Pode me passar mais informações?\n\nAnúncio: ${pageUrl}`
          : `Hi Carla, I'm interested in: ${context}. Could you share more information?\n\nListing: ${pageUrl}`
        : isPt
        ? "Oi Carla, gostaria de mais informações sobre os imóveis em Dubai."
        : "Hi Carla, I'd like more information about your properties in Dubai.";
      const text = encodeURIComponent(message);
      el.setAttribute("href", `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  function initGalleryAndLightbox() {
    const mainImg = document.getElementById("gallery-main-img");
    const thumbWrap = document.getElementById("gallery-thumbs");
    if (!mainImg || !thumbWrap) return;

    const thumbs = Array.from(thumbWrap.querySelectorAll("button[data-index]"));
    const images = thumbs.map((btn) => btn.querySelector("img")?.getAttribute("src") || "");

    function setActive(i) {
      mainImg.src = images[i];
      mainImg.setAttribute("data-index", String(i));
      thumbs.forEach((b, idx) => b.setAttribute("aria-current", String(idx === i)));
    }

    thumbs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-index"));
        setActive(i);
        openLightbox(images, i);
      });
    });

    mainImg.addEventListener("click", () => openLightbox(images, Number(mainImg.getAttribute("data-index") || 0)));

    const lb = document.getElementById("lightbox");
    if (!lb) return;
    let lightboxImages = [];
    let lightboxIndex = 0;

    lb.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lb.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
    lb.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (lb.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });

    function openLightbox(imgs, index) {
      lightboxImages = imgs;
      lightboxIndex = index;
      renderLightbox();
      lb.setAttribute("data-open", "true");
    }
    function closeLightbox() {
      lb.setAttribute("data-open", "false");
    }
    function stepLightbox(dir) {
      if (!lightboxImages.length) return;
      lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
      renderLightbox();
    }
    function renderLightbox() {
      lb.querySelector("img").src = lightboxImages[lightboxIndex];
      lb.querySelector(".lightbox-count").textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    }
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }
})();

/**
 * CBVD-Lock — Decorative Asset Layer
 * Adds only visual decoration from assets/decor.
 * No existing markup, feature logic, layout flow, or interactions are replaced.
 */
const DECOR_GROUPS = {
  hero: ["champions_1.png","decor_1.png"],
  unlock: ["decor_2.png","decor_3.png","decor_4.png","decor_5.png","decor_6.png"],
  product: ["gadget_1.png","gadget_2.png","gadget_3.png","gadget_4.png","gadget_5.png","gadget_6.png","gadget_7.png","gadget_8.png","gadget_9.png","gadget_10.png","gadget_11.png"],
  dashboard: ["peti_1.png","peti_2.png","peti_3.png","peti_4.png","peti_5.png","peti_6.png","peti_7.png","peti_8.png"],
  timeline: ["skin_1.png","skin_2.png","skin_3.png","skin_4.png","skin_5.png"],
  support: [],
  footer: ["skin_7.png"]
};

const DECOR_SLOTS = [
  [3, 8, -7], [16, 27, 5], [31, 7, -4], [68, 9, 6], [84, 25, -6],
  [95, 9, 4], [7, 68, 5], [22, 87, -5], [71, 86, 5], [91, 68, -4], [50, 94, 3]
];

function hostForGroup(group) {
  const selectors = {
    hero: ".hero, .access-page-hero",
    unlock: "#unlock",
    product: "#product",
    dashboard: "#dashboard",
    timeline: "#activity",
    support: "#support",
    footer: ".site-footer"
  };
  return document.querySelector(selectors[group]);
}

function assetClass(name) {
  return /^(decor_1|important_notice_[12]|mail_contact|remove_bg_thumbnail_1|thumbnail_[12])\.png$/i.test(name)
    ? "is-wide"
    : "is-object";
}

function addImageOnce(parent, selector, className, src, alt = "") {
  if (!parent || parent.querySelector(selector)) return null;
  const img = document.createElement("img");
  img.className = className;
  img.src = `assets/decor/${src}`;
  img.alt = alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.draggable = false;
  parent.appendChild(img);
  return img;
}

function initHeroBannerSlider() {
  document.querySelectorAll(".hero-visual").forEach((host) => {
    if (host.querySelector(".cbvd-hero-decor-slider")) return;
    const slider = document.createElement("div");
    slider.className = "cbvd-hero-decor-slider";
    slider.setAttribute("aria-hidden", "true");
    ["thumbnail_1.png", "thumbnail_2.png"].forEach((src, index) => {
      const img = document.createElement("img");
      img.className = `cbvd-hero-decor-slide${index === 0 ? " is-active" : ""}`;
      img.src = `assets/decor/${src}`;
      img.alt = "";
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.draggable = false;
      slider.appendChild(img);
    });
    host.prepend(slider);

    const slides = [...slider.querySelectorAll(".cbvd-hero-decor-slide")];
    let current = 0;
    let timer;
    const rotate = () => {
      slides[current]?.classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current]?.classList.add("is-active");
    };
    if (slides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = window.setInterval(rotate, 5000);
      host.addEventListener("mouseenter", () => window.clearInterval(timer), { passive: true });
      host.addEventListener("mouseleave", () => { window.clearInterval(timer); timer = window.setInterval(rotate, 5000); }, { passive: true });
    }
  });
}

// function initProductTitleDecoration() {
//   document.querySelectorAll("[data-product-title]").forEach((title) => {
//     const info = title.closest(".product-info");
//     if (!info || info.querySelector(".cbvd-product-title-decoration")) return;
//     info.classList.add("cbvd-product-info-decorated");
//     const wrap = document.createElement("span");
//     wrap.className = "cbvd-product-title-decoration";
//     wrap.setAttribute("aria-hidden", "true");
//     const img = document.createElement("img");
//     img.src = "assets/decor/remove_bg_thumbnail_1.png";
//     img.alt = "";
//     img.loading = "lazy";
//     img.decoding = "async";
//     img.draggable = false;
//     wrap.appendChild(img);
//     title.insertAdjacentElement("afterend", wrap);
//   });
// }

function initTargetedDecorations() {
  initHeroBannerSlider();
  // initProductTitleDecoration();
}

function buildDecorations() {
  Object.entries(DECOR_GROUPS).forEach(([group, assets]) => {
    const host = hostForGroup(group);
    if (!host || host.querySelector(`.decorations-layer[data-decor-group="${group}"]`)) return;

    host.classList.add("decorations-host");
    const layer = document.createElement("div");
    layer.className = `decorations-layer decorations-${group}`;
    layer.dataset.decorGroup = group;
    layer.setAttribute("aria-hidden", "true");

    assets.forEach((filename, index) => {
      const image = document.createElement("img");
      const slot = DECOR_SLOTS[index % DECOR_SLOTS.length];
      const isWide = assetClass(filename) === "is-wide";
      const size = isWide ? 150 + ((index * 17) % 45) : 58 + ((index * 11) % 48);

      image.className = `decor-asset ${assetClass(filename)}`;
      image.src = `assets/decor/${filename}`;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.draggable = false;
      image.style.setProperty("--decor-x", `${slot[0]}%`);
      image.style.setProperty("--decor-y", `${slot[1]}%`);
      image.style.setProperty("--decor-size", `${size}px`);
      image.style.setProperty("--decor-rot", `${slot[2]}deg`);
      image.style.setProperty("--decor-delay", `${-(index * 0.65)}s`);
      layer.appendChild(image);
    });

    if (assets.length) host.prepend(layer);
  });
  initTargetedDecorations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildDecorations, { once: true });
} else {
  buildDecorations();
}

export { buildDecorations };

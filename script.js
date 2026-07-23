const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const progress = document.querySelector(".scroll-progress");
const hero = document.querySelector(".hero");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateScrollState = () => {
  const y = window.scrollY;
  header.classList.toggle("is-scrolled", y > 35);

  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = documentHeight > 0 ? Math.min(y / documentHeight, 1) : 0;
  progress.style.transform = `scaleX(${ratio})`;

  if (!prefersReducedMotion && hero && y < window.innerHeight * 1.25) {
    hero.style.setProperty("--hero-shift", `${Math.min(y * 0.085, 70)}px`);
  }
};

let scrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollState();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  },
  { passive: true },
);
updateScrollState();

const closeMenu = () => {
  body.classList.remove("nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Otevřít menu");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Zavřít menu" : "Otevřít menu");
});

mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) closeMenu();
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const filterButtons = [...document.querySelectorAll(".filter-button")];
const archiveCards = [...document.querySelectorAll(".archive-card")];
const visibleCount = document.querySelector("[data-visible-count]");
let activeFilter = "all";

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    archiveCards.forEach((card) => {
      const shouldShow = activeFilter === "all" || card.dataset.category === activeFilter;
      card.classList.toggle("is-hidden", !shouldShow);
    });

    if (visibleCount) visibleCount.textContent = String(visibleCards().length);
  });
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("figure img");
const lightboxTitle = lightbox?.querySelector("figcaption strong");
const lightboxSubtitle = lightbox?.querySelector("figcaption span");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const lightboxPrev = lightbox?.querySelector(".lightbox-prev");
const lightboxNext = lightbox?.querySelector(".lightbox-next");
let currentCard = null;

const visibleCards = () => archiveCards.filter((card) => !card.classList.contains("is-hidden"));

const fillLightbox = (card) => {
  const image = card.querySelector("img");
  const title = card.querySelector(".archive-card-meta strong");
  const subtitle = card.querySelector(".archive-card-meta small");

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = title.textContent;
  lightboxSubtitle.textContent = subtitle.textContent;
  currentCard = card;
};

const showLightbox = (card) => {
  if (!lightbox || typeof lightbox.showModal !== "function") return;
  fillLightbox(card);
  lightbox.showModal();
  body.style.overflow = "hidden";
};

const closeLightbox = () => {
  if (!lightbox?.open) return;
  lightbox.close();
  body.style.overflow = "";
  currentCard?.querySelector(".archive-open")?.focus();
};

const stepLightbox = (direction) => {
  const cards = visibleCards();
  const index = cards.indexOf(currentCard);
  if (index < 0) return;
  const nextIndex = (index + direction + cards.length) % cards.length;
  fillLightbox(cards[nextIndex]);
};

archiveCards.forEach((card) => {
  card.querySelector(".archive-open")?.addEventListener("click", () => showLightbox(card));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
lightboxNext?.addEventListener("click", () => stepLightbox(1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox?.addEventListener("close", () => {
  body.style.overflow = "";
});

document.addEventListener("keydown", (event) => {
  if (!lightbox?.open) return;
  if (event.key === "ArrowLeft") stepLightbox(-1);
  if (event.key === "ArrowRight") stepLightbox(1);
});

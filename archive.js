const archiveGrid = document.querySelector("[data-complete-archive]");
const archiveItems = Array.isArray(window.BABINA_ARCHIVE) ? window.BABINA_ARCHIVE : [];

archiveItems.forEach((item, index) => {
  const figure = document.createElement("figure");
  const ratio = item.width / item.height;
  figure.className = "archive-card complete-archive-card reveal";
  figure.dataset.category = item.category;

  if (ratio > 1.48) figure.classList.add("archive-card-wide");
  if (ratio < 0.78) figure.classList.add("archive-card-tall");

  const button = document.createElement("button");
  button.className = "archive-open";
  button.type = "button";
  button.setAttribute("aria-label", `Otevřít fotografii: ${item.subtitle}`);

  const image = document.createElement("img");
  image.src = item.src;
  image.alt = item.alt;
  image.width = item.width;
  image.height = item.height;
  image.loading = index < 4 ? "eager" : "lazy";
  image.decoding = "async";
  if (index === 0) image.fetchPriority = "high";

  const meta = document.createElement("span");
  meta.className = "archive-card-meta";

  const title = document.createElement("strong");
  title.textContent = item.title;

  const subtitle = document.createElement("small");
  subtitle.textContent = item.subtitle;

  meta.append(title, subtitle);
  button.append(image, meta);
  figure.append(button);
  archiveGrid?.append(figure);
});

const initialCount = document.querySelector("[data-visible-count]");
if (initialCount) initialCount.textContent = String(archiveItems.length);

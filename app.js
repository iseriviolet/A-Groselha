let articles = [];
let featured;

if (location.protocol === "http:" && !["localhost", "127.0.0.1"].includes(location.hostname)) {
  location.replace(`https://${location.host}${location.pathname}${location.search}${location.hash}`);
}

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
})[character]);

const articleUrl = (article) => `materia.html?slug=${encodeURIComponent(article.slug)}`;
const formatDate = (date, long = false) => new Intl.DateTimeFormat("pt-BR", long
  ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  : { day: "2-digit", month: "short", year: "numeric" }
).format(new Date(date));

async function loadArticles() {
  const listResponse = await fetch("content/published.json");
  if (!listResponse.ok) throw new Error("Não foi possível carregar a lista de matérias");
  const files = await listResponse.json();
  return Promise.all(files.map(async (file) => {
    const response = await fetch(`content/${file}`);
    if (!response.ok) throw new Error(`Não foi possível carregar ${file}`);
    return response.json();
  }));
}

function storyArt(article, className = "") {
  if (article.image) {
    return `<figure class="story-image ${className}"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}"></figure>`;
  }

  return `<div class="story-art tone-${escapeHtml(article.tone || "salmon")} ${className}" aria-hidden="true"><span>${escapeHtml(article.art)}</span><i>A G.</i></div>`;
}

function renderLead() {
  if (!featured) return;
  document.querySelector("#lead-story").innerHTML = `
    <a class="lead-visual" href="${articleUrl(featured)}" tabindex="-1">${storyArt(featured, "lead-image")}</a>
    <div class="lead-copy">
      <p class="kicker">${escapeHtml(featured.kicker)}</p>
      <h1 id="lead-title"><a href="${articleUrl(featured)}">${escapeHtml(featured.title)}</a></h1>
      <p class="summary">${escapeHtml(featured.summary)}</p>
      <div class="byline"><span>Por ${escapeHtml(featured.author)}</span><span>${escapeHtml(featured.readingTime)} de leitura</span></div>
    </div>`;

  document.querySelector("#briefs").innerHTML = articles.filter((article) => article !== featured).slice(0, 3).map((article, index) => `
    <article class="brief">
      <span class="brief-number">0${index + 1}</span>
      <div>
        <p class="kicker">${escapeHtml(article.category)}</p>
        <h2><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h2>
      </div>
    </article>`).join("");
}

function renderStories() {
  const requestedCategory = new URLSearchParams(location.search).get("categoria");
  const normalizedCategory = requestedCategory?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const stories = articles.filter((article) => article !== featured && (!normalizedCategory || article.category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === normalizedCategory));
  const title = document.querySelector("#latest-title");
  const status = document.querySelector("#filter-status");

  if (requestedCategory) {
    const category = stories[0]?.category || requestedCategory;
    title.textContent = category;
    status.innerHTML = `${stories.length} ${stories.length === 1 ? "matéria encontrada" : "matérias encontradas"}. <a href="index.html#ultimas">Ver todas</a>`;
  }

  document.querySelector("#story-grid").innerHTML = stories.length ? stories.map((article) => `
    <article class="story-card">
      <a href="${articleUrl(article)}" tabindex="-1">${storyArt(article)}</a>
      <div class="card-copy">
        <div class="card-meta"><span>${escapeHtml(article.category)}</span><time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time></div>
        <h3><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h3>
        <p>${escapeHtml(article.summary)}</p>
        <a class="read-link" href="${articleUrl(article)}">Ler matéria <span aria-hidden="true">→</span></a>
      </div>
    </article>`).join("") : `<p class="empty-state">Ainda não apuramos nada nesta editoria, o que nunca impediu ninguém de comentar.</p>`;
}

const menuButton = document.querySelector(".menu-button");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  document.querySelector("#main-nav").classList.toggle("is-open", !open);
  menuButton.textContent = open ? "Menu" : "Fechar";
});

const now = new Date();
document.querySelector("#today").textContent = formatDate(now, true);
document.querySelector("#year").textContent = now.getFullYear();

loadArticles().then((loadedArticles) => {
  articles = loadedArticles;
  featured = articles.find((article) => article.featured) || articles[0];
  renderLead();
  renderStories();
}).catch((error) => {
  console.error(error);
  document.querySelector("#lead-story").innerHTML = `<p class="empty-state">Não foi possível carregar as matérias. Tente novamente em instantes.</p>`;
});

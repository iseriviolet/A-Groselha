const slug = new URLSearchParams(location.search).get("slug");

if (location.protocol === "http:" && !["localhost", "127.0.0.1"].includes(location.hostname)) {
  location.replace(`https://${location.host}${location.pathname}${location.search}`);
}

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
})[character]);
const articleUrl = (item) => `materia.html?slug=${encodeURIComponent(item.slug)}`;
const formatDate = (date) => new Intl.DateTimeFormat("pt-BR", {
  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
}).format(new Date(date));

async function loadArticles() {
  const listResponse = await fetch("content/published.json", { cache: "no-store" });
  if (!listResponse.ok) throw new Error("Não foi possível carregar a lista de matérias");
  const files = await listResponse.json();
  return Promise.all(files.map(async (file) => {
    const response = await fetch(`content/${file}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Não foi possível carregar ${file}`);
    return response.json();
  }));
}

function art(item) {
  if (item.image) {
    return `<figure class="article-hero-image"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}"><figcaption>Imagem: arquivo / A Groselha</figcaption></figure>`;
  }
  return `<div class="article-hero-art tone-${escapeHtml(item.tone || "salmon")}" aria-hidden="true"><span>${escapeHtml(item.art)}</span><i>A Groselha / Arquivo</i></div>`;
}

function renderMissing(title, message) {
  document.title = `${title} — A Groselha`;
  document.querySelector("#article").innerHTML = `
    <div class="not-found shell">
      <p class="eyebrow">Erro 404</p>
      <h1>${title}</h1>
      <p>${message}</p>
      <a class="button" href="index.html">Voltar para a capa</a>
    </div>`;
  document.querySelector(".related").hidden = true;
}

function renderArticle(article, articles) {
  document.title = `${article.title} — A Groselha`;
  document.querySelector('meta[name="theme-color"]').insertAdjacentHTML("afterend", `<meta name="description" content="${escapeHtml(article.summary)}">`);
  document.querySelector("#article").innerHTML = `
    <header class="article-title shell">
      <p class="kicker">${escapeHtml(article.category)} <span>/</span> ${escapeHtml(article.kicker)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="article-deck">${escapeHtml(article.summary)}</p>
      <div class="article-meta">
        <p>Por <strong>${escapeHtml(article.author)}</strong></p>
        <p><time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time> · ${escapeHtml(article.readingTime)} de leitura</p>
      </div>
    </header>
    <div class="article-media shell">${art(article)}</div>
    <div class="article-body shell">
      <div class="share-note"><span>Compartilhe com responsabilidade editorial mínima.</span></div>
      <div class="prose">${article.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
    </div>
    <footer class="article-end shell">
      <img src="assets/logo.svg" alt="" width="38" height="38">
      <p><strong>Nota da redação:</strong> este texto é satírico. Os fatos foram consultados e decidiram não participar.</p>
    </footer>`;

  document.querySelector("#related-grid").innerHTML = articles.filter((item) => item.slug !== article.slug).slice(0, 3).map((item) => `
    <article>
      <p class="kicker">${escapeHtml(item.category)}</p>
      <h3><a href="${articleUrl(item)}">${escapeHtml(item.title)}</a></h3>
    </article>`).join("");
}

document.querySelector("#year").textContent = new Date().getFullYear();

loadArticles().then((articles) => {
  const article = articles.find((item) => item.slug === slug);
  if (article) {
    renderArticle(article, articles);
  } else {
    renderMissing("Esta notícia é falsa até para os nossos padrões.", "A matéria não existe, foi removida ou ainda está aguardando uma fonte inventar os detalhes.");
  }
}).catch((error) => {
  console.error(error);
  renderMissing("As matérias não chegaram à redação.", "Não foi possível carregar o arquivo publicado. Tente novamente em instantes.");
});

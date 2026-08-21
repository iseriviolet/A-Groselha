import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const files = JSON.parse(readFileSync("content/published.json", "utf8"));
const articles = files.map((file) => JSON.parse(readFileSync(`content/${file}`, "utf8")));

assert(Array.isArray(files) && files.length, "Inclua pelo menos uma matéria em content/published.json");
assert.equal(new Set(files).size, files.length, "Cada arquivo deve aparecer uma única vez em published.json");
assert.equal(new Set(articles.map(({ slug }) => slug)).size, articles.length, "Cada slug deve ser único");
assert.equal(articles.filter(({ featured }) => featured).length, 1, "Marque exatamente uma matéria como featured");

for (const article of articles) {
  for (const field of ["slug", "category", "kicker", "title", "summary", "date", "author", "readingTime"]) {
    assert(article[field], `${article.slug || "Matéria sem slug"}: campo ${field} ausente`);
  }
  assert(!Number.isNaN(Date.parse(article.date)), `${article.slug}: data inválida`);
  assert(Array.isArray(article.body) && article.body.length, `${article.slug}: texto ausente`);
  assert(article.image || article.art, `${article.slug}: informe image ou art`);
  if (article.image) assert(existsSync(article.image), `${article.slug}: imagem ${article.image} não encontrada`);
}

console.log(`${articles.length} matérias validadas.`);

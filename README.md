# A Groselha

Site estático da publicação satírica **A Groselha**. Não há banco de dados, painel ou dependências.

## Publicar uma matéria

1. Duplique um arquivo de `content/articles/`, renomeie-o e altere `slug`, editoria, título, resumo, data, autoria e parágrafos.
2. Para usar uma imagem, coloque o arquivo em `assets/` e informe `image` e `imageAlt`. Sem imagem, use `art` e um `tone`: `salmon`, `cream` ou `brown`.
3. Adicione o caminho do novo arquivo a `content/published.json`. A ordem dessa lista é a ordem exibida no site.
4. Rode `node check.mjs` para validar os JSONs.
5. Rode `python3 -m http.server 8080` e confira em `http://localhost:8080`.
6. Faça commit e push. O workflow valida as matérias e publica a nova versão no GitHub Pages.

Somente uma matéria listada deve ter `"featured": true`. Para despublicar uma matéria sem apagá-la, remova apenas sua linha de `content/published.json`.

O site lê `published.json` e cada JSON listado diretamente. Por segurança, navegadores bloqueiam esse carregamento ao abrir `index.html` por duplo clique; use sempre o servidor local ou o GitHub Pages.

## GitHub Pages e HTTPS

No repositório, abra **Settings → Pages → Source** e selecione **GitHub Actions**. O workflow em `.github/workflows/pages.yml` publica a pasta inteira. O GitHub Pages fornece certificado TLS; o site também redireciona acessos HTTP para HTTPS fora de `localhost`.

# Nicolas Popovicz · Portfólio

**Senior Software Developer na [Fruitfy](https://fruitfy.io/)** · Back-end PHP/Laravel e Node.js · Curitiba, PR

🟢 **Aberto a oportunidades e freelas** → [nicolaspopovicz.github.io](https://nicolaspopovicz.github.io/) · [English version](https://nicolaspopovicz.github.io/en/)

Desenvolvedor back-end há mais de 5 anos, com foco em performance de banco de dados, filas e integrações de
sistemas em produção. Hoje trabalho na Fruitfy, plataforma de pagamentos para negócios digitais (checkout, Pix,
cartão, boleto, assinaturas e recebimentos).

## Destaques

Na **Stokki** (WMS e plataforma 3PL com milhões de pedidos), entreguei 560 pull requests em cerca de 7 meses, com
ganhos medidos antes e depois:

| Onde | Antes → Depois |
| --- | --- |
| Escolha de pedidos no Cockpit | ~65 s → menos de 1 s |
| Busca de pedidos (passou a usar índice) | 15–47 s → 0,5 ms a 1,3 s |
| Resumo diário por e-mail | 5.201 → 23 consultas ao banco (~24× mais rápido) |
| Exportação da auditoria (713 mil linhas) | mais de 1 GB e o processo morria → 111 MB em 14 s |
| 6.500 etiquetas de produto | ~55 s → 3,5 s, arquivo 48% menor |

Também entreguei 54 integrações (Magis5, Bling, Tiny, Omie, Magazord), reforço de segurança e isolamento
multi-tenant, e a estruturação do uso de IA no time (regras do projeto, agentes de revisão de PR e automações de
triagem).

## Experiência

| Empresa | Cargo | Período |
| --- | --- | --- |
| Fruitfy | Senior Software Developer | nov/2026 – atual |
| Stokki | Desenvolvedor Back-end Pleno | abr/2026 – out/2026 |
| Nexcore (Customer Experience by Selbetti) | Desenvolvedor Fullstack | mar/2024 – abr/2026 |
| Procob S/A | Desenvolvedor Back-end | fev/2023 – jan/2024 |
| Daju LTDA. | Analista de Desenvolvimento | fev/2021 – fev/2023 |

## Stack

**PHP · Laravel · Node.js · TypeScript** · MariaDB, MySQL, PostgreSQL, Redis · Docker, AWS, RabbitMQ · PHPUnit,
Jest, TDD/BDD

## Freelance

Performance de banco e de aplicações PHP/Laravel, integrações com ERPs, marketplaces e APIs de terceiros, filas e
processamento em lote, e APIs REST em PHP/Laravel ou Node.js.

## Contato

- E-mail: [nicolaspopovicz@gmail.com](mailto:nicolaspopovicz@gmail.com)
- WhatsApp: [+55 41 98420-6797](https://wa.me/5541984206797?text=Ol%C3%A1%2C%20Nicolas%21%20Encontrei%20seu%20contato%20pelo%20seu%20site%20e%20gostaria%20de%20conversar%20para%20me%20informar%20sobre%20)
- LinkedIn: [nicolas-popovicz](https://www.linkedin.com/in/nicolas-popovicz/)

---

## Sobre este repositório

Site estático servido pelo GitHub Pages direto da branch `main`. Não tem build.

- `index.html` (português) e `en/index.html` (inglês): conteúdo, meta tags de SEO/Open Graph, `hreflang` e JSON-LD
- `css/portfolio.css` e `js/portfolio.js`: estilos e interações, compartilhados pelos dois idiomas (o JS detecta o
  idioma pelo `lang` da página)
- `img/og-image.png`: imagem de preview (1200×630) usada no LinkedIn, WhatsApp etc.
- `img/favicon-*.png` e `img/apple-touch-icon.png`: ícones com o monograma NP
- `robots.txt`, `sitemap.xml` e `llms.txt`: para buscadores e crawlers de IA

Ao mudar de cargo, atualize as duas versões do `index.html` (hero, cases, experiência, meta tags e JSON-LD),
`llms.txt`, este README e a data em `sitemap.xml`.

Temas de cores ficam no botão ◐ do menu. Os easter eggs rodam com o Konami code (↑↑↓↓←→←→BA) ou pelo botão no rodapé.

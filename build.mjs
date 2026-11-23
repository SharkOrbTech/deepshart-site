import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { languages, site } from './content.mjs';

const output = new URL('./docs/', import.meta.url).pathname;
const stylesheetVersion = createHash('sha256').update(await readFile(join(output, 'assets/site.css'))).digest('hex').slice(0, 12);
const iconsVersion = createHash('sha256').update(await readFile(join(output, 'assets/icons.svg'))).digest('hex').slice(0, 12);
const routes = ['', 'privacy', 'terms', 'support'];
const escape = (text) => String(text).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function pathFor(language, page = '') {
  const parts = [language === 'zh' ? 'zh' : '', page].filter(Boolean);
  return parts.length ? parts.join('/') + '/' : '';
}

function icon(root, name, className = '') {
  return `<svg class="icon ${className}" aria-hidden="true" focusable="false"><use href="${root}assets/icons.svg?v=${iconsVersion}#${name}"></use></svg>`;
}

function sectionItems(root, items, className) {
  return `<ul class="${className}">${items.map(([symbol, heading, summary]) => `
    <li>
      ${icon(root, symbol)}
      <div>
        <h3>${escape(heading)}</h3>
        <p>${escape(summary)}</p>
      </div>
    </li>`).join('')}
  </ul>`;
}

function showcase(root, data) {
  const shots = [
    ['desktop', 1600, 1088],
    ['phone', 690, 1338],
  ];
  return `<div class="showcase" role="group" aria-label="${escape(data.screenshotTitles.join(' / '))}">
    ${shots.map(([device, width, height], index) => `<button type="button" class="shot ${device}" data-preview="${escape(data.screenshotTitles[index])}" aria-label="${escape(data.screenshotTitles[index])}" disabled>
      <img class="day" src="${root}assets/${device}.webp" width="${width}" height="${height}" alt="${escape(data.screenshots[index])}"${index === 0 ? ' fetchpriority="high"' : ''}>
      <img class="night" src="${root}assets/${device}-dark.webp" width="${width}" height="${height}" alt="${escape(data.screenshots[index])}">
      <span class="zoom-icon">${icon(root, 'maximize-2')}</span>
    </button>`).join('')}
  </div>
  <dialog class="preview-dialog" aria-labelledby="preview-title">
    <div class="preview-content">
      <div class="preview-header">
        <h2 id="preview-title"></h2>
        <button class="preview-close" type="button" aria-label="${escape(data.closePreview)}">${icon(root, 'x')}</button>
      </div>
      <img alt="">
    </div>
  </dialog>`;
}

function home(root, language, content) {
  const data = content.home;
  return `<main id="main">
    <section class="hero wrap">
      <div class="hero-copy">
        <h1>${data.heading.map((line) => `<span>${escape(line)}</span>`).join(' ')}</h1>
        <p>${escape(data.description)}</p>
        <div class="hero-primary">
          <a class="button button-primary" href="${site.web}">${icon(root, 'globe')} ${escape(data.webApp)}</a>
        </div>
        <div class="hero-links">
          <a class="button" href="${root}${site.android}" download><img src="${root}assets/android.svg" width="24" height="14" alt="">${escape(data.androidDownload)}</a>
          <a class="button" href="${root}${site.windows}" download><img src="${root}assets/windows.png" width="18" height="18" alt="">${escape(data.windowsDownload)}</a>
        </div>
        <a class="button gitee-link" href="${site.gitee}">${icon(root, 'gitee', 'gitee-icon')} ${escape(data.viewOnGitee)}</a>
      </div>
      ${showcase(root, data)}
    </section>
    <section class="wrap section feature-section" id="features" data-reveal>
      <h2>${escape(data.featuresTitle)}</h2>
      ${sectionItems(root, data.features, 'feature-list')}
    </section>
    <div class="tint">
      <section class="wrap section sync-section" data-reveal>
        <div class="section-intro">
          <h2>${escape(data.syncTitle)}</h2>
          <p>${escape(data.syncIntro)}</p>
          <a class="inline-link" href="${root}${pathFor(language, 'privacy')}">${content.nav.privacy}</a>
        </div>
        ${sectionItems(root, data.sync, 'sync-list')}
      </section>
    </div>
    <section class="wrap section platform-section" id="platforms" data-reveal>
      <h2>${escape(data.platformTitle)}</h2>
      <ul class="platform-list">
        ${[['smartphone', 'iPhone'], ['smartphone', 'Android'], ['laptop', 'macOS'], ['monitor', 'Windows']].map(([symbol, name]) =>
          `<li>${icon(root, symbol)}<span>${name}</span></li>`).join('')}
      </ul>
    </section>
  </main>`;
}

function legal(root, language, page, content) {
  const isChinese = language === 'zh';
  const links = {
    email: [`mailto:${site.email}`, site.email],
    privacy: [root + pathFor(language, 'privacy'), content.nav.privacy],
    support: [root + pathFor(language, 'support'), isChinese ? '支持页面' : 'Support'],
    license: [root + 'license.txt', isChinese ? '《DeepShart 个人非商业使用许可协议》' : 'DeepShart Personal Non-Commercial License'],
    githubPrivacy: [site.githubPrivacy, isChinese ? '《GitHub 隐私声明》' : 'GitHub Privacy Statement'],
    deepseek: [site.deepSeekTerms, isChinese ? '《DeepSeek 开放平台服务协议》' : 'DeepSeek Open Platform Terms of Service'],
    androidArtworkLicense: ['https://creativecommons.org/licenses/by/3.0/', isChinese ? '知识共享署名 3.0 许可' : 'Creative Commons Attribution 3.0 License'],
  };
  const text = (paragraph) => escape(paragraph).replace(/\{(\w+)\}/g, (_, name) => {
    const [href, label] = links[name];
    return `<a href="${escape(href)}">${escape(label)}</a>`;
  });
  const {title, date, intro, sections} = content[page];
  return `<main class="wrap document" id="main">
    <article class="prose">
      <header class="document-heading">
        <h1>${escape(title)}</h1>
        ${date ? `<p class="effective-date">${escape(date)}</p>
        ` : ''}<p class="intro">${text(intro)}</p>
      </header>
      ${sections.map(([heading, ...paragraphs]) => `<section>
        <h2>${escape(heading)}</h2>
        ${paragraphs.map(paragraph => `<p>${text(paragraph)}</p>`).join('')}
      </section>`).join('')}
    </article>
  </main>`;
}

function html(language, page) {
  const content = languages[language];
  const route = pathFor(language, page);
  const root = '../'.repeat(route.split('/').filter(Boolean).length) || './';
  const otherLanguage = language === 'zh' ? 'en' : 'zh';
  const homePath = root + pathFor(language);
  const switchPath = root + pathFor(otherLanguage, page);
  const title = page ? `${content[page].title} | DeepShart` : content.home.title;
  const description = page
    ? content[page].intro.replace('{email}', site.email)
    : content.home.description;
  const link = (key) => `<a href="${root}${pathFor(language, key)}"${key === page ? ' aria-current="page"' : ''}>${content.nav[key]}</a>`;

  return `<!doctype html>
<html lang="${content.lang}" data-language="${language}" data-alternate="${switchPath}"${language === 'en' ? ' data-auto-language' : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)}</title>
  <link rel="canonical" href="${site.origin}/${route}">
  <link rel="alternate" hreflang="en" href="${site.origin}/${pathFor('en', page)}">
  <link rel="alternate" hreflang="zh-Hans" href="${site.origin}/${pathFor('zh', page)}">
  <link rel="alternate" hreflang="x-default" href="${site.origin}/${pathFor('en', page)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${site.origin}/${route}">
  <meta property="og:image" content="${site.origin}/assets/desktop.webp">
  <link rel="icon" type="image/png" href="${root}assets/shark.png">
  <script src="${root}assets/preferences.js"></script>
  <link rel="stylesheet" href="${root}assets/site.css?v=${stylesheetVersion}">
</head>
<body>
  <a class="skip" href="#main">${content.ui.skip}</a>
  <header class="top">
    <div class="wrap header-inner">
      <a class="brand" href="${homePath}">
        <img src="${root}assets/shark.png" width="34" height="34" alt="">
        <span>DeepShart</span>
      </a>
      <nav class="main-nav" aria-label="${content.ui.mainNav}">
        <a href="${homePath}#features">${content.nav.features}</a>
        <a href="${homePath}#platforms">${content.nav.platforms}</a>
        ${link('support')}
      </nav>
      <div class="preferences">
        <a class="language" data-set-language="${otherLanguage}" href="${switchPath}" lang="${languages[otherLanguage].lang}">
          ${icon(root, 'languages')} <span>${content.switchTo}</span>
        </a>
        <button class="theme" type="button" data-theme-toggle data-light="${content.ui.light}" data-dark="${content.ui.dark}" aria-label="${content.ui.dark}" hidden>
          ${icon(root, 'moon', 'day')}${icon(root, 'sun', 'night')}
        </button>
      </div>
    </div>
  </header>
  ${page ? legal(root, language, page, content) : home(root, language, content)}
  <footer class="bottom">
    <div class="wrap footer-inner">
      <div class="footer-brand">
        <a class="brand" href="${homePath}"><img src="${root}assets/shark.png" width="26" height="26" alt="">DeepShart</a>
        <span>Made by Muxi</span>
      </div>
      <nav aria-label="${content.ui.legalNav}">
        ${link('privacy')} ${link('terms')} ${link('support')}
      </nav>
    </div>
  </footer>
</body>
</html>
`;
}

for (const language of Object.keys(languages)) {
  for (const page of routes) {
    const folder = join(output, pathFor(language, page));
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, 'index.html'), html(language, page));
  }
}

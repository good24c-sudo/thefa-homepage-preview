// THE FA 기술·개발자산 포트폴리오 페이지 생성기 (의존성 없음)
//
// technology/portfolio.json 을 읽어 technology/index.html 의
// <!-- TECH-PORTFOLIO:START --> ~ <!-- TECH-PORTFOLIO:END --> 영역을 다시 만듭니다.
// 사이트 공통 Header/Footer 와 SEO 태그는 index.html 템플릿에 그대로 두고, 이 영역만 교체합니다.
//
//   node scripts/build-technology.mjs          # 포트폴리오 영역 갱신
//   node scripts/build-technology.mjs --check  # 데이터와 HTML 일치 여부만 검사 (불일치 시 종료 코드 1)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'technology', 'portfolio.json');
const PAGE = join(ROOT, 'technology', 'index.html');
const START = '<!-- TECH-PORTFOLIO:START -->';
const END = '<!-- TECH-PORTFOLIO:END -->';

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fail = (msg) => { console.error(`[technology] ${msg}`); process.exit(1); };

function validate(d) {
  for (const k of ['nav', 'hero', 'toolbar', 'statusKeys', 'sections', 'candidates', 'services', 'infra', 'tools', 'governance', 'footer']) {
    if (d[k] == null) fail(`portfolio.json 에 "${k}" 항목이 없습니다.`);
  }
  const filterValues = new Set(d.toolbar.filters.map((f) => f.value));
  for (const sec of d.sections) {
    if (!sec.id || !sec.title || !Array.isArray(sec.assets)) fail(`섹션 정보가 올바르지 않습니다: ${sec.id ?? '(id 없음)'}`);
    for (const a of sec.assets) {
      for (const k of ['status', 'statusClass', 'statusLabel', 'difficultyLabel', 'name', 'key', 'description']) {
        if (a[k] == null || a[k] === '') fail(`${sec.id}: 자산 "${a.name ?? a.key}" 의 ${k} 누락`);
      }
      if (!Number.isInteger(a.difficultyLevel) || a.difficultyLevel < 0 || a.difficultyLevel > 5) fail(`${sec.id}: "${a.name}" 난이도 단계는 0~5 정수여야 합니다.`);
      if (!filterValues.has(a.status)) fail(`${sec.id}: "${a.name}" 상태 "${a.status}" 가 필터 목록에 없습니다.`);
    }
  }
}

const difficulty = (level, label) =>
  `<span class="tp-difficulty" aria-label="난이도 ${esc(label)}">${[1, 2, 3, 4, 5].map((i) => `<i${i <= level ? ' class="on"' : ''}></i>`).join('')}<b>${esc(label)}</b></span>`;

function assetCard(a, category) {
  const search = [a.name, a.key, a.description, a.effect].filter((x) => x != null).join(' ').toLowerCase();
  return [
    `      <article class="tp-asset-card" data-status="${esc(a.status)}" data-category="${esc(category)}" data-search="${esc(search)}">`,
    `        <div class="tp-asset-top"><span class="tp-status ${esc(a.statusClass)}">${esc(a.statusLabel)}</span>${difficulty(a.difficultyLevel, a.difficultyLabel)}</div>`,
    `        <h3>${esc(a.name)}</h3>`,
    `        <p class="tp-asset-key">${esc(a.key)}</p>`,
    `        <p class="tp-desc">${esc(a.description)}</p>`,
    a.effect != null ? `        <div class="tp-effect"><span>${esc(a.effectLabel)}</span>${esc(a.effect)}</div>` : null,
    `      </article>`,
  ].filter(Boolean).join('\n');
}

function candidateCard(c) {
  return [
    `      <article class="tp-candidate-card">`,
    `        <div class="tp-asset-top"><span class="tp-status ${esc(c.statusClass)}">${esc(c.statusLabel)}</span>${difficulty(c.difficultyLevel, c.difficultyLabel)}</div>`,
    `        <h3>${esc(c.name)}</h3>`,
    `        <p class="tp-asset-key">${esc(c.key)}</p>`,
    `        <p class="tp-desc">${esc(c.description)}</p>`,
    `      </article>`,
  ].join('\n');
}

function render(d) {
  const o = [];
  o.push(`<div class="tp-bar">`);
  o.push(`  <div class="tp-wrap tp-bar-in">`);
  // 로고는 사이트 공통 헤더에 이미 있으므로 목차 바에는 섹션 링크만 둡니다.
  o.push(`    <nav class="tp-nav" aria-label="기술·개발자산 목차">${d.nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('')}</nav>`);
  o.push(`  </div>`);
  o.push(`</div>`);
  o.push(``);
  o.push(`<div class="tp-wrap" id="top">`);

  // hero
  const h = d.hero;
  o.push(`<section class="tp-hero">`);
  o.push(`  <div class="tp-hero-grid">`);
  o.push(`    <div class="tp-hero-main">`);
  o.push(`      <div class="tp-kicker">${esc(h.kicker)}</div>`);
  o.push(`      <h1>${h.titleLines.map(esc).join('<br/>')}</h1>`);
  o.push(`      <p>${esc(h.lead)}</p>`);
  o.push(`      <div class="tp-hero-note">${h.notes.map((n) => `<span>${esc(n)}</span>`).join('')}</div>`);
  o.push(`    </div>`);
  o.push(`    <aside class="tp-hero-side">`);
  o.push(`      <div class="tp-metrics">${h.metrics.map((m) => `<div class="tp-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div>`);
  o.push(`      <div class="tp-source-note">${esc(h.sourceNote)}</div>`);
  o.push(`    </aside>`);
  o.push(`  </div>`);
  o.push(`</section>`);
  o.push(``);

  // toolbar
  o.push(`<div class="tp-toolbar">`);
  o.push(`  <input class="tp-search" id="assetSearch" type="search" placeholder="${esc(d.toolbar.searchPlaceholder)}" aria-label="${esc(d.toolbar.searchPlaceholder)}"/>`);
  o.push(`  <div class="tp-filters">${d.toolbar.filters.map((f, i) => `<button type="button"${i === 0 ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"'} data-filter="${esc(f.value)}">${esc(f.label)}</button>`).join('')}</div>`);
  o.push(`</div>`);
  o.push(``);

  // asset sections
  for (const sec of d.sections) {
    o.push(`<section class="tp-asset-section" id="${esc(sec.id)}" aria-labelledby="${esc(sec.id)}-title">`);
    o.push(`  <div class="tp-section-heading">`);
    o.push(`    <div><span class="tp-section-no">${esc(sec.no)}</span><h2 id="${esc(sec.id)}-title">${esc(sec.title)}</h2></div>`);
    o.push(`    <p>${esc(sec.summary)}</p>`);
    o.push(`    <span class="tp-count">${esc(sec.countLabel)}</span>`);
    o.push(`  </div>`);
    o.push(`  <div class="tp-asset-grid">`);
    for (const a of sec.assets) o.push(assetCard(a, sec.category));
    o.push(`  </div>`);
    o.push(`</section>`);
    o.push(``);
  }

  // candidates
  const c = d.candidates;
  o.push(`<section class="tp-candidate-zone" aria-labelledby="tp-candidates-title">`);
  o.push(`  <h2 id="tp-candidates-title">${esc(c.title)}</h2>`);
  o.push(`  <p class="tp-lead">${esc(c.lead)}</p>`);
  o.push(`  <div class="tp-candidate-grid">`);
  for (const item of c.items) o.push(candidateCard(item));
  o.push(`  </div>`);
  o.push(`  <details>`);
  o.push(`    <summary>${esc(c.moreSummary)}</summary>`);
  o.push(`    <div class="tp-candidate-tags">${c.moreKeys.map((k) => `<span>${esc(k)}</span>`).join('')}</div>`);
  o.push(`  </details>`);
  o.push(`</section>`);
  o.push(``);

  // info tables
  const s = d.services;
  o.push(`<section class="tp-info-section" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-title">`);
  o.push(`  <div class="tp-info-head"><h2 id="${esc(s.id)}-title">${esc(s.title)}</h2><p>${esc(s.note)}</p></div>`);
  o.push(`  <div class="tp-table-wrap">`);
  o.push(`    <table>`);
  o.push(`      <thead><tr>${s.columns.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead>`);
  o.push(`      <tbody>`);
  for (const r of s.rows) {
    // url 이 null 이면 내부 배포 주소를 공개하지 않고 라벨만 표시합니다.
    const link = r.url
      ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.urlLabel)}<span>${esc(r.urlMark)}</span></a>`
      : `<span class="tp-private">${esc(r.urlLabel)}</span>`;
    o.push(`        <tr><td><strong>${esc(r.name)}</strong></td><td>${link}</td><td><span class="tp-domain-status">${esc(r.status)}</span></td><td>${esc(r.note)}</td></tr>`);
  }
  o.push(`      </tbody>`);
  o.push(`    </table>`);
  o.push(`  </div>`);
  o.push(`</section>`);
  o.push(``);

  const inf = d.infra;
  o.push(`<section class="tp-info-section" id="${esc(inf.id)}" aria-labelledby="${esc(inf.id)}-title">`);
  o.push(`  <div class="tp-info-head"><h2 id="${esc(inf.id)}-title">${esc(inf.title)}</h2><p>${esc(inf.note)}</p></div>`);
  o.push(`  <div class="tp-table-wrap">`);
  o.push(`    <table>`);
  o.push(`      <thead><tr>${inf.columns.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead>`);
  o.push(`      <tbody>`);
  for (const r of inf.rows) o.push(`        <tr>${r.map((cell, i) => `<td>${i === 0 ? `<strong>${esc(cell)}</strong>` : esc(cell)}</td>`).join('')}</tr>`);
  o.push(`      </tbody>`);
  o.push(`    </table>`);
  o.push(`  </div>`);
  o.push(`</section>`);
  o.push(``);

  const t = d.tools;
  o.push(`<section class="tp-info-section" id="${esc(t.id)}" aria-labelledby="${esc(t.id)}-title">`);
  o.push(`  <div class="tp-info-head"><h2 id="${esc(t.id)}-title">${esc(t.title)}</h2><p>${esc(t.note)}</p></div>`);
  o.push(`  <div class="tp-tool-grid">${t.items.map((x) => `<div class="tp-tool-card"><strong>${esc(x.name)}</strong><span>${esc(x.description)}</span></div>`).join('')}</div>`);
  o.push(`</section>`);
  o.push(``);

  const g = d.governance;
  o.push(`<section class="tp-method" aria-labelledby="tp-governance-title">`);
  o.push(`  <div>`);
  o.push(`    <h2 id="tp-governance-title">${esc(g.title)}</h2>`);
  o.push(`    <p>${esc(g.lead)}</p>`);
  o.push(`  </div>`);
  o.push(`  <ol>${g.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`);
  o.push(`</section>`);
  o.push(``);

  o.push(`<div class="tp-footer">`);
  o.push(`  <div class="tp-footer-row">${d.footer.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`);
  o.push(`</div>`);
  o.push(`</div>`);
  return o.join('\n');
}

const data = JSON.parse(readFileSync(DATA, 'utf8'));
validate(data);
const page = readFileSync(PAGE, 'utf8');
const a = page.indexOf(START); const b = page.indexOf(END);
if (a < 0 || b < a) fail('technology/index.html 에서 TECH-PORTFOLIO 표식을 찾을 수 없습니다.');
const next = `${page.slice(0, a + START.length)}\n${render(data)}\n${page.slice(b)}`;
const assets = data.sections.reduce((n, s) => n + s.assets.length, 0);
const summary = `섹션 ${data.sections.length}개 · 공식 자산 ${assets}개 · 회수/연구 후보 ${data.candidates.items.length}개 · 서비스 ${data.services.rows.length}개`;

if (process.argv.includes('--check')) {
  if (next !== page) fail('technology/index.html 이 portfolio.json 과 다릅니다. `node scripts/build-technology.mjs` 를 실행하세요.');
  console.log(`[technology] OK · ${summary} · HTML과 데이터 일치`);
} else {
  writeFileSync(PAGE, next);
  console.log(`[technology] 생성 완료 · ${summary}`);
}

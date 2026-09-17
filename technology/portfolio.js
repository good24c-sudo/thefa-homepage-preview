// THE FA 기술·개발자산 포트폴리오 — 상태 필터·검색 (원본 포트폴리오와 동일한 동작)
(function () {
  'use strict';
  const root = document.querySelector('.tech-portfolio');
  if (!root) return;
  const cards = [...root.querySelectorAll('.tp-asset-card')];
  const input = root.querySelector('#assetSearch');
  const buttons = [...root.querySelectorAll('.tp-filters button')];
  let active = 'ALL';

  function apply() {
    const q = ((input && input.value) || '').trim().toLowerCase();
    cards.forEach((c) => {
      const okStatus = active === 'ALL' || c.dataset.status === active;
      const okSearch = !q || (c.dataset.search || '').includes(q);
      c.classList.toggle('hidden', !(okStatus && okSearch));
    });
  }

  if (input) input.addEventListener('input', apply);
  buttons.forEach((b) => b.addEventListener('click', () => {
    buttons.forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
    b.classList.add('active');
    b.setAttribute('aria-pressed', 'true');
    active = b.dataset.filter;
    apply();
  }));
})();

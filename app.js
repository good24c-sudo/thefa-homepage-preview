// THE FA — 공용 인터랙션
(function () {
  'use strict';

  // ---------- 모바일 메뉴 ----------
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const panel = document.querySelector('.nav-panel');

  function closeMenu() {
    if (!nav || !panel || !toggle) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    panel.style.display = 'none';
  }
  function openMenu() {
    if (!nav || !panel || !toggle) return;
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '메뉴 닫기');
    panel.style.display = 'block';
  }

  if (toggle && nav && panel) {
    toggle.setAttribute('aria-label', '메뉴 열기');
    toggle.addEventListener('click', () => {
      if (nav.classList.contains('open')) closeMenu(); else openMenu();
    });

    // ESC 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // 링크 클릭 시 닫기
    panel.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', closeMenu)
    );

    // 데스크톱 폭으로 리사이즈되면 자동 닫기 (mobile menu bleed 방지)
    // ≤900px에서만 모바일 메뉴를 사용하므로 그 폭을 넘으면 닫아야 한다.
    const mq = window.matchMedia('(min-width: 901px)');
    const onMq = (ev) => {
      if (ev.matches) closeMenu();
    };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq); // 구형 사파리 폴백
  }

  // ---------- 헤더 스크롤 그림자 ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 4) header.style.boxShadow = '0 4px 20px rgba(23,24,23,.05)';
      else header.style.boxShadow = 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- 참고 이미지 확대 보기 (lightbox) ----------
  // 요소에 data-zoom 을 붙이면 클릭 시 확대 모달을 연다.
  const zoomTargets = document.querySelectorAll('[data-zoom]');
  if (zoomTargets.length) {
    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '이미지 확대 보기');
    overlay.hidden = true;
    overlay.innerHTML = '<button class="zoom-close" type="button" aria-label="확대 보기 닫기">닫기 ✕</button>' +
                        '<figure class="zoom-figure"><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector('img');
    const capEl = overlay.querySelector('figcaption');
    const closeBtn = overlay.querySelector('.zoom-close');
    let lastFocus = null;

    function openZoom(src, alt, caption) {
      lastFocus = document.activeElement;
      imgEl.src = src;
      imgEl.alt = alt || '';
      capEl.textContent = caption || '';
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function closeZoom() {
      overlay.hidden = true;
      imgEl.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }
    closeBtn.addEventListener('click', closeZoom);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeZoom();
    });
    document.addEventListener('keydown', (e) => {
      if (!overlay.hidden && e.key === 'Escape') closeZoom();
    });

    zoomTargets.forEach((el) => {
      // 클릭 대상: 이미지 또는 이미지 컨테이너
      el.addEventListener('click', (e) => {
        const img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (!img) return;
        e.preventDefault();
        const caption = el.getAttribute('data-caption') ||
                        (el.querySelector('figcaption') ? el.querySelector('figcaption').textContent : '');
        openZoom(img.currentSrc || img.src, img.alt, caption);
      });
      // 키보드 접근성 (button/anchor가 아니면)
      if (!['A','BUTTON'].includes(el.tagName)) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.style.cursor = 'zoom-in';
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); el.click();
          }
        });
      }
    });
  }
})();

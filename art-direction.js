/* White Field: a small, optional layer of movement. All portfolio data stays in data.js. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const works = document.getElementById('work-grid');
  const curatorial = document.getElementById('curatorial-grid');
  const archiveButton = document.getElementById('archive-toggle');
  const isChinese = () => document.documentElement.lang.toLowerCase().startsWith('zh');
  let observer;

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.06, rootMargin: '0px 0px 100px 0px' });
  }
  function refreshCards() {
    const cards = document.querySelectorAll('.work-card');
    cards.forEach(card => {
      if (observer) {
        if (!card.dataset.visualObserved) {
          card.dataset.visualObserved = '1';
          if (card.getBoundingClientRect().top < innerHeight) card.classList.add('is-visible');
          else observer.observe(card);
        }
      } else card.classList.add('is-visible');
    });
    document.body.classList.toggle('visual-enhanced', Boolean(observer));
    if (works && archiveButton) {
      const count = works.querySelectorAll('.work-card').length;
      const hasArchive = count > 8;
      document.body.classList.toggle('has-archive-limit', hasArchive);
      archiveButton.hidden = !hasArchive;
      archiveButton.setAttribute('aria-expanded', String(document.body.classList.contains('archive-expanded')));
      archiveButton.innerHTML = document.body.classList.contains('archive-expanded')
        ? (isChinese() ? '收起完整档案 <span aria-hidden="true">↑</span>' : 'Show fewer works <span aria-hidden="true">↑</span>')
        : (isChinese() ? '查看完整作品档案 <span aria-hidden="true">↗</span>' : 'Explore complete archive <span aria-hidden="true">↗</span>');
    }
    const notes = document.querySelectorAll('.section-note');
    if (notes.length === 2) {
      notes[0].textContent = isChinese() ? '关于影像、空间、行动与被构造的情境。' : 'A selection of moving image, spatial experiments, gestures and constructed situations.';
      notes[1].textContent = isChinese() ? '展览、合作，以及在共同工作中生成的项目。' : 'Exhibitions, collaborations, and projects shaped through collective work.';
    }
  }
  if (archiveButton) archiveButton.addEventListener('click', () => {
    const expanded = document.body.classList.toggle('archive-expanded');
    archiveButton.setAttribute('aria-expanded', String(expanded));
    refreshCards();
    if (!expanded) document.getElementById('works')?.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  refreshCards();
  if (works || curatorial) {
    const mutationObserver = new MutationObserver(() => refreshCards());
    if (works) mutationObserver.observe(works, { childList: true });
    if (curatorial) mutationObserver.observe(curatorial, { childList: true });
  }
  document.querySelectorAll('.lang-toggle').forEach(button => button.addEventListener('click', () => setTimeout(refreshCards, 0)));

  // Ambient glints: tied to deliberate scrolling, never an always-on particle screen.
  if (!reduceMotion.matches) {
    const layer = document.createElement('div');
    layer.id = 'ambient-glints';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    let previousY = scrollY, previousLight = 0;
    let index = 0;
    function glint() {
      if (document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) return;
      const width = innerWidth, height = innerHeight;
      for (let attempt = 0; attempt < 4; attempt++) {
        // Favor margins and the natural white gaps between art works.
        const side = Math.random() < .5;
        const x = width * (side ? .035 + Math.random() * .16 : .80 + Math.random() * .16);
        const y = height * (.16 + Math.random() * .68);
        const under = document.elementFromPoint(x, y);
        if (under?.closest('img, video, iframe, a, button, header, input, textarea, dialog')) continue;
        const dot = document.createElement('span');
        dot.className = 'ambient-glint' + ((index++ % 3 === 2) ? ' soft' : '');
        dot.style.left = x + 'px'; dot.style.top = y + 'px';
        layer.append(dot);
        dot.addEventListener('animationend', () => dot.remove(), { once:true });
        return;
      }
    }
    window.addEventListener('scroll', () => {
      const distance = Math.abs(scrollY - previousY);
      previousY = scrollY;
      const now = performance.now();
      if (scrollY > 200 && distance > 7 && now - previousLight > 640 && layer.childElementCount < 3) {
        previousLight = now; glint();
      }
    }, { passive:true });
    reduceMotion.addEventListener?.('change', event => { if (event.matches) { layer.replaceChildren(); layer.remove(); } }, { once:true });
  }
})();


/* Keep bespoke header and text labels bilingual without touching Studio's data.js. */
function syncXuNuoNavigation(){
  const zh=document.documentElement.lang.toLowerCase().startsWith('zh');
  document.querySelectorAll('[data-nav-en]').forEach(el=>{
    const label=zh?el.getAttribute('data-nav-zh'):el.getAttribute('data-nav-en');
    if(label)el.textContent=label;
  });
}
syncXuNuoNavigation();
document.querySelectorAll('.lang-toggle').forEach(btn=>btn.addEventListener('click',()=>queueMicrotask(syncXuNuoNavigation)));

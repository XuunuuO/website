/* Slow movement in the first field. No input data, cookies or network requests. */
(() => {
  'use strict';
  const field = document.getElementById('name-field');
  if (!field || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let frame = 0;
  const pieces = [...field.querySelectorAll('.name-piece')].map(el => ({el, speed:Number(el.style.getPropertyValue('--speed')) || 0}));
  const update = () => {
    currentX += (targetX - currentX) * .075;
    currentY += (targetY - currentY) * .075;
    pieces.forEach(({el,speed}) => { el.style.transform = `translate(calc(-50% + ${(currentX*speed).toFixed(2)}px), calc(-50% + ${(currentY*speed).toFixed(2)}px))`; });
    if (Math.abs(targetX-currentX) > .1 || Math.abs(targetY-currentY) > .1) frame = requestAnimationFrame(update);
    else frame = 0;
  };
  const start = () => { if (!frame) frame = requestAnimationFrame(update); };
  field.addEventListener('pointermove', e => {
    if(e.pointerType === 'touch') return;
    const b = field.getBoundingClientRect();
    targetX = Math.max(-45, Math.min(45, (e.clientX - b.left - b.width/2) / b.width * 90));
    targetY = Math.max(-32, Math.min(32, (e.clientY - b.top - b.height/2) / b.height * 64));
    start();
  }, {passive:true});
  field.addEventListener('pointerleave', () => { targetX=0; targetY=0; start(); }, {passive:true});
  // Animate only when this section is onscreen, so background tabs do not spend CPU.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { targetX=0; targetY=0; start(); }
    }, {threshold:0}).observe(field);
  }
})();

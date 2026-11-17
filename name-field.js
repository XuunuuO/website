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
    pieces.forEach(({el,speed}) => { el.style.transform = 'translate(calc(-50% + ' + (currentX*speed).toFixed(2) + 'px), calc(-50% + ' + (currentY*speed).toFixed(2) + 'px))'; });
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

/* Small, scattered glints briefly gather around the name as the visitor begins to scroll. */
(() => {
  'use strict';
  const hero=document.querySelector('.hero-namefield');
  const field=document.getElementById('name-field');
  if(!hero||!field)return;
  const layer=document.createElement('div');
  layer.id='scroll-glints';
  layer.setAttribute('aria-hidden','true');
  document.body.appendChild(layer);
  const scatter=[[-78,-28],[-54,40],[-26,-64],[14,-42],[42,56],[78,-8],[91,38],[-96,14],[27,4]];
  const dots=scatter.map(()=>{const dot=document.createElement('i');dot.className='scroll-glint';layer.appendChild(dot);return dot;});
  let frame=0;
  const clamp=(n)=>Math.max(0,Math.min(1,n));
  function update(){
    frame=0;
    const sy=window.scrollY||0;
    const box=field.getBoundingClientRect();
    const cx=box.left+(window.scrollX||0)+box.width*.52;
    const cy=box.top+sy+box.height*.48;
    const scale=Math.min(1,Math.max(.68,box.width/420));
    const reveal=clamp((sy+14)/120);
    const dissolve=1-clamp((sy-hero.offsetHeight*.38)/(hero.offsetHeight*.24));
    const visible=Math.ceil(reveal*dots.length);
    dots.forEach((dot,i)=>{
      const [dx,dy]=scatter[i];
      dot.style.left=(cx+dx*scale)+'px';
      dot.style.top=(cy+dy*scale)+'px';
      dot.style.setProperty('--glint-alpha',(0.26*dissolve).toFixed(3));
      dot.classList.toggle('is-lit',i<visible&&dissolve>.02);
    });
    hero.classList.toggle('is-scrolling',sy>18);
    document.body.classList.toggle('has-scrolled',sy>42);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('load',schedule,{once:true});
  schedule();
})();

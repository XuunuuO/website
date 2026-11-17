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


/* A scroll-revealed trail of light points leads from the name toward the first work. */
(() => {
  'use strict';
  const hero=document.querySelector('.hero-namefield');
  const field=document.getElementById('name-field');
  const target=document.querySelector('.featured-row .hero-feature');
  if(!hero||!field||!target)return;
  const layer=document.createElement('div');
  layer.id='scroll-glints';
  layer.setAttribute('aria-hidden','true');
  document.body.appendChild(layer);
  const count=24,dots=Array.from({length:count},()=>{const dot=document.createElement('i');dot.className='scroll-glint';layer.appendChild(dot);return dot;});
  let frame=0;
  function update(){
    frame=0;
    const sy=window.scrollY||0;
    const a=field.getBoundingClientRect(),b=target.getBoundingClientRect();
    const start={x:a.left+(window.scrollX||0)+a.width*.52,y:a.top+sy+a.height*.48};
    const end={x:b.left+(window.scrollX||0)+Math.min(22,b.width*.04),y:b.top+sy+24};
    const control={x:start.x+(end.x-start.x)*.7+Math.min(70,window.innerWidth*.06),y:start.y+(end.y-start.y)*.52};
    const reveal=Math.max(0,Math.min(1,(sy+12)/Math.max(220,hero.offsetHeight*.64)));
    const lit=Math.ceil(reveal*count);
    dots.forEach((dot,i)=>{
      const t=(i+1)/(count+1),u=1-t,wave=Math.sin(t*Math.PI*3)*9;
      const x=u*u*start.x+2*u*t*control.x+t*t*end.x+wave;
      const y=u*u*start.y+2*u*t*control.y+t*t*end.y;
      dot.style.left=x+'px';dot.style.top=y+'px';dot.classList.toggle('is-lit',i<lit);
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

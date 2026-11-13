(()=>{'use strict';
const data=window.SITE_DATA;if(!data)return;
const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let lang='en';try{lang=localStorage.getItem('xunuo-language')==='zh'?'zh':'en'}catch{}
const t=k=>data.text[lang][k]||k;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const imagePath=id=>'./'+encodeURIComponent(id)+'.webp';
const title=w=>lang==='zh'&&w.zh?w.zh:w.title;
const medium=w=>lang==='zh'&&w.mediumZh?w.mediumZh:w.medium;
function img(id,alt,lazy=true){return `<img src="${imagePath(id)}" ${lazy?'loading="lazy"':'fetchpriority="high"'} decoding="async" alt="${esc(alt)}">`}
function card(w,i){return `<a class="work-card" href="./project.html?id=${encodeURIComponent(w.id)}" aria-label="${esc(title(w))}"><div class="card-img">${img(w.id,title(w)+', '+w.year)}<span class="card-open" aria-hidden="true">↗</span></div><div class="card-meta"><span class="card-number">${String(i+1).padStart(2,'0')}</span><div><h3 class="card-title">${esc(title(w))}</h3><div class="card-sub">${esc(medium(w))}</div></div><span class="card-year">${w.year}</span></div></a>`}
function renderHome(){qs('#work-grid').innerHTML=data.works.map(card).join('');qs('#curatorial-grid').innerHTML=data.curatorial.map(card).join('');qs('#works-count').textContent='01 / '+String(data.works.length).padStart(2,'0');qs('#exhibition-list').innerHTML=data.exhibitions.map(([year,en,zh])=>`<div class="cv-entry"><span>${esc(year)}</span><p>${esc(lang==='zh'?zh||en:en)}</p></div>`).join('');}
function renderProject(){const id=new URLSearchParams(location.search).get('id'),all=[...data.works,...data.curatorial],w=all.find(x=>x.id===id);if(!w){qs('#project-title').textContent=t('notFound');qs('#project-subtitle').textContent=t('notFoundBody');['.project-hero','.project-details','.project-gallery','.project-next'].forEach(s=>qs(s).hidden=true);return;}
const next=all[(all.indexOf(w)+1)%all.length],curation=data.curatorial.includes(w);
document.title=title(w)+' — Xu Nuo / 徐诺';document.querySelector('meta[name="description"]').content=(lang==='zh'?w.descriptionZh:w.description).split('\n')[0];qs('link[rel="canonical"]').href='https://xuunuuo.github.io/website/project.html?id='+encodeURIComponent(w.id);
qs('#project-number').textContent=t(curation?'curatorialLabel':'worksLabel')+' / '+w.year;
qs('#project-title').textContent=title(w);qs('#project-subtitle').textContent=w.year+' · '+medium(w);
qs('#project-hero').innerHTML=`<button class="image-zoom" aria-label="${esc(t('imageHint'))}">${img(w.id,title(w)+', '+w.year,false)}</button>`;
qs('#project-description').innerHTML=(lang==='zh'?w.descriptionZh:w.description).split('\n\n').map(p=>'<p>'+esc(p)+'</p>').join('');
qs('#project-gallery').innerHTML=(w.gallery||[]).map((id,i)=>`<figure><button class="image-zoom" aria-label="${esc(t('imageHint'))}">${img(id,title(w)+' — '+t('documentation')+' '+(i+2))}</button><figcaption>${t('documentation')} / ${String(i+2).padStart(2,'0')}</figcaption></figure>`).join('');
qs('#project-next').innerHTML=`<span class="eyebrow">${t('nextWork')}</span><a href="./project.html?id=${encodeURIComponent(next.id)}">${esc(title(next))} ↗</a>`;
const back=qs('.project-return a');back.href=curation?'./#curatorial':'./#works';back.textContent=t(curation?'allCuratorial':'allWorks');
}
function render(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';qsa('[data-i18n]').forEach(el=>{const s=data.text[lang][el.dataset.i18n];if(s)el.textContent=s});qsa('.lang-toggle').forEach(el=>{el.textContent=lang==='zh'?'EN':'中文';el.setAttribute('aria-label',lang==='zh'?'Switch to English':'切换至中文')});qs('.viewer-close').setAttribute('aria-label',t('closeImage'));if(document.body.dataset.page==='home')renderHome();else renderProject();}
qsa('.lang-toggle').forEach(b=>b.addEventListener('click',()=>{lang=lang==='en'?'zh':'en';try{localStorage.setItem('xunuo-language',lang)}catch{}render()}));
const viewer=qs('#image-viewer');let lastTrigger;
document.addEventListener('click',e=>{const button=e.target.closest('.image-zoom');if(!button)return;lastTrigger=button;const source=button.querySelector('img'),target=viewer.querySelector('img');target.src=source.src;target.alt=source.alt;viewer.showModal();document.body.classList.add('viewer-open')});
qs('.viewer-close').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});viewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');lastTrigger?.focus()});
render();
})();

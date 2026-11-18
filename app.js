import {videoInfo,localMedia} from './admin-core.mjs';
(()=>{'use strict';
const data=window.SITE_DATA;if(!data)return;
const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let lang='en';try{lang=localStorage.getItem('xunuo-language')==='zh'?'zh':'en'}catch{}
const t=k=>data.text[lang][k]||k;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const imagePath=id=>'./'+encodeURIComponent(localMedia(id)?id:id+'.webp');
const title=w=>lang==='zh'&&w.zh?w.zh:w.title;
const medium=w=>lang==='zh'&&w.mediumZh?w.mediumZh:w.medium;
function img(id,alt,lazy=true){return `<img src="${imagePath(id)}" ${lazy?'loading="lazy"':'fetchpriority="high"'} decoding="async" alt="${esc(alt)}">`}
function card(w,i){return `<a class="work-card" href="./project.html?id=${encodeURIComponent(w.id)}" aria-label="${esc(title(w))}"><div class="card-img">${img(w.cover||w.id,title(w)+', '+w.year)}<span class="card-open" aria-hidden="true">↗</span></div><div class="card-meta"><span class="card-number">${String(i+1).padStart(2,'0')}</span><div><h3 class="card-title">${esc(title(w))}</h3><div class="card-sub">${esc(medium(w))}</div></div><span class="card-year">${w.year}</span></div></a>`}
function renderHome(){const feature=data.works.find(w=>w.id==='layered-edge'&&!w.hidden)||data.works.find(w=>!w.hidden);const hero=qs('.hero-feature');hero.hidden=!feature;if(feature){hero.href='./project.html?id='+encodeURIComponent(feature.id);hero.querySelector('img').src=imagePath(feature.cover||feature.id);hero.querySelector('img').alt=title(feature);hero.querySelector('span>span').textContent=feature.year;} qs('#work-grid').innerHTML=data.works.filter(w=>!w.hidden).map(card).join('');qs('#curatorial-grid').innerHTML=data.curatorial.filter(w=>!w.hidden).map(card).join('');qs('#works-count').textContent='01 / '+String(data.works.filter(w=>!w.hidden).length).padStart(2,'0');qs('#exhibition-list').innerHTML=data.exhibitions.map(([year,en,zh])=>`<div class="cv-entry"><span>${esc(year)}</span><p>${esc(lang==='zh'?zh||en:en)}</p></div>`).join('');}
function renderProject(){const requestedId=new URLSearchParams(location.search).get('id'),id=requestedId==='temporary-point'?'here-i-work':requestedId,all=[...data.works,...data.curatorial].filter(w=>!w.hidden),w=all.find(x=>x.id===id);if(!w){qs('#project-title').textContent=t('notFound');qs('#project-subtitle').textContent=t('notFoundBody');['.project-hero','.project-details','.project-gallery','.project-next'].forEach(s=>qs(s).hidden=true);return;}
const next=all[(all.indexOf(w)+1)%all.length],curation=data.curatorial.includes(w);
document.title=title(w)+' — Xu Nuo / 徐诺';document.querySelector('meta[name="description"]').content=(lang==='zh'?w.descriptionZh:w.description).split('\n')[0];qs('link[rel="canonical"]').href='https://xuunuuo.github.io/website/project.html?id='+encodeURIComponent(w.id);
qs('#project-number').textContent=t(curation?'curatorialLabel':'worksLabel')+' / '+w.year;
qs('#project-title').textContent=title(w);qs('#project-subtitle').textContent=w.year+' · '+medium(w);
qs('#project-hero').innerHTML=`<button class="image-zoom" aria-label="${esc(t('imageHint'))}">${img(w.cover||w.id,title(w)+', '+w.year,false)}</button>`;
qs('#project-description').innerHTML=(lang==='zh'?w.descriptionZh:w.description).split('\n\n').map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join('');
const video=qs('#project-video');video.replaceChildren();try{const v=videoInfo(w.video);if(v){if(v.type==='embed'){const iframe=document.createElement('iframe');iframe.src=v.url;iframe.title=title(w);iframe.allow='fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';video.append(iframe);}else{const player=document.createElement('video');player.src=v.url;player.controls=true;player.preload='metadata';player.playsInline=true;video.append(player);}}}catch{}
qs('#project-gallery').innerHTML=(w.gallery||[]).map((id,i)=>`<figure><button class="image-zoom" aria-label="${esc(t('imageHint'))}">${img(id,title(w)+' — '+t('documentation')+' '+(i+2))}</button><figcaption>${t('documentation')} / ${String(i+2).padStart(2,'0')}</figcaption></figure>`).join('');
qs('#project-next').innerHTML=`<span class="eyebrow">${t('nextWork')}</span><a href="./project.html?id=${encodeURIComponent(next.id)}">${esc(title(next))} ↗</a>`;
const back=qs('.project-return a');back.href=curation?'./#curatorial':'./#works';back.textContent=t(curation?'allCuratorial':'allWorks');
}
function render(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';window.dispatchEvent(new Event('site-language-change'));qsa('[data-i18n]').forEach(el=>{const s=data.text[lang][el.dataset.i18n];if(s)el.textContent=s});qsa('.lang-toggle').forEach(el=>{el.textContent=lang==='zh'?'EN':'中文';el.setAttribute('aria-label',lang==='zh'?'Switch to English':'切换至中文')});qs('.viewer-close').setAttribute('aria-label',t('closeImage'));if(document.body.dataset.page==='home'){renderHome();const ci=qs('[data-i18n=curationIndex]');ci.textContent='02 / '+String(data.curatorial.filter(w=>!w.hidden).length).padStart(2,'0')+(lang==='zh'?' 个项目':' PROJECTS');}else renderProject();}
qsa('.lang-toggle').forEach(b=>b.addEventListener('click',()=>{lang=lang==='en'?'zh':'en';try{localStorage.setItem('xunuo-language',lang)}catch{}render()}));
const viewer=qs('#image-viewer');let lastTrigger;
document.addEventListener('click',e=>{const button=e.target.closest('.image-zoom');if(!button)return;lastTrigger=button;const source=button.querySelector('img'),target=viewer.querySelector('img');target.src=source.src;target.alt=source.alt;viewer.showModal();document.body.classList.add('viewer-open')});
qs('.viewer-close').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});viewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');lastTrigger?.focus()});
render();
})();

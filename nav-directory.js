(()=>{'use strict';
const data=window.SITE_DATA;if(!data)return;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const lang=()=>document.documentElement.lang.startsWith('zh')?'zh':'en';
const title=w=>lang()==='zh'&&w.zh?w.zh:w.title;
const homeHash=id=>document.body.dataset.page==='home'?'#'+id:'./#'+id;
function link(href,label,meta=''){return `<a class="nav-directory-link" href="${esc(href)}"><span>${esc(label)}</span>${meta?`<small>${esc(meta)}</small>`:''}</a>`}
function yearGroups(items){const groups={};for(const item of items){(groups[item.year]??=[]).push(item)}return Object.keys(groups).sort((a,b)=>Number(b)-Number(a)).map(year=>`<section class="nav-year-group"><h3>${esc(year)}</h3>${groups[year].map(w=>link(`./project.html?id=${encodeURIComponent(w.id)}`,title(w))).join('')}</section>`).join('')}
function render(){
 const labels=lang()==='zh'?{works:'展开作品目录',curatorial:'展开策展目录',cv:'展开履历与联系目录',text:'展开文本目录'}:{works:'Show works menu',curatorial:'Show curatorial menu',cv:'Show CV and contact menu',text:'Show text menu'};qa('.nav-item').forEach(item=>{const b=q('.nav-disclosure',item);if (b) {
   const names = lang() === 'zh'
     ? {works:'作品',curatorial:'策展',cv:'履历／联系',text:'文本'}
     : {works:'Works',curatorial:'Curatorial',cv:'CV / Contact',text:'Text'};
   b.textContent = names[item.dataset.navMenu];
   b.setAttribute('aria-label',labels[item.dataset.navMenu]);
   b.setAttribute('aria-controls','nav-menu-' + item.dataset.navMenu);
 }});
 const activeWorks=data.works.filter(w=>!w.hidden),activeCuratorial=data.curatorial.filter(w=>!w.hidden);
 const workBox=q('#nav-menu-works');if(workBox){workBox.innerHTML=`<div class="nav-directory-heading">${lang()==='zh'?'按年份浏览作品':'Browse works by year'}</div><div class="nav-year-grid">${yearGroups(activeWorks)}</div>`;workBox.hidden=false;}
 const curBox=q('#nav-menu-curatorial');if(curBox){curBox.innerHTML=`<div class="nav-directory-heading">${lang()==='zh'?'策展及相关项目':'Curatorial projects'}</div><div class="nav-year-grid">${yearGroups(activeCuratorial)}</div>`;curBox.hidden=false;}
 const cv=q('#nav-menu-cv');if(cv){const rows=lang()==='zh'?[['艺术家简介','about'],['教育经历','education'],['精选展览','exhibitions'],['联系方式','contact']]:[['Biography','about'],['Education','education'],['Selected exhibitions','exhibitions'],['Contact','contact']];cv.innerHTML=`<div class="nav-directory-heading">${lang()==='zh'?'履历／联系':'CV / Contact'}</div><div class="nav-directory-list">${rows.map(([label,id])=>link(homeHash(id),label)).join('')}</div>`;cv.hidden=false;}
 const textBox=q('#nav-menu-text');if(textBox){const samples=[['silence','2026','沉默是一项需要反复训练的技能。','Silence is a skill that requires constant practice.'],['nothing-happens','2025','当什么也没有发生时，会发生什么？','What happens when nothing happens?'],['all-that-appears','2025','搅动一个被表象充满的世界；搅动数据、感知与意义的尘埃。','To disturb a world saturated with appearances; to stir the dust of data, of perception, of meaning.']];textBox.innerHTML=`<div class="nav-directory-heading">${lang()==='zh'?'作品中的文本片段':'Fragments from works'}</div><div class="nav-directory-list">${samples.map(([id,year,zh,en])=>link(`./project.html?id=${id}`,lang()==='zh'?zh:en,year)).join('')}</div>`;textBox.hidden=false;}
}
function closeAll(except){qa('.nav-item').forEach(item=>{if(item!==except){item.classList.remove('is-open');q('.nav-disclosure',item)?.setAttribute('aria-expanded','false')}})}
qa('.nav-item').forEach(item=>{
 const button=q('.nav-disclosure',item);
 item.addEventListener('pointerenter',()=>{item.classList.add('is-hovered');button?.setAttribute('aria-expanded','true')});
 item.addEventListener('pointerleave',()=>{item.classList.remove('is-hovered');if(!item.classList.contains('is-open')&&!item.contains(document.activeElement))button?.setAttribute('aria-expanded','false')});
 item.addEventListener('focusin',()=>button?.setAttribute('aria-expanded','true'));
 item.addEventListener('focusout',e=>{if(!item.contains(e.relatedTarget)&&!item.classList.contains('is-open'))button?.setAttribute('aria-expanded','false')});
 button?.addEventListener('click',()=>{const open=!item.classList.contains('is-open');closeAll(item);item.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open))});
 item.addEventListener('click',e=>{if(e.target.closest('.nav-directory-link')){item.classList.remove('is-open');button?.setAttribute('aria-expanded','false')}});
});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-item'))closeAll(null)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAll(null);document.activeElement?.blur?.()}});
window.addEventListener('site-language-change',render);render();
})();

// Desktop visitors can hover to browse or click a section to keep its menu open.
(() => {
  const desktop = window.matchMedia('(hover: hover) and (min-width: 761px)');
  const items = [...document.querySelectorAll('.nav-item')];
  let pinned = null;
  let timer;

  function reset() {
    clearTimeout(timer);
    pinned = null;
    for (const item of items) {
      item.classList.remove('is-open');
      item.querySelector('.nav-disclosure')?.setAttribute('aria-expanded', 'false');
    }
  }

  for (const item of items) {
    const trigger = item.querySelector(':scope > a');
    const panel = item.querySelector('.nav-popover');
    if (!trigger || !panel || panel.hidden) continue;

    function open() {
      clearTimeout(timer);
      for (const other of items) {
        if (other !== item) other.classList.remove('is-open');
      }
      item.classList.add('is-open');
      item.querySelector('.nav-disclosure')?.setAttribute('aria-expanded', 'true');
    }

    item.addEventListener('pointerenter', event => {
      if (!desktop.matches || event.pointerType !== 'mouse') return;
      if (pinned !== item) pinned = null;
      open();
    });
    item.addEventListener('pointerleave', event => {
      if (!desktop.matches || event.pointerType !== 'mouse' || pinned === item) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!item.matches(':hover, :focus-within')) reset();
      }, 550);
    });
    trigger.addEventListener('click', event => {
      if (!desktop.matches || event.detail === 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (pinned === item) return;
      event.preventDefault();
      pinned = item;
      open();
    });
  }
  document.addEventListener('pointerdown', event => {
    if (desktop.matches && !event.target.closest('.nav-item')) reset();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') pinned = null;
  });
  desktop.addEventListener('change', reset);
})();



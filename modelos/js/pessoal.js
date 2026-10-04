(function(){
const filters=document.querySelectorAll('[data-gallery]');const cards=document.querySelectorAll('[data-work]');
function filter(value){filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gallery===value)));cards.forEach(c=>c.hidden=value!=='todos'&&c.dataset.work!==value);}
filters.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.gallery)));
cards.forEach(c=>c.addEventListener('click',()=>{const d=document.createElement('dialog');d.className='photo-dialog';d.setAttribute('aria-label',c.querySelector('span').textContent);const close=document.createElement('button');close.className='preview-btn';close.textContent='Fechar';close.addEventListener('click',()=>d.close());const img=c.querySelector('img').cloneNode();d.append(close,img);document.body.append(d);d.addEventListener('close',()=>d.remove());d.addEventListener('click',e=>{if(e.target===d)d.close();});d.showModal();}));
document.getElementById('btn-restaurar').addEventListener('click',()=>{filter('todos');const toast=document.getElementById('toast');toast.textContent='Filtros do portfólio restaurados.';toast.classList.add('is-visible');setTimeout(()=>toast.classList.remove('is-visible'),2400);});
})();

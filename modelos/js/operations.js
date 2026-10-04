/* Modelos locais: regras de dados compartilhadas com os controles da interface. */
(function(){
  const stages=['Inscrição','Triagem','Entrevista','Proposta','Contratado','Não selecionado'];
  const defaults={
    recrutamento:[{id:'c1',name:'Ana Exemplo',role:'Analista administrativo',score:86,stage:'Entrevista'},{id:'c2',name:'Bruno Exemplo',role:'Desenvolvimento',score:72,stage:'Triagem'},{id:'c3',name:'Carla Exemplo',role:'Desenvolvimento',score:94,stage:'Proposta'},{id:'c4',name:'Diego Exemplo',role:'Analista administrativo',score:80,stage:'Contratado'}],
    estoque:[{id:'p1',name:'Caderno azul',sku:'CAD-001',category:'Papelaria',stock:12,min:5,price:29.9},{id:'p2',name:'Caneta preta',sku:'CAN-002',category:'Papelaria',stock:3,min:10,price:4.5},{id:'p3',name:'Mouse sem fio',sku:'TEC-003',category:'Tecnologia',stock:0,min:3,price:79.9},{id:'p4',name:'Suporte de mesa',sku:'TEC-004',category:'Tecnologia',stock:18,min:4,price:45}]
  };
  const clone=v=>JSON.parse(JSON.stringify(v));
  const clean=v=>String(v??'').trim().slice(0,80);
  const normalize=v=>String(v).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function validate(type,r){
    if(!r||!clean(r.name))return false;
    if(type==='recrutamento')return !!clean(r.role)&&Number.isFinite(r.score)&&r.score>=0&&r.score<=100&&Number.isInteger(r.score)&&stages.includes(r.stage);
    return !!clean(r.sku)&&!!clean(r.category)&&['stock','min'].every(k=>Number.isInteger(r[k])&&r[k]>=0&&r[k]<=1000000)&&Number.isFinite(r.price)&&r.price>=0&&r.price<=1000000;
  }
  function create(type,saved){
    if(!Object.hasOwn(defaults,type))throw Error('Modelo inválido.');
    const valid=saved&&Array.isArray(saved.rows)&&saved.rows.every(r=>validate(type,r)&&typeof r.id==='string')&&new Set(saved.rows.map(r=>r.id)).size===saved.rows.length&&(type!=='estoque'||new Set(saved.rows.map(r=>normalize(r.sku))).size===saved.rows.length);
    let rows=clone(valid?saved.rows:defaults[type]);let history=valid&&Array.isArray(saved.history)?saved.history.filter(h=>h&&typeof h.name==='string'&&typeof h.at==='string'&&Number.isInteger(h.amount)&&Number.isInteger(h.balance)).slice(0,15):[];
    function save(input,id){
      const r=type==='recrutamento'?{name:clean(input.name),role:clean(input.role),score:Number(input.score),stage:input.stage}:{name:clean(input.name),sku:clean(input.sku).toUpperCase(),category:clean(input.category),stock:Number(input.stock),min:Number(input.min),price:Number(input.price)};
      if(!validate(type,r))throw Error('Preencha os campos corretamente. Use números válidos e não negativos.');
      if(type==='estoque'&&rows.some(x=>x.id!==id&&normalize(x.sku)===normalize(r.sku)))throw Error('Este SKU já está cadastrado. Use um código diferente.');
      if(id&&!rows.some(x=>x.id===id))throw Error('Registro não encontrado.');
      r.id=id||('demo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));
      if(id)rows=rows.map(x=>x.id===id?r:x);else rows.push(r);return clone(r);
    }
    return {
      list:()=>clone(rows),snapshot:()=>clone({rows,history}),history:()=>clone(history),save,
      remove(id){rows=rows.filter(r=>r.id!==id);},
      stage(id,value){if(type!=='recrutamento'||!stages.includes(value))throw Error('Etapa inválida.');const r=rows.find(r=>r.id===id);if(!r)throw Error('Candidato não encontrado.');r.stage=value;},
      move(id,amount){const r=rows.find(r=>r.id===id);if(type!=='estoque'||!r)throw Error('Produto não encontrado.');if(!Number.isInteger(amount)||amount===0||Math.abs(amount)>1000000)throw Error('Informe uma quantidade inteira maior que zero.');if(r.stock+amount<0)throw Error('Saldo insuficiente. A saída não pode ultrapassar o estoque.');if(r.stock+amount>1000000)throw Error('O saldo ultrapassa o limite desta demonstração.');r.stock+=amount;history.unshift({name:r.name,amount,balance:r.stock,at:new Date().toISOString()});history=history.slice(0,15);},
      filter(term='',option='todos'){return clone(rows.filter(r=>normalize(Object.values(r).join(' ')).includes(normalize(term))&&(option==='todos'||(type==='recrutamento'?r.role===option:option==='baixo'?r.stock<=r.min:r.stock>r.min))));},
      reset(){rows=clone(defaults[type]);history=[];}
    };
  }
  function csvCell(v){let s=String(v);if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
  function mount(type){
    const recruit=type==='recrutamento',key='kodex-demo-'+type;
    let saved=null;try{saved=JSON.parse(localStorage.getItem(key));}catch(_){}
    const api=create(type,saved);window.KodexActiveOperation=api;
    const get=id=>document.getElementById(id),form=get('op-form'),status=get('op-status'),search=get('op-search'),filter=get('op-filter');let editing=null;
    const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
    function notify(message){status.textContent=message;}
    function persist(){try{localStorage.setItem(key,JSON.stringify(api.snapshot()));}catch(_){/* Funciona em memória quando o armazenamento está indisponível. */}}
    function action(text,fn){const b=el('button',text);b.type='button';b.className='preview-btn';b.addEventListener('click',fn);return b;}
    function resetForm(){editing=null;form.reset();get('op-form-title').textContent=recruit?'Cadastrar candidato':'Cadastrar produto';}
    function updateFilters(){if(!recruit)return;const chosen=filter.value;filter.replaceChildren(new Option('Todas as vagas','todos'));[...new Set(api.list().map(r=>r.role))].sort().forEach(v=>filter.append(new Option(v,v)));filter.value=Array.from(filter.options).some(o=>o.value===chosen)?chosen:'todos';}
    function edit(r){editing=r.id;Object.entries(r).forEach(([k,v])=>{const input=form.elements.namedItem(k);if(input)input.value=v;});get('op-form-title').textContent='Editar '+(recruit?'candidato':'produto');form.elements.namedItem('name').focus();notify('Edite os campos e clique em Salvar registro.');}
    function refresh(){
      const all=api.list(),visible=api.filter(search.value.trim(),filter.value);get('op-count').textContent=`${visible.length} de ${all.length} registros · dados fictícios`;
      const metrics=recruit?[['Candidatos',all.length],['Em entrevista',all.filter(r=>r.stage==='Entrevista').length],['Contratados',all.filter(r=>r.stage==='Contratado').length]]:[['Produtos',all.length],['Reposição necessária',all.filter(r=>r.stock<=r.min).length],['Valor em estoque',money(all.reduce((s,r)=>s+r.stock*r.price,0))]];
      get('op-metrics').replaceChildren();metrics.forEach(([label,value])=>{const c=el('div');c.append(el('span',label),el('strong',String(value)));get('op-metrics').append(c);});
      const body=get('op-rows');body.replaceChildren();visible.forEach(r=>{
        const tr=el('tr'),name=el('td');name.append(el('strong',r.name),el('p',recruit?r.role:r.sku+' · '+r.category));tr.append(name);
        if(recruit){tr.append(el('td',r.score+' / 100'));const cell=el('td'),select=el('select');select.setAttribute('aria-label','Etapa de '+r.name);stages.forEach(s=>select.append(new Option(s,s)));select.value=r.stage;select.addEventListener('change',()=>{api.stage(r.id,select.value);persist();refresh();const replacement=Array.from(body.querySelectorAll('select')).find(s=>s.getAttribute('aria-label')==='Etapa de '+r.name);replacement?.focus();notify('Etapa atualizada.');});cell.append(select);tr.append(cell);}
        else {const stock=el('td');stock.append(el('strong',String(r.stock)),el('p','Mínimo: '+r.min));if(r.stock<=r.min){const warn=el('span','Repor estoque');warn.className='stock-warning';stock.append(warn);}tr.append(stock,el('td',money(r.price)));}
        const actions=el('td');
        if(!recruit){const controls=el('div');controls.className='movement-controls';const quantity=el('input');quantity.type='number';quantity.min='1';quantity.max='1000000';quantity.step='1';quantity.value='1';quantity.setAttribute('aria-label','Quantidade para movimentar '+r.name);controls.append(quantity);['Entrada','Saída'].forEach((label,i)=>controls.append(action(label,()=>{try{api.move(r.id,Number(quantity.value)*(i?-1:1));persist();refresh();const replacement=Array.from(body.querySelectorAll('input')).find(x=>x.getAttribute('aria-label')==='Quantidade para movimentar '+r.name);replacement?.focus();notify(label+' registrada para '+r.name+'.');}catch(e){notify(e.message);}})));actions.append(controls);}
        actions.append(action('Editar',()=>edit(r)),action('Excluir',()=>{if(!confirm('Excluir este registro fictício?'))return;api.remove(r.id);if(editing===r.id)resetForm();updateFilters();persist();refresh();search.focus();notify('Registro excluído.');}));tr.append(actions);body.append(tr);
      });
      if(!visible.length){const tr=el('tr'),td=el('td','Nenhum registro encontrado. Ajuste os filtros ou cadastre um novo.');td.colSpan=4;tr.append(td);body.append(tr);}
      if(!recruit){const log=get('op-log');log.replaceChildren();api.history().forEach(h=>log.append(el('li',`${h.amount>0?'Entrada':'Saída'} de ${Math.abs(h.amount)} · ${h.name} · saldo ${h.balance} · ${new Date(h.at).toLocaleString('pt-BR')}`)));if(!api.history().length)log.append(el('li','Faça uma entrada ou saída para ver o histórico.'));}
    }
    form.addEventListener('submit',event=>{event.preventDefault();const input=Object.fromEntries(new FormData(form));try{const updated=editing!==null;api.save(input,editing);persist();resetForm();updateFilters();refresh();notify(updated?'Registro atualizado.':'Registro cadastrado.');}catch(e){notify(e.message);}});
    get('op-cancel').addEventListener('click',()=>{resetForm();notify('Formulário pronto para um novo cadastro.');});
    search.addEventListener('input',refresh);filter.addEventListener('change',refresh);
    get('btn-restaurar').addEventListener('click',()=>{api.reset();persist();search.value='';filter.value='todos';resetForm();updateFilters();refresh();notify('Dados fictícios originais restaurados.');});
    get('op-export').addEventListener('click',()=>{const keys=recruit?['name','role','score','stage']:['name','sku','category','stock','min','price'];const headers=recruit?['Candidato','Vaga','Avaliação','Etapa']:['Produto','SKU','Categoria','Saldo','Mínimo','Preço unitário'];const rows=[headers,...api.filter(search.value.trim(),filter.value).map(r=>keys.map(k=>r[k]))];const blob=new Blob(['\ufeff'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download='kodex-'+type+'-demo.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('CSV gerado com os registros da visualização atual.');});
    updateFilters();refresh();
  }
  window.KodexOperations={create,mount,validate,csvCell,stages};
})();

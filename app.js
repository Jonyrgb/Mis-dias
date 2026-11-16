const $ = id => document.getElementById(id);
const STORAGE = 'mi-dia-pwa-v1';
const state = {goals:[], history:[], date:localDate(), configured:false, page:'today', editing:null, installPrompt:null};
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function uid(){return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}
function load(){try{const data=JSON.parse(localStorage.getItem(STORAGE)||'{}');state.goals=Array.isArray(data.goals)?data.goals:[];state.history=Array.isArray(data.history)?data.history:[];state.date=data.date||localDate();state.configured=!!data.configured}catch(e){state.goals=[];state.history=[];state.configured=false}}
function save(){localStorage.setItem(STORAGE,JSON.stringify({goals:state.goals,history:state.history,date:state.date,configured:state.configured}))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function prettyDate(iso,opts={weekday:'long',day:'numeric',month:'long'}){return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CL',opts)}
function rollover(){const today=localDate();if(state.date===today)return false;
  // The last active day is archived once; intervening days without app use are not fabricated.
  if(!state.history.some(x=>x.date===state.date)){state.history.push({date:state.date,goals:state.goals.map(g=>({title:g.title,done:!!g.done}))})}
  state.history.sort((a,b)=>b.date.localeCompare(a.date));state.goals.forEach(g=>g.done=false);state.date=today;save();return true}
function showScreen(){const first=!state.configured;$('onboarding').classList.toggle('hidden',!first);$('mainScreen').classList.toggle('hidden',first);if(first)renderSetup();else render()}
function renderSetup(){const list=$('setupGoals');list.innerHTML='';state.goals.forEach((g,i)=>{const row=document.createElement('div');row.className='goal-row';row.innerHTML=`<span class="goal-title">${escapeHtml(g.title)}</span><button class="setup-remove" aria-label="Quitar objetivo">×</button>`;row.querySelector('button').onclick=()=>{state.goals.splice(i,1);renderSetup()};list.append(row)})}
function addGoal(input,permanent=true){const title=input.value.trim();if(!title)return;state.goals.push({id:uid(),title,done:false});input.value='';save();if(!state.configured)renderSetup();else render()}
function render(){rollover();$('todayDate').textContent=prettyDate(state.date,{weekday:'long',day:'numeric',month:'long'}).toUpperCase();renderToday();renderHistory();renderSettings();document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));['today','history','settings'].forEach(p=>$(`${p}Page`).classList.toggle('hidden',p!==state.page))}
function renderToday(){const pending=state.goals.filter(g=>!g.done),done=state.goals.filter(g=>g.done),total=state.goals.length,n=done.length,pct=total?Math.round(n/total*100):0;$('progressCount').textContent=`${n} de ${total}`;$('progressPercent').textContent=`${pct}%`;$('progressBar').style.width=`${pct}%`;$('progressMessage').textContent=total===0?'Agrega tus objetivos diarios en Ajustes.':pct===100?'¡Completaste todo lo que te propusiste!': 'Cada pequeño avance cuenta.';$('pendingCount').textContent=pending.length;$('doneCount').textContent=done.length;$('pendingList').innerHTML=pending.map(g=>goalHTML(g)).join('');$('doneList').innerHTML=done.map(g=>goalHTML(g)).join('');$('pendingEmpty').classList.toggle('hidden',pending.length!==0);$('doneEmpty').classList.toggle('hidden',done.length!==0)}
function goalHTML(g){return `<label class="goal-row ${g.done?'done':''}"><input class="goal-check" type="checkbox" data-id="${escapeHtml(g.id)}" ${g.done?'checked':''} aria-label="Marcar ${escapeHtml(g.title)} como realizado"><span class="goal-title">${escapeHtml(g.title)}</span></label>`}
function renderHistory(){const list=$('historyList');const items=[...state.history].sort((a,b)=>b.date.localeCompare(a.date));list.innerHTML=items.map(day=>{const total=day.goals.length,done=day.goals.filter(g=>g.done).length,pct=total?Math.round(done/total*100):0;return `<button class="history-card" data-date="${day.date}"><div class="history-top"><span>${escapeHtml(prettyDate(day.date))}</span><span class="history-score">${done}/${total}</span></div><div class="mini-track"><div class="mini-fill" style="width:${pct}%"></div></div><span class="history-sub">${pct}% completado · Toca para ver el detalle</span></button>`}).join('');$('historyEmpty').classList.toggle('hidden',items.length>0)}
function renderSettings(){const list=$('settingsList');list.innerHTML=state.goals.map(g=>`<div class="goal-row"><span class="goal-title">${escapeHtml(g.title)}</span><button class="row-action" data-edit="${escapeHtml(g.id)}">Editar</button><button class="row-action" data-delete="${escapeHtml(g.id)}">Eliminar</button></div>`).join('')}
function openGoalDialog(id=null){state.editing=id;const goal=state.goals.find(g=>g.id===id);$('dialogTitle').textContent=goal?'Editar objetivo':'Nuevo objetivo';$('goalInput').value=goal?.title||'';$('goalDialog').showModal();setTimeout(()=>$('goalInput').focus(),100)}
function saveGoal(){const title=$('goalInput').value.trim();if(!title)return;const goal=state.goals.find(g=>g.id===state.editing);if(goal)goal.title=title;else state.goals.push({id:uid(),title,done:false});save();$('goalDialog').close();render()}
function showDay(date){const day=state.history.find(x=>x.date===date);if(!day)return;$('dayTitle').textContent=prettyDate(day.date);$('dayDetail').innerHTML=`<div class="detail-list">${day.goals.length?day.goals.map(g=>`<div class="${g.done?'ok':''}">${g.done?'✓':'○'} &nbsp;${escapeHtml(g.title)}</div>`).join(''):'No había objetivos registrados ese día.'}</div>`;$('dayDialog').showModal()}
function exportData(){const blob=new Blob([JSON.stringify({goals:state.goals,history:state.history,date:state.date,configured:state.configured},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mi-dia-respaldo.json';a.click();URL.revokeObjectURL(url)}
$('setupForm').addEventListener('submit',e=>{e.preventDefault();addGoal($('setupInput'))});
$('startBtn').onclick=()=>{if(!state.goals.length){alert('Agrega al menos un objetivo para crear tu rutina.');return}state.configured=true;save();showScreen()};
$('todayAddBtn').onclick=()=>openGoalDialog();$('settingsAddBtn').onclick=()=>openGoalDialog();$('cancelDialog').onclick=()=>$('goalDialog').close();
$('goalForm').addEventListener('submit',e=>{e.preventDefault();saveGoal()});
$('pendingList').addEventListener('change',e=>{if(!e.target.matches('.goal-check'))return;const g=state.goals.find(x=>x.id===e.target.dataset.id);if(g){g.done=e.target.checked;save();render()}});
$('doneList').addEventListener('change',e=>{if(!e.target.matches('.goal-check'))return;const g=state.goals.find(x=>x.id===e.target.dataset.id);if(g){g.done=e.target.checked;save();render()}});
$('settingsList').addEventListener('click',e=>{const edit=e.target.dataset.edit,del=e.target.dataset.delete;if(edit)openGoalDialog(edit);if(del){const g=state.goals.find(x=>x.id===del);if(g&&confirm(`¿Eliminar "${g.title}" de tu rutina? El historial guardado no cambiará.`)){state.goals=state.goals.filter(x=>x.id!==del);save();render()}}});
$('historyList').addEventListener('click',e=>{const card=e.target.closest('[data-date]');if(card)showDay(card.dataset.date)});
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render()});
$('exportBtn').onclick=exportData;
window.addEventListener('focus',()=>{if(rollover())render()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&rollover())render()});
setInterval(()=>{if(rollover())render()},30000);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;$('installBtn').classList.remove('hidden')});
$('installBtn').onclick=async()=>{if(!state.installPrompt)return;state.installPrompt.prompt();await state.installPrompt.userChoice;state.installPrompt=null;$('installBtn').classList.add('hidden')};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
load();rollover();showScreen();

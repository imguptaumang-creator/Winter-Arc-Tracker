const KEY="winterArcV4";
let state=JSON.parse(localStorage.getItem(KEY)||"{}");
state.habits??={};state.days??={};state.sleep??=[];state.calendar??={};state.reviews??={};state.customHabits??=[];
let selectedDay=1;
function save(){localStorage.setItem(KEY,JSON.stringify(state));updateHome()}
function toast(x){let t=document.querySelector(".toast");if(!t)return;t.textContent=x;t.style.display="block";clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.style.display="none",1400)}
function habitList(){return [
  {key:"0",name:"Study / Deep Work"},
  {key:"1",name:"Workout / Exercise"},
  {key:"2",name:"Read Books"},
  {key:"3",name:"Sleep on Time"},
  {key:"4",name:"No Unnecessary Scrolling"},
  ...state.customHabits.map(h=>({key:h.id,name:h.name,custom:true}))
]}
function allHabitsDone(day){let list=habitList();return list.length>0&&list.every(h=>!!state.habits[day]?.[h.key])}
function renderDays(){let w=document.querySelector("#days");if(!w)return;w.innerHTML="";for(let i=1;i<=90;i++){let b=document.createElement("button");b.className="day"+(state.days[i]?" done":"")+(i===selectedDay?" selected":"");b.textContent=i;b.onclick=()=>{selectedDay=i;renderDays();renderHabits()};w.appendChild(b)}}
function renderHabits(){
  let w=document.querySelector("#habits");if(!w)return;
  state.habits[selectedDay]??={};
  let list=habitList();
  w.innerHTML=list.map(h=>`<div class="habit"><input class="check" type="checkbox" data-h="${h.key}" ${state.habits[selectedDay][h.key]?"checked":""}><span>${escapeHtml(h.name)}</span><small class="todo">${state.habits[selectedDay][h.key]?"DONE":"TODO"}</small></div>`).join("");
  w.querySelectorAll(".check").forEach(c=>c.onchange=()=>{state.habits[selectedDay][c.dataset.h]=c.checked;state.days[selectedDay]=allHabitsDone(selectedDay);save();renderDays();renderHabits();toast(state.days[selectedDay]?"Day completed ✓":"Habit updated")});
  renderCustomHabitsList();
}
function renderCustomHabitsList(){
  let w=document.querySelector("#customHabitsList");if(!w)return;
  if(!state.customHabits.length){w.innerHTML='<p class="muted customEmpty">No custom habits yet.</p>';return}
  w.innerHTML=state.customHabits.map(h=>`<div class="customHabit"><span>${escapeHtml(h.name)}</span><button class="removeHabit" type="button" data-remove-habit="${h.id}" aria-label="Remove ${escapeHtml(h.name)}">×</button></div>`).join("");
  w.querySelectorAll("[data-remove-habit]").forEach(b=>b.onclick=()=>{let id=b.dataset.removeHabit;let h=state.customHabits.find(x=>x.id===id);state.customHabits=state.customHabits.filter(x=>x.id!==id);Object.values(state.habits).forEach(day=>{if(day)delete day[id]});Object.keys(state.days).forEach(d=>state.days[d]=allHabitsDone(d));save();renderDays();renderHabits();toast((h?.name||"Habit")+" removed")});
}
function escapeHtml(x){return String(x).replace(/[&<>'"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[m]))}
document.querySelector("#addHabitForm")?.addEventListener("submit",e=>{e.preventDefault();let input=document.querySelector("#newHabit"),name=input.value.trim();if(!name)return;if(state.customHabits.some(h=>h.name.toLowerCase()===name.toLowerCase())){toast("That habit already exists");return}let id="custom_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);state.customHabits.push({id,name});save();renderHabits();input.value="";toast("Custom habit added ✓")});
function updateHome(){let n=Object.values(state.days).filter(Boolean).length,p=Math.round(n/90*100);let x=document.querySelector("#homeProgress");if(x)x.textContent=p+"%";x=document.querySelector("#homeBar");if(x)x.style.width=p+"%";let ds=Object.keys(state.days).map(Number).filter(n=>state.days[n]).sort((a,b)=>a-b),best=0,run=0,last=-99;ds.forEach(n=>{run=n===last+1?run+1:1;best=Math.max(best,run);last=n});x=document.querySelector("#bestStreak");if(x)x.textContent=best;x=document.querySelector("#completedDays");if(x)x.textContent=n}
function renderSleep(){let w=document.querySelector("#sleepList");if(!w)return;w.innerHTML=state.sleep.slice().reverse().map((x,r)=>`<div class="sleepRow"><span>${x.date}<br><small class="muted">${x.note||""}</small></span><b>${x.duration}</b><button class="btn" data-del="${state.sleep.length-1-r}">×</button></div>`).join("")||'<p class="muted">No sleep entries yet.</p>';w.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.sleep.splice(+b.dataset.del,1);save();renderSleep()})}
document.querySelector("#sleepForm")?.addEventListener("submit",e=>{e.preventDefault();let f=new FormData(e.target),s=f.get("start"),en=f.get("end"),duration="—";if(s&&en){let [sh,sm]=s.split(":").map(Number),[eh,em]=en.split(":").map(Number),mins=eh*60+em-(sh*60+sm);if(mins<0)mins+=1440;duration=Math.floor(mins/60)+"h "+mins%60+"m"}state.sleep.push({date:f.get("date")||new Date().toISOString().slice(0,10),duration,note:f.get("note")||""});save();renderSleep();e.target.reset();toast("Sleep saved ✓")});
const monthData={oct:{name:"OCTOBER",days:31,start:4},nov:{name:"NOVEMBER",days:30,start:0},dec:{name:"DECEMBER",days:31,start:2}};
function renderMonth(m){let c=document.querySelector("#cal-"+m);if(!c)return;let d=monthData[m],key="2026-"+m;c.innerHTML=`<div class="monthTitle">${d.name} 2026</div><div class="calendar">${["SUN","MON","TUE","WED","THU","FRI","SAT"].map(x=>`<div class="calHead">${x}</div>`).join("")}</div>`;let g=c.querySelector(".calendar");for(let i=0;i<d.start;i++)g.insertAdjacentHTML("beforeend",'<div class="date empty"></div>');for(let day=1;day<=d.days;day++){let id=key+"-"+day;g.insertAdjacentHTML("beforeend",`<button class="date ${state.calendar[id]?"done":""}" data-date="${id}">${day}</button>`)}g.querySelectorAll(".date:not(.empty)").forEach(b=>b.onclick=()=>{let id=b.dataset.date;state.calendar[id]=!state.calendar[id];save();renderMonth(m);toast(state.calendar[id]?"Completed ✓":"Unchecked")})}
document.querySelectorAll(".monthTabs [data-m]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".monthTabs [data-m]").forEach(x=>x.classList.remove("primary"));b.classList.add("primary");document.querySelectorAll(".monthPanel").forEach(x=>x.classList.toggle("active",x.id==="panel-"+b.dataset.m))});
document.querySelectorAll("[data-review]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-review]").forEach(x=>x.classList.remove("primary"));b.classList.add("primary");document.querySelectorAll("#review .monthPanel").forEach(x=>x.classList.toggle("active",x.id==="review-"+b.dataset.review))});
function loadReviews(){document.querySelectorAll(".reviewForm").forEach(f=>{let m=f.dataset.month,r=state.reviews[m]||{};f.goal.value=r.goal||"";f.achieved.value=r.achieved||"";f.improve.value=r.improve||"";f.onsubmit=e=>{e.preventDefault();state.reviews[m]={goal:f.goal.value,achieved:f.achieved.value,improve:f.improve.value};save();toast(m.toUpperCase()+" review saved ✓")}})}
renderDays();renderHabits();renderSleep();["oct","nov","dec"].forEach(renderMonth);loadReviews();updateHome();

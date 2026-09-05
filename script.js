const KEY="winterArc2026";
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{
  completedDays:[], currentDay:1, habits:{}, goals:["Study / Deep Work","Exercise","Read","Sleep on time"], journal:"", best:0
};
const habitNames=["Study / Deep Work","Workout / Exercise","Read Books","Sleep on Time","No Unnecessary Scrolling"];

function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function pct(){return Math.round(state.completedDays.length/90*100)}
function streak(){let s=0;for(let i=state.completedDays.length-1;i>=0;i--){if(state.completedDays[i]===state.completedDays.length-i)s++;else break}return s}

function render(){
  const p=pct(), s=streak();
  document.getElementById("percent").textContent=p+"%";
  document.getElementById("ring").style.setProperty("--p",p+"%");
  document.getElementById("completed").textContent=state.completedDays.length;
  document.getElementById("streak").textContent=s;
  document.getElementById("best").textContent=Math.max(state.best,s);
  document.getElementById("dayCount").textContent=`DAY ${state.currentDay} / 90`;
  document.getElementById("dashPercent").textContent=p+"%";
  document.getElementById("dashText").textContent=`${state.completedDays.length} of 90 days completed.`;
  document.getElementById("bar").style.width=p+"%";
  document.getElementById("statPercent").textContent=p+"%";
  document.getElementById("statStreak").textContent=s;
  document.getElementById("statBest").textContent=Math.max(state.best,s);
  document.getElementById("journal").value=state.journal||"";
  document.getElementById("journalPage").value=state.journal||"";

  const days=document.getElementById("days"); days.innerHTML="";
  for(let i=1;i<=90;i++){let b=document.createElement("button");b.className="day "+(i===state.currentDay?"current ":"")+(state.completedDays.includes(i)?"done":"");b.textContent=i;b.onclick=()=>{state.currentDay=i;save()};days.appendChild(b)}
  renderHabits(document.getElementById("habitsList"));
  renderHabits(document.getElementById("habitsPage"));
  renderGoals(document.getElementById("goalsList"));
  renderGoals(document.getElementById("goalsPage"));
}
function renderHabits(el){if(!el)return;el.innerHTML="";habitNames.forEach((name,i)=>{
  const key=state.currentDay+"-"+i, done=!!state.habits[key];
  const row=document.createElement("div");row.className="habit "+(done?"done":"");
  row.innerHTML=`<button class="check">${done?"✓":""}</button><span class="name">${name}</span><small>${done?"DONE":"TODO"}</small>`;
  row.querySelector(".check").onclick=()=>{state.habits[key]=!done;if(state.habits[key] && i===habitNames.length-1){if(!state.completedDays.includes(state.currentDay))state.completedDays.push(state.currentDay);state.completedDays.sort((a,b)=>a-b);state.best=Math.max(state.best,streak())}save()};el.appendChild(row)
})}
function renderGoals(el){if(!el)return;el.innerHTML="";state.goals.forEach((g,i)=>{let d=document.createElement("div");d.className="goal";d.innerHTML=`<label><input type="checkbox"> ${g}</label>`;d.querySelector("input").onchange=e=>d.classList.toggle("done",e.target.checked);el.appendChild(d)})}

document.querySelectorAll(".nav").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".section").forEach(s=>s.classList.remove("active-section"));document.getElementById(btn.dataset.section).classList.add("active-section");document.querySelectorAll(".nav").forEach(n=>n.classList.remove("active"));btn.classList.add("active")});
document.getElementById("addGoal").onclick=()=>{let v=document.getElementById("goalInput").value.trim();if(v){state.goals.push(v);document.getElementById("goalInput").value="";save()}};
function saveJ(){state.journal=document.getElementById("journal").value||document.getElementById("journalPage").value;save();alert("Journal saved ✨")}
document.getElementById("saveJournal").onclick=saveJ;document.getElementById("saveJournalPage").onclick=saveJ;
document.getElementById("resetBtn").onclick=()=>{if(confirm("Reset all Winter Arc progress?")){localStorage.removeItem(KEY);location.reload()}};
document.getElementById("today").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
render();

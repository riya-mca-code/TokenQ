/* ==========================================
   QueueFlow Admin Dashboard
========================================== */

const STORAGE_KEY = "queueflow_queue";
const THEME_KEY = "queueflow_theme";

/* -----------------------------
   DOM Elements
----------------------------- */

const servingToken =
document.getElementById(
"servingToken"
);

const waitingCustomers =
document.getElementById(
"waitingCustomers"
);

const totalTokens =
document.getElementById(
"totalTokens"
);

const completedTokens =
document.getElementById(
"completedTokens"
);

const adminQueueTable =
document.getElementById(
"adminQueueTable"
);

const nextTokenBtn =
document.getElementById(
"nextTokenBtn"
);

const completeTokenBtn =
document.getElementById(
"completeTokenBtn"
);

const resetQueueBtn =
document.getElementById(
"resetQueueBtn"
);

const exportBtn =
document.getElementById(
"exportBtn"
);

const searchInput =
document.getElementById(
"searchInput"
);

const searchBtn =
document.getElementById(
"searchBtn"
);

const searchResult =
document.getElementById(
"searchResult"
);

const activityLogs =
document.getElementById(
"activityLogs"
);

const themeToggle =
document.getElementById(
"themeToggle"
);

/* -----------------------------
   Theme
----------------------------- */

loadTheme();

function loadTheme(){

const mode =
localStorage.getItem(
THEME_KEY
);

if(mode === "dark"){
document.body.classList.add(
"dark"
);
}

}

themeToggle?.addEventListener(
"click",
() => {

document.body.classList.toggle(
"dark"
);

const mode =
document.body.classList.contains(
"dark"
)
? "dark"
: "light";

localStorage.setItem(
THEME_KEY,
mode
);

}
);

/* -----------------------------
   Storage Helpers
----------------------------- */

function getQueue(){

return JSON.parse(
localStorage.getItem(
STORAGE_KEY
)
) || [];

}

function saveQueue(queue){

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(queue)
);

}

/* -----------------------------
   Logs
----------------------------- */

function addLog(message){

const li =
document.createElement("li");

const time =
new Date()
.toLocaleTimeString();

li.innerHTML =
`[${time}] ${message}`;

activityLogs.prepend(li);

}

/* -----------------------------
   Format Time
----------------------------- */

function formatTime(date){

return new Date(date)
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);

}

/* -----------------------------
   Dashboard Stats
----------------------------- */

function updateStats(){

const queue =
getQueue();

const waiting =
queue.filter(
q =>
q.status === "waiting"
);

const serving =
queue.find(
q =>
q.status === "serving"
);

const completed =
queue.filter(
q =>
q.status === "completed"
);

servingToken.textContent =
serving
? serving.token
: "A000";

waitingCustomers.textContent =
waiting.length;

totalTokens.textContent =
queue.length;

completedTokens.textContent =
completed.length;

}

/* -----------------------------
   Render Queue
----------------------------- */

function renderQueue(){

const queue =
getQueue();

adminQueueTable.innerHTML =
"";

queue.forEach(item => {

let statusClass =
"status-waiting";

if(
item.status === "serving"
){
statusClass =
"status-serving";
}

if(
item.status === "completed"
){
statusClass =
"status-completed";
}

const row =
document.createElement(
"tr"
);

row.innerHTML = `

<td>${item.token}</td>

<td class="${statusClass}">
${item.status}
</td>

<td>
${formatTime(
item.createdAt
)}
</td>

`;

adminQueueTable.appendChild(
row
);

});

updateStats();

}

/* -----------------------------
   Call Next Token
----------------------------- */

function callNextToken(){

let queue =
getQueue();

const currentServing =
queue.find(
q =>
q.status === "serving"
);

if(currentServing){

currentServing.status =
"completed";

}

const nextWaiting =
queue.find(
q =>
q.status === "waiting"
);

if(nextWaiting){

nextWaiting.status =
"serving";

saveQueue(queue);

addLog(
`Now serving ${nextWaiting.token}`
);

renderQueue();

return;

}

saveQueue(queue);

renderQueue();

addLog(
"No waiting customers"
);

}

nextTokenBtn?.addEventListener(
"click",
callNextToken
);

/* -----------------------------
   Complete Current
----------------------------- */

function completeCurrent(){

let queue =
getQueue();

const current =
queue.find(
q =>
q.status === "serving"
);

if(!current){

alert(
"No active serving token"
);

return;

}

current.status =
"completed";

saveQueue(queue);

addLog(
`${current.token} completed`
);

renderQueue();

}

completeTokenBtn?.addEventListener(
"click",
completeCurrent
);

/* -----------------------------
   Reset Queue
----------------------------- */

function resetQueue(){

const confirmReset =
confirm(
"Reset complete queue?"
);

if(!confirmReset){
return;
}

localStorage.removeItem(
STORAGE_KEY
);

localStorage.removeItem(
"myToken"
);

addLog(
"Queue reset completed"
);

renderQueue();

}

resetQueueBtn?.addEventListener(
"click",
resetQueue
);

/* -----------------------------
   Export CSV
----------------------------- */

function exportCSV(){

const queue =
getQueue();

let csv =
"Token,Status,CreatedAt\n";

queue.forEach(item => {

csv +=
`${item.token},
${item.status},
${item.createdAt}\n`;

});

const blob =
new Blob(
[csv],
{
type:"text/csv"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement(
"a"
);

a.href = url;

a.download =
"queueflow-report.csv";

a.click();

URL.revokeObjectURL(
url
);

addLog(
"CSV exported"
);

}

exportBtn?.addEventListener(
"click",
exportCSV
);

/* -----------------------------
   Search Token
----------------------------- */

function searchToken(){

const value =
searchInput.value.trim()
.toUpperCase();

if(!value){

searchResult.innerHTML =
"Enter token number";

return;

}

const queue =
getQueue();

const token =
queue.find(
q =>
q.token === value
);

if(!token){

searchResult.innerHTML =
`
<p>
Token not found
</p>
`;

return;

}

searchResult.innerHTML =
`

<div>

<h3>
${token.token}
</h3>

<p>
Status:
<strong>
${token.status}
</strong>
</p>

<p>
Created:
${formatTime(
token.createdAt
)}
</p>

</div>

`;

}

searchBtn?.addEventListener(
"click",
searchToken
);

/* -----------------------------
   Auto Refresh
----------------------------- */

setInterval(
renderQueue,
2000
);

/* -----------------------------
   Initialization
----------------------------- */

renderQueue();

addLog(
"Admin dashboard loaded"
);

/* ==========================================
   End File
========================================== */
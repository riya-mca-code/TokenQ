/* ==========================================
   QueueFlow Smart Queue Management
   Customer Application Logic
========================================== */

const STORAGE_KEY = "queueflow_queue";
const THEME_KEY = "queueflow_theme";

/* -------------------------
   DOM Elements
------------------------- */

const generateTokenBtn =
document.getElementById(
"generateTokenBtn"
);

const tokenDisplay =
document.getElementById(
"tokenDisplay"
);

const tokenMessage =
document.getElementById(
"tokenMessage"
);

const currentServing =
document.getElementById(
"currentServing"
);

const waitingCount =
document.getElementById(
"waitingCount"
);

const yourPosition =
document.getElementById(
"yourPosition"
);

const estimatedWait =
document.getElementById(
"estimatedWait"
);

const queueTable =
document.getElementById(
"queueTable"
);

const themeToggle =
document.getElementById(
"themeToggle"
);

/* -------------------------
   Theme Management
------------------------- */

loadTheme();

function loadTheme() {

const savedTheme =
localStorage.getItem(THEME_KEY);

if(savedTheme === "dark"){
document.body.classList.add("dark");
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

/* -------------------------
   Queue Functions
------------------------- */

function getQueue() {

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

function generateTokenNumber(){

const queue =
getQueue();

const tokenId =
queue.length + 1;

return (
"A" +
String(tokenId).padStart(
3,
"0"
)
);

}

function formatDate(date){

return new Date(date)
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);

}

/* -------------------------
   Generate Token
------------------------- */

generateTokenBtn?.addEventListener(
"click",
() => {

let queue =
getQueue();

const token =
generateTokenNumber();

const tokenData = {

token,
status:"waiting",
createdAt:
new Date().toISOString()

};

queue.push(tokenData);

saveQueue(queue);

localStorage.setItem(
"myToken",
token
);

tokenDisplay.textContent =
token;

tokenMessage.textContent =
"Token generated successfully";

renderQueue();

}
);

/* -------------------------
   Render Queue
------------------------- */

function renderQueue(){

const queue =
getQueue();

queueTable.innerHTML = "";

queue.forEach(item => {

const tr =
document.createElement("tr");

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

tr.innerHTML = `

<td>${item.token}</td>

<td class="${statusClass}">
${item.status}
</td>

<td>
${formatDate(
item.createdAt
)}
</td>

`;

queueTable.appendChild(tr);

});

updateStats();

}

/* -------------------------
   Dashboard Stats
------------------------- */

function updateStats(){

const queue =
getQueue();

const waiting =
queue.filter(
q => q.status === "waiting"
);

const serving =
queue.find(
q => q.status === "serving"
);

currentServing.textContent =
serving
? serving.token
: "A000";

waitingCount.textContent =
waiting.length;

updateUserPosition();

}

/* -------------------------
   User Position
------------------------- */

function updateUserPosition(){

const myToken =
localStorage.getItem(
"myToken"
);

if(!myToken){

yourPosition.textContent =
"--";

estimatedWait.textContent =
"0 Min";

return;

}

const queue =
getQueue();

const waitingTokens =
queue.filter(
q =>
q.status === "waiting"
);

const index =
waitingTokens.findIndex(
q =>
q.token === myToken
);

if(index === -1){

yourPosition.textContent =
"Completed";

estimatedWait.textContent =
"0 Min";

return;

}

yourPosition.textContent =
index + 1;

const avgTimePerCustomer =
5;

const minutes =
(index + 1) *
avgTimePerCustomer;

estimatedWait.textContent =
minutes + " Min";

}

/* -------------------------
   Load Existing Token
------------------------- */

function loadUserToken(){

const myToken =
localStorage.getItem(
"myToken"
);

if(myToken){

tokenDisplay.textContent =
myToken;

tokenMessage.textContent =
"Existing active token";

}

}

/* -------------------------
   Demo Data
------------------------- */

function createDemoData(){

const queue =
getQueue();

if(queue.length > 0){
return;
}

const demo = [

{
token:"A001",
status:"completed",
createdAt:
new Date().toISOString()
},

{
token:"A002",
status:"serving",
createdAt:
new Date().toISOString()
},

{
token:"A003",
status:"waiting",
createdAt:
new Date().toISOString()
},

{
token:"A004",
status:"waiting",
createdAt:
new Date().toISOString()
}

];

saveQueue(demo);

}

/* -------------------------
   Auto Refresh
------------------------- */

setInterval(
renderQueue,
2000
);

/* -------------------------
   Initialization
------------------------- */

createDemoData();

loadUserToken();

renderQueue();

/* ==========================================
   Notifications
========================================== */

function showNotification(message){

const div =
document.createElement(
"div"
);

div.className =
"queue-notification";

div.innerText =
message;

Object.assign(
div.style,
{
position:"fixed",
right:"20px",
top:"20px",
padding:"15px 20px",
background:"#2563eb",
color:"#fff",
borderRadius:"10px",
zIndex:"9999"
}
);

document.body.appendChild(
div
);

setTimeout(() => {

div.remove();

},3000);

}

/* ==========================================
   Queue Monitoring
========================================== */

let previousServing =
currentServing.textContent;

setInterval(() => {

const current =
currentServing.textContent;

if(
current !== previousServing
){

showNotification(
`Now Serving ${current}`
);

previousServing =
current;

}

},1500);

/* ==========================================
   Export Queue
========================================== */

function exportQueueCSV(){

const queue =
getQueue();

let csv =
"Token,Status,Created\n";

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

}

/* ==========================================
   Search Token
========================================== */

function findToken(token){

const queue =
getQueue();

return queue.find(
q =>
q.token === token
);

}

/* ==========================================
   Analytics Helpers
========================================== */

function getAnalyticsData(){

const queue =
getQueue();

return {

total:
queue.length,

waiting:
queue.filter(
q =>
q.status === "waiting"
).length,

serving:
queue.filter(
q =>
q.status === "serving"
).length,

completed:
queue.filter(
q =>
q.status === "completed"
).length

};

}

/* ==========================================
   End File
========================================== */
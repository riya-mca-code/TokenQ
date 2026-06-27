/* ==========================================
   QueueFlow Analytics Dashboard
========================================== */

const STORAGE_KEY = "queueflow_queue";
const THEME_KEY = "queueflow_theme";

/* -----------------------------
   DOM Elements
----------------------------- */

const totalTokenCount =
document.getElementById(
"totalTokenCount"
);

const waitingCountCard =
document.getElementById(
"waitingCountCard"
);

const servingCountCard =
document.getElementById(
"servingCountCard"
);

const completedCountCard =
document.getElementById(
"completedCountCard"
);

const avgWaitTime =
document.getElementById(
"avgWaitTime"
);

const serviceEfficiency =
document.getElementById(
"serviceEfficiency"
);

const analyticsTable =
document.getElementById(
"analyticsTable"
);

const insightBox =
document.getElementById(
"insightBox"
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
   Storage
----------------------------- */

function getQueue(){

return JSON.parse(
localStorage.getItem(
STORAGE_KEY
)
) || [];

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
   Stats Calculation
----------------------------- */

function getStats(){

const queue =
getQueue();

const waiting =
queue.filter(
q =>
q.status === "waiting"
).length;

const serving =
queue.filter(
q =>
q.status === "serving"
).length;

const completed =
queue.filter(
q =>
q.status === "completed"
).length;

return {

total:
queue.length,

waiting,

serving,

completed

};

}

/* -----------------------------
   KPI Cards
----------------------------- */

function updateCards(){

const stats =
getStats();

totalTokenCount.textContent =
stats.total;

waitingCountCard.textContent =
stats.waiting;

servingCountCard.textContent =
stats.serving;

completedCountCard.textContent =
stats.completed;

}

/* -----------------------------
   Wait Time
----------------------------- */

function calculateWaitTime(){

const stats =
getStats();

const averageMinutes =
stats.waiting * 5;

avgWaitTime.textContent =
averageMinutes +
" Min";

}

/* -----------------------------
   Efficiency
----------------------------- */

function calculateEfficiency(){

const stats =
getStats();

if(stats.total === 0){

serviceEfficiency.textContent =
"0%";

return;

}

const efficiency =
Math.round(

(stats.completed /
stats.total)

* 100

);

serviceEfficiency.textContent =
efficiency + "%";

}

/* -----------------------------
   Insights
----------------------------- */

function generateInsights(){

const stats =
getStats();

let insight = "";

if(stats.total === 0){

insight =
"No queue records available.";

}

else if(stats.waiting > 10){

insight =
"Queue congestion detected. Consider opening additional service counters.";

}

else if(stats.completed > stats.waiting){

insight =
"Service performance is healthy and customers are being processed efficiently.";

}

else{

insight =
"Queue activity is normal. Continue monitoring service throughput.";

}

insightBox.innerHTML =

`<p>${insight}</p>`;

}

/* -----------------------------
   Recent Queue Table
----------------------------- */

function renderTable(){

const queue =
getQueue();

analyticsTable.innerHTML =
"";

queue
.slice()
.reverse()
.forEach(item => {

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

<td>
${item.token}
</td>

<td class="${statusClass}">
${item.status}
</td>

<td>
${formatTime(
item.createdAt
)}
</td>

`;

analyticsTable.appendChild(
row
);

});

}

/* -----------------------------
   Charts
----------------------------- */

let statusChart;
let activityChart;

function renderCharts(){

const stats =
getStats();

const statusCtx =
document
.getElementById(
"statusChart"
)
.getContext("2d");

const activityCtx =
document
.getElementById(
"activityChart"
)
.getContext("2d");

if(statusChart){
statusChart.destroy();
}

if(activityChart){
activityChart.destroy();
}

/* -----------------------------
   Status Pie Chart
----------------------------- */

statusChart =
new Chart(
statusCtx,
{

type:"doughnut",

data:{

labels:[
"Waiting",
"Serving",
"Completed"
],

datasets:[
{

data:[

stats.waiting,
stats.serving,
stats.completed

],

backgroundColor:[

"#f59e0b",
"#16a34a",
"#2563eb"

]

}

]

},

options:{

responsive:true,

plugins:{

legend:{

position:"bottom"

}

}

}

}
);

/* -----------------------------
   Activity Chart
----------------------------- */

activityChart =
new Chart(
activityCtx,
{

type:"bar",

data:{

labels:[

"Waiting",
"Serving",
"Completed"

],

datasets:[{

label:
"Queue Count",

data:[

stats.waiting,
stats.serving,
stats.completed

],

backgroundColor:[

"#f59e0b",
"#16a34a",
"#2563eb"

]

}]

},

options:{

responsive:true,

scales:{

y:{

beginAtZero:true

}

}

}

}
);

}

/* -----------------------------
   Auto Refresh
----------------------------- */

function refreshDashboard(){

updateCards();

calculateWaitTime();

calculateEfficiency();

generateInsights();

renderTable();

renderCharts();

}

setInterval(
refreshDashboard,
3000
);

/* -----------------------------
   Initial Load
----------------------------- */

refreshDashboard();

/* ==========================================
   End File
========================================== */
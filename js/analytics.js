/* ==========================================
   QueueFlow Analytics Dashboard
========================================== */

const THEME_KEY = "queueflow_theme";

const totalTokenCount = document.getElementById("totalTokenCount");
const waitingCountCard = document.getElementById("waitingCountCard");
const servingCountCard = document.getElementById("servingCountCard");
const completedCountCard = document.getElementById("completedCountCard");
const avgWaitTime = document.getElementById("avgWaitTime");
const serviceEfficiency = document.getElementById("serviceEfficiency");
const analyticsTable = document.getElementById("analyticsTable");
const insightBox = document.getElementById("insightBox");
const themeToggle = document.getElementById("themeToggle");

const socket = window.QueueAPI.createSocket();
let statusChart;
let activityChart;
let queueCache = [];

function loadTheme() {
  if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark");
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getStats() {
  const waiting = queueCache.filter((q) => q.status === "waiting").length;
  const serving = queueCache.filter((q) => q.status === "serving").length;
  const completed = queueCache.filter((q) => q.status === "completed").length;
  return { total: queueCache.length, waiting, serving, completed };
}

function updateCards() {
  const stats = getStats();
  totalTokenCount.textContent = stats.total;
  waitingCountCard.textContent = stats.waiting;
  servingCountCard.textContent = stats.serving;
  completedCountCard.textContent = stats.completed;
}

function calculateWaitTime() {
  avgWaitTime.textContent = `${getStats().waiting * 5} Min`;
}

function calculateEfficiency() {
  const stats = getStats();
  serviceEfficiency.textContent = stats.total === 0 ? "0%" : `${Math.round((stats.completed / stats.total) * 100)}%`;
}

function generateInsights() {
  const stats = getStats();
  const insight =
    stats.total === 0
      ? "No queue records available."
      : stats.waiting > 10
      ? "Queue congestion detected. Consider opening additional service counters."
      : stats.completed > stats.waiting
      ? "Service performance is healthy and customers are being processed efficiently."
      : "Queue activity is normal. Continue monitoring service throughput.";
  insightBox.innerHTML = `<p>${insight}</p>`;
}

function renderTable() {
  analyticsTable.innerHTML = "";
  queueCache
    .slice()
    .reverse()
    .forEach((item) => {
      const statusClass =
        item.status === "serving" ? "status-serving" : item.status === "completed" ? "status-completed" : "status-waiting";
      const row = document.createElement("tr");
      row.innerHTML = `<td>${item.token}</td><td class="${statusClass}">${item.status}</td><td>${formatTime(item.createdAt)}</td>`;
      analyticsTable.appendChild(row);
    });
}

function renderCharts() {
  const stats = getStats();
  const statusCtx = document.getElementById("statusChart").getContext("2d");
  const activityCtx = document.getElementById("activityChart").getContext("2d");

  statusChart?.destroy();
  activityChart?.destroy();

  statusChart = new Chart(statusCtx, {
    type: "doughnut",
    data: {
      labels: ["Waiting", "Serving", "Completed"],
      datasets: [{ data: [stats.waiting, stats.serving, stats.completed], backgroundColor: ["#f59e0b", "#16a34a", "#2563eb"] }],
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } },
  });

  activityChart = new Chart(activityCtx, {
    type: "bar",
    data: {
      labels: ["Waiting", "Serving", "Completed"],
      datasets: [{ label: "Queue Count", data: [stats.waiting, stats.serving, stats.completed], backgroundColor: ["#f59e0b", "#16a34a", "#2563eb"] }],
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } },
  });
}

async function refreshDashboard() {
  const data = await window.QueueAPI.request("/api/queue");
  queueCache = data.queue || [];
  updateCards();
  calculateWaitTime();
  calculateEfficiency();
  generateInsights();
  renderTable();
  renderCharts();
}

loadTheme();
refreshDashboard().catch(() => {});

socket?.on("queue:update", () => refreshDashboard().catch(() => {}));

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

/* ==========================================
   End File
========================================== */

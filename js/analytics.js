const totalTokenCount = document.getElementById("totalTokenCount");
const waitingCountCard = document.getElementById("waitingCountCard");
const servingCountCard = document.getElementById("servingCountCard");
const completedCountCard = document.getElementById("completedCountCard");
const skippedCountCard = document.getElementById("skippedCountCard");
const missedCountCard = document.getElementById("missedCountCard");
const avgWaitTime = document.getElementById("avgWaitTime");
const serviceEfficiency = document.getElementById("serviceEfficiency");
const analyticsTable = document.getElementById("analyticsTable");
const insightBox = document.getElementById("insightBox");
const socket = window.QueueAPI.createSocket();
let statusChart;
let activityChart;
let queueCache = [];

window.RouteGuard?.enforceRole("Organization Admin", ["org_admin"]);

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getStats() {
  const counts = queueCache.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { waiting: 0, serving: 0, completed: 0, skipped: 0, missed: 0 }
  );
  return { total: queueCache.length, ...counts };
}

function updateCards() {
  const stats = getStats();
  totalTokenCount.textContent = stats.total;
  waitingCountCard.textContent = stats.waiting;
  servingCountCard.textContent = stats.serving;
  completedCountCard.textContent = stats.completed;
  skippedCountCard.textContent = stats.skipped;
  missedCountCard.textContent = stats.missed;
}

function calculateWaitTime() {
  const stats = getStats();
  avgWaitTime.textContent = `${stats.waiting * 5} Min`;
}

function calculateEfficiency() {
  const stats = getStats();
  serviceEfficiency.textContent = stats.total === 0 ? "0%" : `${Math.round(((stats.completed + stats.skipped) / stats.total) * 100)}%`;
}

function generateInsights() {
  const stats = getStats();
  const insight =
    stats.total === 0
      ? "No queue records available."
      : stats.waiting > 10
      ? "Queue congestion detected. Consider opening additional service counters."
      : stats.missed > 0
      ? "Missed tokens detected. Review queue calling workflow."
      : stats.completed > stats.waiting
      ? "Service performance is healthy and customers are being processed efficiently."
      : "Queue activity is normal. Continue monitoring service throughput.";
  insightBox.innerHTML = `<p>${insight}</p>`;
}

function renderTable() {
  if (!queueCache.length) {
    analyticsTable.innerHTML = '<tr class="empty-row"><td colspan="3">No recent records.</td></tr>';
    return;
  }

  analyticsTable.innerHTML = "";
  queueCache
    .slice()
    .reverse()
    .forEach((item) => {
      const statusClass =
        item.status === "serving"
          ? "status-serving"
          : item.status === "completed"
          ? "status-completed"
          : item.status === "skipped"
          ? "status-skipped"
          : item.status === "missed"
          ? "status-missed"
          : "status-waiting";
      const row = document.createElement("tr");
      row.innerHTML = `<td data-label="Token">${item.token}</td><td data-label="Status" class="${statusClass}">${item.status}</td><td data-label="Created">${formatTime(item.createdAt)}</td>`;
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
      labels: ["Waiting", "Serving", "Completed", "Skipped", "Missed"],
      datasets: [
        {
          data: [stats.waiting, stats.serving, stats.completed, stats.skipped, stats.missed],
          backgroundColor: ["#f59e0b", "#16a34a", "#2563eb", "#64748b", "#dc2626"],
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } },
  });

  activityChart = new Chart(activityCtx, {
    type: "bar",
    data: {
      labels: ["Waiting", "Serving", "Completed", "Skipped", "Missed"],
      datasets: [{ label: "Queue Count", data: [stats.waiting, stats.serving, stats.completed, stats.skipped, stats.missed], backgroundColor: ["#f59e0b", "#16a34a", "#2563eb", "#64748b", "#dc2626"] }],
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } },
  });
}

async function refreshDashboard() {
  analyticsTable.innerHTML = '<tr class="empty-row"><td colspan="3">Loading analytics...</td></tr>';
  const data = await window.QueueAPI.request("/api/queue");
  queueCache = data.queue || [];
  updateCards();
  calculateWaitTime();
  calculateEfficiency();
  generateInsights();
  renderTable();
  renderCharts();
}

refreshDashboard().catch(() => {});
socket?.on("queue:update", () => refreshDashboard().catch(() => {}));

const THEME_KEY = "queueflow_theme";
const MY_TOKEN_KEY = "myToken";

const generateTokenBtn = document.getElementById("generateTokenBtn");
const currentServing = document.getElementById("currentServing");
const waitingCount = document.getElementById("waitingCount");
const yourPosition = document.getElementById("yourPosition");
const estimatedWait = document.getElementById("estimatedWait");
const tokenDisplay = document.getElementById("tokenDisplay");
const tokenMessage = document.getElementById("tokenMessage");
const queueTable = document.getElementById("queueTable");
const themeToggle = document.getElementById("themeToggle");

const socket = window.QueueAPI.createSocket();

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadTheme() {
  if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark");
}

function renderQueue(queue) {
  queueTable.innerHTML = "";
  queue.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.token}</td><td>${item.status}</td><td>${formatTime(item.createdAt)}</td>`;
    queueTable.appendChild(row);
  });
}

function renderDashboard(queue) {
  const serving = queue.find((item) => item.status === "serving");
  const waiting = queue.filter((item) => item.status === "waiting");
  const myToken = localStorage.getItem(MY_TOKEN_KEY);
  const myIndex = queue.findIndex((item) => item.token === myToken && item.status !== "completed");

  currentServing.textContent = serving ? serving.token : "A000";
  waitingCount.textContent = waiting.length;
  yourPosition.textContent = myIndex >= 0 ? myIndex + 1 : "--";
  estimatedWait.textContent = `${waiting.length * 5} Min`;
}

async function refresh() {
  const data = await window.QueueAPI.request("/api/queue");
  const queue = data.queue || [];
  renderDashboard(queue);
  renderQueue(queue);
}

async function generateToken() {
  try {
    const data = await window.QueueAPI.request("/api/queue", { method: "POST" });
    const queue = data.queue || [];
    if (data.token?.token) {
      localStorage.setItem(MY_TOKEN_KEY, data.token.token);
      tokenDisplay.textContent = data.token.token;
    }
    tokenMessage.textContent = "Token generated successfully";
    renderDashboard(queue);
    renderQueue(queue);
  } catch (error) {
    tokenMessage.textContent = error.message;
  }
}

loadTheme();
refresh();

socket?.on("queue:update", refresh);

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

generateTokenBtn?.addEventListener("click", generateToken);

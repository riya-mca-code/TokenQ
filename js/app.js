const MY_TOKEN_KEY = "myToken";

const customerQueueForm = document.getElementById("customerQueueForm");
const customerName = document.getElementById("customerName");
const customerMobile = document.getElementById("customerMobile");
const customerEmail = document.getElementById("customerEmail");
const customerPurpose = document.getElementById("customerPurpose");
const currentServing = document.getElementById("currentServing");
const waitingCount = document.getElementById("waitingCount");
const yourPosition = document.getElementById("yourPosition");
const estimatedWait = document.getElementById("estimatedWait");
const tokenDisplay = document.getElementById("tokenDisplay");
const tokenMessage = document.getElementById("tokenMessage");
const queueTable = document.getElementById("queueTable");
const socket = window.QueueAPI.createSocket();

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function setTokenState(type, message) {
  tokenMessage.className = `state state-${type}`;
  tokenMessage.textContent = message;
}

function renderQueue(queue) {
  if (!queue.length) {
    queueTable.innerHTML = '<tr class="empty-row"><td colspan="3">No queue entries yet.</td></tr>';
    return;
  }

  queueTable.innerHTML = "";
  queue.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td data-label="Token">${item.token}</td><td data-label="Status">${item.status}</td><td data-label="Created">${formatTime(item.createdAt)}</td>`;
    queueTable.appendChild(row);
  });
}

function renderDashboard(queue) {
  const activeQueue = queue.filter((item) => item.status !== "completed");
  const serving = activeQueue.find((item) => item.status === "serving");
  const waiting = activeQueue.filter((item) => item.status === "waiting");
  const myToken = sessionStorage.getItem(MY_TOKEN_KEY);
  const myIndex = activeQueue.findIndex((item) => item.token === myToken);

  currentServing.textContent = serving ? serving.token : "A000";
  waitingCount.textContent = waiting.length;
  yourPosition.textContent = myIndex >= 0 ? myIndex + 1 : "--";
  estimatedWait.textContent = `${waiting.length * 5} Min`;
}

async function refresh() {
  queueTable.innerHTML = '<tr class="empty-row"><td colspan="3">Loading queue...</td></tr>';
  const data = await window.QueueAPI.request("/api/queue");
  const queue = data.queue || [];
  renderDashboard(queue);
  renderQueue(queue);
}

async function generateToken() {
  try {
    const data = await window.QueueAPI.request("/api/queue", {
      method: "POST",
      body: {
        customerName: customerName.value.trim(),
        customerMobile: customerMobile.value.trim(),
        customerEmail: customerEmail.value.trim(),
        purpose: customerPurpose.value.trim(),
      },
    });
    const queue = data.queue || [];
    if (data.token?.token) {
      sessionStorage.setItem(MY_TOKEN_KEY, data.token.token);
      tokenDisplay.textContent = data.token.token;
    }
    setTokenState("success", "Token generated successfully");
    renderDashboard(queue);
    renderQueue(queue);
  } catch (error) {
    setTokenState("error", error.message);
  }
}

refresh().catch(() => {});

socket?.on("queue:update", () => refresh().catch(() => {}));

customerQueueForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  generateToken();
});

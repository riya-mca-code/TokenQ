const registerForm = document.getElementById("registerForm");
const registerState = document.getElementById("registerState");
const businessName = document.getElementById("businessName");
const businessType = document.getElementById("businessType");
const ownerName = document.getElementById("ownerName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");

function setState(type, message) {
  registerState.className = `state state-${type}`;
  registerState.textContent = message;
}

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setState("loading", "Creating organization...");
    const data = await window.QueueAPI.registerOrganization({
      businessName: businessName.value.trim(),
      businessType: businessType.value.trim(),
      ownerName: ownerName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      password: password.value.trim(),
    });
    setState("success", "Organization created. Redirecting...");
    sessionStorage.setItem(window.QueueAPI.ORG_KEY, data.organization.id);
    if (data.token) sessionStorage.setItem(window.QueueAPI.AUTH_KEY, data.token);
    window.location.href = `admin.html?org=${encodeURIComponent(data.organization.id)}`;
  } catch (error) {
    setState("error", error.message);
  }
});

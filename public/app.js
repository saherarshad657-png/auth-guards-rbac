
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const authMessage = document.getElementById("auth-message");
const dashboardMessage = document.getElementById("dashboard-message");

let token = sessionStorage.getItem("authToken");

function showMessage(element, message, type = "") {
  element.textContent = message;
  element.className = `message ${type}`;
}

function showLogin() {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  showMessage(authMessage, "");
}

function showSignup() {
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  showMessage(authMessage, "");
}

loginTab.addEventListener("click", showLogin);
signupTab.addEventListener("click", showSignup);


async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const responseText = await response.text();
  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned an invalid response (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (HTTP ${response.status}).`
    );
  }

  if (!responseText) {
    throw new Error("The server returned an empty response.");
  }

  return data;
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = signupForm.querySelector("button[type='submit']");
  button.disabled = true;
  showMessage(authMessage, "Creating your account...");

  try {
    const data = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("signup-name").value.trim(),
        email: document.getElementById("signup-email").value.trim(),
        password: document.getElementById("signup-password").value
      })
    });

    signupForm.reset();
    showLogin();
    showMessage(authMessage, data.message + " Please log in.", "success");
  } catch (error) {
    showMessage(authMessage, error.message, "error");
  } finally {
    button.disabled = false;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = loginForm.querySelector("button[type='submit']");
  button.disabled = true;
  showMessage(authMessage, "Signing you in...");

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("login-email").value.trim(),
        password: document.getElementById("login-password").value
      })
    });

    token = data.token;
    sessionStorage.setItem("authToken", token);
    loginForm.reset();

    await loadDashboard();
  } catch (error) {
    showMessage(authMessage, error.message, "error");
  } finally {
    button.disabled = false;
  }
});

async function loadDashboard() {
  try {
    const data = await apiRequest("/api/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = data.user;

    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    document.getElementById("welcome-title").textContent =
      `Welcome, ${user.name}`;

    document.getElementById("user-name").textContent = user.name;
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("user-role").textContent = user.role;
    document.getElementById("role-badge").textContent =
      user.role.toUpperCase();

    const adminArea = document.getElementById("admin-area");
    adminArea.classList.toggle("hidden", user.role !== "admin");

    showMessage(dashboardMessage, data.message, "success");
  } catch (error) {
    sessionStorage.removeItem("authToken");
    token = null;

    dashboardSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    showLogin();
    showMessage(authMessage, "Please log in to continue.", "error");
  }
}

document.getElementById("admin-button").addEventListener("click", async () => {
  showMessage(dashboardMessage, "Checking administrator permissions...");

  try {
    const data = await apiRequest("/api/admin", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    showMessage(dashboardMessage, data.message, "success");
  } catch (error) {
    showMessage(dashboardMessage, error.message, "error");
  }
});

document.getElementById("logout-button").addEventListener("click", () => {
  sessionStorage.removeItem("authToken");
  token = null;

  dashboardSection.classList.add("hidden");
  authSection.classList.remove("hidden");
  showLogin();

  showMessage(authMessage, "You have logged out successfully.", "success");
});

if (token) {
  loadDashboard();
} else {
  showLogin();
}

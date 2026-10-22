
let users = [];
let currentPage = 1;
const pageSize = 5;
let toastTimeout;

const API_URL = "/api/users";

const elements = {
  search: document.getElementById("searchInput"),
  role: document.getElementById("roleFilter"),
  status: document.getElementById("statusFilter"),
  tbody: document.getElementById("userTableBody"),
  count: document.getElementById("recordCount"),
  pageInfo: document.getElementById("pageInfo"),
  pageNumber: document.getElementById("pageNumber"),
  prev: document.getElementById("prevPage"),
  next: document.getElementById("nextPage"),
  total: document.getElementById("totalUsers"),
  active: document.getElementById("activeUsers"),
  admins: document.getElementById("adminUsers"),
  inactive: document.getElementById("inactiveUsers"),
  toast: document.getElementById("toast")
};

// Safely display user-provided text in HTML
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("");
}

function formatJoinedDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

// Request helper for the backend API
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }

  return data;
}

// Load users from MongoDB
async function loadUsers(showMessage = false) {
  try {
    elements.tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          Loading users...
        </td>
      </tr>`;

    const data = await apiRequest(API_URL);

    if (!Array.isArray(data)) {
      throw new Error("The server returned an unexpected response.");
    }

    users = data;

    updateStatistics();
    renderTable();

    if (showMessage) {
      showToast("Dashboard data refreshed successfully.");
    }
  } catch (error) {
    console.error("Error loading users:", error);

    elements.tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          Could not load users. Check that the server and MongoDB are running.
        </td>
      </tr>`;

    showToast(error.message || "Could not load users.");
  }
}

function updateStatistics() {
  elements.total.textContent = users.length;

  elements.active.textContent = users.filter(
    user => String(user.status).toLowerCase() === "active"
  ).length;

  elements.admins.textContent = users.filter(
    user => String(user.role).toLowerCase() === "admin"
  ).length;

  elements.inactive.textContent = users.filter(
    user => String(user.status).toLowerCase() === "inactive"
  ).length;
}


function getFilteredUsers() {
  const query = elements.search.value.trim().toLowerCase();
  const role = elements.role.value.toLowerCase();
  const status = elements.status.value.toLowerCase();

  return users.filter(user => {
    const name = String(user.name || "").toLowerCase();
    const email = String(user.email || "").toLowerCase();
    const userRole = String(user.role || "user").toLowerCase();
    const userStatus = String(user.status || "inactive").toLowerCase();

    const matchesSearch =
      name.includes(query) || email.includes(query);

    const matchesRole =
      role === "all" || userRole === role;

    const matchesStatus =
      status === "all" || userStatus === status;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

function renderTable() {
  const filteredUsers = getFilteredUsers();

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * pageSize;

  const visibleUsers = filteredUsers.slice(
    startIndex,
    startIndex + pageSize
  );

  elements.count.textContent =
    `${filteredUsers.length} record${filteredUsers.length === 1 ? "" : "s"}`;

  elements.pageInfo.textContent = filteredUsers.length
    ? `Showing ${startIndex + 1}–${startIndex + visibleUsers.length} of ${filteredUsers.length} users`
    : "No matching users found";

  elements.pageNumber.textContent = currentPage;
  elements.prev.disabled = currentPage <= 1;
  elements.next.disabled = currentPage >= totalPages;

  if (!visibleUsers.length) {
    elements.tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          No users match your search or filters. Try clearing your filters.
        </td>
      </tr>`;
    return;
  }

  const avatarColors = [
    "",
    "green-avatar",
    "orange-avatar",
    "blue-avatar"
  ];

  elements.tbody.innerHTML = visibleUsers.map(user => {
    const userId = String(user._id);
    const colorIndex = userId.charCodeAt(userId.length - 1) %
      avatarColors.length;

    const normalizedRole = String(user.role || "user").toLowerCase();
    const normalizedStatus = String(user.status || "inactive").toLowerCase();

    const roleLabel = normalizedRole === "admin"
      ? "Admin"
      : normalizedRole === "editor"
        ? "Editor"
        : "User";

    const statusLabel = normalizedStatus === "active"
      ? "Active"
      : "Inactive";

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar ${avatarColors[colorIndex]}">
              ${escapeHTML(initials(user.name))}
            </div>

            <div class="user-details">
              <strong>${escapeHTML(user.name)}</strong>
              <span>${escapeHTML(user.email)}</span>
            </div>
          </div>
        </td>

        <td>
          <span class="role-pill role-${escapeHTML(normalizedRole)}">
            ${roleLabel}
          </span>
        </td>

        <td>
          <span class="status-pill status-${escapeHTML(normalizedStatus)}">
            ${statusLabel}
          </span>
        </td>

        <td>${escapeHTML(formatJoinedDate(user.joined))}</td>
        <td>${escapeHTML(user.lastActive || "—")}</td>

        <td>
          <button
            class="action-button"
            data-user-id="${escapeHTML(userId)}"
            type="button"
          >
            View
          </button>

          <button
            class="action-button delete-button"
            data-delete-id="${escapeHTML(userId)}"
            type="button"
          >
            Delete
          </button>
        </td>
      </tr>`;
  }).join("");
}

function resetPageAndRender() {
  currentPage = 1;
  updateStatistics();
  renderTable();
}

// Search and filters
elements.search.addEventListener("input", resetPageAndRender);
elements.role.addEventListener("change", resetPageAndRender);
elements.status.addEventListener("change", resetPageAndRender);

// Clear filters
document.getElementById("clearFilters").addEventListener("click", () => {
  elements.search.value = "";
  elements.role.value = "all";
  elements.status.value = "all";
  currentPage = 1;

  renderTable();
  showToast("All filters have been cleared.");
});

// Previous page
elements.prev.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

// Next page
elements.next.addEventListener("click", () => {
  const totalPages = Math.max(
    1,
    Math.ceil(getFilteredUsers().length / pageSize)
  );

  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});

// Refresh data from MongoDB
document.getElementById("refreshButton").addEventListener("click", async event => {
  const button = event.currentTarget;
  const originalHTML = button.innerHTML;

  button.disabled = true;
  button.innerHTML = "<span>↻</span> Refreshing...";

  await loadUsers(true);

  button.disabled = false;
  button.innerHTML = originalHTML;
});

// View and Delete buttons
elements.tbody.addEventListener("click", async event => {
  const deleteButton = event.target.closest("[data-delete-id]");

  if (deleteButton) {
    const userId = deleteButton.dataset.deleteId;
    const user = users.find(item => String(item._id) === userId);

    if (!user) {
      showToast("User not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    deleteButton.disabled = true;

    try {
      await apiRequest(`${API_URL}/${encodeURIComponent(userId)}`, {
        method: "DELETE"
      });

      users = users.filter(item => String(item._id) !== userId);

      const totalPages = Math.max(
        1,
        Math.ceil(getFilteredUsers().length / pageSize)
      );

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      updateStatistics();
      renderTable();

      showToast(`${user.name} has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(error.message || "Could not delete user.");
      deleteButton.disabled = false;
    }

    return;
  }

  const viewButton = event.target.closest("[data-user-id]");

  if (!viewButton) return;

  const userId = viewButton.dataset.userId;
  const user = users.find(item => String(item._id) === userId);

  if (user) {
    showToast(
      `${user.name} — ${String(user.role).toUpperCase()} account`
    );
  }
});

// Mobile menu
document.getElementById("menuButton").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// Navigation
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");
    document.getElementById("sidebar").classList.remove("open");
  });
});

// Add User modal
const addUserButton = document.getElementById("addUserButton");
const userModal = document.getElementById("userModal");
const addUserForm = document.getElementById("addUserForm");
const cancelUserButton = document.getElementById("cancelUserButton");

function closeUserModal() {
  if (userModal) {
    userModal.classList.add("hidden");
  }
}

if (addUserButton && userModal && addUserForm && cancelUserButton) {
  addUserButton.addEventListener("click", () => {
    addUserForm.reset();
    userModal.classList.remove("hidden");
    document.getElementById("userName").focus();
  });

  cancelUserButton.addEventListener("click", closeUserModal);

  userModal.addEventListener("click", event => {
    if (event.target === userModal) {
      closeUserModal();
    }
  });

  addUserForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const role = document.getElementById("userRole").value.toLowerCase();
    const status = document.getElementById("userStatus").value.toLowerCase();

    if (
      !name ||
      !email ||
      !["admin", "user"].includes(role) ||
      !["active", "inactive"].includes(status)
    ) {
      showToast("Please complete all fields correctly.");
      return;
    }

    const emailExists = users.some(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      showToast("A user with this email already exists.");
      document.getElementById("userEmail").focus();
      return;
    }

    const submitButton = addUserForm.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) submitButton.disabled = true;

    try {
      const newUser = await apiRequest(API_URL, {
        method: "POST",
        body: JSON.stringify({ name, email, role, status })
      });

      users.unshift(newUser);

      currentPage = 1;
      elements.search.value = "";
      elements.role.value = "all";
      elements.status.value = "all";

      updateStatistics();
      renderTable();

      closeUserModal();
      addUserForm.reset();

      showToast(`${newUser.name} was saved to MongoDB successfully.`);
    } catch (error) {
      console.error("Error adding user:", error);
      showToast(error.message || "Could not save the user.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

// Initialize dashboard with database records
loadUsers();

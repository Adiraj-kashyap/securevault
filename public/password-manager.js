// import * as lucide from "lucide"

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons()

  const addPasswordBtn = document.getElementById("addPasswordBtn")
  const passwordModal = document.getElementById("passwordModal")
  const passwordForm = document.getElementById("passwordForm")
  const cancelBtn = document.getElementById("cancelBtn")
  const passwordList = document.getElementById("passwordList")
  const searchInput = document.getElementById("searchInput")
  const logoutBtn = document.getElementById("logoutBtn")
  const statusMessage = document.getElementById("statusMessage")

  let passwords = []
  let editingId = null

  // Check authentication
  if (!checkAuth()) {
    return; // checkAuth will redirect to auth.html if not authenticated
  }

  // Load passwords
  loadPasswords()

  // Password visibility toggle
  const togglePassword = document.querySelector('.toggle-password');
  if (togglePassword) {
      togglePassword.addEventListener('click', function() {
          const passwordInput = document.querySelector('#password');
          const showIcon = this.querySelector('.show-password');
          const hideIcon = this.querySelector('.hide-password');

          if (passwordInput.type === 'password') {
              passwordInput.type = 'text';
              showIcon.style.display = 'none';
              hideIcon.style.display = 'block';
          } else {
              passwordInput.type = 'password';
              showIcon.style.display = 'block';
              hideIcon.style.display = 'none';
          }
      });
  }

  // Add password button
  addPasswordBtn.addEventListener("click", () => {
    editingId = null
    document.getElementById("modalTitle").textContent = "Add Password"
    passwordForm.reset()
    passwordModal.style.display = "block"
  })

  // Cancel button
  cancelBtn.addEventListener("click", () => {
    passwordModal.style.display = "none"
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === passwordModal) {
      passwordModal.style.display = "none"
    }
  })

  // Form submission
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const siteName = document.getElementById("siteName").value
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    // Show loading state
    const submitBtn = passwordForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      if (editingId) {
        await updatePassword(editingId, siteName, username, password)
        showStatus("Password updated successfully", "success")
      } else {
        await addPassword(siteName, username, password)
        showStatus("Password added successfully", "success")
      }

      passwordModal.style.display = "none"
      await loadPasswords()
    } catch (error) {
      console.error("Error saving password:", error)
      showStatus("Failed to save password. Please try again.", "error")
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  })

  // Search functionality
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()
    if (searchTerm.length > 0) {
      const filteredPasswords = passwords.filter(
        (p) => p.siteName.toLowerCase().includes(searchTerm) || 
               p.username.toLowerCase().includes(searchTerm)
      )
      renderPasswords(filteredPasswords)
    } else {
      loadPasswords()
    }
  })

  // Logout button
  logoutBtn.addEventListener("click", () => {
    logout()
  })

  // Load passwords from server
  async function loadPasswords() {
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session || !session.email) {
      showStatus("Session expired. Please login again.", "error")
      logout()
      return
    }

    const email = session.email;
    const searchTerm = searchInput.value.toLowerCase();
 
    try {
      showStatus("Loading passwords...", "info")
      const response = await fetch(`http://localhost:3000/passwords/${email}?searchTerm=${searchTerm}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      passwords = await response.json();
      renderPasswords(passwords);
      
      if (passwords.length === 0) {
        showStatus("No passwords found. Add your first password!", "info")
      } else {
        showStatus(`Loaded ${passwords.length} passwords`, "success")
      }
    } catch (error) {
      console.error("Failed to load passwords:", error);
      showStatus("Failed to load passwords. Please try again.", "error")
    }
  }

  // Render passwords to the UI
  function renderPasswords(passwordsToRender) {
    passwordList.innerHTML = ""
    
    if (passwordsToRender.length === 0) {
      const emptyMessage = document.createElement("div")
      emptyMessage.className = "empty-message"
      emptyMessage.innerHTML = `
        <i data-lucide="file-question"></i>
        <p>No passwords found</p>
      `
      passwordList.appendChild(emptyMessage)
      lucide.createIcons()
      return
    }
    
    passwordsToRender.forEach((p) => {
      const passwordItem = document.createElement("div")
      passwordItem.className = "password-item"
      passwordItem.innerHTML = `
        <div class="password-info">
            <h3>${escapeHtml(p.siteName)}</h3>
            <p>${escapeHtml(p.username)}</p>
        </div>
        <div class="password-actions">
            <button class="view-btn" data-id="${p.id}" title="View Password"><i data-lucide="eye"></i></button>
            <button class="edit-btn" data-id="${p.id}" title="Edit Password"><i data-lucide="edit"></i></button>
            <button class="delete-btn" data-id="${p.id}" title="Delete Password"><i data-lucide="trash-2"></i></button>
        </div>
      `
      passwordList.appendChild(passwordItem)
    })
    
    lucide.createIcons()

    // Add event listeners for buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => viewPassword(btn.dataset.id))
    })
    
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => editPassword(btn.dataset.id))
    })
    
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deletePassword(btn.dataset.id))
    })
  }

  // Add a new password
  async function addPassword(siteName, username, password) {
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session || !session.email) {
      throw new Error("Session expired. Please login again.")
    }
    
    const email = session.email;
 
    try {
      const response = await fetch("http://localhost:3000/passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: email, siteName, username, password }),
      });
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      return await response.json();
    } catch (error) {
      console.error("Failed to add password:", error);
      throw error;
    }
  }
  
  // Update an existing password
  async function updatePassword(id, siteName, username, password) {
    try {
      const response = await fetch(`http://localhost:3000/passwords/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ siteName, username, password }),
      });
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      return await response.json();
    } catch (error) {
      console.error("Failed to update password:", error);
      throw error;
    }
  }
 
  // View password details
  function viewPassword(id) {
    const password = passwords.find((p) => p.id === id)
    if (password) {
      alert(`Site: ${password.siteName}\nUsername: ${password.username}\nPassword: ${password.password}`)
    }
  }

  // Edit a password
  function editPassword(id) {
    const password = passwords.find((p) => p.id === id)
    if (password) {
      editingId = id
      document.getElementById("modalTitle").textContent = "Edit Password"
      document.getElementById("siteName").value = password.siteName
      document.getElementById("username").value = password.username
      document.getElementById("password").value = password.password
      passwordModal.style.display = "block"
    }
  }

  // Delete a password
  async function deletePassword(id) {
    if (confirm("Are you sure you want to delete this password?")) {
      try {
        const response = await fetch(`http://localhost:3000/passwords/${id}`, {
          method: "DELETE",
        });
 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
 
        showStatus("Password deleted successfully", "success")
        await loadPasswords();
      } catch (error) {
        console.error("Failed to delete password:", error);
        showStatus("Failed to delete password", "error")
      }
    }
  }
  
  // Show status message
  function showStatus(message, type = "info") {
    if (!statusMessage) return;
    
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = "block";
    
    // Hide after 3 seconds
    setTimeout(() => {
      statusMessage.style.display = "none";
    }, 3000);
  }
  
  // Helper function to escape HTML to prevent XSS
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})

// These functions should be defined in a shared auth.js file
function checkAuth() {
  const session = JSON.parse(localStorage.getItem("session"))
  if (!session) {
    return false
  }
  // Check session expiry (24 hours)
  if (new Date().getTime() - session.timestamp > 24 * 60 * 60 * 1000) {
    localStorage.removeItem("session")
    return false
  }
  return true
}

function logout() {
  localStorage.removeItem("session")
  window.location.href = "auth.html"
}


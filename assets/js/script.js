/* Lawns & Laundry - Main JavaScript File
 *
 * This script handles user authentication, navigation, and form submissions
 * for the Lawns & Laundry web application.
 *  
*/

// Use an IIFE (Immediately Invoked Function Expression) to keep all our code
// from interfering with other scripts or the global scope.
(function () {

  // --- 1. Core Helpers & State Management ---

  // A simple way to select a single element, like jQuery's $.
  const $ = (selector) => document.querySelector(selector);
  // A way to select multiple elements and treat them as an array.
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  // A simple object to define the paths to our pages.
  const routes = {
    home: "/index.html",
    login: "/pages/auth/login.html",
    signup: "/pages/auth/signup.html",
    post: "/pages/questgiver/postquest.html",
    questview: "/pages/quests/questBoard.html"
  };

  // An object to handle user authentication using the browser's localStorage.
  const auth = {
    storageKey: "ll_auth_user", // The key used to store user data in localStorage.

    // Save user data to localStorage.
    login(user) {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    },

    // Remove user data from localStorage.
    logout() {
      localStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.redirectKey);
    },

    // Check if a user is currently logged in.
    isLoggedIn() {
      return localStorage.getItem(this.storageKey) !== null;
    },

    // Redirect to quest view once per browser session when logged in.
    redirectToQuestOnce() {
      if (!this.isLoggedIn()) return;
      const alreadyRedirected = sessionStorage.getItem(this.redirectKey) === "1";
      const currentPage = location.pathname.split("/").pop();
      // Don't redirect when already redirected, on quest board, or on admin pages
      if (alreadyRedirected || currentPage === "questBoard.html" || currentPage === "admin.html") return;
      sessionStorage.setItem(this.redirectKey, "1");
      location.href = "questBoard.html";
    },

    redirectKey: "ll_redirected_questview"
  };

  // --- 2. Main Setup ---

  // Wait until the HTML document is fully loaded before running any scripts.
  document.addEventListener("DOMContentLoaded", () => {
    // Setup universal UI elements that appear on every page (like the nav bar).
    setupGlobalUI();

    // Setup features that are specific to the page we are on.
    setupPageSpecificFeatures();
  });


  // --- 3. Global UI Functions (run on every page) ---

  /**
   * Sets up navigation links and the login/logout button.
   */
  function setupGlobalUI() {
    // Highlight the current page in the navigation menu.
    const currentPage = location.pathname.split("/").pop() || routes.home;
    $$("nav a").forEach(link => {
      if (link.getAttribute("href").endsWith(currentPage)) {
        link.setAttribute("aria-current", "page"); // Helps with accessibility and styling.
      }
    });

    // Update the Login/Logout button based on authentication state.
    const loginButton = $("#login_link");
    if (loginButton) {
      if (auth.isLoggedIn()) {
        loginButton.textContent = "Logout";
        loginButton.addEventListener("click", (e) => {
          e.preventDefault(); // Stop the link from navigating.
          auth.logout();
          location.href = routes.home; // Go to the homepage after logout.
        });
      } else {
        loginButton.textContent = "Login";
      }
    }

    // Protect the "Post a Quest" link so only logged-in users can click it.
    const postQuestLink = $("#postAQuest");
    if (postQuestLink) {
      postQuestLink.addEventListener("click", (e) => {
        if (!auth.isLoggedIn()) {
          // If the user is not logged in, stop them.
          e.preventDefault();
          // Redirect them to the login page.
          // We add a 'return' URL so we can send them back here after they log in.
          location.href = `${routes.login}?return=${routes.post}`;
        }
      });
    }

    // If logged in, optionally send them to the quest board once per session.
    auth.redirectToQuestOnce();
  }


  // --- 4. Page-Specific Functions ---

  /**
   * Checks which page we are on and runs the relevant setup code.
   */
  function setupPageSpecificFeatures() {
    const loginForm = $(".login-form");
    const signupForm = $("#signupForm");
    const questForm = $("#questForm");
    const passwordToggles = $$(".pwd-toggle");

    if (loginForm) setupLoginForm(loginForm);
    if (signupForm) setupSignupForm(signupForm);
    if (questForm) setupQuestForm(questForm);
    if (passwordToggles.length > 0) setupPasswordToggles(passwordToggles);
  
  const adminLogout = document.getElementById("adminLogout");
    if (adminLogout) {
      adminLogout.addEventListener("click", () => {
        auth.logout();
        location.href = routes.home; // or routes.login if you prefer
      });
    }

    
  }

  /**
   * Redirect to Quest Giver Profile from Quest View Page when you click "You" button.
   */
function setupQuestViewCTA() {
  // Find any profile button and menu on the page (works with different ID patterns)
  const profileBtn = document.querySelector('[id$="ProfileBtn"]');
  const profileMenu = document.querySelector('[id$="ProfileMenu"]');
  const accountBtn = document.querySelector('[id$="ProfileAccount"]');
  const settingsBtn = document.querySelector('[id$="ProfileSettings"]');
  const signoutBtn = document.querySelector('[id$="ProfileSignout"]');

  if (!profileBtn || !profileMenu) return;

  const closeMenu = () => profileMenu.classList.remove("open");

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target) && e.target !== profileBtn) {
      closeMenu();
    }
  });

  if (accountBtn) {
    accountBtn.addEventListener("click", () => {
      closeMenu();
      // Navigate relative to current location
      const accountPath = window.location.pathname.includes('/pages/') ? '../dashboard/accountSummary.html' : '/pages/dashboard/accountSummary.html';
      window.location.href = accountPath; 
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      closeMenu();
      // Navigate relative to current location
      const settingsPath = window.location.pathname.includes('/pages/') ? '../dashboard/settings.html' : '/pages/dashboard/settings.html';
      window.location.href = settingsPath;
    });
  }

  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      closeMenu();
      auth.logout();
      // Navigate to root index.html
      const indexPath = window.location.pathname.includes('/pages/') ? '../../index.html' : '/index.html';
      window.location.href = indexPath;
    });
  }
}

// call it after other page-specific setups
setupQuestViewCTA();

  /**
   * LOGIN FORM: Handles the login process.
   */
  function setupLoginForm(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent the form from submitting the traditional way.
      clearMessages(form);

      const username = $("#username").value.trim();
      const password = $("#password").value;

      if (!username || !password) {
        showMessage(form, "Please enter both username and password.", "error");
        return;
      }

    if (username === "admin" && password === "admin123") {
        showMessage(form, "Admin login successful! Redirecting...", "success");
        auth.login({ username });
        // Use relative path from login page to admin
        const adminPath = window.location.pathname.includes('/pages/auth/') ? '../../admin/admin.html' : '/admin/admin.html';
        window.location.href = adminPath;
        return;
      }

      // --- Simulated Login Success ---
      auth.login({ username: username });

      // After login, redirect the user.
      // If a "return" URL is present (e.g., from a protected link), go there.
      const returnUrl = new URLSearchParams(location.search).get("return");
      // Use relative path from login page to quest board
      const questBoardPath = window.location.pathname.includes('/pages/auth/') ? '../quests/questBoard.html' : '/pages/quests/questBoard.html';
      window.location.href = returnUrl || questBoardPath; // Otherwise, go to quest board.
    });
  }

  /**
   * SIGNUP FORM: Handles new user registration.
   */
  function setupSignupForm(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearMessages(form);

      // Get form values
      const name = $("#fullname").value.trim();
      const email = $("#email").value.trim();
      const password = $("#password").value;
      const confirmPassword = $("#confirm-password").value;

      // --- Validation ---
      if (!name || !email || !password) {
        showMessage(form, "All fields are required.", "error");
        return;
      }
      if (password.length < 6) {
        showMessage(form, "Password must be at least 6 characters.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showMessage(form, "Passwords do not match.", "error");
        return;
      }

      // --- Simulated Signup Success ---
      showMessage(form, "Account created! Redirecting to login...", "success");

      // Redirect to the login page after a short delay.
      setTimeout(() => {
        // Signup is in same directory as login, so just use relative path
        window.location.href = 'login.html';
      }, 1000);
    });
  }

  /**
   * POST A QUEST FORM: Handles the quest submission.
   */
  function setupQuestForm(form) {
    // First, check if the user is logged in. If not, redirect them away.
    // Commented out for demo purposes - allow form submission without login
    // if (!auth.isLoggedIn()) {
    //   location.replace(`${routes.login}?return=${routes.post}`);
    //   return; // Stop further execution.
    // }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearMessages(form);

      const title = $("#questTitle").value.trim();
      const budget = $("#questBudget").value.trim();
      const description = $("#questDesc").value.trim();

      if (!title || !budget || !description) {
        showMessage(form, "Please complete all fields.", "error");
        return;
      }

      // --- Simulated Post Success ---
      form.reset(); // Clear the form fields.
      
      // Show success message with animated checkmark
      const checkmark = document.getElementById('successCheckmark');
      if (checkmark) {
        checkmark.style.display = 'inline-block';
        showMessage(form, "Quest submitted successfully!", "success");
        
        // Prepend checkmark to the success message
        const messageElement = form.querySelector('.success');
        if (messageElement) {
          messageElement.insertBefore(checkmark, messageElement.firstChild);
        }
      } else {
        showMessage(form, "Quest submitted successfully!", "success");
      }
    });
  }

  /**
   * PASSWORD TOGGLE: Adds show/hide functionality to password fields.
   */
  function setupPasswordToggles(buttons) {
    buttons.forEach(btn => {
      const inputId = btn.getAttribute("data-for");
      const passwordInput = document.getElementById(inputId);

      if (passwordInput) {
        btn.addEventListener("click", () => {
          const isPassword = passwordInput.type === "password";
          passwordInput.type = isPassword ? "text" : "password"; // Toggle type
          btn.textContent = isPassword ? "Hide" : "Show";
        });
      }
    });
  }


  // --- 5. Form Helper Functions ---

  /**
   * Displays a message (error or success) inside a form.
   * @param {HTMLElement} formElement The form to add the message to.
   * @param {string} message The text to display.
   * @param {string} type The type of message ('error' or 'success').
   */
  function showMessage(formElement, message, type = "error") {
    // Create a new paragraph element for the message.
    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    messageEl.className = type; // e.g., class="error" or class="success"
    messageEl.setAttribute("role", "alert");

    // Add it to the end of the form.
    formElement.append(messageEl);
  }

  /**
   * Removes all previous error or success messages from a form.
   * @param {HTMLElement} formElement The form to clear messages from.
   */
  function clearMessages(formElement) {
    $$(".error, .success", formElement).forEach(el => el.remove());
  }

  
  
})();
//Apply settings in settings menu by giving notifications
function applySetting(type) {
    if (type === 'password') {
        const pwdInput = document.getElementById('new-password');
        const notif = document.getElementById('password-notification');
        if (pwdInput.value.trim() !== '') {
            notif.textContent = 'Password changed successfully!';
            notif.style.display = 'block';
            pwdInput.value = ''; 
        }
    }

    if (type === 'email') {
        const emailInput = document.getElementById('new-email');
        const notif = document.getElementById('email-notification');
        if (emailInput.value.trim() !== '') {
            notif.textContent = 'Email updated successfully!';
            notif.style.display = 'block';
            emailInput.value = ''; 
        }
    }
}


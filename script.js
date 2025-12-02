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
    home: "index.html",
    login: "login.html",
    signup: "signup.html",
    post: "postquest.html",
    questview: "questView.html"
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
      if (alreadyRedirected || currentPage === "questView.html") return;
      sessionStorage.setItem(this.redirectKey, "1");
      location.href = "questView.html";
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
    
  }

  /**
   * Redirect to Quest Giver Profile from Quest View Page when you click "You" button.
   */
function setupQuestViewCTA() {
  // Only run on the quest view page where the profile menu exists.
  const questPage = document.querySelector(".quest-page");
  if (!questPage) return;

  const profileBtn = document.getElementById("questProfileBtn");
  const profileMenu = document.getElementById("questProfileMenu");
  const accountBtn = document.getElementById("questProfileAccount");
  const settingsBtn = document.getElementById("questProfileSettings");
  const signoutBtn = document.getElementById("questProfileSignout");

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
      window.location.href = "questGiver.html"; 
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      closeMenu();
      window.location.href = "settings.html"; // create a settings.html page later
    });
  }

  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      closeMenu();
      auth.logout();
      window.location.href = routes.home;
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

      // --- Simulated Login Success ---
      auth.login({ username: username });

      // After login, redirect the user.
      // If a "return" URL is present (e.g., from a protected link), go there.
      const returnUrl = new URLSearchParams(location.search).get("return");
      location.href = returnUrl || routes.questview; // Otherwise, go to the homepage.
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
        location.href = routes.login;
      }, 1000);
    });
  }

  /**
   * POST A QUEST FORM: Handles the quest submission.
   */
  function setupQuestForm(form) {
    // First, check if the user is logged in. If not, redirect them away.
    if (!auth.isLoggedIn()) {
      location.replace(`${routes.login}?return=${routes.post}`);
      return; // Stop further execution.
    }

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
      showMessage(form, "Quest submitted successfully!", "success");
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


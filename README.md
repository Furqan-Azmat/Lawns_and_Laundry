# Lawns & Laundry

A static prototype for a quest-style marketplace that lets neighbours post chores (lawn, laundry, errands) and adventurers pick them up.

## Quick start
- Open `index.html` directly in a browser or run via the live server extension
- All data is client-side; refresh clears demo state except login stored in localStorage.
- To access admin dashboards via login page:
- Login = admin
- password = admin123

## Pages
- Landing + services: `index.html`, `services.html`.
- Auth: `pages/auth/login.html` (demo login; admin/admin123 goes to admin dashboard), `pages/auth/signup.html`.
- Quest flow: quest board `pages/quests/questBoard.html`, guild `pages/quests/guild.html`, quest giver post/management pages under `pages/questgiver/`.
- Adventurer views: accepted/completed/rating under `pages/adventurer/`.
- User dashboard: account summary, settings, address book, messages, and billing under `pages/dashboard/`.
- Support & admin: support center (`pages/support/*.html`), admin console/analytics/users under `pages/admin/`.

## Behavior & scripts
- `assets/js/script.js` handles navigation highlights, password toggles, and simple auth using `localStorage`.
- Any non-empty credentials log in; `admin` / `admin123` redirects to admin pages.
- Post a quest form validates fields and shows a success message with a checkmark; login state is simulated.
- Logged-in users are redirected to the quest board once per session; guarded links (Post a Quest) bounce to login with a return URL.

## Project structure
- `assets/css/styles.css`: global styles and layout.
- `assets/js/script.js`: shared client logic and demo behaviours.
- `pages/`:  feature pages grouped by role (auth, quest giver, adventurer, quests, dashboard, admin, support).
- `images/`, `assets/fonts/`: UI assets.

## Development notes
- There is no backend; replace the fake auth/localStorage logic with real API calls for production.
- Forms currently only validate in the browser; hook them up to services and add error handling when integrating.

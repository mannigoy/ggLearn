# GG Learn: progress notes

_Last updated: 5 November 2026_

## Where things stand

| Area | Status |
| --- | --- |
| Local dev setup | Done. Dependencies are installed and `npm run dev` works. |
| UI redesign | Done for the public site, the auth screen and the signed-in shell. |
| Firebase connection | **Blocked.** `.env.local` exists but is empty (0 bytes, probably not saved). |
| Firestore database and rules | Not started. Needs a Firebase CLI login and a choice of region. |
| Lessons in Firestore | Not started. Lessons are still saved only in the browser (`localStorage`). |

## 1. Local dev setup

- `npm run dev` failed with `'vite' is not recognized` because `node_modules` was missing. `npm install` fixed it (228 packages).
- **Warning:** Firebase 13 needs **Node 24.12 or newer**, but this machine has Node 22.13. Install the current Node 24 LTS, then delete `node_modules` and run `npm install` again.
- `npm audit` reports 8 known vulnerabilities (4 moderate, 4 high). Review them before using `npm audit fix --force`, because it can install breaking versions.

## 2. UI redesign

The UI follows this style guide:

| Guide item | How it's done |
| --- | --- |
| Colours | Sky `#3BA4F5`, sun `#FFC83D`, mint `#2FC69A` and coral `#FF7466` on an off-white `#FFFAF3`, with navy `#1D2B4F` text. No dark sections. |
| Shapes | Pill buttons with a darker bottom edge that presses down, rounded cards (26–36px corners), soft background circles and blobs. |
| Type | Fredoka for headings, Nunito for body text at 19px, short centred lines. |
| Imagery | No photos. Flat icons in coloured circles. One mascot, "Fizz" (a smiling flask), at most once per screen. |
| Layout | One focus per section, lots of space, every control at least 48px tall. |
| Progress | Star rating, progress bars, a "Bubble Builder" badge, locked badges on the overview. |
| Motion | Bouncy taps, pop and wiggle on rewards, a gently bobbing mascot. All of it is off under `prefers-reduced-motion`. |

### Screens

- **Family home page:** hero with Fizz, "How one lesson goes" (Learn, Try it, Check, plus the reward strip), the experiment shelf, "For grown-ups", a letter to the kid, and the sign-up block.
- **The experiment shelf** is interactive ("What's in your kitchen?"). Kids tick the items they have, and the 17 experiments are marked "Ready today" or "You need …", with an "8 of 17" progress bar.
- **Teachers page:** hero, how a course comes together, three starter courses, the class-progress dashboard, the pilot offer and an FAQ.
- **Auth:** one centred card with Fizz, Log in / Sign up tabs, and a Student / Teacher picker. There are no emoji anywhere.
- **Signed-in shell:** centred tabs (My notebook, Users, Password). The overview shows a progress bar, locked badges and three experiments that need no shopping.

### Code changes

- **New:**
  - `src/components/ui/Icon.jsx`: the flat icon set
  - `src/components/ui/Paper.jsx`: the logo, the wordmark, the Fizz mascot and the decorative shapes
  - `src/hooks/useReveal.js`: scroll entrance animations
  - `src/pages/public/content.js`: the experiments and kitchen items
- **Rewritten:**
  - every file in `src/styles/`
  - `HomePage.jsx`, `TeachersPage.jsx`, `Site.jsx`, `TeacherDashboard.jsx`, `Overview.jsx`, `AppShell.jsx`, `AppHeader.jsx` and `Confirm.jsx`
  - the layout of `Auth.jsx`
- **Removed:**
  - `src/components/icons/icons.jsx`
  - `src/pages/public/shared/bits.jsx`
  - `src/components/layout/Sidebar.jsx`
  - the emoji in the topic labels in `src/constants/index.js`
- **Content removed on purpose:** the invented school names, the statistics ("1,200+ classrooms", "4.9/5") and the placeholder quotes from parents and teachers. Add them back only once they're real.
- `.taste-skill/` (design-check screenshots) has been added to `.gitignore`.

### Checks

- ESLint passes, and `vite build` succeeds.
- The home, teachers and auth screens were rendered at 1440, 768 and 390px wide. None of them scroll sideways, have text too small to read, or have low-contrast text.
- **Not seen yet:** the signed-in screens (Overview, Users, Change password), because the app can't log in until Firebase is connected.

### Sample content to confirm before launch

- The 17 experiments, including their times, grades and materials (`src/pages/public/content.js`)
- The three starter courses and their topics (`TeachersPage.jsx`)
- The six-student class dashboard (`shared/TeacherDashboard.jsx`)
- The email addresses `hello@gglearn.example` and `schools@gglearn.example`

## 3. Database: next steps

Already in the repo:

- `firestore.rules` defines who can read and change profiles. Students and pending teachers create their own profile, and only an admin can change roles (never their own).
- `.firebaserc` points at the project `gglearn-af963`.
- `src/services/` handles sign-up, login, profiles and role changes.

To do, in order:

1. **Fill in and save `.env.local`.** Use Firebase console → Project settings → General → Your apps → Web app → Config. Use six `KEY=value` lines with no quotes, then restart `npm run dev`.
2. **Enable email/password sign-in:** Authentication → Sign-in method → Email/Password.
3. **Create the Firestore database.** Choose the region carefully because it can't be changed later; `asia-southeast1` is suggested.
4. **Log in to the Firebase CLI:** `npx firebase-tools login`.
5. **Deploy the rules:** `npx firebase-tools deploy --only firestore:rules --project gglearn-af963`.
6. **Test sign-up** and check that a profile appears under `users/{uid}`.
7. **Make the first admin:** Firestore → `users` → your account → set `role` to `admin`.
8. **Open question:** should lessons move from `localStorage` to Firestore? The Spring Boot API in `src/server` already has `/api/lessons`.

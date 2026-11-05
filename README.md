# GG Learn

Hands-on science learning for elementary kids. React + Vite front end, Firebase Auth and Firestore for accounts.

## Setup

1. `npm install`
2. In the [Firebase console](https://console.firebase.google.com):
   - Create a project and add a **Web app**.
   - **Authentication → Sign-in method**: enable **Email/Password**.
   - **Firestore Database**: create a database.
3. Copy `.env.example` to `.env.local` and paste in the web app config.
4. Deploy the security rules:
   ```sh
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```
5. `npm run dev`

## Roles

Profiles live in Firestore at `users/{uid}` with a `role` field:

| Role | How you get it |
| --- | --- |
| `student` | Sign up as a student. |
| `pending_teacher` | Sign up as a teacher. No teacher tools until approved. |
| `teacher` | An admin approves the request on the **Users** page. |
| `admin` | Another admin grants it, or set by hand (below). |

Admins can change anyone's role except their own. That rule lives in `firestore.rules`, so it holds even if someone edits the client.

### Making the first admin

1. Sign up normally in the app.
2. In the Firebase console, open **Firestore → users → (your uid)** and change `role` to `admin`.
3. Refresh the app. **Users** appears in the sidebar.

## Spring Boot API (`src/server`)

A Spring Boot 4 / Java 21 API that reads and writes the same Firestore data through the Firebase Admin SDK. The React app still signs in with Firebase Auth and sends the ID token as `Authorization: Bearer <token>`.

1. In the Firebase console, open **Project settings → Service accounts → Generate new private key**. Save the file outside the repo (it grants full admin access).
2. Run it:
   ```sh
   cd src/server
   FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json ./mvnw spring-boot:run
   ```
   It listens on `http://localhost:8080` and allows `http://localhost:5173` (override with `CORS_ALLOWED_ORIGINS`).

| Endpoint | Who |
| --- | --- |
| `GET /api/me`, `PATCH /api/me` `{name}` | Signed in |
| `POST /api/me` `{name, role: student\|teacher}` | Right after Firebase sign-up |
| `GET /api/users`, `PATCH /api/users/{uid}/role` `{role}` | Admin (not your own role) |
| `GET /api/lessons` | Anyone with a profile |
| `POST /api/lessons` `{title, topic, content}` | Teacher or admin |
| `DELETE /api/lessons/{id}` | The author or an admin |

The Admin SDK ignores `firestore.rules`, so these permission checks live in the services (`UserService`, `LessonService`).

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: production build
- `npm run lint`: ESLint

# GG Learn

Hands-on science learning for elementary kids. React + Vite front end, Firebase Auth and Firestore for accounts.

## Setup

> Joining the team? Follow [SETUP.md](SETUP.md). It uses the existing Firebase project.

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

### Run both servers

1. In the Firebase console, open **Project settings → Service accounts → Generate new private key**. Save the file outside the repo (it grants full admin access).
2. Start the API. Set `FIREBASE_CREDENTIALS_PATH` to the key file:
   ```sh
   cd src/server
   FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json ./mvnw spring-boot:run
   ```
   It listens on `http://localhost:8080` and allows `http://localhost:5173` (override with `CORS_ALLOWED_ORIGINS`).
3. In another terminal, start the web app from the project root:
   ```sh
   npm run dev
   ```
   The app calls the API at `VITE_API_URL`, which defaults to `http://localhost:8080/api`. Set it in `.env.local` only if the API runs somewhere else.

### Endpoints

Everything is under `/api` and needs `Authorization: Bearer <Firebase ID token>`. Errors are problem JSON (`{status, title, detail}`) with status 400, 403, 404 or 409.

Staff means the course's teacher or any admin. Members are staff and students enrolled in the course. Disabled users get 403 on every endpoint.

| Endpoint | Who |
| --- | --- |
| `GET /api/me`, `PATCH /api/me` `{name}` | Signed in |
| `POST /api/me` `{name, role: student\|teacher}` | Right after Firebase sign-up |
| `GET /api/courses` | Signed in |
| `GET /api/courses?mine=true` | Signed in (returns only the courses you teach) |
| `POST /api/courses` `{title, gradeLevel, topic, teacherUid}` | Teacher or admin (an admin may set `teacherUid`) |
| `GET /api/courses/{id}` | Signed in |
| `PUT /api/courses/{id}`, `DELETE /api/courses/{id}` | Staff |
| `GET /api/courses/{courseId}/lessons` | Members |
| `POST /api/courses/{courseId}/lessons` `{title, topic, content, order}` | Staff |
| `GET /api/lessons/{id}` | Members |
| `PUT /api/lessons/{id}`, `DELETE /api/lessons/{id}` | Staff |
| `GET /api/lessons/{lessonId}/experiments` | Members |
| `POST /api/lessons/{lessonId}/experiments` | Staff |
| `PUT /api/experiments/{id}`, `DELETE /api/experiments/{id}` | Staff |
| `GET /api/lessons/{lessonId}/quizzes` | Members |
| `POST /api/lessons/{lessonId}/quizzes` | Staff |
| `GET /api/quizzes/{id}` | Members |
| `PUT /api/quizzes/{id}`, `DELETE /api/quizzes/{id}` | Staff |
| `GET /api/quizzes/{quizId}/questions` | Members (students never get `correctAnswer`) |
| `POST /api/quizzes/{quizId}/questions` | Staff |
| `PUT /api/questions/{id}`, `DELETE /api/questions/{id}` | Staff |
| `GET /api/courses/{courseId}/enrollments` | Staff (the roster) |
| `POST /api/courses/{courseId}/enrollments` (no body) | Student, enrolls self |
| `POST /api/courses/{courseId}/enrollments` `{studentUid}` | Staff. The target must be a student. |
| `DELETE /api/courses/{courseId}/enrollments/{studentUid}` | The student themselves, or staff |
| `GET /api/me/enrollments` | Signed in |
| `GET /api/badges?courseId=` | Staff of that course |
| `POST /api/badges` `{courseId, userUid, title}` | Staff. The student must be enrolled. |
| `PUT /api/badges/{id}` `{title}`, `DELETE /api/badges/{id}` | Staff of the badge's course |
| `GET /api/me/badges` | Signed in (your own badges) |
| `GET /api/students` | Teacher or admin |
| `GET /api/users` | Admin |
| `POST /api/users` `{name,email,password,role,gradeLevel?,section?,subject?}` | Admin |
| `PUT /api/users/{uid}` `{name,gradeLevel?,section?,subject?}` | Admin, not your own account |
| `PATCH /api/users/{uid}/role` `{role}` | Admin, not your own role |
| `PATCH /api/users/{uid}/disabled` `{disabled}` | Admin, not yourself |
| `DELETE /api/users/{uid}` | Admin, not yourself |

The Admin SDK ignores `firestore.rules`, so these permission checks live in the services (`UserService`, `CourseAccess`, `LessonService` and the other child services).

## Scripts

- `npm run dev`: start the dev server
- `npm test`: run the Vitest unit tests
- `npm run build`: production build
- `npm run lint`: ESLint
- `./mvnw test` (in `src/server`): run the backend tests. Add `-Dtest=CourseServiceTest` to run one class.

For the checks that need a live Firebase project, follow the [manual test checklist](docs/superpowers/manual-test.md).

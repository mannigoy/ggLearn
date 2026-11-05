# GG Learn: web CRUD design

_Date: 5 November 2026. Status: approved in chat, awaiting written-spec review._

## 1. Goal

Give the GG Learn **web app** full create, read, update and delete for the core learning data in the project-proposal ERD, with role-based permissions. The mobile app is out of scope.

**Success means:**
- A teacher can build a course end to end: lessons, experiments, quizzes with questions, a student roster and badges.
- A student can browse courses, enroll, read lessons, experiments and quiz questions (without answers), and see their badges.
- An admin can create, edit, change the role of, disable and delete user accounts, and manage any course.
- Every permission rule is enforced on the server and covered by a unit test.
- `npm run lint`, `npm run build`, `npm test` and `./mvnw test` all pass.

**Out of scope this round:**
- Taking quizzes and scoring them
- `user_stats`, the leaderboard and analytics
- Offline mode, the Q&A thread, file uploads
- The mobile app

## 2. Decisions

| Decision | Choice |
|---|---|
| Source of truth | The proposal PDF ERD (courses → lessons → experiments, quizzes → questions; enrollments; badges) |
| Data path | React → Spring Boot API (`src/server`) → Firestore through the Admin SDK. The browser never writes the new collections directly. |
| Backend structure | One controller, service and repository per entity, following the existing `LessonService` pattern, with a small shared course-access helper |
| Firestore layout | Top-level collections. Every child record also stores `courseId`, so a permission check needs one read. |
| Enrollment | Students can self-enroll, and teachers and admins can add or remove students |
| Admin user management | Full CRUD, including Firebase Auth create, disable and delete |
| Front-end tests | Add Vitest for `api.js` and form validators |

## 3. Data model (Firestore)

Ids are Firestore document ids (strings), not the ERD's ints. Timestamps are server timestamps.

| Collection | Fields | Notes |
|---|---|---|
| `users/{uid}` | name, email, role, disabled (bool, default false), createdAt, gradeLevel?, section? (students), subject? (teachers), roleUpdatedAt?, roleUpdatedBy? | Replaces the ERD's `students`, `teachers` and `admins` tables. `managed_by_admin_id` is dropped. |
| `courses/{id}` | title, gradeLevel, topic (`life`/`earth`/`physical`), teacherUid, teacherName, createdAt, updatedAt | |
| `lessons/{id}` | courseId, title, topic, content, order (int), createdAt, updatedAt | Replaces the `localStorage` lessons and the current flat `lessons` schema (by/byUid). |
| `experiments/{id}` | courseId, lessonId, title, materials (string[]), steps (string[]), safetyNotes, createdAt, updatedAt | |
| `quizzes/{id}` | courseId, lessonId, title, passingScore (int, 0 to totalPoints), createdAt, updatedAt | `totalPoints` is computed as the number of questions and returned in responses. It is not stored. |
| `questions/{id}` | courseId, quizId, questionText, choices (string[], 2 to 6), correctAnswer (must be one of the choices), order | |
| `enrollments/{courseId}_{studentUid}` | courseId, studentUid, studentName, progressPct (0), points (0), enrolledAt | The fixed id prevents duplicates; a second enroll returns 409. |
| `badges/{id}` | courseId, userUid, userName, title, dateEarned, awardedBy | Kept when its course is deleted. |

**Validation limits:**

| Field | Limit |
|---|---|
| Titles | 2 to 120 characters |
| Content | Up to 20,000 characters |
| Materials and steps | 1 to 30 items, each 1 to 300 characters |
| Safety notes | Up to 1,000 characters |
| `gradeLevel` | One of `K`, `1`, `2`, `3`, `4`, `5`, `6` |
| `section` and `subject` | Up to 60 characters |

## 4. Permissions

Definitions:
- **Owner:** the course's `teacherUid`.
- **Staff:** the owner or any admin.
- **Member:** staff, or a student with an enrollment in the course.

| Action | Allowed |
|---|---|
| List or read courses | Any signed-in user with a profile who is not disabled |
| Create a course | `teacher`, `admin` (the creator becomes the owner; an admin may set `teacherUid` to any teacher) |
| Update or delete a course | Staff |
| Read lessons, experiments, quizzes, questions | Members. Students never receive `correctAnswer`. |
| Write lessons, experiments, quizzes, questions | Staff |
| Enroll self or leave | The student themselves (`student` role only) |
| Add or remove any student, list the roster | Staff |
| Award, edit or revoke a badge | Staff of the badge's course, and only for students enrolled in it |
| Read badges | Staff of the course, or the badge's owner (`/me/badges`) |
| `GET /students` | `teacher`, `admin` (returns uid, name, gradeLevel, section only) |
| Users admin endpoints | `admin` only. Admins cannot change, disable or delete themselves. |

`pending_teacher` users are treated like users with no role: they can read the course list but cannot author anything. Disabled users get 403 on every endpoint.

**Cascade on course delete:** the course's lessons, experiments, quizzes, questions and enrollments are deleted in Firestore batches. Badges are kept. **Lesson delete** cascades to its experiments, quizzes and questions. **Quiz delete** cascades to its questions. **User delete** removes their enrollments. Their courses stay; an admin reassigns or deletes those.

## 5. API

Everything is under `/api` and needs `Authorization: Bearer <Firebase ID token>`. Errors are problem JSON (`{status, title, detail}`) through the existing `ApiException` and `GlobalExceptionHandler`. Status codes are 400 (validation), 403, 404 and 409.

| Resource | Endpoints |
|---|---|
| Profile | `GET /me`, `POST /me`, `PATCH /me` (existing) |
| Courses | `GET /courses[?mine=true]`, `POST /courses`, `GET /courses/{id}`, `PUT /courses/{id}`, `DELETE /courses/{id}` |
| Lessons | `GET /courses/{courseId}/lessons`, `POST /courses/{courseId}/lessons`, `GET /lessons/{id}`, `PUT /lessons/{id}`, `DELETE /lessons/{id}` |
| Experiments | `GET /lessons/{lessonId}/experiments`, `POST /lessons/{lessonId}/experiments`, `PUT /experiments/{id}`, `DELETE /experiments/{id}` |
| Quizzes | `GET /lessons/{lessonId}/quizzes`, `POST /lessons/{lessonId}/quizzes`, `GET /quizzes/{id}`, `PUT /quizzes/{id}`, `DELETE /quizzes/{id}` |
| Questions | `GET /quizzes/{quizId}/questions`, `POST /quizzes/{quizId}/questions`, `PUT /questions/{id}`, `DELETE /questions/{id}` |
| Enrollments | `GET /courses/{courseId}/enrollments`, `POST /courses/{courseId}/enrollments` (body `{studentUid}` optional), `DELETE /courses/{courseId}/enrollments/{studentUid}`, `GET /me/enrollments` |
| Badges | `GET /badges?courseId=`, `POST /badges`, `PUT /badges/{id}`, `DELETE /badges/{id}`, `GET /me/badges` |
| Students | `GET /students` |
| Users (admin) | `GET /users`, `POST /users` `{name,email,password,role,gradeLevel?,section?,subject?}`, `PUT /users/{uid}` `{name,gradeLevel?,section?,subject?}`, `PATCH /users/{uid}/role` (existing), `PATCH /users/{uid}/disabled` `{disabled}`, `DELETE /users/{uid}` |

How the enrollment `POST` behaves:
- With no body and the caller is a student: self-enroll.
- With a `studentUid`: the caller must be staff, and the target must have the `student` role.

`PATCH /users/{uid}/disabled` also sets `disabled` in Firebase Auth. `DELETE /users/{uid}` deletes the Auth account and the profile, then removes the user's enrollments. `POST /users` creates the Auth account and then the profile, and rolls back the Auth account if the profile write fails.

The old `POST /api/lessons` and `GET /api/lessons` (flat, without a course) are removed.

## 6. Backend structure (`src/server`)

The base package is `com.gglearn.backend`:

| Package | Contents |
|---|---|
| `entity/` | `Course`, `Lesson` (reworked), `Experiment`, `Quiz`, `Question`, `Enrollment`, `Badge`, and `User` (adds the new fields) |
| `dto/` | One `XxxRequest` (jakarta-validated record) and one `XxxResponse` per entity. `QuestionResponse.forStudent()` leaves out `correctAnswer`. |
| `repository/` | One repository per collection: find by id, find by parent, create, update, delete, and delete by `courseId` / `lessonId` / `quizId` in batches |
| `service/CourseAccess` | Loads a course and asserts staff or member access. Every child service uses it. |
| `service/` | `CourseService`, `LessonService`, `ExperimentService`, `QuizService`, `QuestionService`, `EnrollmentService`, `BadgeService`, `UserService` (extended) |
| `controller/` | One controller per resource, plus `MeController` for the `/me/*` reads |
| `config/` | Adds a `FirebaseAuth` bean for user admin, if it isn't already exposed |

## 7. Front-end structure (`src/`)

**Services:**
- `services/api.js`: `apiFetch(path, {method, body})`. It reads `VITE_API_URL` (default `http://localhost:8080/api`), attaches `await auth.currentUser.getIdToken()`, parses problem JSON, and throws an `ApiError` with `{status, message}`.
- `services/courseApi.js`, `lessonApi.js`, `experimentApi.js`, `quizApi.js`, `questionApi.js`, `enrollmentApi.js`, `badgeApi.js`, `adminUserApi.js`: thin functions over `apiFetch`.

**Hooks:**
- `hooks/useAsync.js`: `{data, error, loading, reload}` for loading screens.
- `useNav` gains the views `courses`, `course {id, tab}`, `lesson {id}`, `quiz {id}`, `badges` and `admin`.

**Validators:**
- `utils/validate.js`: pure validators that mirror section 3's limits, used by every form and unit-tested.

**Pages:**
- `pages/courses/CoursesPage.jsx`: "My courses" for staff, "Browse" (grade filter, Enroll) and "My courses" for students
- `pages/courses/CourseForm.jsx`
- `pages/courses/CoursePage.jsx`, with tabs:
  - **Lessons:** add, edit, delete, and move up or down
  - **Students:** staff only, with roster and add-from-list
  - **Badges:** staff only
- `pages/lessons/LessonPage.jsx`: content view and edit, plus experiment and quiz sections
- `pages/lessons/LessonForm.jsx`
- `pages/lessons/ExperimentForm.jsx`: editable list inputs for materials and steps
- `pages/quizzes/QuizPage.jsx`: question list and editor for staff; question preview without answers for students
- `pages/quizzes/QuestionForm.jsx`
- `pages/badges/BadgesPage.jsx`: my badges (students)
- `pages/badges/BadgeForm.jsx`
- `pages/admin/AdminPage.jsx`: reworked into a users table with create, edit, role, disable and delete, loaded from `/api/users` instead of the Firestore listener

**Shared UI:**
- `components/ui/ListEditor.jsx`: add, remove and reorder rows of text
- `components/ui/Tabs.jsx`
- `components/ui/States.jsx`: Loading, Empty and Error states
- Reuses `Field`, `Confirm` (every delete asks for confirmation) and the existing tokens and styles, following the style guide in PROGRESS.md.

**Removed:**
- `services/db.js`
- `utils/id.js`, if nothing else uses it
- The lesson functions in `useStore`
- `watchUsers` and `useUsers` (`AppShell`'s pending count now comes from `/api/users`)

**Stays the same:** `authService.watchAuth` still reads the caller's own profile live from Firestore, because the rules allow that. Self-sign-up stays client-side.

## 8. Error handling

- **Server:** validation failures return 400 with a field message. Missing parent records return 404. Permission failures return 403 with a child-friendly sentence.
- **Client:** `ApiError.message` is shown inline on forms, or in the page's Error state with a "Try again" button that calls `reload`. A 401 triggers sign-out and a return to the auth screen. A network failure shows "Can’t reach the GG Learn server. Is the backend running?".

## 9. Testing

**Backend (JUnit 5 and Mockito, matching `UserServiceTest`):** one test class per service. Each covers:
- The happy path
- Each forbidden role
- Not found
- Validation edge cases
- Cascades (repository delete-by-parent called)
- That `correctAnswer` is hidden from students
- Duplicate enrollment returns 409
- An admin cannot disable or delete themselves

Run with `./mvnw test`.

**Front end:**
- Add `vitest` as a dev dependency with an `npm test` script.
- Test `api.js` with a mocked `fetch` and token: headers, a problem-JSON error, the network error, and 401 handling.
- Test `utils/validate.js`.
- `npm run lint` and `npm run build` must pass.

**Manual:** a click-through as student, teacher and admin against a running backend (`docs/superpowers/manual-test.md` checklist).

## 10. Prerequisites and setup

- `git init` in `ggLearn/`. Add `serviceAccountKey*.json` and `*.pem` to `.gitignore`.
- Add `VITE_API_URL` to `.env.example`.
- To run the backend, you need a service-account key at `FIREBASE_CREDENTIALS_PATH` (kept outside the repo).
- Node 24.12+ is recommended for Firebase 13 (see PROGRESS.md).
- Deploy the existing `firestore.rules` unchanged. The new collections stay deny-all to browsers.

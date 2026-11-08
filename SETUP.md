# Running GG Learn locally

This takes you from a fresh clone to the app running on your machine. It uses the team's existing Firebase project (`gglearn-af963`), so you don't need to create one.

GG Learn has two parts, and both must be running:

| Part | Where | Runs on |
| --- | --- | --- |
| Web app (React + Vite) | repo root | http://localhost:5173 |
| API (Spring Boot) | `src/server` | http://localhost:8080 |

If the web app says **"Can't reach the GG Learn server. Is the backend running?"**, the API isn't running.

## 1. Install the tools

- **Git**
- **Node.js 22** or newer (`node -v`)
- **Java 21** JDK (`java -version`). You don't need to install Maven, because the repo includes `mvnw`.

## 2. Get two things from the project owner

1. **The `.env.local` file**, which holds the Firebase web config for the front end.
2. **An invite to the Firebase project.** Send the owner your Google email. They add you under **Project settings → Users and permissions → Add member** with the **Editor** role. Accept the invite email, and `gglearn-af963` will appear in your [Firebase console](https://console.firebase.google.com). You need this access to make your own service account key (step 4), so you never have to copy the owner's.

Never commit either of these to git.

## 3. Clone and install

```sh
git clone https://github.com/mannigoy/ggLearn.git
cd ggLearn
npm install
```

Put the `.env.local` you were given in the repo root, next to `package.json`. It should contain:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=gglearn-af963.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gglearn-af963
VITE_FIREBASE_STORAGE_BUCKET=gglearn-af963.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`VITE_API_URL` is optional. It defaults to `http://localhost:8080/api`.

## 4. Get a service account key for the API

The API connects to Firestore with an admin key, and that key **has full access to the database**.

1. Open the [Firebase console](https://console.firebase.google.com) → **gglearn-af963** → **Project settings → Service accounts**.
2. Click **Generate new private key**. A `.json` file downloads.
3. Move it to a folder **outside the repo**, for example `C:\keys\` or `~/keys/`.

## 5. Start the API (terminal 1)

Windows PowerShell:

```powershell
cd src\server
$env:FIREBASE_CREDENTIALS_PATH = "C:\keys\gglearn-af963-firebase-adminsdk-xxxx.json"
.\mvnw.cmd spring-boot:run
```

macOS / Linux / Git Bash:

```sh
cd src/server
FIREBASE_CREDENTIALS_PATH=~/keys/gglearn-af963-firebase-adminsdk-xxxx.json ./mvnw spring-boot:run
```

The first run downloads dependencies and takes a few minutes. The API is ready once you see:

```
Tomcat started on port 8080 (http)
Started BackendApplication in ... seconds
```

To check it, open http://localhost:8080/api/courses. The reply `{"status":401,"title":"Unauthorized","detail":"Sign in first."}` is **correct**: it means the API is running and wants you to sign in.

## 6. Start the web app (terminal 2)

From the repo root:

```sh
npm run dev
```

Open http://localhost:5173.

## 7. Make an account

1. Sign up in the app.
2. Ask the project owner to give you the `teacher` or `admin` role on the **Users** page.

If you have Firebase console access, you can do it yourself: open **Firestore → users → (your uid)** and set `role` to `admin`. Then refresh the app.

## Mobile app (optional)

The phone app lives in `mobile/` and talks to the same API and Firebase project. It runs in **Expo Go**, so you don't build anything.

1. Install **Expo Go** on your phone. The phone must be on the same Wi-Fi as your PC.
2. Find your PC's IPv4 address. Run `ipconfig` and read the **IPv4 Address** line of your Wi-Fi adapter, for example `192.168.1.20`.
3. Let the phone reach the API. In an **admin** PowerShell, allow port 8080 once:

   ```powershell
   New-NetFirewallRule -DisplayName "GG Learn API" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
   ```

4. Copy `mobile/.env.example` to `mobile/.env`. Fill it in from the web `.env.local`, but change the prefix from `VITE_` to `EXPO_PUBLIC_`. Then set the API address to your PC:

   ```
   EXPO_PUBLIC_API_URL=http://<PC-IP>:8080/api
   ```

5. Start the API (step 5), then run:

   ```sh
   cd mobile
   npm install
   npx expo start
   ```

   Scan the QR code with Expo Go (Android) or the Camera app (iPhone).

## Running the tests

```sh
npm test                    # front end (Vitest)
npm run lint                # ESLint
cd src/server && ./mvnw test  # backend (use .\mvnw.cmd test on PowerShell)
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Can't reach the GG Learn server" | The API isn't running. Do step 5. |
| API fails at startup with a credentials error | `FIREBASE_CREDENTIALS_PATH` is unset or points to the wrong file. You must set it in the **same terminal** that runs `mvnw`. |
| `Port 8080 was already in use` | Another API copy is still running. Close it, or start with `PORT=8081` and set `VITE_API_URL=http://localhost:8081/api` in `.env.local`. |
| Firebase errors on sign-in / blank app | `.env.local` is missing or in the wrong folder. Restart `npm run dev` after you change it. |
| CORS error in the browser console | The web app must run on `localhost:5173`. Any other origin needs `CORS_ALLOWED_ORIGINS` set when you start the API. |
| `java` not found or wrong version | Install JDK 21 and make sure `java -version` shows 21. |
| Mobile app says offline or can't reach the server | The IP in `EXPO_PUBLIC_API_URL` is wrong, or the firewall blocks port 8080. Re-check `ipconfig` and step 3 of "Mobile app". |
| Mobile app ignores a change to `mobile/.env` | Restart with `npx expo start -c` to clear the cache. |
| Expo Go hangs on "Opening project…" | The Windows firewall blocks Metro on port 8081. In an **admin** PowerShell, run `New-NetFirewallRule -DisplayName "GG Learn Metro" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow` (or allow Node when Windows asks). Or start with `npx expo start --tunnel` instead. |

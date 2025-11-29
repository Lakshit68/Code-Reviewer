# Code Reviewer

AI‑powered code review web app with GitHub integration.

The app lets you:

- Paste code directly in the editor and get an AI review.
- Upload local files and review their contents.
- Connect your GitHub account, browse repositories, and review files from GitHub.
- Work primarily in a polished dark UI with optional light mode.

---

## Tech Stack

- **Frontend**
  - React
  - `react-simple-code-editor` + Prism for syntax highlighting
  - Axios for API calls
  - Custom CSS (dark/light themes, GitHub + upload UIs)

- **Backend**
  - Node.js + Express
  - Google Generative AI (Gemini) for code review (`@google/generative-ai`)
  - GitHub OAuth integration
  - File upload handling

---

## Project Structure (high level)

```text
backend/
  src/
    app.js                 # Express app setup
    services/ai.js         # Gemini client + generateContent helper
    controllers/githubController.js
    middleware/
      authMiddleware.js    # JWT auth for GitHub routes
      errorMiddleware.js
    routes/
      githubAuthRoutes.js  # OAuth + protected GitHub API routes
      githubRoutes.js      # GitHub API helpers
      uploadRoutes.js      # File upload endpoints
  .env                     # Backend configuration (not committed)

frontend/
  src/
    App.jsx                # Main UI, tabs, editor, review panel
    App.css                # Global styling + themes
    components/
      FileUpload.jsx       # Drag & drop file upload card
      GithubIntegration.jsx# GitHub connect + repo browser
```

---

## Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- A GitHub OAuth app (for integration)
- A Google Gemini API key

---

## Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` in `backend/`**

   ```env
   PORT=3000

   # Gemini / Google Generative AI
   GEMINI_APIKEY=your_gemini_api_key

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

   # JWT for GitHub integration
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1h

   # File uploads
   MAX_FILE_SIZE=500000
   UPLOAD_DIR=uploads
   ```

   Adjust values to match your local environment and GitHub OAuth app.

3. **Run the backend**

   ```bash
   cd backend
   npm start
   ```

   By default the API runs on **http://localhost:3000**.

---

## Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure API base URL (if needed)**

   The frontend expects the backend at `http://localhost:3000`. If you change this, update any Axios base URLs in the React code.

3. **Run the frontend**

   ```bash
   cd frontend
   npm start
   ```

   This usually starts the app on **http://localhost:5173** or **http://localhost:3000** depending on your setup.

---

## GitHub Integration

### 1. Create a GitHub OAuth App

In GitHub settings → Developer settings → OAuth Apps:

- **Homepage URL**: `http://localhost:3000` (or your frontend URL)
- **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback` (must match `GITHUB_CALLBACK_URL` in `.env`)

Copy the **Client ID** and **Client Secret** into your backend `.env`.

### 2. Flow (high level)

- User clicks **Connect with GitHub** in the app.
- Frontend redirects to backend `/api/auth/github`, which redirects to GitHub.
- On success, GitHub calls the backend callback with a `code`.
- Backend exchanges the code for an access token, fetches user info, signs a JWT, and redirects back to the frontend with a token.
- Frontend stores the JWT and uses it for:
  - `/api/github/repos` – list repositories
  - `/api/github/contents/:owner/:repo` – browse repo contents
  - `/api/github/file/:owner/:repo` – fetch a file for review

---

## Using the App

1. **Write Code tab**
   - Type or paste code into the editor.
   - Click **Review Code** to send it to the backend.
   - The AI (Gemini) responds with:
     - A short greeting (thanks for providing code).
     - Errors/issues (if any).
     - Short code explanation.
     - Suggestions / improvements.

2. **Upload File tab**
   - Drag & drop supported files or click **Choose files**.
   - See selected files in a list; click **Upload & review** to analyze.

3. **GitHub tab**
   - Click **Connect with GitHub** and authorize the app.
   - Browse repositories, view contents, and select files to review.
   - Use **Disconnect** to clear the session token.

---

## Environment & Theming

- Default mode is **dark**.
- Light mode can be toggled from the header, but current design is optimized for dark.
- Main theme variables are defined at the top of `frontend/src/App.css`.

---

## Scripts

From the **backend** directory:

- `npm start` – start Express server

From the **frontend** directory:

- `npm start` – start React dev server

---

## Notes & Future Improvements

- Improve error messages and edge‑case handling for GitHub OAuth.
- Add tests around the AI review service and GitHub routes.
- Further refine Prism theme and layout responsiveness if additional languages or views are added.



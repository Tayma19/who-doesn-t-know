# Who Doesn't Know?

A multiplayer social deduction party game for **4–10 players**. Everyone receives the same secret tip except one hidden player. Players ask and answer questions, decide when to vote, and try to identify who doesn't know the secret.

## How to play

1. Create a room with a display name and share its five-character room code.
2. Other players join the lobby. The host can start once at least four players have joined.
3. Each player receives a private role. Informed players see the secret tip; the hidden player must blend in without knowing it.
4. Players take turns asking another player a question and answering questions directed at them.
5. After every two rounds, everyone chooses whether to continue questioning or vote. Voting starts only when a strict majority chooses it; a tied decision continues questioning.
6. Everyone votes for a suspected hidden player. A tied suspect vote resumes questioning and restricts the next vote to the tied players.
7. The informed players win if they accuse the hidden player. Otherwise, the hidden player wins.

The client polls the API every two seconds for public game state and the current player's private role. Player sessions are stored in the browser's `sessionStorage`.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 5, React Router, CSS |
| Backend | NestJS 10, TypeScript, class-validator |
| Database | MongoDB with Mongoose |
| API documentation | Swagger / OpenAPI |
| Backend tests | Jest |

## Local setup

### Prerequisites

- Node.js and npm. Node.js 22 is a suggested baseline; the repository does not pin a Node version.
- A running MongoDB instance, either locally or through a hosted connection string.

Install dependencies separately for the API and client. The root `package.json` does not provide scripts to run them together.

### 1. Configure and start the API

From the repository root:

```sh
cd api
npm ci
```

Copy `api/.env.example` to `api/.env`. In PowerShell, while inside `api/`:

```powershell
Copy-Item .env.example .env
```

Set these values in `.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/who-doesnt-know
INTERNAL_TOOL_TOKEN=replace-with-a-local-development-token
FRONTEND_URL=http://localhost:5173
PORT=3000
```

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string; required for database access. |
| `INTERNAL_TOOL_TOKEN` | Token required in the `x-internal-token` header for all `/tips` endpoints. |
| `FRONTEND_URL` | Allowed frontend origin for CORS; defaults to `http://localhost:5173` when unset. |
| `PORT` | API listening port; defaults to `3000` when unset. |

The example environment file contains empty values, so populate them before starting. Keep `.env` local; it is ignored by Git.

```sh
npm run start:dev
```

The API runs at [http://localhost:3000](http://localhost:3000), with Swagger at [http://localhost:3000/api](http://localhost:3000/api).

On startup, the API seeds 32 secret tips across Places, Food, Jobs, and Sports if the tips collection is empty. No separate tip-seeding command is needed for a fresh database.

### 2. Start the frontend

In a second terminal, from the repository root:

```sh
cd client
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). To try a full game locally, create a room and join it from separate browser tabs or profiles using different display names, until at least four players are present.

The API base URL in `client/src/api/http.ts` uses the current page's hostname with HTTP on port `3000`. If you change the API port or protocol, update that value too. The `/api` proxy in `client/vite.config.ts` points to port `3001`, but current client requests use the absolute API URL and bypass it. Swagger uses `/api`; game endpoints are served directly under `/games`.

### 3. Join from phones on the same Wi-Fi

Find your PC's Wi-Fi IPv4 address with `ipconfig` (for example, `192.168.1.2`). Set `FRONTEND_URL` in `api/.env` to `http://<PC-IP>:5173` and restart the API.

Start the frontend from `client/` with:

```sh
npm run dev -- --host 0.0.0.0
```

On the PC and phones connected to the same Wi-Fi, open `http://<PC-IP>:5173`. Create a room and share its code. Keep both servers running and allow Node.js on private networks if Windows Firewall prompts you. If the PC's IP changes, update `FRONTEND_URL` and the address used to open the game.

## Development commands

Run each command from the indicated directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `client/` | `npm run dev` | Start the Vite development server. |
| `client/` | `npm run build` | Type-check and build the frontend into `dist/`. |
| `client/` | `npm run lint` | Run ESLint. |
| `client/` | `npm run preview` | Preview the built frontend locally. |
| `api/` | `npm run start:dev` | Start the API in watch mode. |
| `api/` | `npm run build` | Compile the API into `dist/`. |
| `api/` | `npm run start:prod` | Run the compiled API after building. |
| `api/` | `npm test` | Run Jest unit tests, including gameplay rules. |
| `api/` | `npm run test:cov` | Run unit tests with coverage. |
| `api/` | `npm run lint` | Run ESLint with automatic fixes. |

### Frontend previews

Set `USE_MOCKS = true` in `client/src/api/http.ts` to use mock API responses, then visit `/dev` to choose a game state and player role and open a preview room. Restore `USE_MOCKS = false` to reconnect to the backend.

Additional preview pages are available at:

- `/dev/game` — game and voting previews.
- `/dev/result` — round decision and result previews.

## API overview

See Swagger for request schemas and endpoint details.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/games` | Create a room and its host player. |
| `POST` | `/games/join` | Join a room in the lobby. |
| `POST` | `/games/:roomCode/start` | Start a game as the host. |
| `GET` | `/games/:roomCode/state` | Read public game state. |
| `GET` | `/games/:roomCode/me?playerId=...` | Read a player's private role. |
| `POST` | `/games/:roomCode/questions` | Ask a question. |
| `POST` | `/games/:roomCode/questions/:questionId/answer` | Answer a pending question. |
| `POST` | `/games/:roomCode/decisions` | Choose to continue or vote. |
| `POST` | `/games/:roomCode/votes` | Vote for a suspect. |
| `GET` | `/tips` | List secret tips for internal tooling. |
| `POST` | `/tips` | Create a secret tip. |
| `PATCH` | `/tips/:id` | Update a secret tip. |
| `PATCH` | `/tips/:id/deactivate` | Deactivate a secret tip. |

All `/tips` routes require the `x-internal-token` header to match `INTERNAL_TOOL_TOKEN`.

## Project structure

```text
.
├── api/
│   ├── src/
│   │   ├── counters/      # Numeric ID generation
│   │   ├── games/         # Rooms, players, roles, and public state
│   │   ├── gameplay/      # Questions, decisions, voting, and game rules
│   │   ├── scripts/       # Development game seed script
│   │   ├── tips/          # Secret tips, initial data, and internal tooling
│   │   └── main.ts        # API bootstrap, validation, CORS, and Swagger
│   └── .env.example
├── client/
│   └── src/
│       ├── api/           # HTTP requests, sessions, and polling
│       ├── components/    # Shared game UI
│       ├── mocks/         # Preview fixtures
│       ├── pages/         # Home, lobby, game, voting, and results
│       ├── style/         # Component and page styles
│       └── types.ts       # Frontend data types
└── docs/                  # Team overview and implementation PDFs
```


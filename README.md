## Telecom Order Analytics Dashboard

Full-stack app with a React (Vite) client and an Express server.

### Prerequisites

- Node.js (recommended: 18+)
- npm

### Setup

Install dependencies:

```bash
cd server
npm install

cd ../client
npm install
```

### Environment

The server reads `server/.env`.

- **Quick start (no MongoDB needed)**: you can run without `MONGODB_URI` and the server will **fall back to JSON file persistence**.
- **MongoDB**: set `MONGODB_URI` to use a real database.

Copy the example:

```bash
copy server\.env.example server\.env
```

### Run (dev)

Start the server:

```bash
cd server
node server.js
```

Start the client:

```bash
cd client
npm run dev
```

Open `http://localhost:5173/`.

### Useful scripts

Client:

- `npm run lint`
- `npm run build`


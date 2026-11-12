# Graphico — Printing Services Web Application

An academic/personal MVP exploring how a printing-services business could present products, collect customer enquiries and manage orders through a web application.

> **Project status:** MVP / in development. This is a learning prototype, not a production service.

## Project goals

- Present printing products and service information in a clear catalogue.
- Provide a customer-facing experience for exploring services.
- Explore administrative workflows for catalogue information and pricing.
- Connect the application to a backend and database.

## Technology

- Frontend: HTML, CSS and JavaScript.
- Backend: Node.js and Express.
- Database: MongoDB with Mongoose.
- File handling: Multer (requires additional security review before public deployment).

## Repository layout

```text
.
├── index.html
├── server.js
├── package.json
├── public/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── uploads/                 # sample assets currently tracked
└── docs/
    ├── ARCHITECTURE.md
    └── PROCESS_MAP.md
```

The repository contains both a root-level and a `backend/` server entry point. Review the scripts and matching frontend before choosing which one to run; do not start both blindly. Consolidating these entry points is a future cleanup task.

## Run the root application

1. Install a supported Node.js LTS release.
2. Clone the repository.
3. Install dependencies from the repository root:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and configure `MONGODB_URI` for a database you control.
5. Start the root server:
   ```bash
   npm start
   ```

## Run the backend variant

If you are specifically working with `backend/server.js`:

1. Open a terminal in the `backend/` directory.
2. Install its dependencies with `npm install`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Set `MONGODB_URI` to a database you control.
5. Run `npm start` from that directory.

Never commit either local `.env` file.

## Architecture and process

- [Architecture overview](docs/ARCHITECTURE.md)
- [End-to-end process map](docs/PROCESS_MAP.md)
- [Cleanup and deployment security audit](docs/CLEANUP_AND_DEPLOYMENT_AUDIT.md)

## Security and known limitations

- A database credential was previously committed in `backend/server.js`. The current source now reads `MONGODB_URI` from the environment, but the exposed credential must be rotated/revoked because removing it from the latest file does not erase Git history.
- Admin routes must have server-side authentication and authorization before any public deployment.
- File upload validation currently relies partly on client-provided MIME type. Add content-based validation, safe storage, access control and malware scanning before accepting untrusted uploads in production.
- Review request validation, rate limiting, error responses and data retention.
- Use synthetic data in public demonstrations.
- Do not expose admin or dashboard endpoints publicly until authorization has been implemented and tested.

## Development checklist

- [ ] Choose and document one canonical server entry point.
- [ ] Add automated tests for API validation and business rules.
- [ ] Verify customer-facing catalogue and enquiry flows.
- [ ] Verify admin authentication and authorization.
- [ ] Add screenshots of the current, working interface.
- [ ] Record known issues and incomplete features.
- [ ] Rotate any credential that has appeared in Git history.

## About

This project is part of my BSc Computer Science learning portfolio. It demonstrates an exploration of frontend-to-backend integration, API design, database models and software documentation.

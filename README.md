# Graphico Complete

A full-stack printing-services website prototype with customer-facing pages, artwork upload/preview flows, quotation enquiries, and an Express/MongoDB backend.

> This repository is a student/development project. Review authentication, upload handling, database access, payment-related flows, and deployment settings before using it with real customers.

## Project structure

- `index.html`, `upload.js`, `upload.css` — main website and upload interface.
- `public/` — additional customer-facing pages, styles, and browser scripts.
- `server.js` — root Express server and application endpoints.
- `backend/` — separate backend/admin implementation.
- `uploads/` — sample uploaded artwork currently tracked in the repository.

There are both root-level and `backend/` server implementations. Review which one you intend to run before deploying; their configuration and endpoints may differ.

## Requirements

- Node.js and npm
- A MongoDB database accessible from your development machine
- Environment variables configured outside source control

## Run the root server

1. Clone this repository and open its directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure `MONGODB_URI` in your local shell or deployment environment. See `.env.example` for the variable name. Do not commit real credentials.
4. Start the server:

   ```bash
   npm start
   ```

The root `package.json` defines `npm start` as `node server.js`. The root server currently expects `MONGODB_URI` to be provided by the environment.

## Security notes

- A database credential was previously embedded in the root server source. The security branch replaces it with the `MONGODB_URI` environment variable. **Rotate the old database credential in MongoDB Atlas** because deleting it from the latest source does not remove it from Git history.
- Restrict database network access and use a database user with least-privilege permissions.
- Review upload file validation, file size limits, storage permissions, and public access to uploaded files.
- Configure CORS for trusted origins instead of allowing every origin in production.
- Never commit `.env`, passwords, API keys, service-account files, or customer data.
- The root package currently does not define an automated test suite. Add tests before treating the project as production-ready.

## Current limitations

- The repository contains two server implementations; choose and document the intended deployment path.
- The root server and backend subproject have separate package manifests.
- This README does not claim that payments, authentication, or deployment have been independently audited.

## Suggested next steps

1. Confirm which server implementation is canonical.
2. Add a safe local development configuration and a health-check endpoint.
3. Add automated API tests and upload-security tests.
4. Review environment variables and Git history for any other exposed secrets.
5. Add current screenshots and a short demo once the intended app flow is verified.

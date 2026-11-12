# Graphico — Cleanup and Deployment Audit

This audit is based on the current default-branch file tree and source inspection. It intentionally separates confirmed cleanup candidates from files that must be retained until their runtime usage is verified.

## Confirmed improvements made

- Both root and backend server variants use `process.env.MONGODB_URI` rather than a hardcoded connection string in the current source.
- The backend entry point now loads `.env` using dotenv before reading configuration.
- Root and backend environment templates are present.
- Root `.gitignore` excludes local `.env` files and user-uploaded runtime files.
- Architecture and process documentation are available in `docs/`.

## Items not deleted

| Item | Reason |
|---|---|
| `server.js` and `backend/server.js` | Two separate server implementations exist. Deleting either without confirming the active entry point could break the application. |
| `public/admin.html` and `backend/admin.html` | The public page is a placeholder; the backend-level page appears to be an older unrelated admin template. Confirm the intended admin workflow before removal. |
| `uploads/*` | These are design-image assets and may be referenced as portfolio examples or test data. Do not remove until references and ownership are confirmed. |
| `public/contact.html`, `quote.html`, `track.html`, `upload.html` | These appear to be placeholder or legacy pages; confirm links and route usage before removal. |

## Security blockers before any public deployment

1. **Rotate the previously exposed MongoDB credential.** The credential appeared in a previous committed version. Updating the current file does not remove it from Git history.
2. **Add server-side authentication and role-based authorization.** The backend includes administrative data and update endpoints such as `GET /api/orders`, `GET /api/contacts`, `GET /api/dashboard`, and order/print-job status updates. Treat these as exposed until authorization is implemented and tested.
3. Restrict upload file types using content inspection, enforce size limits, store files safely and add access controls.
4. Review CORS, rate limits, input validation and error messages.
5. Confirm that payment handling is only a sandbox simulation and does not imply a live payment integration.
6. Do not deploy either server publicly until these controls have been implemented and verified.

## Recommended cleanup sequence

- [ ] Decide whether the root server or backend server is canonical.
- [ ] Compare routes and frontend integrations before merging or removing the duplicate implementation.
- [ ] Choose one admin interface and remove only the confirmed obsolete copy.
- [ ] Verify every tracked image is intentionally used; remove only confirmed unused assets.
- [ ] Replace placeholder pages with working pages or remove their navigation links.
- [ ] Add API tests for validation, authorization, database failures and upload rejection.
- [ ] Run the application locally with a new database credential and synthetic data.
- [ ] Capture fresh screenshots only after the main customer journey works.

## Current recommendation

Keep the current files for now. A conservative cleanup is better than deleting source files or customer design assets based only on filenames. The most important next work is choosing one server entry point and closing the unauthenticated admin endpoints.

# Graphico — Printing Services Web Application

An academic/personal MVP exploring how a printing-services business could present products, collect customer enquiries and manage orders through a web application.

> **Project status:** MVP / in development. Review the current code and configuration before running or demonstrating it. Features described here should be treated as project scope, not a claim of production readiness.

## Project goals

- Present printing products and service information in a clear catalogue.
- Provide a customer-facing experience for exploring services.
- Explore administrative workflows for managing catalogue information and pricing.
- Connect the application to a backend and database.

## Technology

The repository contains a Node.js-based backend and MongoDB integration. Check the current `package.json` files and source folders for the exact scripts and installed dependency versions before running the project.

## Getting started

1. Install a supported Node.js LTS release.
2. Clone this repository and inspect the available project folders.
3. Install dependencies in the folder containing the relevant `package.json`:
   ```bash
   npm install
   ```
4. Configure the database connection using an environment variable such as `MONGODB_URI`. Keep real credentials in a local `.env` file that is excluded from Git.
5. Start the backend using the script defined in that folder's `package.json`.

If the repository contains more than one server entry point, use the one documented by its package scripts rather than starting both.

## Configuration and security

- Never commit database passwords, API keys, access tokens or private customer data.
- Keep local configuration in `.env`; commit only a placeholder `.env.example`.
- Rotate any database credential that may previously have been committed. Removing a secret from the latest file does not remove it from Git history.
- Enforce authentication and authorization on the server for administrative actions.
- Validate user input on the server and use synthetic demo data.

## Development checklist

- [ ] Confirm the intended application entry point and document exact run commands.
- [ ] Verify customer-facing catalogue flows.
- [ ] Verify administrator authentication and authorization.
- [ ] Add tests for input validation and important business rules.
- [ ] Add screenshots of the current, working interface.
- [ ] Record known issues and incomplete features.

## About

This project is part of my learning journey as a BSc Computer Science student. It is intended for academic demonstration and continued development, not as a production service.

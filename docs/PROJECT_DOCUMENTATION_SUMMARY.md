# Graphico — Project Documentation Summary

## Project overview
Graphico is an enquiry-first printing-services web application prototype. The documented MVP focuses on helping customers submit printing requirements and giving staff a central place to review enquiries and prepare manual quotations.

## Recorded MVP scope
- Customer-facing printing-services website
- Quote/enquiry form with server-side validation
- Google Sheets as an enquiry register
- Staff/admin review and manual quotation workflow

## Wider screens and future scope
The project report and screen documents also discuss catalogue/product-detail integration, customer accounts, order history, artwork upload, order stages, quotation PDFs/email, payments and GST invoices. These must be labelled as planned or illustrative unless verified in the running application.

## Architecture and technologies
The repository contains a customer-facing web interface and Node.js/Express server implementation with MongoDB-related code. It also contains a separate `backend/` implementation. Confirm which server is canonical before deployment, and keep their configuration instructions separate if both are retained.

## Verification checklist
- [ ] Run the application locally from a clean checkout.
- [ ] Test quote form validation and successful persistence to the configured destination.
- [ ] Test staff authentication and server-side authorization.
- [ ] Test invalid file types, oversized uploads, and error responses.
- [ ] Check mobile and desktop layouts.
- [ ] Record actual results in a test report.
- [ ] Replace illustrative interface images with genuine application screenshots where possible.

## Security notes
- The root server was changed on this branch to read `MONGODB_URI` from the environment rather than embedding a database credential in source code.
- Rotate the previously exposed database credential; it may remain in Git history.
- Review CORS, upload validation, admin access control, environment variables, and database network permissions before deployment.

## Supporting reports
A 25-page expanded report, a corrected project report, and organized/vertical screen-document PDFs were found in the project workspace/library. They are not included as binary files in this commit. Before adding a PDF to the repository, select one final reviewed report rather than publishing duplicate versions.

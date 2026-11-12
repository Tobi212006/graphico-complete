# Graphico — End-to-End Process Map

```mermaid
flowchart TD
    A[Customer opens Graphico] --> B[Browse printing services]
    B --> C[Select service and enter request]
    C --> D[Frontend validates basic fields]
    D --> E[Express API receives request]
    E --> F[Server validates input]
    F --> G{Valid request?}
    G -->|No| H[Return validation error]
    G -->|Yes| I[Mongoose writes record]
    I --> J[(MongoDB)]
    J --> K[Return confirmation response]
    K --> L[Customer sees request status or confirmation]
```

## Developer workflow

1. Read the existing route and model before editing.
2. Reproduce the issue with synthetic data.
3. Make a small change and validate inputs server-side.
4. Test success, invalid input, missing data and database failure paths.
5. Review the diff for credentials and personal data.
6. Update the README and commit with a clear message.

## Interview explanation

"Graphico is a printing-services web application prototype. I explored the customer request flow from the browser through Express routes and Mongoose models into MongoDB. I documented the system boundaries and identified security work required before deployment, including environment-based secrets, admin authorization and safe file handling."

# Day 4 — Authentication and Role-Based Access Control

## Overview

- Firebase Auth handles email/password sign-in and ID tokens.
- The frontend attaches the current Firebase ID token to protected API requests.
- Spring Boot verifies the ID token with Firebase Admin SDK.
- Spring Boot reads `users/{uid}` from Firestore to enforce `active` and `role`.
- Roles are `ADMIN` and `CASHIER`.
- Local-only seeded employees are created using the Authentication and Firestore emulators.

## Implemented API routes

- `GET /api/v1/users/me` — authenticated employee
- `GET /api/v1/admin/overview` — ADMIN only
- `GET /api/v1/cashier/overview` — ADMIN or CASHIER

## Test matrix

- No bearer token on `/api/v1/users/me`: 401
- Invalid bearer token: 401
- Valid token without active Firestore employee profile: 403
- Valid active CASHIER token on `/api/v1/admin/overview`: 403
- Valid active ADMIN token on `/api/v1/admin/overview`: 200
- Valid active CASHIER token on `/api/v1/cashier/overview`: 200
- Logout: protected client pages require login again

## Security notes

- Do not place service account private keys in the repository.
- Local demo account passwords belong in PowerShell environment variables, not committed files.
- `local` profile and `/api/v1/dev/**` must never be exposed publicly.
- Production server must securely initialize the Firebase Admin SDK with Application Default Credentials.
- Server authorization is authoritative; client-side protected routes are only for navigation UX.
- This first implementation reads the employee document on every token-authenticated request. Cache and error handling can be optimized later.
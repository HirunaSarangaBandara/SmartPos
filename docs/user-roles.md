# SmartPOS — Users, Roles and Permissions

**MVP roles:** `ADMIN`, `CASHIER`.

## 1. Permission Matrix
| Action | Admin | Cashier |
|---|:---:|:---:|
| Sign in/out | Yes | Yes |
| View/search products | Yes | Yes |
| Create/edit/deactivate products | Yes | No |
| Adjust stock | Yes | No |
| View inventory movements | Yes | No |
| Complete cash checkout | Yes | Yes |
| Print permitted receipt | Yes | Yes |
| View own sales | Yes | Yes |
| View all sales | Yes | No |
| View daily report | Yes | No |
| Provision/deactivate employees | Yes | No |

## 2. Authentication Flow
1. Employee signs in with Firebase Authentication Email/Password from React.
2. React obtains an ID token and sends it as `Authorization: Bearer <ID_TOKEN>`.
3. Spring Boot verifies the token using Firebase Admin SDK and extracts UID.
4. Backend reads `users/{uid}` from Firestore to verify `active: true` and load role.
5. Spring Security + service-layer authorization enforce every protected operation.

Do not trust role values passed by React. The Admin SDK bypasses Firestore Security Rules, so API authorization is critical. For this API-only model, deny direct browser access to authoritative business collections.

## 3. Employee Document Example
```json
{
  "uid": "example-firebase-uid",
  "name": "Example Cashier",
  "email": "cashier@example.invalid",
  "role": "CASHIER",
  "active": true
}
```
Example data is illustrative and not a real login credential.

## 4. Provisioning Employees
For the 14-day demo, create Auth users and corresponding `users` documents through an admin-controlled seed process in the local emulator. No self-service public registration. An employee-management UI is optional. In production, only a privileged backend flow can provision, assign roles, or deactivate accounts.

## 5. Security Outcomes
- Missing/invalid token → HTTP `401 Unauthorized`.
- Valid token, missing/inactive employee record → access denied (`403` or a consistently defined policy).
- Cashier requesting admin operation → HTTP `403 Forbidden`.
- Cashier viewing an unrelated receipt → HTTP `403` or `404` (consistent no-disclosure policy).
- UI may hide forbidden controls, but the backend must independently enforce every rule.

## 6. Acceptance Tests
- [ ] Active Admin can manage products and inventory.
- [ ] Active Cashier can check out cash sales and print own receipts.
- [ ] Cashier cannot create/update products or view business-wide reports.
- [ ] Unauthenticated requests are rejected.
- [ ] Deactivated employee cannot use protected APIs.
- [ ] Role changes take effect based on the backend's authoritative role lookup.
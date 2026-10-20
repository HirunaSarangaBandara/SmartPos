# SmartPOS — Day 5: Product Management

## Implemented

- GET `/api/v1/products` — Admin and Cashier; returns first 100 products, sorted by name.
- GET `/api/v1/products/{id}` — Admin and Cashier.
- POST `/api/v1/products` — Admin only; returns 201.
- PUT `/api/v1/products/{id}` — Admin only; returns 200.
- PATCH `/api/v1/products/{id}/status` — Admin only; returns 204.
- React `/products` screen (any logged-in employee; edit controls Admin-only).
- Spring Boot validates product data and reserves SKU atomically using `skuReservations`.

## Example POST body

```json
{
  "name": "A5 Notebook",
  "sku": "NB-A5-001",
  "categoryId": "stationery",
  "priceMinor": 45000,
  "reorderLevel": 10,
  "active": true
}
```

`priceMinor: 45000` means **LKR 450.00**. New products start at `stockQuantity: 0` and cannot specify initial stock through this API. The inventory adjustment workflow will follow in Day 7.

## Security

- Firebase bearer tokens are verified by the Day 4 filter.
- `GET /products/**`: ADMIN or CASHIER.
- `POST`, `PUT`, `PATCH /products/**`: ADMIN only.
- React controls are convenience only; server authorization is mandatory.
- Use `@EnableMethodSecurity` in the Day 4 security config for method-level `@PreAuthorize` rules.

## Firestore notes

- `products/{productId}` stores metadata and stock.
- `skuReservations/{UPPERCASE_SKU}` ensures SKU uniqueness (SKU syntax `[A-Z0-9][A-Z0-9_-]{1,39}`).
- On update, SKU reservation changes are performed within a single Firestore transaction.
- Day 3 seed data may not include a reservation record. **Do not use that seeded product for SKU-change tests until data is reset/migrated.** Delete seeded demo product and reseed using the Day 5 API, or create its matching reservation manually in the emulator for testing.
- This starter deliberately does not allow deleting products (historical receipts will later require consistent references).
- This starter does not modify stock or generate stock movements. It is for product catalog metadata only.

## Known MVP limits

- First 100 products only; cursor pagination and server-side search are future improvements.
- Category IDs are required but not yet checked against `categories` existence.
- No batch import or barcode scanner integration.
- Transaction failures become HTTP 503 and detailed causes appear in server logs; refine errors before production.
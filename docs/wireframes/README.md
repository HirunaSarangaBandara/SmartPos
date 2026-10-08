# SmartPOS — Wireframes

Store initial low-fidelity UI sketches here (PNG, SVG, PDF or design-export files). These files are planning artifacts, not implemented screens.

## Required Screens
| Screen | User | Essential controls |
|---|---|---|
| Login | All | Email, password, sign-in, error message |
| Dashboard | Admin | Navigation, daily sales total, quick links |
| Products | Admin | Search, list, add/edit, deactivate, validation |
| Inventory | Admin | Product, current stock, signed adjustment, reason, history |
| POS | Admin/Cashier | Product search, cart, quantity, total, cash tendered, pay |
| Receipt | Authorized | Receipt details and print button |
| Sales History | Authorized | Date search, receipt view, pagination |

## Simple POS Layout Sketch
```text
+------------------------------------------------------------------+
| SmartPOS    Products | Inventory | POS | Reports | Sign out      |
+------------------------------------+-----------------------------+
| Search product / SKU               | Cart                        |
| [ Search...                    ]    | Item       Qty     Amount  |
|                                    | Notebook    [-]2[+]  900.00 |
| Product list                       |                             |
| Notebook A5   LKR 450.00  [Add]    | Total         LKR 900.00    |
| Pencil        LKR 100.00  [Add]    | Cash tendered [ 1000.00 ]  |
|                                    | Change        LKR 100.00    |
|                                    | [ Complete Cash Sale ]      |
+------------------------------------+-----------------------------+
```

## Design Rules
- Desktop/tablet first; readable labels and clear actions.
- Admin-only controls are hidden for cashiers but protected on the backend.
- Display loading, empty and error states.
- Show a transaction-pending state when checkout outcome is uncertain.
- Confirmation/receipt should only appear after backend confirms a successful sale.
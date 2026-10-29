# POS local catalog publication

The POS publishes its local catalog to `/api/waiter/catalog-sync`. The cloud stores one `PosLocalCatalog` snapshot per tenant, company and location, separately from ERP products and categories. The first POS publishing a location owns its snapshot; a different POS receives 409 instead of overwriting it. Publisher reassignment requires an explicit administrative operation.

The snapshot uses local numeric IDs, integer prices in bani, POS ordering, category images, product images and product visibility. Promotional prices are applied using the same condition as the POS sale view model. Waiter bootstrap reads this snapshot only. Before the first publication it returns 409 with a synchronization message, rather than displaying a different ERP catalog.

The Android POS publishes at startup and every 60 seconds while its process is running, and immediately after waiter pairing. Local images are decoded and uploaded before the snapshot is replaced; a failed image upload leaves the previous snapshot intact. The image endpoint validates and converts images to WebP in persistent uploads storage and hashes the scope plus content for deduplication. Existing HTTP image URLs remain unchanged. No ERP product/category write is performed.

`/api/v1/pos/connected-terminals` lists active WAITER and KDS registrations matching the authenticated POS tenant, company and location. The settings dialogs refresh this list every 15 seconds. “Associated in cloud” describes registration, not a live online heartbeat.

## Validation on 2026-10-29

- Backend TypeScript build succeeded locally and in the production Docker image. Existing backend tests and three focused catalog tests passed.
- Both Android debug APKs built and were installed with `adb install -r` on Swan2 and M2 Pro; application data was backed up before installation.
- Swan published 3 categories and 5 active products. Cloud bootstrap returned the exact 3 categories and 4 visible products, matching local IDs, ordering and prices; the hidden product was excluded.
- All catalog image URLs returned HTTP 200. A repeated image upload returned the same public URL.
- Repeated catalog publications kept one snapshot and left ERP product/category records unchanged.
- The connected-terminal endpoint returned KDS “FF” and “Gufo Ospatar”, matching the database scope. The waiter registration was also verified in the Swan settings UI.
- Waiter credentials were denied catalog publication and POS terminal-list access with HTTP 403.
- API logs confirmed POS publication, waiter bootstrap, image upload and terminal-list requests with successful responses. The intentional authorization checks returned 403.

## Deployment and rollback

Production path: `/opt/poshard/gufo-gestiune-full`. API image: `gufo-api:waiter-catalog-20261029`. Only the additive `20261029170000_pos_local_catalog` migration was executed and marked applied; no database push/reset was used. Persistent upload mounts and runtime configuration were retained.

The prior API container is retained stopped as `gufo-gestiune-full-api-1-before-waiter-catalog`; the prior image is tagged `gufo-api:before-waiter-catalog-20261029`. Original source and runtime configuration are backed up under `/opt/poshard/backups/waiter-catalog-20261029`. An API rollback can retain the additive catalog table.

Scope of validation: catalog and pairing-related terminal visibility. No fiscal sale, payment, or kitchen ticket was created for testing.

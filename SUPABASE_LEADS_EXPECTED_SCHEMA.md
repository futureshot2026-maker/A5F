# Existing `public.leads` table

The connector is designed for the table already created in this project. The minimum columns it reads/writes are:

- `id` — bigint/int8 primary key
- `created_at` — timestamptz (preferably with a default such as `now()` )
- `name` — text
- `email` — text
- `message` — text
- `status` — text

No SQL migration is required by this version. In particular, do **not** add another `created_at` column.

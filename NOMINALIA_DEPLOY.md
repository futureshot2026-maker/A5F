# A5F — Nominalia deployment

This package is adapted from the original Netlify/Supabase project to run on Nominalia Micro Hosting.

## Upload
Upload the **contents of this folder** to the Nominalia website path shown in the control panel (`/www`).
Do not upload the outer ZIP folder itself.

## Included
- Static A5F website and all routes
- PHP form endpoint: `/api/forms.php`
- PHP Lead Center API: `/api/leads.php`
- File-based lead storage in `/data/leads.json`
- File-based form storage in `/data/forms.json`
- Protected Lead Center with PHP session login
- WordPress is not used by this project

## Lead Center login
Username: not required
Password: `A5F-Lead-2026!`

Change it in `/dashboard/config.php` after the first login.

## Important
The original project used Netlify Forms and a Supabase service-role key. Those integrations are not required by this Nominalia version. Leads and form submissions are stored on the hosting account as JSON files, protected from direct web access by `/data/.htaccess`.

If your Nominalia account does not allow PHP file writes, contact support or enable write permission for `/data`; the site itself will still load.

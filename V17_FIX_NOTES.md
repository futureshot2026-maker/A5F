# A5F V17 Fix Notes

## Blank-content fix
The previous CSS made `.reveal` elements invisible by default. If `/js/main.js` failed to load or `IntersectionObserver` was unavailable, the entire revealed content stayed transparent while its layout boxes remained visible. This release makes content visible by default and only enables the hidden/animated state after JavaScript confirms that `IntersectionObserver` is available.

## Language fix
Locale requests now use `cache: no-store` and explicitly request JSON. The existing English fallback remains in place so a temporary locale-loading failure cannot blank the page.

## Deployment
Upload the complete ZIP contents to the website document root. Keep the `/locales/`, `/js/`, `/css/`, `/assets/`, and page directories together.

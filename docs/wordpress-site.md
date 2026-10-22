# Live WordPress Site (h2ocolumbus.org)

The current public site is a separate WordPress install (Grace Church theme +
WPBakery + Slider Revolution), not this Next.js app. We edit it through the
WordPress REST API.

## Access

- Credentials: `WP_USER` and `WP_APP_PASS` (a WordPress Application Password) in
  `.env.local`. The account is an administrator. Keep the app password; it is reused.
- **Send a browser `User-Agent` on every request.** The host's nginx returns 403 for
  the default `Python-urllib` agent (media uploads fail first).
- Always save `content.raw` before writing a page. WordPress also keeps page
  revisions (`/wp/v2/pages/<id>/revisions`) for rollback.

## How the pages are built

| Page | ID | Notes |
|---|---|---|
| Home (front page) | 31383 | WPBakery shortcodes |
| Sunday Gatherings (`/sunday-morning/`) | 30685 | Hero is the first `[vc_row]`'s background image |

- **Custom CSS/JS on the home page** lives in the page content as base64
  `[vc_raw_html]` blocks (e.g. `h2o-home-polish`). Site-wide CSS is the
  "Simple Custom CSS" plugin (`<style id="sccss">`).
- **The home hero is a Slider Revolution module** (`homePageSlider`, alias
  `campus-city`). Its data lives in RevSlider's own tables, which the REST API
  cannot reach. Button links are in `data-actions`; the background video is
  `<rs-bgvideo data-mp4=…>`. To change slider behavior from REST, inject CSS/JS
  that targets the layer IDs (e.g. `#slider-8-slide-15-layer-26`) via a home-page
  `[vc_raw_html]` block. A *synchronous* inline script can rewrite `data-mp4`
  before RevSlider initializes.
- **Hero brightness** is the overlay rule `#slider-8-slide-15-layer-1` in
  `h2o-home-polish`, not the footage.
- Home card rows: `.h2o-start-band` (brand-blue "Start here" next steps, inner row
  `.h2o-plan-cards-row`) above `.h2o-info-cards-row` (Our Community / Mission / Sundays).

## Change log

**2026-09-03 – 09-08 · Home gallery**
- Added 18 event photos to the "What's different about H2O?" gallery (9 → 27).
- Gallery slides forced to a 1:1 square (`.h2o-home-gallery`, `object-fit: cover`)
  so the nav dots stop jumping; autoplay every 2s.
- A photo-slideshow video section ("Life at H2O") was added and later removed.

**2026-09-08 – 09-11 · Sunday Gatherings hero**
- Replaced the "Sunday Gatherings" water-texture banner with a photo; final image is
  the Neil Ave Sunday worship photo (`sunday-worship-neil-ave.jpg`, media 32256),
  300px band, centered.

**2026-10-21 · Home page next steps + hero**
- Moved "You're not meant to do campus life alone" (Visit Sunday / Get Connected /
  Join a Group) above the info cards and restyled it as a full-width brand-blue band
  with elevated white cards.
- "Find a group" button changed from black to the same primary blue as the others.
- Hero "GET CONNECTED": click safeguard (`h2o-hero-cta-fix`) so it always opens the
  Church Center form.
- Hero montage v2 (`h2o_hero_montage_v2-720p-crf24.mp4`, media 32496): IMG_1097
  (sign → worship room) and IMG_1104 (lobby) prepended to the original montage;
  22.5s, 1280×720. Served via the `h2o-hero-video-v2` swap script.

**2026-10-22 · Hero overlay**
- Lightened the hero overlay: left-side fade on desktop (.70 → .46 → .08), lighter
  vertical gradient on phones ≤900px (.70 → .30 → .08). Previously 92/55/32 vertical.

## Open items

- Set the montage v2 URL in Slider Revolution (campus-city → slide → Background →
  Video), then delete the `h2o-hero-video-v2` `[vc_raw_html]` block on the home page.
- Unused media that can be deleted: `h2o-slideshow.mp4` (32238), its poster (32237),
  `hero_final.jpg` (32253).

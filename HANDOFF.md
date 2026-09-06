# Handoff

Last updated: 2026-09-06

## Project

`portfolio-test` — a placeholder personal portfolio site. Plain HTML/CSS/JS, no framework, no build step. Purpose: verify the git → GitHub → Vercel deploy pipeline works before real content is written.

- Repo: https://github.com/Psych0Ray/portfolio-test (branch `main`)
- Hosting: Vercel, connected to the GitHub repo, auto-deploys on push to `main`

## Files

- [index.html](index.html) — hero section (name + tagline), About, Projects (3 placeholder cards), Contact, footer
- [style.css](style.css) — minimal dark theme, responsive card grid
- [script.js](script.js) — one line, sets the footer copyright year

## Done so far

1. Built the initial one-page placeholder (hero + About + Projects + Contact + footer).
2. Initialized git repo locally, set local git identity (user.name "Rutujeet Nayak", user.email rutujeetnayak@gmail.com — repo-local config, not global).
3. Committed and pushed to `origin/main` on the new GitHub repo.
4. Updated hero title and footer from "Your Name" to "Rutujeet", committed and pushed — used to confirm the Vercel auto-deploy pipeline picks up pushes.
5. Added this handoff process (`CLAUDE.md` + `HANDOFF.md`).
6. Installed Node.js LTS (v24.19.0) on this machine — was previously missing entirely (no `node`/`npm`/`npx` on PATH in bash or PowerShell).
7. Installed the `taste-skill` plugin (marketplace: `leonxlnx/taste-skill`) — 13 frontend design-taste skills (brutalist, minimalist, soft, redesign, image-to-code, etc.), user scope, ~1.7k tok always-on.
8. Installed the `vercel-optimize` skill manually into `~/.claude/skills/vercel-optimize` (sparse-cloned from `vercel-labs/agent-skills`, not a native Claude Code plugin format — copied the skill folder directly). Needs Vercel CLI v53+, `vercel login`, `vercel link`, and ideally Observability Plus to be useful; dormant until the site has real production traffic.
9. Installed Playwright agent CLI (`@playwright/cli`, global npm install) + Chromium/Firefox/WebKit browsers + the Claude Code skill (`.claude/skills/playwright-cli`, project-scoped). Verified working: served the site locally on port 8080 (file:// URLs are blocked by the CLI) and screenshotted it — renders correctly. Found one minor issue: no favicon (404 on `favicon.ico`).
10. Installed GSAP 3.15.0 via CDN (SRI-pinned) in [index.html](index.html). Verified loading in a real browser (`gsap.version` → 3.15.0). No animations written yet — wired in only, per user's call.
11. Built 3 UI mockup iterations in Figma on the "Portfolio Ideations" page (file `uG8MdK8svbC6sa0wQ5kyIK`). Brief: red primary, frosted glass, premium/minimal, 6 work pieces directly after hero, custom cursor + hover states. Each iteration = one "Site UI" frame + one "Cursor & Hover States" frame, grouped in a Figma Section:
    - **Iteration 01 · Vault** — near-black `#0A0A0B`, vermilion `#E8402A`, Geist + Geist Mono. Asymmetric split hero with frosted-glass caption; bento work grid (rows of 2 / 3 / 1).
    - **Iteration 02 · Editorial** — cool paper `#EFEFED`, deep red `#C8102E`, Bricolage Grotesque + Geist. Typographic manifesto hero with filmstrip preview; staggered two-column work grid; full-bleed red contact block.
    - **Iteration 03 · Chroma** — `#08070A` with luminous `#FF3B2F`, Schibsted Grotesk + JetBrains Mono. Full-bleed chroma hero with floating glass nav + glass hero card; wave-offset three-column grid, glass caption on every tile.
12. **Iteration 04 · Signal** — built after user feedback on 01-03. Feedback was: no gradients; Bricolage Grotesque is good (especially heroes); keep Iteration 03's pill nav shape but swap its font to uppercase mono (refs: OkayDev nav + a pixel-mono nav); hero was "mid", make it poppier with Awwwards-style play; drop the bento grid for a normal grid. Result: paper `#F3F2EE` / ink `#111112` / signal red `#FF3B21`, entirely flat fills (verified 0 gradient fills in the frame). Bricolage ExtraBold hero at 104px with "REMEMBER" in red, JetBrains Mono uppercase pill nav, rotated "OPEN FOR Q1 2026" sticker badge, flat red panel, normal 3x2 poster-tile work grid, one marquee band, flat red contact block.
13. **Iteration 04 revised** after further feedback: nav reworked for a student portfolio (home icon slot marked as a placeholder for a custom icon TBD, links now WORK / ABOUT / RESUME); work cards changed from square to tall portrait (418x560) matching the user's sketch — mono category top-left, year top-right, big display name bottom-left, bordered tag chips, arrow bottom-right; full card hover state specced.
14. **Iteration 05 · Terminal** — dark `#0B0B0D`, mono-forward (JetBrains Mono for headlines too), square 2px radius, hairline grid rules, bracket nav notation (`WORK[1]`), blinking caret block in the hero, bracketed `[UI DESIGN]` tags. Technical/dev-student energy.
15. **Iteration 06 · Riso Press** — warm print paper `#F6F3E9`, near-black `#0A0A0A`, Archivo Black display, 2.5px borders and hard offset shadows (radius 0) throughout, pill tag chips, red highlight box around "REMEMBER". Neo-brutalist print-poster energy.
16. **Iteration 06 chosen as the direction.** Built out as a full multi-page site in Figma (section `Iteration 06 · Riso Press`):
    - **Home page** — hero, selected work grid, studio, contact, footer. Nav `WORK` is the active item because Selected Works is an anchor to the work section on Home, not its own page.
    - **About page** — header with portrait cutout, Skills chip cloud, Software 4x2 tile grid, Experience blocks (Accenture internship featured in red), Education, intern-focused contact CTA.
    - **Resume page** — header with contact chips and a Download PDF CTA, two-column body (Experience / Education / Selected Projects on the left; Skills / Software with proficiency / Languages on the right).
    - **Cursor & Hover States** frame updated to the new card.
    - **Card redesign per user feedback:** single non-red default (white `#FFFFFF`), no shadow at rest, with a bordered **thumbnail cutout** filling the middle as the project image slot. On hover the card fills red and a 10px hard shadow drops in. Bottom meta block is height-locked at 124px so every thumbnail is identical (385px).
    - **Clipping fixed:** audited every drop-shadowed node against its clipping ancestors, found 2 real clips (hero red "REMEMBER" box, contact CTA), set `clipsContent = false` on 121 auto-layout containers while preserving intentional clippers (thumbnails, portrait, home icon, page frames, full-bleed contact). Re-audit returns 0 issues.
17. Looked at (but did not install — it's not a plugin) `voltagent/awesome-design-md`: a reference library of ~100+ brand `DESIGN.md` style-guide files. Usage model: user picks a brand, we fetch that one file, I use it as a style spec. No action taken yet — waiting on user to pick a brand if they want this route for a future redesign.

18. **About page reworked to be personality-first (2026-09-06).** User's brief: lead with who they are, not a stacks-and-skills resume — movies, video games, cooking, drumming — and keep the factual blocks lower on the same page. Of the three concepts offered (Four Obsessions poster cards / The Personal Stack / Now Playing board), the user chose the **Now Playing board**.
    - Built as a new `Now Playing` section on the About page (node `2210:2`), inserted between `Header` and `Skills`, so the page order is now Nav / Header / **Now Playing** / Skills / Software / Experience / Education / Contact / Footer. About page height went 3251 → 4282.
    - Structure: red mono eyebrow `OFF THE CLOCK` + Archivo Black 44 title `WHAT I'M INTO RIGHT NOW`, then a full-width **ink `#0A0A0A` board panel** (node `2210:7`) — the only dark block on the page above the footer, which makes it the visual anchor.
    - Inside the board: a header strip (`◉ NOW PLAYING` in red, `UPDATED SEP 2026` right-aligned in muted mono), a hairline rule, four pinned cards, a second rule, and a through-line footer: `ALL FOUR ARE THE SAME SKILL — TIMING. I DESIGN THE WAY I PLAY.`
    - **Four cards** (552x240, radius 0, 9px hard offset shadow, slight rotations of −1.5°/+1.2°/+1.4°/−1.1°, each with a 14px pin dot straddling the top edge): `LAST WATCHED`, `CURRENTLY PLAYING`, `ON THE STOVE`, `LEARNING THIS GROOVE`. Three are white with red shadows; the drumming card is red-filled with a paper shadow as the accent. Card anatomy: mono label → Archivo Black 30 title → Geist 15 detail line → mono meta pinned to the bottom.
    - **The argument the page makes:** all four hobbies are timing-and-composition disciplines (editing, feedback loops, seasoning, tempo), so the section reads as a claim about how the user designs rather than a hobby list. Every card's detail line is written to land that point.
    - **Content is dummy and must be swapped** — currently Whiplash / Disco Elysium / Butter Chicken / Rosanna Shuffle. Needs the user's real specifics.
    - The `UPDATED SEP 2026` stamp is the deliberate answer to the board going stale: it dates the content honestly rather than pretending it is live. Refresh the cards every month or two.
    - Not built: hover states for these cards (suggested spec — rotation eases to 0° and the shadow grows on hover), and no entry was added to the `Cursor & Hover States` frame for them.

## In progress / not yet confirmed

- Waiting on user to confirm the Vercel deployment actually updated after the last push (deployment trigger looked correct on the git side; visual confirmation on Vercel dashboard/live URL still pending).

## Next up (not started)

- **Project Detail page BUILT** (2026-09-06) with dummy content, at x=4640 in the Iteration 06 section. Structure: back link, intro (project name, one-liner, ROLE / TIMELINE / TEAM / TOOLS meta strip, Download Case Study + View Live Site CTAs), full-width hero slot, "The Problem" two-column band, then case-study slides in a varied rhythm (full-width / two-up / red pull-quote band / full-width / two-up), "Where it landed" outcome trio, next-project card, contact CTA, footer. All slide slots are bordered image placeholders — swap in exported PDF pages. Clipping audit on this page returns 0.

  **Agreed direction (still stands):** own on-site project page, NOT an outbound Behance link (keeps the hirer on the site, preserves the design language, keeps the contact CTA in reach; Behance stays as a feeder that links back).

  **Important:** do NOT embed the PDF. Export each PDF page to an image and stack them full-width so the page scrolls naturally, and offer the original PDF as a "Download PDF" button alongside. Reasons: mobile browsers (iOS Safari especially) often refuse to render inline PDFs and show a blank box or force a download; embeds create nested scrolling; decks run 10-20MB which kills mobile load; PDF text is not selectable, indexable, or accessible inside an embed.

  **Page structure agreed:** (1) intro block — project name, one-line description, role / timeline / tools as chips reusing the existing tag component; (2) stacked slide images + Download PDF button; (3) one closing line on outcome or what they would change; (4) next-project card + contact CTA. User has PDFs ready for all 6 case studies.
- Iteration 06 is the chosen direction; iterations 01-05 remain on the page for reference only.
- Once pages are signed off, build the real site in HTML/CSS/JS (GSAP already wired into the repo).
- **About page personality rework — DONE (2026-09-06), see item 18.** The `Now Playing` board is built and in place. Remaining from the original five directions, still unbuilt and still viable as *additions* rather than replacements: (1) **annotated self-portrait** with Figma-inspect-style hotspot annotations — would pair well with the existing portrait slot in the Header; (2) **design opinions** as poster cards or sliders; (3) **scrollytelling chapters** with a GSAP-pinned transforming element (most premium, most expensive, easiest to get wrong — and would need a `prefers-reduced-motion` fallback); (4) **process honesty** showing rejected directions and messy first frames; (5) **micro-interaction layer** over the lower half (software tiles flip to show why each tool is used). The lead-with-personality-then-facts structure the advice called for is now actually in the page.
- Work tiles are placeholders, not real imagery — the Figma plugin API blocks `createImageAsync`, so real project images must be dropped in manually. In Iteration 04 the tiles are flat colour posters with the project name set inside, so they read as intentional even before real images land.
- Custom home icon still to be designed — every iteration has a placeholder icon slot in the nav, layer-named so it is easy to find.
- User's stated dislikes to respect going forward: **gradients** (audited: 0 gradient fills across iterations 04-06). User's stated likes: Bricolage Grotesque for display, uppercase mono nav labels, the pill nav shape, normal (non-bento) work grids, tall portrait work cards with tag chips, Awwwards-style playful detail.
- Context: this is a **student** portfolio. Nav is WORK / ABOUT / RESUME with a home icon; copy refers to the user as a design student.
- Replace all placeholder content (name is set; tagline, About text, Projects, Contact still placeholders).
- Add a favicon (currently 404s, caught by the Playwright tooling — cosmetic only).
- Write the actual GSAP animations once a design direction is chosen.

## Notes for future sessions

- Git identity for this repo is set locally (not global) — if committing from a different machine/environment, identity will need to be set again.
- Line-ending warning (LF→CRLF) appears on git operations on Windows; harmless, not yet addressed with a `.gitattributes` — could add one if it becomes noisy.
- Node.js is now installed globally on this machine (not project-specific) — available for any future JS tooling needs.
- To visually check the site with Playwright: serve it over local HTTP first (e.g. a quick Node static server on a port), since `file://` URLs are blocked by the CLI by default.

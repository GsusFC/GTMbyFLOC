<claude-mem-context>
# Memory Context

# [floc] recent context, 2026-05-25 11:47am GMT+2

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 39 obs (12,182t read) | 195,221t work | 94% savings

### May 24, 2026
3753 9:02a 🔵 Floc Project Structure at /Users/gsus/floc
3754 9:03a 🔵 Floc Frontend is a Static Site Served via Python HTTP Server
3755 " 🟣 Floc Landing Page Started Successfully on Port 3000
3764 9:28a 🔵 Landing Page Audit Requested from Claude Artifact
3772 9:31a 🔵 floc/frontend Project Structure Mapped
3773 " 🔵 baseline-ui Skill Defines Strict UI Constraints for floc
3775 9:32a 🔵 floc-landing.html Full Structure and Design System Mapped
3776 " 🔵 baseline-ui Violations Identified in floc-landing.html
3779 9:33a 🔵 Landing Page Infrastructure Confirmed: Python SimpleHTTP Dev Server, 63MB Unoptimized Video
3780 " 🔵 Booking System Uses LeadConnector (GoHighLevel) with Deferred iframe Load
3788 9:37a 🟣 Schedule CTA Now Triggers Calendar Execution
3806 4:14p 🔵 Line-height values mapped for all heading classes in floc-landing.html
3807 " ✅ Increased line-height on all heading classes in floc-landing.html
3808 4:15p 🔵 Residual line-height: .9 remains on a hero-h1 sub-rule at line 229
3827 4:22p ⚖️ Responsive Video: Picture-in-Picture (Floating) Behavior Requested
3839 4:26p 🔵 Floc Landing Page CSS Architecture
3840 " ✅ Landing Page Tablet Video: Inline → Fixed PiP Corner Widget
3843 " 🔵 Floc Landing Page Served via Python SimpleHTTP on localhost:3000
3844 4:27p 🔵 Headless Chrome Used for Visual QA of Landing Page at Mobile Widths
### May 25, 2026
3953 7:50a ⚖️ Landing Page UX: Evitar navegación externa en sección "Casos/Proyectos"
4000 9:18a 🟣 Portfolio Cases Slider with Full-Page Image Lightbox
4005 9:19a 🔵 wearefloc.com/work/charms is a Framer-published site with framerusercontent.com image CDN
S338 Build a proportional image slider with cover card and full-page lightbox for portfolio case pages on wearefloc.com (May 25 at 9:20 AM)
4013 9:21a 🔵 Node.js image manifest extraction script failed due to shell quoting parse error
4014 " 🔵 EPERM writing to frontend/public from JS REPL context
4017 9:22a 🟣 Project image manifest generated with 59 total images across 3 cases
4021 " 🔵 Node.js fetch cannot reach framerusercontent.com — DNS ENOTFOUND in execution sandbox
4022 9:23a 🔵 framerusercontent.com CDN is unreachable — DNS fails even via direct curl, not just Node fetch
4024 9:24a 🔵 Escalated sandbox permissions resolved framerusercontent.com DNS — image downloads now working
4025 " 🟣 All 59 case images downloaded locally to frontend/public/project-images/
4026 9:25a 🔵 Local image asset inventory verified: 59 files, 2.6MB total, no empty files
4028 " 🔵 Slider work targets public/floc-landing.html — already modified before new assets
4033 9:27a 🔵 Current project cards in floc-landing.html use fixed 1.9:1 aspect ratio with object-fit:cover cropping
4034 " 🔵 Projects section HTML structure mapped — existing cover images are separate files, not from manifest
4035 " 🔵 Project -01.png files are 512×512 logos despite manifest claiming 4000×4000 — scale-down-to=512 URL param applied
4037 9:28a 🟣 Slider and lightbox CSS added to floc-landing.html
4039 " 🔵 Residual .projects-grid class references remain in HTML markup and responsive CSS after slider CSS refactor
4040 " 🔴 Removed stale .projects-grid references from responsive CSS media queries
4042 9:29a 🟣 Project cards converted from anchor links to buttons with data-project-open attributes and slider shell added
4043 " 🟣 Lightbox HTML overlay added to floc-landing.html after footer

Access 195k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

# Responsive Breakpoints

Use this breakpoint system unless the project already defines another one.

## Breakpoints

- `xs`: 320px
- `sm`: 480px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1440px
- `3xl`: 1920px

## Design Rules

Build mobile-first.

Default styles must target mobile.

Use breakpoints only when the layout actually changes:

- navigation changes
- grid columns change
- content density changes
- spacing needs adjustment
- components become too wide or too compressed

Do not create unnecessary breakpoints.

Prefer fluid behavior between breakpoints using:

- `clamp()`
- CSS Grid
- `minmax()`
- flexible containers
- responsive spacing tokens

## Layout Interpretation

- `xs/sm`: mobile
- `md`: tablet
- `lg`: tablet landscape / small laptop
- `xl`: desktop
- `2xl`: large desktop
- `3xl`: wide / 2K screens

## Implementation

If using Tailwind, extend the theme screens as:

```ts
screens: {
  xs: "320px",
  sm: "480px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
  "3xl": "1920px",
}
```

If using CSS variables, define:

```css
:root {
  --bp-xs: 320px;
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1440px;
  --bp-3xl: 1920px;
}
```

## Validation

Before finishing responsive work, check:

- mobile at 375px
- tablet at 768px
- laptop at 1024px
- desktop at 1440px
- wide screen at 1920px

Avoid horizontal scroll unless it is intentional.

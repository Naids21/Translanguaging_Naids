[README.md](https://github.com/user-attachments/files/32602894/README.md)
# Translanguaging — Interactive Web Presentation

A responsive, motion-rich web presentation based on the provided **“Translanguaging as Pedagogical Strategy in Multilingual Classrooms”** PowerPoint. It is designed for classroom/projector use, phone viewing, and GitHub Pages deployment.

## What is included

- Step-by-step click/keyboard reveals rather than showing every point at once
- Smooth slide transitions and gentle ambient motion
- Touch/swipe navigation on phones and tablets
- Fullscreen mode
- Progress bar, slide counter, section menu, restart control
- Interactive benefits, strategy tabs, misconception flip cards, quizzes, and reflection prompt
- Separate **Presenter View** with current slide, next slide, speaker notes, and timer
- Responsive desktop, projector, tablet, portrait phone, and landscape phone layouts
- `prefers-reduced-motion` support and visible keyboard focus states
- Vector/CSS-first visuals to stay crisp on high-resolution displays
- Automatic GitHub Pages deployment workflow

## Install / run locally

There are **no third-party runtime or build dependencies**. Node.js 18+ is enough.

```bash
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The production files are created in `dist/`. The build script only copies the static HTML/CSS/JS assets, so the deck stays lightweight and deterministic.

## Publish on GitHub Pages

1. Create a GitHub repository and upload this project.
2. Keep the default branch named `main`.
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Push to `main`.
5. The included `.github/workflows/deploy.yml` builds the Vite project and publishes `dist/`.

All asset paths are relative, so the presentation works correctly from a GitHub Pages repository subdirectory.

## Presentation controls

- `→`, `Space`, or **Next**: reveal the next item; once all steps are visible, move to the next slide
- `←` or **Previous**: hide the previous reveal; then move to the previous slide
- `M`: open/close the section menu
- `F`: fullscreen
- `P`: open Presenter View
- Swipe left/right on touch screens to navigate

## Presenter View

Open the presentation, then press `P` or choose **Presenter**. A second window opens and syncs through `BroadcastChannel` (with local-storage fallback). Put the audience window on the projector and keep the presenter window on your own screen.

## Modify content

Most presentation content lives in `index.html` as semantic `<section class="slide">` blocks.

- Add `data-section` and `data-title` to each new slide.
- Add the class `step` to anything that should reveal progressively.
- Put speaker notes inside `<div class="speaker-notes">…</div>`; these remain hidden from the audience and appear in Presenter View.
- Interactive logic is in `src/main.js`.
- Visual design and responsive rules are in `src/styles.css`.

## Add another slide

Copy a slide block and place it before the closing `</main>` tag:

```html
<section class="slide" data-section="My Section" data-title="My new slide">
  <div class="slide-inner">
    <span class="kicker step">SECTION LABEL</span>
    <h2 class="section-title step">My new idea</h2>
    <p class="lead step">Supporting explanation.</p>
  </div>
  <div class="speaker-notes">Optional notes for Presenter View.</div>
</section>
```

The slide counter, progress bar, section menu, presenter sync, and keyboard navigation update automatically.

## Source-content integrity notes

The build preserves the source deck’s objectives, code-switching definition, translanguaging definition, benefits, five classroom strategies, misconceptions, classroom scenarios, PPST Domain 1 links, and reference list.

Two source scenario slides repeat the first scenario’s A–D answer set even though their speaker notes identify different strongest moves. In this web version, those two interactive answer sets were aligned to the **speaker-note rationales** rather than silently reproducing the duplicated options:

- Scenario 2 → **Multilingual Vocabulary Wall**
- Scenario 3 → **Flexible Peer Discussion**, followed by English synthesis

The source deck also cites **Najarro (2023), Morrison (2026), and Rajendram (2023)** in individual slides, but their full bibliography entries are not included on the provided reference slide. The web deck flags this on the references screen instead of inventing missing entries.

## Tech

HTML5 · CSS3 · JavaScript · a dependency-free Node build/server helper. No animation framework is required; transitions and motion are intentionally handled with lightweight CSS and vanilla JavaScript for fast loading and smooth performance on mid-range devices.

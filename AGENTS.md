# AGENTS.md - Obsidian Zoom Plugin

Guidelines for AI coding agents working on this fork of `vslinko/obsidian-zoom`.

## Project Overview

Obsidian community plugin that zooms into headings and lists by narrowing the visible editor content and providing navigation back out.

**Tech Stack:** TypeScript, Rollup, Jest, Obsidian Plugin API, Node.js, npm

## Build Commands

```bash
npm ci                # Install dependencies
npm run build         # Production bundle to main.js
npm run dev           # Watch mode bundle during development
npm run lint          # Prettier check + ESLint
npm run build-with-tests
npm test
```

Output: `main.js` in the repo root. Treat it as generated output.

## Project Structure

```text
src/
├── ObsidianZoomPlugin.ts           # Main plugin entry
├── ObsidianZoomPluginWithTests.ts  # Test-enabled bundle entry
├── features/                       # Plugin features and integrations
├── logic/                          # Pure zoom/selection/render logic
├── services/                       # Settings and logging services
└── utils/                          # Shared utilities

specs/                              # Markdown feature specs
jest/                               # Jest environment and helpers
```

## How This Plugin Works

`ObsidianZoomPlugin` in `src/ObsidianZoomPlugin.ts` is the bootstrapper. In `onload()` it creates `SettingsService` and `LoggerService`, instantiates the feature objects, and loads them. The public helpers `zoomIn`, `zoomOut`, `refreshZoom`, and `getZoomRange` all delegate into the central zoom feature.

- `ZoomFeature` is the main coordinator. It registers the core editor extension, exposes the zoom commands, and notifies other features after zoom in/out.
- `CalculateRangeForZooming` decides what span of the document should stay visible. It uses foldable heading/list ranges when available, and falls back to single-list-item handling for plain list lines.
- `KeepOnlyZoomedContentVisible` is the core hiding mechanism for markdown content. It uses a CodeMirror `StateField`, `Decoration.replace`, and `zoomInEffect` / `zoomOutEffect` to hide document text outside the selected range and to recover the visible range later.
- `HeaderNavigationFeature` adds the breadcrumb header shown while zoomed. It combines `CollectBreadcrumbs`, `RenderNavigationHeader`, and `DetectRangeBeforeVisibleRangeChanged` so the header appears after zoom in, disappears after zoom out, and refreshes when the visible range shifts.
- `LimitSelectionFeature` keeps cursor and selection behavior inside the visible area with `LimitSelectionOnZoomingIn` and `LimitSelectionWhenZoomedIn`.
- `ResetZoomWhenVisibleContentBoundariesViolatedFeature` watches edits through `DetectVisibleContentBoundariesViolation` and automatically zooms out if changes break the assumptions around the hidden/visible boundaries.
- `ZoomOnClickFeature` uses `DetectClickOnBullet` so clicking a list bullet can move the cursor and trigger zoom. `ListsStylesFeature` adds the CSS cues that make list bullets feel interactive.
- `ViewChromeVisibilityFeature` handles non-document UI around the editor, such as inline title, properties, backlinks, or plugin-injected elements. It uses `zoomVisibility.ts` plus settings from `SettingsService` to compile scoped CSS that hides matching elements only inside the active markdown leaf while zoomed.

## Coding Guidance

- Prefer minimal, behavior-focused changes.
- Keep `manifest.json` identity unchanged unless the user explicitly asks to rename the plugin.
- Do not hand-edit `main.js`; edit source under `src/` and rebuild.
- Reuse the existing feature, logic, and service separation instead of adding cross-cutting code paths.
- Follow existing TypeScript and test patterns in neighboring files before introducing new abstractions.
- When changing behavior described in `specs/`, keep implementation, tests, and spec text aligned.

## Validation Guidance

- For pure logic changes, run the most relevant Jest tests first.
- For broader behavior changes, run `npm test` after `npm run build-with-tests`.
- For plugin behavior changes, run `npm run build` or `npm run dev` and reload Obsidian to verify the plugin from the local `.obsidian/plugins/obsidian-zoom` folder.
- Keep lint clean with `npm run lint` when touching TypeScript source substantially.

## Fork Workflow Notes

- `origin` is the user-owned fork.
- `upstream` points to `vslinko/obsidian-zoom`.
- This repo is used as a local development plugin inside an Obsidian vault, so community-plugin auto-updates should not be relied on.

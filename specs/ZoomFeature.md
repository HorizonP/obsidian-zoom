# Zoom Feature

The zoom feature narrows the visible editor content to the current foldable section or list item so the active part of the note is easier to focus on.

## Behavior

When the cursor is inside a foldable heading or list section, zooming in keeps that section visible and hides the rest of the document.

If the cursor is on a list item that has no foldable children, zooming in still works by keeping that single list line visible.

When zooming into a nested list item, the plugin visually removes the shared leading indentation from the visible subtree so the top visible item renders like a top-level item. This is a presentation-only change and does not modify the document text, zoom range API, or selection coordinates.

If the visible list subtree changes while zoomed in, the shared indentation is recalculated so the dedented presentation stays correct.

If the cursor is on a heading that has no foldable content below it, zooming in still works by keeping that single heading line visible. This includes headings at the end of the document and headings immediately followed by another heading.

Zooming out restores the full document.

Zooming out also restores the normal indentation rendering.

# Zoom Feature

The zoom feature narrows the visible editor content to the current foldable section or list item so the active part of the note is easier to focus on.

## Behavior

When the cursor is inside a foldable heading or list section, zooming in keeps that section visible and hides the rest of the document.

If the cursor is on a list item that has no foldable children, zooming in still works by keeping that single list line visible.

If the cursor is on a heading that has no foldable content below it, zooming in still works by keeping that single heading line visible. This includes headings at the end of the document and headings immediately followed by another heading.

Zooming out restores the full document.

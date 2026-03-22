# Header Navigation Feature

The header navigation feature shows a breadcrumb trail for the current zoomed path so the user can see where they are and jump back out through parent sections.

## Behavior

When zoomed in, the breadcrumb row is centered within the editor chrome above the visible content.

Each breadcrumb item shows the display text of its source line rather than the raw markdown source. Heading markers, list markers, markdown links, wikilinks, inline images, bold, italic, strikethrough, highlight, and inline code syntax are removed before the breadcrumb text is rendered.

Long breadcrumb segments are visually truncated with an ellipsis so the header remains compact. Hovering a breadcrumb still reveals the full cleaned display text via the element tooltip.

Icons, heading-level badges, and click navigation behavior remain unchanged.

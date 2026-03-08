# View Chrome Visibility

This feature extends zoom mode with broader and more customizable hiding behavior. In addition to hiding markdown content outside the zoomed scope, it can also hide surrounding note UI inside the current markdown pane so the active section stays visually focused.

When enabled, the feature can optionally hide the note title, file properties, and embedded backlinks while zoomed in. It also supports custom CSS selectors so plugin-added panels or other non-standard interface elements can be hidden in the same way.

## Behavior

When the user zooms in, the plugin can hide selected pane chrome inside the active markdown leaf only. When the user zooms out, that hiding is removed from the leaf.

The feature currently supports these built-in targets:

- `.inline-title`
- `.metadata-container`
- `.embedded-backlinks`

Users can also provide custom CSS selectors. The plugin scopes them to the active markdown leaf before applying `display: none !important`.

## Settings

Defaults:

```json
{
  "hideInlineTitle": false,
  "hideProperties": false,
  "hideEmbeddedBacklinks": false,
  "customHiddenSelectors": []
}
```

Normalization rules for `customHiddenSelectors`:

- Split textarea input by line
- Trim whitespace
- Drop empty lines
- Remove duplicates while preserving first occurrence

## Scope And Updates

The hiding is scoped to the active markdown pane being zoomed. It does not apply globally across the workspace.

If the user changes any visibility setting while already zoomed in, the pane updates immediately without requiring a zoom-out and re-zoom cycle.

If all selectors are disabled or invalid, the plugin removes the zoom-specific root marker and does not leave empty scoped CSS behind.

## Invalid Selectors

Custom selectors that are not valid CSS selectors are ignored when scoped CSS is compiled. They are logged through the plugin logger, but they do not fail zooming or disable other valid selectors.

## Example

If the user enables:

```json
{
  "hideInlineTitle": true,
  "hideProperties": true,
  "hideEmbeddedBacklinks": false,
  "customHiddenSelectors": [
    ".my-plugin-panel"
  ]
}
```

then zooming in hides:

- `.inline-title`
- `.metadata-container`
- `.my-plugin-panel`

and zooming out restores them.

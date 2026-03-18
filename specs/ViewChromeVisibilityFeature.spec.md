# Should keep view chrome visible by default

- applySettings:

```json
{
  "hideInlineTitle": false,
  "hideProperties": false,
  "hideEmbeddedBacklinks": false,
  "customHiddenSelectors": []
}
```

- applyState:

```md
# Heading|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertViewChrome:

```json
{
  "active": false,
  "rootAttrPresent": false,
  "rootClassPresent": false,
  "selectors": []
}
```

# Should hide configured built-in chrome while zoomed in

- applySettings:

```json
{
  "hideInlineTitle": true,
  "hideProperties": true,
  "hideEmbeddedBacklinks": true,
  "customHiddenSelectors": []
}
```

- applyState:

```md
# Heading|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertViewChrome:

```json
{
  "active": true,
  "rootAttrPresent": true,
  "rootClassPresent": true,
  "selectors": [
    ".inline-title",
    ".metadata-container",
    ".embedded-backlinks"
  ]
}
```

# Should include custom selectors while zoomed in

- applySettings:

```json
{
  "hideInlineTitle": true,
  "hideProperties": false,
  "hideEmbeddedBacklinks": false,
  "customHiddenSelectors": [
    ".custom-pane",
    ".metadata-container",
    ".custom-pane"
  ]
}
```

- applyState:

```md
# Heading|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertViewChrome:

```json
{
  "active": true,
  "rootAttrPresent": true,
  "rootClassPresent": true,
  "selectors": [
    ".inline-title",
    ".custom-pane",
    ".metadata-container"
  ]
}
```

# Should clear view chrome hiding when zooming out

- applySettings:

```json
{
  "hideInlineTitle": true,
  "hideProperties": true,
  "hideEmbeddedBacklinks": false,
  "customHiddenSelectors": []
}
```

- applyState:

```md
# Heading|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertViewChrome:

```json
{
  "active": true,
  "rootAttrPresent": true,
  "rootClassPresent": true,
  "selectors": [
    ".inline-title",
    ".metadata-container"
  ]
}
```

- execute: `enhanced-zoom:zoom-out`
- assertViewChrome:

```json
{
  "active": false,
  "rootAttrPresent": false,
  "rootClassPresent": false,
  "selectors": []
}
```

# Should update visible chrome configuration while already zoomed in

- applySettings:

```json
{
  "hideInlineTitle": true,
  "hideProperties": false,
  "hideEmbeddedBacklinks": false,
  "customHiddenSelectors": []
}
```

- applyState:

```md
# Heading|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertViewChrome:

```json
{
  "active": true,
  "rootAttrPresent": true,
  "rootClassPresent": true,
  "selectors": [
    ".inline-title"
  ]
}
```

- applySettings:

```json
{
  "hideInlineTitle": false,
  "hideProperties": true,
  "hideEmbeddedBacklinks": false,
  "customHiddenSelectors": [
    ".custom-pane"
  ]
}
```

- assertViewChrome:

```json
{
  "active": true,
  "rootAttrPresent": true,
  "rootClassPresent": true,
  "selectors": [
    ".metadata-container",
    ".custom-pane"
  ]
}
```

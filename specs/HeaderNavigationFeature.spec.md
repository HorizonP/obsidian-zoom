# Should render cleaned breadcrumb text for markdown headings

- applyState:

```md
# [[Parent]]

## [Display Child](https://example.com)|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertHeader:

```json
{
  "active": true,
  "justifyContent": "center",
  "paddingTop": "0px",
  "items": [
    {
      "text": "test",
      "title": "test",
      "kind": "root",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Parent",
      "title": "Parent",
      "headingLevel": "1",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Display Child",
      "title": "Display Child",
      "headingLevel": "2",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    }
  ]
}
```

# Should expose cleaned tooltip text for inline markdown formatting

- applyState:

```md
# ==Highlighted Parent==

## `Current Section`|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertHeader:

```json
{
  "active": true,
  "justifyContent": "center",
  "paddingTop": "0px",
  "items": [
    {
      "text": "test",
      "title": "test",
      "kind": "root",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Highlighted Parent",
      "title": "Highlighted Parent",
      "headingLevel": "1",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Current Section",
      "title": "Current Section",
      "headingLevel": "2",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    }
  ]
}
```

# Should center the breadcrumb row and keep truncation styles for long titles

- applyState:

```md
# Parent Section With A Very Long Display Title

## Child Section With Another Extremely Long Display Title|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertHeader:

```json
{
  "active": true,
  "justifyContent": "center",
  "paddingTop": "0px",
  "items": [
    {
      "text": "test",
      "title": "test",
      "kind": "root",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Parent Section With A Very Long Display Title",
      "title": "Parent Section With A Very Long Display Title",
      "headingLevel": "1",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Child Section With Another Extremely Long Display Title",
      "title": "Child Section With Another Extremely Long Display Title",
      "headingLevel": "2",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    }
  ]
}
```

# Should offset the breadcrumb below the phone safe area while keeping it centered

- applyTestEnvironment:

```json
{
  "bodyClasses": ["is-phone"],
  "cssVariables": {
    "--safe-area-inset-top": "32px"
  }
}
```

- applyState:

```md
# Parent

## Child|

text
```

- execute: `enhanced-zoom:zoom-in`
- assertHeader:

```json
{
  "active": true,
  "justifyContent": "center",
  "paddingTop": "32px",
  "items": [
    {
      "text": "test",
      "title": "test",
      "kind": "root",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Parent",
      "title": "Parent",
      "headingLevel": "1",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    },
    {
      "text": "Child",
      "title": "Child",
      "headingLevel": "2",
      "kind": "heading",
      "textOverflow": "ellipsis",
      "whiteSpace": "nowrap",
      "overflow": "hidden",
      "maxInlineSize": "24ch"
    }
  ]
}
```

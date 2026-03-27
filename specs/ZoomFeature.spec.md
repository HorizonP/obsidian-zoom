# Should zoom in

- applyState:

```md
text

# 1

text

## 1.1|

text

# 2

text
```

- execute: `enhanced-zoom:zoom-in`
- assertState:

```md
text #hidden
 #hidden
# 1 #hidden
 #hidden
text #hidden
 #hidden
## 1.1|

text

# 2 #hidden
 #hidden
text #hidden
```

# Should zoom out

- applyState:

```md
text

# 1

text

## 1.1|

text

# 2

text
```

- execute: `enhanced-zoom:zoom-in`
- execute: `enhanced-zoom:zoom-out`
- assertState:

```md
text

# 1

text

## 1.1|

text

# 2

text
```

# Should zoom into empty heading at end of doc

- applyState:

```md
text

# Empty|
```

- execute: `enhanced-zoom:zoom-in`
- assertState:

```md
text #hidden
 #hidden
# Empty|
```

# Should zoom into empty heading between headings

- applyState:

```md
# First
## Second|
# Third
```

- execute: `enhanced-zoom:zoom-in`
- assertState:

```md
# First #hidden
## Second|
# Third #hidden
```

# Should remove shared indentation when zooming into a nested list item

- applyState:

```md
- Parent
  - Child|
    - Grandchild
```

- execute: `enhanced-zoom:zoom-in`
- assertState:

```md
- Parent #hidden
  - Child|
    - Grandchild
```

- assertSharedIndentation:

```json
{
  "active": true,
  "sharedPrefix": "  "
}
```

# Should recalculate shared indentation after editing children while zoomed in

- applyState:

```md
- Parent
  - Child|
    - Grandchild
```

- execute: `enhanced-zoom:zoom-in`
- keydown: `Enter`
- replaceSelection: `New Child`
- assertState:

```md
- Parent #hidden
  - Child
  - New Child|
    - Grandchild
```

- assertSharedIndentation:

```json
{
  "active": true,
  "sharedPrefix": "  "
}
```

# Should clear shared indentation when zooming out

- applyState:

```md
- Parent
  - Child|
    - Grandchild
```

- execute: `enhanced-zoom:zoom-in`
- assertSharedIndentation:

```json
{
  "active": true,
  "sharedPrefix": "  "
}
```

- execute: `enhanced-zoom:zoom-out`
- assertSharedIndentation:

```json
{
  "active": false,
  "sharedPrefix": ""
}
```

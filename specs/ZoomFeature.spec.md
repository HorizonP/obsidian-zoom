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

### Single pages
```
export default () => html`...`
```

### Multiple pages

```
export default () => [
  {
    path: 'path-segment-1',
    html: html`...`
  },
  {
    path: 'path-segment-2',
    html: html`...`
  }
  ...
]
```

## Setup

```bash
npm install -g orison
orison init my-project
cd my-project
npm install

# Build the /src directory into the /docs directory
npx orison build

# Serve the files from the /docs directory
npx orison static

# Your new website is available at localhost:3000
```

You can also serve your changes live without needing to rebuild with the serve command:

```bash
# Build the html files on the fly from the /src directory
npx orison serve
```

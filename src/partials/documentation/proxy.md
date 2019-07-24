## Local Development Proxies

During local development you might need a proxy so that you can integrate with other APIs without running into CORS errors. This is quite simple to setup. For example say you are using Netlify Functions and have them running locally on localhost:9000 but are running the Orison development server on localhost:3000. To setup a proxy so that you can make relative url requests from your client side JavaScript do the following:

#### /build.js
```js
const proxy = require('express-http-proxy');
const { OrisonServer } = require('orison');

const server = new OrisonServer({ rootPath: process.cwd() });
server.app.use('/.netlify/functions/', proxy('http://localhost:9000/.netlify/functions/'));
```

Now, from your JavaScript in the browser you can use fetch as if Netlify Functions was running on localhost:3000. These requests will go to localhost:3000 and then be proxied to the local Netlify Functions server.

```js
fetch('/.netlify/functions/yourCustomLambdaFunction');
```

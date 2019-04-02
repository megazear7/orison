const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// TODO watch for all index.html files not just the top level one.
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../docs/index.html'));
});

app.use(express.static('docs'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

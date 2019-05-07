const { OrisonGenerator } = require('./bin/orison.js');
const orisonGenerator = new OrisonGenerator({ rootPath: __dirname });

console.log('INCOMING_HOOK_BODY', process.env.INCOMING_HOOK_BODY);

orisonGenerator.build();

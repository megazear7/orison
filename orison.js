import { OrisonGenerator, OrisonServer, OrisonStaticServer } from './bin/orison.js'

if (process.argv.includes('--build')) (new OrisonGenerator({ rootPath: __dirname })).build();
if (process.argv.includes('--serve')) (new OrisonServer(__dirname)).start();
if (process.argv.includes('--static')) (new OrisonStaticServer()).start();

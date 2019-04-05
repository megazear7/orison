import { OrisonGenerator } from './bin/orison.js'

const orison = new OrisonGenerator({ rootPath: __dirname });

orison.build();

# Builder Box Logger
This package handles everything related to the logging of the Framework Builder Box

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/ElMijo/builder-box-logger/blob/master/LICENSE) [![Build Status](https://travis-ci.com/ElMijo/builder-box-logger.svg?branch=master)](https://travis-ci.com/ElMijo/builder-box-logger) [![Coverage Status](https://coveralls.io/repos/github/ElMijo/builder-box-logger/badge.svg?branch=master)](https://coveralls.io/github/ElMijo/builder-box-logger?branch=master) [![codecov](https://codecov.io/gh/ElMijo/builder-box-logger/branch/master/graph/badge.svg)](https://codecov.io/gh/ElMijo/builder-box-logger) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![dependencies Status](https://david-dm.org/ElMijo/builder-box-logger/status.svg)](https://david-dm.org/ElMijo/builder-box-logger) [![devDependencies Status](https://david-dm.org/ElMijo/builder-box-logger/dev-status.svg)](https://david-dm.org/ElMijo/builder-box-logger?type=dev) [![peerDependencies Status](https://david-dm.org/ElMijo/builder-box-logger/peer-status.svg)](https://david-dm.org/ElMijo/builder-box-logger?type=peer) 


## Install
```bash
yarn add @builderbox/logger
```
or 

```bash
npm install --save @builderbox/logger
```

## Quick start

You have to init a Logger object and you can use all winston transporter
```javascript
const { transports } = require('winston')
const { Logger } = new require('./lib/logger')
const logger = new Logger([ new transports.Console() ])

logger.debug("test one...")
logger.info("testing two...")
logger.warn("testing three...")
logger.error("testing four...")
```
then this is the result

```bash
[2020-09-15 10:24:22] DEBUG test one... {}
[2020-09-15 10:24:22] INFO testing two... {}
[2020-09-15 10:24:22] WARN testing three... {}
[2020-09-15 10:24:22] ERROR testing four... {}
```
You can add all the context that you need
```javascript
logger.error("testing five...", {any: 'any value', obj : {}, arr: [1,2,3]})
```
And then..
```bash
[2020-09-15 10:30:00] ERROR testing five... {"any":"any value","obj":{},"arr":[1,2,3]}
```
Log exceptions as principal content

```javascript
logger.error("testing five...", {any: 'any value', obj : {}, arr: [1,2,3]})
```
Then...
```bash
[2020-09-15 10:38:25] ERROR Error: Something is wrong in test six {"any":"any value","obj":{},"arr":[1,2,3],"exception":{"message":"Error: Something is wrong in test six","trace":["Object.<anonymous> (/absolute/path/file.js:11:14)","Module._compile (internal/modules/cjs/loader.js:1137:30)","Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)","Module.load (internal/modules/cjs/loader.js:985:32)","Function.Module._load (internal/modules/cjs/loader.js:878:14)","Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)","internal/main/run_main_module.js:17:47"]}}
```
Or you can log exception as e context

```javascript
logger.error("testing seven...", new Error('Something is wrong'))
```
```bash
[2020-09-15 10:33:44] ERROR testing seven... {"exception":{"message":"Error: Something is wrong","trace":["Object.<anonymous> (/absolute/path/file.js:12:34)","Module._compile (internal/modules/cjs/loader.js:1137:30)","Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)","Module.load (internal/modules/cjs/loader.js:985:32)","Function.Module._load (internal/modules/cjs/loader.js:878:14)","Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)","internal/main/run_main_module.js:17:47"]}}
```

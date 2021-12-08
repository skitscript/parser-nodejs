# Skitscript Parser (NodeJS) [![Continuous Integration](https://github.com/skitscript/parser-nodejs/workflows/Continuous%20Integration/badge.svg)](https://github.com/skitscript/parser-nodejs/actions) [![License](https://img.shields.io/github/license/skitscript/parser-nodejs.svg)](https://github.com/skitscript/parser-nodejs/blob/master/license) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/) [![npm](https://img.shields.io/npm/v/skitscript/parser-nodejs.svg)](https://www.npmjs.com/package/skitscript/parser-nodejs) [![npm type definitions](https://img.shields.io/npm/types/skitscript/parser-nodejs.svg)](https://www.npmjs.com/package/skitscript/parser-nodejs)

A Skitscript document parser targeting NodeJS.

## Installation

### Dependencies

This is a NPM package.  It targets NodeJS 16.11.1 or newer on the following
operating systems:

- Ubuntu 20.04
- Ubuntu 18.04
- macOS 11 (Big Sur)
- macOS 10.15 (Catalina)
- Windows Server 2022
- Windows Server 2019
- Windows Server 2016

It is likely also possible to use this package as part of a web browser
application through tools such as [webpack](https://webpack.js.org/).  This has
not been tested, however.

### Install as a runtime dependency

If your application uses this as a runtime dependency, install it like any other
NPM package:

```bash
npm install --save @skitscript/parser-nodejs
```

Additionally install the types package:

```bash
npm install --save-dev @skitscript/types-nodejs
```

### Install `@skitscript/types-nodejs` as a peer dependency

If you are developing a package with includes types from
`@skitscript/types-nodejs` in its public API, additionally install it as a peer
dependency so that consumers of your package know to include it as well:

```bash
npm install --save-peer @skitscript/types-nodejs
```

### Install as a development dependency

If this is used when building your application and not at runtime, install it as
a development dependency:

```bash
npm install --save-dev @skitscript/parser-nodejs @skitscript/types-nodejs
```

## Usage

Import the `parse` function, and provide it with a string containing your
document's content:

```typescript
import { parse } from "@skitscript/parser-nodejs";

const parsed = parse(documentContentString);

console.log(parsed);
```

```json
{
  "events": [
    ...
  ]
}
```

# Skitscript Parser (NodeJS) [![Continuous Integration](https://github.com/skitscript/parser-nodejs/workflows/Continuous%20Integration/badge.svg)](https://github.com/skitscript/parser-nodejs/actions) [![License](https://img.shields.io/github/license/skitscript/parser-nodejs.svg)](https://github.com/skitscript/parser-nodejs/blob/master/license) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/) [![npm](https://img.shields.io/npm/v/@skitscript/parser-nodejs.svg)](https://www.npmjs.com/package/@skitscript/parser-nodejs) [![npm type definitions](https://img.shields.io/npm/types/@skitscript/parser-nodejs.svg)](https://www.npmjs.com/package/@skitscript/parser-nodejs)

A Skitscript document parser targeting NodeJS.

## Installation

### Dependencies

This is a NPM package.  It targets NodeJS 20.14.0 or newer on the following
operating systems:

- Ubuntu 22.04
- Ubuntu 20.04
- macOS 13 (Ventura)
- macOS 12 (Monterey)
- macOS 11 (Big Sur)
- Windows Server 2022
- Windows Server 2019

It is likely also possible to use this package as part of a web browser
application through tools such as [webpack](https://webpack.js.org/).  This has
not been tested, however.

### Install as a runtime dependency

If your application uses this as a runtime dependency, install it like any other
NPM package:

```bash
npm install --save @skitscript/parser-nodejs
```

### Install as a development dependency

If this is used when building your application and not at runtime, install it as
a development dependency:

```bash
npm install --save-dev @skitscript/parser-nodejs
```

## Usage

### Validating identifiers

Import the `identifierIsValid` function, and provide it with a string containing
a possible identifier:

```typescript
import { identifierIsValid } from "@skitscript/parser-nodejs";

console.log(identifierIsValid(`Example Identifier`));
console.log(identifierIsValid(`???`));
```

```
true
false
```

### Parsing documents

Import the `parse` function, and provide it with a string containing your
document's content:

```typescript
import { parse } from "@skitscript/parser-nodejs";

const parsed = parse(documentContentString);

console.log(parsed);
```

```json
{
  "type": "valid",
  "instructions": [
    ...
  ],
  "warnings": [
    ...
  ],
  "identifierInstances": [
    ...
  ]
}
```

```json
{
  "type": "invalid",
  "errors": [
    ...
  ],
  "warnings": [
    ...
  ],
  "identifierInstances": [
    ...
  ]
}
```

### Types

A comprehensive library of types representing the results of attempting to parse
documents can be imported:

```typescript
import { Document } from "@skitscript/parser-nodejs";
```

#### Documents

- [Document](./Document/index.ts)
- [InvalidDocument](./InvalidDocument/index.ts)
- [ValidDocument](./ValidDocument/index.ts)

#### Instructions

- [ClearInstruction](./ClearInstruction/index.ts)
- [EmoteInstruction](./EmoteInstruction/index.ts)
- [EntryAnimationInstruction](./EntryAnimationInstruction/index.ts)
- [ExitAnimationInstruction](./ExitAnimationInstruction/index.ts)
- [Instruction](./Instruction/index.ts)
- [JumpInstruction](./JumpInstruction/index.ts)
- [LabelInstruction](./LabelInstruction/index.ts)
- [LineInstruction](./LineInstruction/index.ts)
- [LocationInstruction](./LocationInstruction/index.ts)
- [MenuOptionInstruction](./MenuOptionInstruction/index.ts)
- [SetInstruction](./SetInstruction/index.ts)
- [SpeakerInstruction](./SpeakerInstruction/index.ts)

##### Formatting

- [Formatted](./Formatted/index.ts)
- [Run](./Run/index.ts)

##### Conditions

- [Condition](./Condition/index.ts)
- [EveryFlagClearCondition](./EveryFlagClearCondition/index.ts)
- [EveryFlagSetCondition](./EveryFlagSetCondition/index.ts)
- [FlagClearCondition](./FlagClearCondition/index.ts)
- [FlagSetCondition](./FlagSetCondition/index.ts)
- [SomeFlagsClearCondition](./SomeFlagsClearCondition/index.ts)
- [SomeFlagsSetCondition](./SomeFlagsSetCondition/index.ts)

#### Identifiers

- [Identifier](./Identifier/index.ts)
- [IdentifierContext](./IdentifierContext/index.ts)
- [IdentifierInstance](./IdentifierInstance/index.ts)
- [IdentifierReference](./IdentifierReference/index.ts)
- [IdentifierType](./IdentifierType/index.ts)

#### Warnings

- [DuplicateIdentifierInListWarning](./DuplicateIdentifierInListWarning/index.ts)
- [EmptyLabelWarning](./EmptyLabelWarning/index.ts)
- [FlagNeverReferencedWarning](./FlagNeverReferencedWarning/index.ts)
- [FlagNeverSetWarning](./FlagNeverSetWarning/index.ts)
- [InconsistentIdentifierWarning](./InconsistentIdentifierWarning/index.ts)
- [UnreachableWarning](./UnreachableWarning/index.ts)
- [UnreferencedLabelWarning](./UnreferencedLabelWarning/index.ts)
- [Warning](./Warning/index.ts)

#### Errors

- [DuplicateLabelError](./DuplicateLabelError/index.ts)
- [Error](./Error/index.ts)
- [IncompleteEscapeSequenceError](./IncompleteEscapeSequenceError/index.ts)
- [InvalidEscapeSequenceError](./InvalidEscapeSequenceError/index.ts)
- [UndefinedLabelError](./UndefinedLabelError/index.ts)
- [UnparsableError](./UnparsableError/index.ts)
- [UnterminatedBoldError](./UnterminatedBoldError/index.ts)
- [UnterminatedCodeError](./UnterminatedCodeError/index.ts)
- [UnterminatedItalicError](./UnterminatedItalicError/index.ts)

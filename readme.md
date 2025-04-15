# Skitscript Parser (NodeJS) [![Continuous Integration](https://github.com/skitscript/parser-nodejs/workflows/Continuous%20Integration/badge.svg)](https://github.com/skitscript/parser-nodejs/actions) [![License](https://img.shields.io/github/license/skitscript/parser-nodejs.svg)](https://github.com/skitscript/parser-nodejs/blob/master/license) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/) [![npm](https://img.shields.io/npm/v/@skitscript/parser-nodejs.svg)](https://www.npmjs.com/package/@skitscript/parser-nodejs) [![npm type definitions](https://img.shields.io/npm/types/@skitscript/parser-nodejs.svg)](https://www.npmjs.com/package/@skitscript/parser-nodejs)

A Skitscript document parser targeting NodeJS.

## Installation

### Dependencies

This is a NPM package.  It targets NodeJS 20.14.0 or newer on the following
operating systems:

- Ubuntu 22.04
- Ubuntu 20.04
- macOS 13 (Ventura)
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

Import the `start`, `append` and `end` functions and feed the parser one
character at a time:

```typescript
import { start, append, end } from "@skitscript/parser-nodejs";

const parser = start();
append(parser, 'h');
append(parser, 'e');
append(parser, 'l');
append(parser, 'l');
append(parser, 'o');
const parsed = end(parser);

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

- [Document](./Document)
- [InvalidDocument](./InvalidDocument)
- [ValidDocument](./ValidDocument)

#### Instructions

- [ClearInstruction](./ClearInstruction)
- [EmoteInstruction](./EmoteInstruction)
- [EntryAnimationInstruction](./EntryAnimationInstruction)
- [ExitAnimationInstruction](./ExitAnimationInstruction)
- [Instruction](./Instruction)
- [JumpInstruction](./JumpInstruction)
- [LabelInstruction](./LabelInstruction)
- [LineInstruction](./LineInstruction)
- [LocationInstruction](./LocationInstruction)
- [MenuOptionInstruction](./MenuOptionInstruction)
- [SetInstruction](./SetInstruction)
- [SpeakerInstruction](./SpeakerInstruction)

##### Formatting

- [Formatted](./Formatted)
- [Run](./Run)

##### Conditions

- [Condition](./Condition)
- [EveryFlagClearCondition](./EveryFlagClearCondition)
- [EveryFlagSetCondition](./EveryFlagSetCondition)
- [FlagClearCondition](./FlagClearCondition)
- [FlagSetCondition](./FlagSetCondition)
- [SomeFlagsClearCondition](./SomeFlagsClearCondition)
- [SomeFlagsSetCondition](./SomeFlagsSetCondition)

#### Identifiers

- [Identifier](./Identifier)
- [IdentifierContext](./IdentifierContext)
- [IdentifierInstance](./IdentifierInstance)
- [IdentifierReference](./IdentifierReference)
- [IdentifierType](./IdentifierType)

#### Warnings

- [DuplicateIdentifierInListWarning](./DuplicateIdentifierInListWarning)
- [EmptyLabelWarning](./EmptyLabelWarning)
- [FlagNeverReferencedWarning](./FlagNeverReferencedWarning)
- [FlagNeverSetWarning](./FlagNeverSetWarning)
- [InconsistentIdentifierWarning](./InconsistentIdentifierWarning)
- [UnreachableWarning](./UnreachableWarning)
- [UnreferencedLabelWarning](./UnreferencedLabelWarning)
- [Warning](./Warning)

#### Errors

- [DuplicateLabelError](./DuplicateLabelError)
- [Error](./Error)
- [IncompleteEscapeSequenceError](./IncompleteEscapeSequenceError)
- [InvalidEscapeSequenceError](./InvalidEscapeSequenceError)
- [UndefinedLabelError](./UndefinedLabelError)
- [UnparsableError](./UnparsableError)
- [UnterminatedBoldError](./UnterminatedBoldError)
- [UnterminatedCodeError](./UnterminatedCodeError)
- [UnterminatedItalicError](./UnterminatedItalicError)

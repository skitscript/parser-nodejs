import type {
  Condition,
  Document,
  Instruction,
  Warning,
  Formatted,
  Identifier,
  IdentifierReference,
  Run,
  Error,
} from "@skitscript/types-nodejs";

const identifierFilteredCharacterRegexFragment = `!?'"{}@*/\\\\&#%\`+<=>|$.-`;

const identifierFilteredCharacterRegex = new RegExp(
  `[${identifierFilteredCharacterRegexFragment}]`,
  `ig`
);

const identifierDisallowedWords = [
  `and`,
  `or`,
  `when`,
  `not`,
  `is`,
  `are`,
  `enters`,
  `enter`,
  `exits`,
  `exit`,
  `leads`,
  `to`,
  `set`,
  `clear`,
  `jump`,
];

const identifierDisallowedCharacters = [`,`, `(`, `)`, `\\s`, `:`, `~`];

const identifierRegexFragment = `(?=.*[^${identifierFilteredCharacterRegexFragment}\\s].*)(?:(?!(?:${identifierDisallowedWords.join(
  `|`
)})\\b)[^${identifierDisallowedCharacters.join(
  ``
)}]+)(?:\\s+(?!(?:${identifierDisallowedWords.join(
  `|`
)})\\b)[^${identifierDisallowedCharacters.join(``)}]+)*`;

const identifierListRegexFragmentFactory = (
  binaryOperators: ReadonlyArray<string>
): string =>
  `(?:(${identifierRegexFragment}(?:\\s*,\\s*${identifierRegexFragment})*)(\\s+)(${binaryOperators.join(
    `|`
  )})(\\s+))?(${identifierRegexFragment})`;

const identifierListAtLeastTwoRegexFragmentFactory = (
  binaryOperators: ReadonlyArray<string>
): string =>
  `(${identifierRegexFragment}(?:\\s*,\\s*${identifierRegexFragment})*)(\\s+)(${binaryOperators.join(
    `|`
  )})(\\s+)(${identifierRegexFragment})`;

const locationRegex = new RegExp(
  `^(location\\s*:\\s*)(${identifierRegexFragment})\\s*\\.\\s*$`,
  `i`
);

const singleCharacterEntryAnimationRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+enters\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  `i`
);

const multiCharacterEntryAnimationRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    `and`,
  ])}(\\s+enter\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  `i`
);

const singleCharacterExitAnimationRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+exits\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  `i`
);

const multiCharacterExitAnimationRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    `and`,
  ])}(\\s+exit\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  `i`
);

const speakerRegex = new RegExp(
  `^${identifierListRegexFragmentFactory([
    `and`,
  ])}(?:(\\s*\\(\\s*)(${identifierRegexFragment})\\s*\\))?\\s*\\:\\s*$`,
  `i`
);

const singleCharacterEmoteRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+is\\s+)(${identifierRegexFragment})\\s*\\.\\s*$`,
  `i`
);

const multiCharacterEmoteRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    `and`,
  ])}(\\s+are\\s+)(${identifierRegexFragment})\\s*\\.\\s*$`,
  `i`
);

const labelRegex = new RegExp(
  `^(\\s*~\\s*)(${identifierRegexFragment})\\s*~\\s*$`,
  `i`
);

const conditionRegexFragment = `(?:(\\s+when\\s+)(not\\s+)?${identifierListRegexFragmentFactory(
  [`and`, `or`]
)})?`;

const formattedRegexFragment = `\\S.*\\S|\\S`;

const menuOptionRegex = new RegExp(
  `^(>\\s*)(${formattedRegexFragment})(\\s+leads\\s+to\\s+)(${identifierRegexFragment})${conditionRegexFragment}\\s*\\.\\s*$`,
  `i`
);

const lineRegex = new RegExp(`^(\\s+)(${formattedRegexFragment})\\s*$`, `i`);

const setRegex = new RegExp(
  `^(set\\s+)${identifierListRegexFragmentFactory([`and`])}\\s*\\.\\s*$`,
  `i`
);

const clearRegex = new RegExp(
  `^(clear\\s+)${identifierListRegexFragmentFactory([`and`])}\\s*\\.\\s*$`,
  `i`
);

const jumpRegex = new RegExp(
  `^(jump\\s+to\\s+)(${identifierRegexFragment})${conditionRegexFragment}\\s*\\.\\s*$`,
  `i`
);

type IdentifierType =
  | `character`
  | `emote`
  | `entryAnimation`
  | `exitAnimation`
  | `label`
  | `flag`
  | `background`;

type IdentifierInstance = {
  readonly first: IdentifierReference;
  reportedInconsistent: boolean;
};

type Reachability =
  | `reachable`
  | `willBecomeUnreachableAtEndOfCurrentMenu`
  | `firstUnreachable`
  | `unreachable`;

/**
 * Parses a Skitscript document from source.
 * @param source The Skitscript source to parse.
 * @returns      The parsed document.
 */
export const parse = (source: string): Document => {
  const identifiers: {
    readonly [TIdentifierType in IdentifierType]: {
      [normalized: string]: IdentifierInstance;
    };
  } = {
    character: {},
    emote: {},
    entryAnimation: {},
    exitAnimation: {},
    label: {},
    flag: {},
    background: {},
  };

  const normalizeIdentifier = (
    fromColumn: number,
    verbatim: string
  ): Identifier => {
    return {
      verbatim,
      normalized: verbatim
        .toLowerCase()
        .replace(identifierFilteredCharacterRegex, ` `)
        .trim()
        .replace(/\s+/g, `-`),
      fromColumn: fromColumn,
      toColumn: fromColumn + verbatim.length - 1,
    };
  };

  const checkIdentifierConsistency = (
    identifierType: IdentifierType,
    line: number,
    identifier: Identifier
  ): void => {
    const identifiersByType = identifiers[identifierType];

    const identifierReference = {
      identifier,
      line,
    };

    if (
      Object.prototype.hasOwnProperty.call(
        identifiersByType,
        identifier.normalized
      )
    ) {
      const existing = identifiersByType[
        identifier.normalized
      ] as IdentifierInstance;

      if (
        !existing.reportedInconsistent &&
        existing.first.identifier.verbatim !== identifier.verbatim &&
        existing.first.line !== line
      ) {
        warnings.push({
          type: `inconsistentIdentifier`,
          first: existing.first,
          second: identifierReference,
        });

        existing.reportedInconsistent = true;
      }
    } else {
      identifiersByType[identifier.normalized] = {
        first: identifierReference,
        reportedInconsistent: false,
      };
    }
  };

  const checkConditionConsistency = (
    line: number,
    condition: null | Condition
  ): void => {
    if (condition !== null) {
      switch (condition.type) {
        case `flagClear`:
        case `flagSet`:
          checkIdentifierConsistency(`flag`, line, condition.flag);
          break;

        case `someFlagsClear`:
        case `someFlagsSet`:
        case `everyFlagClear`:
        case `everyFlagSet`:
          for (const flag of condition.flags) {
            checkIdentifierConsistency(`flag`, line, flag);
          }
          break;
      }
    }
  };

  function normalizeIdentifierList<TBinaryOperator extends string>(
    line: number,
    fromColumn: number,
    match: RegExpMatchArray,
    startingIndex: number
  ): readonly [
    ReadonlyArray<Identifier>,
    ReadonlyArray<Instruction>,
    ReadonlyArray<Warning>,
    null | TBinaryOperator
  ] {
    const commaDelimited = match[startingIndex] as undefined | string;

    if (commaDelimited === undefined) {
      const single = match[startingIndex + 4] as string;

      return [[normalizeIdentifier(fromColumn, single)], [], [], null];
    } else {
      const beforeBinaryOperator = match[startingIndex + 1] as string;
      const binaryOperator = match[startingIndex + 2] as string;
      const afterBinaryOperator = match[startingIndex + 3] as string;
      const final = match[startingIndex + 4] as string;

      const identifiers: Identifier[] = [];

      fromColumn--;

      for (const identifier of commaDelimited.split(`,`)) {
        fromColumn++;

        fromColumn += identifier.length - identifier.trimStart().length;

        identifiers.push(normalizeIdentifier(fromColumn, identifier.trim()));

        fromColumn += identifier.trimStart().length;
      }

      fromColumn += beforeBinaryOperator.length;
      fromColumn += binaryOperator.length;
      fromColumn += afterBinaryOperator.length;

      identifiers.push(normalizeIdentifier(fromColumn, final));

      const instructions: Instruction[] = [];
      const warnings: Warning[] = [];

      for (let i = 0; i < identifiers.length; i++) {
        const first = identifiers[i] as Identifier;

        let firstDuplicate = true;

        for (let j = i + 1; j < identifiers.length; ) {
          const second = identifiers[j] as Identifier;

          if (first.normalized === second.normalized) {
            identifiers.splice(j, 1);

            if (firstDuplicate) {
              warnings.push({
                type: `duplicateIdentifierInList`,
                line,
                first,
                second,
              });

              firstDuplicate = false;
            }
          } else {
            j++;
          }
        }
      }

      return [
        identifiers,
        instructions,
        warnings,
        binaryOperator.toLowerCase() as TBinaryOperator,
      ];
    }
  }

  function parseCondition(
    line: number,
    fromColumn: number,
    match: RegExpMatchArray,
    startingIndex: number
  ): [null | Condition, ReadonlyArray<Instruction>, ReadonlyArray<Warning>] {
    const prefix = match[startingIndex] as undefined | string;

    if (prefix === undefined) {
      return [null, [], []];
    } else {
      const not = match[startingIndex + 1] as undefined | string;

      const [flags, instructions, warnings, binaryOperator] =
        normalizeIdentifierList<`and` | `or`>(
          line,
          fromColumn + prefix.length + (not === undefined ? 0 : not.length),
          match,
          startingIndex + 2
        );

      switch (binaryOperator) {
        case null:
          return [
            {
              type: not === undefined ? `flagSet` : `flagClear`,
              flag: flags[0] as Identifier,
            },
            instructions,
            warnings,
          ];

        case `and`:
          return [
            {
              type: not === undefined ? `everyFlagSet` : `someFlagsClear`,
              flags,
            },
            instructions,
            warnings,
          ];

        case `or`:
          return [
            {
              type: not === undefined ? `someFlagsSet` : `everyFlagClear`,
              flags,
            },
            instructions,
            warnings,
          ];
      }
    }
  }

  const instructions: Instruction[] = [];
  const warnings: Warning[] = [];

  const parseFormatted = (
    line: number,
    fromColumn: number,
    unformatted: string,
    onSuccess: (formatted: Formatted) => void
  ): null | Error => {
    const formatted: Run[] = [];

    let previousBold = false;
    let previousItalic = false;
    let previousCode = false;

    let boldFromColumn: null | number = null;
    let italicFromColumn: null | number = null;
    let codeFromColumn: null | number = null;

    let plainText = ``;
    let verbatim = ``;

    let state:
      | `noSpecialCharacter`
      | `backslash`
      | `asterisk`
      | `code`
      | `codeBackslash` = `noSpecialCharacter`;

    let currentRunFromColumn = fromColumn;
    let toColumn = fromColumn - 1;

    for (const character of unformatted) {
      toColumn++;

      let insertBackslash = false;

      switch (state) {
        case `noSpecialCharacter`:
          switch (character) {
            case `\\`:
              state = `backslash`;
              continue;

            case `\``:
              verbatim += `\``;
              state = `code`;
              codeFromColumn = toColumn;
              continue;

            case `*`:
              verbatim += `*`;
              state = `asterisk`;
              continue;

            default:
              break;
          }
          break;

        case `backslash`:
          switch (character) {
            case `\\`:
            case `\``:
            case `*`:
              insertBackslash = true;
              state = `noSpecialCharacter`;
              break;

            default:
              return {
                type: `invalidEscapeSequence`,
                line,
                verbatim: `\\${character}`,
                fromColumn: toColumn - 1,
                toColumn,
              };
          }
          break;

        case `asterisk`:
          state = `noSpecialCharacter`;

          if (character === `*`) {
            if (boldFromColumn === null) {
              boldFromColumn = toColumn - 1;
            } else {
              boldFromColumn = null;
            }
            verbatim += `*`;
            continue;
          } else {
            if (italicFromColumn === null) {
              italicFromColumn = toColumn - 1;
            } else {
              italicFromColumn = null;
            }

            switch (character) {
              case `\\`:
                state = `backslash`;
                continue;

              case `\``:
                verbatim += `\``;
                state = `code`;
                codeFromColumn = toColumn;
                continue;

              default:
                break;
            }
          }
          break;

        case `code`:
          switch (character) {
            case `\\`:
              state = `codeBackslash`;
              continue;

            case `\``:
              codeFromColumn = null;
              verbatim += `\``;
              state = `noSpecialCharacter`;
              continue;

            default:
              break;
          }
          break;

        case `codeBackslash`:
          switch (character) {
            case `\\`:
            case `\``:
              insertBackslash = true;
              state = `code`;
              break;

            default:
              return {
                type: `invalidEscapeSequence`,
                line,
                verbatim: `\\${character}`,
                fromColumn: toColumn - 1,
                toColumn,
              };
          }
      }

      if (
        (previousBold !== (boldFromColumn !== null) ||
          previousItalic !== (italicFromColumn !== null) ||
          previousCode !== (codeFromColumn !== null)) &&
        ((previousCode && plainText != ``) ||
          (!previousCode && plainText.trim() !== ``))
      ) {
        formatted.push({
          bold: previousBold,
          italic: previousItalic,
          code: previousCode,
          verbatim,
          plainText,
          fromColumn: currentRunFromColumn,
          toColumn: toColumn - (insertBackslash ? 2 : 1),
        });

        previousBold = boldFromColumn !== null;
        previousItalic = italicFromColumn !== null;
        previousCode = codeFromColumn !== null;

        plainText = ``;
        verbatim = ``;

        currentRunFromColumn = toColumn - (insertBackslash ? 1 : 0);
      }

      if (insertBackslash) {
        verbatim += `\\`;
      }

      plainText += character;
      verbatim += character;
    }

    switch (state) {
      case `backslash`:
      case `codeBackslash`:
        return {
          type: `incompleteEscapeSequence`,
          line,
          column: toColumn,
        };

      case `asterisk`:
        if (italicFromColumn === null) {
          italicFromColumn = toColumn;
        } else {
          italicFromColumn = null;
        }
        break;
    }

    if (boldFromColumn !== null) {
      return {
        type: `unterminatedBold`,
        line,
        verbatim: unformatted.slice(boldFromColumn - fromColumn),
        fromColumn: boldFromColumn,
        toColumn,
      };
    } else if (italicFromColumn !== null) {
      return {
        type: `unterminatedItalic`,
        line,
        verbatim: unformatted.slice(italicFromColumn - fromColumn),
        fromColumn: italicFromColumn,
        toColumn,
      };
    } else if (codeFromColumn !== null) {
      return {
        type: `unterminatedCode`,
        line,
        verbatim: unformatted.slice(codeFromColumn - fromColumn),
        fromColumn: codeFromColumn,
        toColumn,
      };
    } else {
      formatted.push({
        bold: previousBold,
        italic: previousItalic,
        code: previousCode,
        verbatim,
        plainText,
        fromColumn: currentRunFromColumn,
        toColumn,
      });

      onSuccess(formatted);
      return null;
    }
  };

  let reachability: Reachability = `reachable`;

  const whenReachable = (line: number, then: () => void) => {
    switch (reachability) {
      case `reachable`:
        then();
        break;

      case `willBecomeUnreachableAtEndOfCurrentMenu`:
      case `firstUnreachable`:
        warnings.push({ type: `unreachable`, line });
        reachability = `unreachable`;
        break;

      case `unreachable`:
        break;
    }
  };

  let line = 0;

  for (const unparsed of source.split(/\r\n|\r|\n/g)) {
    line++;

    if (/\S/.test(unparsed)) {
      const lineMatch = lineRegex.exec(unparsed);

      if (lineMatch !== null) {
        const prefix = lineMatch[1] as string;
        const unformatted = lineMatch[2] as string;

        const error = parseFormatted(
          line,
          1 + prefix.length,
          unformatted,
          (content) => {
            whenReachable(line, () => {
              instructions.push({
                type: `line`,
                line,
                content,
              });
            });
          }
        );

        if (error === null) {
          continue;
        } else {
          return { type: `invalid`, error };
        }
      }

      const locationMatch = locationRegex.exec(unparsed);

      if (locationMatch !== null) {
        whenReachable(line, () => {
          const prefix = locationMatch[1] as string;
          const backgroundName = locationMatch[2] as string;

          const background = normalizeIdentifier(
            1 + prefix.length,
            backgroundName
          );

          instructions.push({
            type: `location`,
            line,
            background,
          });

          checkIdentifierConsistency(`background`, line, background);
        });

        continue;
      }

      const singleCharacterEntryAnimationMatch =
        singleCharacterEntryAnimationRegex.exec(unparsed);

      if (singleCharacterEntryAnimationMatch !== null) {
        whenReachable(line, () => {
          const characterName = singleCharacterEntryAnimationMatch[1] as string;
          const enters = singleCharacterEntryAnimationMatch[2] as string;
          const animationName = singleCharacterEntryAnimationMatch[3] as string;

          const character = normalizeIdentifier(1, characterName);

          const animation = normalizeIdentifier(
            1 + characterName.length + enters.length,
            animationName
          );

          instructions.push({
            type: `entryAnimation`,
            line,
            character,
            animation,
          });

          const emotePrefix = singleCharacterEntryAnimationMatch[4] as
            | undefined
            | string;

          if (emotePrefix !== undefined) {
            const emoteName = singleCharacterEntryAnimationMatch[5] as string;

            const emote = normalizeIdentifier(
              1 +
                characterName.length +
                enters.length +
                animationName.length +
                emotePrefix.length,
              emoteName
            );

            instructions.push({
              type: `emote`,
              line,
              character,
              emote,
            });

            checkIdentifierConsistency(`emote`, line, emote);
          }

          checkIdentifierConsistency(`character`, line, character);

          checkIdentifierConsistency(`entryAnimation`, line, animation);
        });

        continue;
      }

      const multiCharacterEntryAnimationMatch =
        multiCharacterEntryAnimationRegex.exec(unparsed);

      if (multiCharacterEntryAnimationMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterInstructions, characterWarnings] =
            normalizeIdentifierList(
              line,
              1,
              multiCharacterEntryAnimationMatch,
              1
            );

          const entry = multiCharacterEntryAnimationMatch[6] as string;
          const animationName = multiCharacterEntryAnimationMatch[7] as string;

          const animation = normalizeIdentifier(
            1 +
              (multiCharacterEntryAnimationMatch[1] as string).length +
              (multiCharacterEntryAnimationMatch[2] as string).length +
              (multiCharacterEntryAnimationMatch[3] as string).length +
              (multiCharacterEntryAnimationMatch[4] as string).length +
              (multiCharacterEntryAnimationMatch[5] as string).length +
              entry.length,
            animationName
          );

          for (const character of characters) {
            instructions.push({
              type: `entryAnimation`,
              line,
              character,
              animation,
            });
          }

          const emotePrefix = multiCharacterEntryAnimationMatch[8] as
            | undefined
            | string;

          if (emotePrefix !== undefined) {
            const emoteName = multiCharacterEntryAnimationMatch[9] as string;

            const emote = normalizeIdentifier(
              1 +
                (multiCharacterEntryAnimationMatch[1] as string).length +
                (multiCharacterEntryAnimationMatch[2] as string).length +
                (multiCharacterEntryAnimationMatch[3] as string).length +
                (multiCharacterEntryAnimationMatch[4] as string).length +
                (multiCharacterEntryAnimationMatch[5] as string).length +
                entry.length +
                animationName.length +
                emotePrefix.length,
              emoteName
            );

            for (const character of characters) {
              instructions.push({
                type: `emote`,
                line,
                character,
                emote,
              });
            }

            checkIdentifierConsistency(`emote`, line, emote);
          }

          instructions.push(...characterInstructions);
          warnings.push(...characterWarnings);

          for (const character of characters) {
            checkIdentifierConsistency(`character`, line, character);
          }

          checkIdentifierConsistency(`entryAnimation`, line, animation);
        });

        continue;
      }

      const singleCharacterExitAnimationMatch =
        singleCharacterExitAnimationRegex.exec(unparsed);

      if (singleCharacterExitAnimationMatch !== null) {
        whenReachable(line, () => {
          const characterName = singleCharacterExitAnimationMatch[1] as string;
          const enters = singleCharacterExitAnimationMatch[2] as string;
          const animationName = singleCharacterExitAnimationMatch[3] as string;

          const character = normalizeIdentifier(1, characterName);

          const animation = normalizeIdentifier(
            1 + characterName.length + enters.length,
            animationName
          );

          instructions.push({
            type: `exitAnimation`,
            line,
            character,
            animation,
          });

          const emotePrefix = singleCharacterExitAnimationMatch[4] as
            | undefined
            | string;

          if (emotePrefix !== undefined) {
            const emoteName = singleCharacterExitAnimationMatch[5] as string;

            const emote = normalizeIdentifier(
              1 +
                characterName.length +
                enters.length +
                animationName.length +
                emotePrefix.length,
              emoteName
            );

            instructions.push({
              type: `emote`,
              line,
              character,
              emote,
            });

            checkIdentifierConsistency(`emote`, line, emote);
          }

          checkIdentifierConsistency(`character`, line, character);

          checkIdentifierConsistency(`exitAnimation`, line, animation);
        });

        continue;
      }

      const multiCharacterExitAnimationMatch =
        multiCharacterExitAnimationRegex.exec(unparsed);

      if (multiCharacterExitAnimationMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterInstructions, characterWarnings] =
            normalizeIdentifierList(
              line,
              1,
              multiCharacterExitAnimationMatch,
              1
            );

          const exit = multiCharacterExitAnimationMatch[6] as string;
          const animationName = multiCharacterExitAnimationMatch[7] as string;

          const animation = normalizeIdentifier(
            1 +
              (multiCharacterExitAnimationMatch[1] as string).length +
              (multiCharacterExitAnimationMatch[2] as string).length +
              (multiCharacterExitAnimationMatch[3] as string).length +
              (multiCharacterExitAnimationMatch[4] as string).length +
              (multiCharacterExitAnimationMatch[5] as string).length +
              exit.length,
            animationName
          );

          for (const character of characters) {
            instructions.push({
              type: `exitAnimation`,
              line,
              character,
              animation,
            });
          }

          const emotePrefix = multiCharacterExitAnimationMatch[8] as
            | undefined
            | string;

          if (emotePrefix !== undefined) {
            const emoteName = multiCharacterExitAnimationMatch[9] as string;

            const emote = normalizeIdentifier(
              1 +
                (multiCharacterExitAnimationMatch[1] as string).length +
                (multiCharacterExitAnimationMatch[2] as string).length +
                (multiCharacterExitAnimationMatch[3] as string).length +
                (multiCharacterExitAnimationMatch[4] as string).length +
                (multiCharacterExitAnimationMatch[5] as string).length +
                exit.length +
                animationName.length +
                emotePrefix.length,
              emoteName
            );

            for (const character of characters) {
              instructions.push({
                type: `emote`,
                line,
                character,
                emote,
              });
            }

            checkIdentifierConsistency(`emote`, line, emote);
          }

          instructions.push(...characterInstructions);
          warnings.push(...characterWarnings);

          for (const character of characters) {
            checkIdentifierConsistency(`character`, line, character);
          }

          checkIdentifierConsistency(`exitAnimation`, line, animation);
        });

        continue;
      }

      const speakerMatch = speakerRegex.exec(unparsed);

      if (speakerMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterInstructions, characterWarnings] =
            normalizeIdentifierList(line, 1, speakerMatch, 1);

          instructions.push({
            type: `speaker`,
            line,
            characters,
          });

          const emotePrefix = speakerMatch[6] as undefined | string;

          if (emotePrefix !== undefined) {
            const emoteName = speakerMatch[7] as string;

            const emote = normalizeIdentifier(
              1 +
                (speakerMatch[1] ?? ``).length +
                (speakerMatch[2] ?? ``).length +
                (speakerMatch[3] ?? ``).length +
                (speakerMatch[4] ?? ``).length +
                (speakerMatch[5] as string).length +
                emotePrefix.length,
              emoteName
            );

            for (const character of characters) {
              instructions.push({
                type: `emote`,
                line,
                character,
                emote,
              });
            }

            checkIdentifierConsistency(`emote`, line, emote);
          }

          instructions.push(...characterInstructions);
          warnings.push(...characterWarnings);

          for (const character of characters) {
            checkIdentifierConsistency(`character`, line, character);
          }
        });

        continue;
      }

      const singleCharacterEmoteMatch =
        singleCharacterEmoteRegex.exec(unparsed);

      if (singleCharacterEmoteMatch !== null) {
        whenReachable(line, () => {
          const characterName = singleCharacterEmoteMatch[1] as string;
          const is = singleCharacterEmoteMatch[2] as string;
          const emoteName = singleCharacterEmoteMatch[3] as string;

          const character = normalizeIdentifier(1, characterName);

          const emote = normalizeIdentifier(
            1 + characterName.length + is.length,
            emoteName
          );

          instructions.push({
            type: `emote`,
            line,
            character,
            emote,
          });

          checkIdentifierConsistency(`character`, line, character);
          checkIdentifierConsistency(`emote`, line, emote);
        });

        continue;
      }

      const multiCharacterEmoteMatch = multiCharacterEmoteRegex.exec(unparsed);

      if (multiCharacterEmoteMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterInstructions, characterWarnings] =
            normalizeIdentifierList(line, 1, multiCharacterEmoteMatch, 1);

          const are = multiCharacterEmoteMatch[6] as string;
          const emoteName = multiCharacterEmoteMatch[7] as string;

          const emote = normalizeIdentifier(
            1 +
              (multiCharacterEmoteMatch[1] as string).length +
              (multiCharacterEmoteMatch[2] as string).length +
              (multiCharacterEmoteMatch[3] as string).length +
              (multiCharacterEmoteMatch[4] as string).length +
              (multiCharacterEmoteMatch[5] as string).length +
              are.length,
            emoteName
          );

          for (const character of characters) {
            instructions.push({
              type: `emote`,
              line,
              character,
              emote,
            });
          }

          instructions.push(...characterInstructions);
          warnings.push(...characterWarnings);

          for (const character of characters) {
            checkIdentifierConsistency(`character`, line, character);
          }

          checkIdentifierConsistency(`emote`, line, emote);
        });

        continue;
      }

      const labelMatch = labelRegex.exec(unparsed);

      if (labelMatch !== null) {
        const prefix = labelMatch[1] as string;
        const nameString = labelMatch[2] as string;

        const name = normalizeIdentifier(1 + prefix.length, nameString);

        for (const previousInstruction of instructions) {
          if (
            previousInstruction.type === `label` &&
            previousInstruction.name.normalized === name.normalized
          ) {
            return {
              type: `invalid`,
              error: {
                type: `duplicateLabel`,
                first: {
                  line: previousInstruction.line,
                  identifier: previousInstruction.name,
                },
                second: {
                  line,
                  identifier: name,
                },
              },
            };
          }
        }

        instructions.push({
          type: `label`,
          line,
          name,
        });

        checkIdentifierConsistency(`label`, line, name);

        reachability = `reachable`;

        continue;
      }

      const menuOptionMatch = menuOptionRegex.exec(unparsed);

      if (menuOptionMatch !== null) {
        // Workaround for https://github.com/microsoft/TypeScript/issues/46475.
        if ((reachability as Reachability) !== `unreachable`) {
          const prefix = menuOptionMatch[1] as string;
          const unformattedContent = menuOptionMatch[2] as string;

          parseFormatted(
            line,
            1 + prefix.length,
            unformattedContent,
            (content) => {
              const betweenContentAndLabelName = menuOptionMatch[3] as string;
              const labelName = menuOptionMatch[4] as string;

              const label = normalizeIdentifier(
                1 +
                  unformattedContent.length +
                  prefix.length +
                  betweenContentAndLabelName.length,
                labelName
              );

              const [condition, conditionInstructions, conditionWarnings] =
                parseCondition(
                  line,
                  1 +
                    prefix.length +
                    unformattedContent.length +
                    betweenContentAndLabelName.length +
                    labelName.length,
                  menuOptionMatch,
                  5
                );

              instructions.push(
                {
                  type: `menuOption`,
                  line,
                  content,
                  label,
                  condition,
                },
                ...conditionInstructions
              );

              warnings.push(...conditionWarnings);

              checkIdentifierConsistency(`label`, line, label);

              checkConditionConsistency(line, condition);

              if (condition === null) {
                reachability = `willBecomeUnreachableAtEndOfCurrentMenu`;
              }
            }
          );
        }

        continue;
      }

      const setMatch = setRegex.exec(unparsed);

      if (setMatch !== null) {
        whenReachable(line, () => {
          const prefix = setMatch[1] as string;

          const [flags, flagInstructions, flagWarnings] =
            normalizeIdentifierList(line, 1 + prefix.length, setMatch, 2);

          for (const flag of flags) {
            instructions.push({
              type: `set`,
              line,
              flag,
            });

            checkIdentifierConsistency(`flag`, line, flag);
          }

          instructions.push(...flagInstructions);
          warnings.push(...flagWarnings);
        });

        continue;
      }

      const clearMatch = clearRegex.exec(unparsed);

      if (clearMatch !== null) {
        whenReachable(line, () => {
          const prefix = clearMatch[1] as string;

          const [flags, flagInstructions, flagWarnings] =
            normalizeIdentifierList(line, 1 + prefix.length, clearMatch, 2);

          for (const flag of flags) {
            instructions.push({
              type: `clear`,
              line,
              flag,
            });

            checkIdentifierConsistency(`flag`, line, flag);
          }

          instructions.push(...flagInstructions);
          warnings.push(...flagWarnings);
        });

        continue;
      }

      const jumpMatch = jumpRegex.exec(unparsed);

      if (jumpMatch !== null) {
        whenReachable(line, () => {
          const prefix = jumpMatch[1] as string;
          const labelName = jumpMatch[2] as string;

          const previousInstruction =
            instructions.length > 0
              ? instructions[instructions.length - 1]
              : undefined;

          const label = normalizeIdentifier(1 + prefix.length, labelName);

          const [condition, conditionInstructions, conditionWarnings] =
            parseCondition(
              line,
              1 + prefix.length + labelName.length,
              jumpMatch,
              3
            );

          if (
            previousInstruction !== undefined &&
            previousInstruction.type === `label` &&
            condition === null
          ) {
            warnings.push({
              type: `emptyLabel`,
              line: previousInstruction.line,
              label: previousInstruction.name,
            });
          }

          instructions.push(
            {
              type: `jump`,
              line,
              label,
              condition,
            },
            ...conditionInstructions
          );

          warnings.push(...conditionWarnings);

          checkIdentifierConsistency(`label`, line, label);

          checkConditionConsistency(line, condition);

          if (condition === null) {
            reachability = `firstUnreachable`;
          }
        });

        continue;
      }

      return {
        type: `invalid`,
        error: {
          type: `unparsable`,
          line,
        },
      };
    }
  }

  for (
    let instructionIndex = 0;
    instructionIndex < instructions.length;
    instructionIndex++
  ) {
    const instruction = instructions[instructionIndex] as Instruction;

    switch (instruction.type) {
      case `label`: {
        const referencedByAJump = instructions.some(
          (jumpInstruction) =>
            jumpInstruction.type === `jump` &&
            jumpInstruction.label.normalized === instruction.name.normalized
        );

        const referencedByAMenuOption = instructions.some(
          (menuOptionInstruction) =>
            menuOptionInstruction.type === `menuOption` &&
            menuOptionInstruction.label.normalized ===
              instruction.name.normalized
        );

        if (!referencedByAJump && !referencedByAMenuOption) {
          warnings.push({
            type: `unreferencedLabel`,
            line: instruction.line,
            label: instruction.name,
          });
        }

        break;
      }

      case `jump`:
      case `menuOption`:
        if (
          !instructions.some(
            (labelInstruction) =>
              labelInstruction.type === `label` &&
              labelInstruction.name.normalized === instruction.label.normalized
          )
        ) {
          return {
            type: `invalid`,
            error: {
              type: `undefinedLabel`,
              line: instruction.line,
              label: instruction.label,
            },
          };
        }
    }
  }

  for (const normalizedFlag in identifiers.flag) {
    if (
      !instructions.some(
        (instruction) =>
          instruction.type === `set` &&
          instruction.flag.normalized === normalizedFlag
      )
    ) {
      const flag = identifiers.flag[normalizedFlag] as IdentifierInstance;

      warnings.push({
        type: `flagNeverSet`,
        line: flag.first.line,
        name: flag.first.identifier,
      });
    }

    if (
      !instructions.some(
        (instruction) =>
          (instruction.type === `jump` || instruction.type === `menuOption`) &&
          instruction.condition !== null &&
          (instruction.condition.type === `flagClear` ||
          instruction.condition.type === `flagSet`
            ? instruction.condition.flag.normalized === normalizedFlag
            : instruction.condition.flags.some(
                (flag) => flag.normalized === normalizedFlag
              ))
      )
    ) {
      const flag = identifiers.flag[normalizedFlag] as IdentifierInstance;

      warnings.push({
        type: `flagNeverReferenced`,
        line: flag.first.line,
        name: flag.first.identifier,
      });
    }
  }

  if (instructions.length > 0) {
    const lastInstruction = instructions[
      instructions.length - 1
    ] as Instruction;

    if (
      lastInstruction.type === `label` &&
      !warnings.some(
        (flagNeverReferencedWarning) =>
          flagNeverReferencedWarning.type === `unreferencedLabel` &&
          flagNeverReferencedWarning.label.normalized ===
            lastInstruction.name.normalized
      )
    ) {
      warnings.push({
        type: `emptyLabel`,
        line: lastInstruction.line,
        label: lastInstruction.name,
      });
    }
  }

  return { type: `valid`, instructions, warnings };
};

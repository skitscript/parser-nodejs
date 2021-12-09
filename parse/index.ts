import type {
  Condition,
  Document,
  Event,
  Formatted,
  Identifier,
  IdentifierReference,
  Run,
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
        events.push({
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

  function normalizeIdentifierList<TBinaryOperator extends string>(
    line: number,
    fromColumn: number,
    match: RegExpMatchArray,
    startingIndex: number
  ): readonly [
    ReadonlyArray<Identifier>,
    ReadonlyArray<Event>,
    null | TBinaryOperator
  ] {
    const commaDelimited = match[startingIndex] as undefined | string;

    if (commaDelimited === undefined) {
      const single = match[startingIndex + 4] as string;

      return [[normalizeIdentifier(fromColumn, single)], [], null];
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

      const events: Event[] = [];

      for (let i = 0; i < identifiers.length; i++) {
        const first = identifiers[i] as Identifier;

        const firstDuplicate = true;

        for (let j = i + 1; j < identifiers.length; ) {
          const second = identifiers[j] as Identifier;

          if (first.normalized === second.normalized) {
            identifiers.splice(j, 1);

            if (firstDuplicate) {
              events.push({
                type: `duplicateIdentifierInList`,
                line,
                first,
                second,
              });
            }
          } else {
            j++;
          }
        }
      }

      return [
        identifiers,
        events,
        binaryOperator.toLowerCase() as TBinaryOperator,
      ];
    }
  }

  function parseCondition(
    line: number,
    fromColumn: number,
    match: RegExpMatchArray,
    startingIndex: number
  ): [null | Condition, ReadonlyArray<Event>] {
    const prefix = match[startingIndex] as undefined | string;

    if (prefix === undefined) {
      return [null, []];
    } else {
      const not = match[startingIndex + 1] as undefined | string;

      const [flags, events, binaryOperator] = normalizeIdentifierList<
        `and` | `or`
      >(
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
            events,
          ];

        case `and`:
          return [
            {
              type: not === undefined ? `everyFlagSet` : `someFlagsClear`,
              flags,
            },
            events,
          ];

        case `or`:
          return [
            {
              type: not === undefined ? `someFlagsSet` : `everyFlagClear`,
              flags,
            },
            events,
          ];
      }
    }
  }

  const events: Event[] = [];

  const parseFormatted = (
    line: number,
    fromColumn: number,
    unformatted: string,
    onSuccess: (formatted: Formatted) => void
  ): void => {
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
              events.push({
                type: `invalidEscapeSequence`,
                line,
                verbatim: `\\${character}`,
                fromColumn: toColumn - 1,
                toColumn,
              });
              return;
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
              events.push({
                type: `invalidEscapeSequence`,
                line,
                verbatim: `\\${character}`,
                fromColumn: toColumn - 1,
                toColumn,
              });
              return;
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
        events.push({
          type: `incompleteEscapeSequence`,
          line,
          column: toColumn,
        });
        return;

      case `asterisk`:
        if (italicFromColumn === null) {
          italicFromColumn = toColumn;
        } else {
          italicFromColumn = null;
        }
        break;
    }

    if (boldFromColumn !== null) {
      events.push({
        type: `unterminatedBold`,
        line,
        verbatim: unformatted.slice(boldFromColumn - fromColumn),
        fromColumn: boldFromColumn,
        toColumn,
      });
    } else if (italicFromColumn !== null) {
      events.push({
        type: `unterminatedItalic`,
        line,
        verbatim: unformatted.slice(italicFromColumn - fromColumn),
        fromColumn: italicFromColumn,
        toColumn,
      });
    } else if (codeFromColumn !== null) {
      events.push({
        type: `unterminatedCode`,
        line,
        verbatim: unformatted.slice(codeFromColumn - fromColumn),
        fromColumn: codeFromColumn,
        toColumn,
      });
    } else {
      if (
        (previousCode && plainText != ``) ||
        (!previousCode && plainText.trim() !== ``)
      ) {
        formatted.push({
          bold: previousBold,
          italic: previousItalic,
          code: previousCode,
          verbatim,
          plainText,
          fromColumn: currentRunFromColumn,
          toColumn,
        });
      }

      onSuccess(formatted);
    }
  };

  let reachability:
    | `reachable`
    | `willBecomeUnreachableAtEndOfCurrentMenu`
    | `firstUnreachable`
    | `unreachable` = `reachable`;

  const whenReachable = (line: number, then: () => void) => {
    switch (reachability) {
      case `reachable`:
        then();
        break;

      case `willBecomeUnreachableAtEndOfCurrentMenu`:
      case `firstUnreachable`:
        events.push({ type: `unreachable`, line });
        reachability = `unreachable`;
        break;

      case `unreachable`:
        break;
    }
  };

  source.split(/\r\n|\r|\n/g).forEach((unparsed, line) => {
    line++;

    if (/\S/.test(unparsed)) {
      const lineMatch = lineRegex.exec(unparsed);

      if (lineMatch !== null) {
        whenReachable(line, () => {
          const prefix = lineMatch[1] as string;
          const unformatted = lineMatch[2] as string;
          parseFormatted(line, 1 + prefix.length, unformatted, (content) => {
            events.push({
              type: `line`,
              line,
              content,
            });
          });
        });

        return;
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

          events.push({
            type: `location`,
            line,
            background,
          });
        });

        return;
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

          events.push({
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

            events.push({
              type: `emote`,
              line,
              character,
              emote,
            });
          }

          checkIdentifierConsistency(`character`, line, character);
        });

        return;
      }

      const multiCharacterEntryAnimationMatch =
        multiCharacterEntryAnimationRegex.exec(unparsed);

      if (multiCharacterEntryAnimationMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterEvents] = normalizeIdentifierList(
            line,
            1,
            multiCharacterEntryAnimationMatch,
            1
          );

          const entry = multiCharacterEntryAnimationMatch[6] as string;
          const animationName = multiCharacterEntryAnimationMatch[7] as string;

          const animation = normalizeIdentifier(
            1 +
              (multiCharacterEntryAnimationMatch[1] ?? ``).length +
              (multiCharacterEntryAnimationMatch[2] ?? ``).length +
              (multiCharacterEntryAnimationMatch[3] ?? ``).length +
              (multiCharacterEntryAnimationMatch[4] ?? ``).length +
              (multiCharacterEntryAnimationMatch[5] ?? ``).length +
              entry.length,
            animationName
          );

          for (const character of characters) {
            events.push({
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
                (multiCharacterEntryAnimationMatch[1] ?? ``).length +
                (multiCharacterEntryAnimationMatch[2] ?? ``).length +
                (multiCharacterEntryAnimationMatch[3] ?? ``).length +
                (multiCharacterEntryAnimationMatch[4] ?? ``).length +
                (multiCharacterEntryAnimationMatch[5] ?? ``).length +
                entry.length +
                animationName.length +
                emotePrefix.length,
              emoteName
            );

            for (const character of characters) {
              events.push({
                type: `emote`,
                line,
                character,
                emote,
              });
            }
          }

          events.push(...characterEvents);

          for (const character of characters) {
            checkIdentifierConsistency(`character`, line, character);
          }
        });

        return;
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

          events.push({
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

            events.push({
              type: `emote`,
              line,
              character,
              emote,
            });
          }

          checkIdentifierConsistency(`character`, line, character);
        });

        return;
      }

      const multiCharacterExitAnimationMatch =
        multiCharacterExitAnimationRegex.exec(unparsed);

      if (multiCharacterExitAnimationMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterEvents] = normalizeIdentifierList(
            line,
            1,
            multiCharacterExitAnimationMatch,
            1
          );

          const exit = multiCharacterExitAnimationMatch[6] as string;
          const animationName = multiCharacterExitAnimationMatch[7] as string;

          const animation = normalizeIdentifier(
            1 +
              (multiCharacterExitAnimationMatch[1] ?? ``).length +
              (multiCharacterExitAnimationMatch[2] ?? ``).length +
              (multiCharacterExitAnimationMatch[3] ?? ``).length +
              (multiCharacterExitAnimationMatch[4] ?? ``).length +
              (multiCharacterExitAnimationMatch[5] ?? ``).length +
              exit.length,
            animationName
          );

          for (const character of characters) {
            events.push({
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
                (multiCharacterExitAnimationMatch[1] ?? ``).length +
                (multiCharacterExitAnimationMatch[2] ?? ``).length +
                (multiCharacterExitAnimationMatch[3] ?? ``).length +
                (multiCharacterExitAnimationMatch[4] ?? ``).length +
                (multiCharacterExitAnimationMatch[5] ?? ``).length +
                exit.length +
                animationName.length +
                emotePrefix.length,
              emoteName
            );

            for (const character of characters) {
              events.push({
                type: `emote`,
                line,
                character,
                emote,
              });
            }
          }

          events.push(...characterEvents);

          for (const character of characters) {
            checkIdentifierConsistency(`character`, line, character);
          }
        });

        return;
      }

      const speakerMatch = speakerRegex.exec(unparsed);

      if (speakerMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterEvents] = normalizeIdentifierList(
            line,
            1,
            speakerMatch,
            1
          );

          events.push({
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
                (speakerMatch[5] ?? ``).length +
                emotePrefix.length,
              emoteName
            );
            for (const character of characters) {
              events.push({
                type: `emote`,
                line,
                character,
                emote,
              });
            }
          }

          events.push(...characterEvents);

          for (const character of characters) {
            checkIdentifierConsistency(`character`, line, character);
          }
        });

        return;
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

          events.push({
            type: `emote`,
            line,
            character,
            emote,
          });
        });

        return;
      }

      const multiCharacterEmoteMatch = multiCharacterEmoteRegex.exec(unparsed);

      if (multiCharacterEmoteMatch !== null) {
        whenReachable(line, () => {
          const [characters, characterEvents] = normalizeIdentifierList(
            line,
            1,
            multiCharacterEmoteMatch,
            1
          );

          const are = multiCharacterEmoteMatch[6] as string;
          const emoteName = multiCharacterEmoteMatch[7] as string;

          const emote = normalizeIdentifier(
            1 +
              (multiCharacterEmoteMatch[1] ?? ``).length +
              (multiCharacterEmoteMatch[2] ?? ``).length +
              (multiCharacterEmoteMatch[3] ?? ``).length +
              (multiCharacterEmoteMatch[4] ?? ``).length +
              (multiCharacterEmoteMatch[5] ?? ``).length +
              are.length,
            emoteName
          );

          for (const character of characters) {
            events.push({
              type: `emote`,
              line,
              character,
              emote,
            });
          }

          events.push(...characterEvents);
        });

        return;
      }

      const labelMatch = labelRegex.exec(unparsed);

      if (labelMatch !== null) {
        const prefix = labelMatch[1] as string;
        const nameString = labelMatch[2] as string;

        const name = normalizeIdentifier(1 + prefix.length, nameString);

        events.push({
          type: `label`,
          line,
          name,
        });

        reachability = `reachable`;

        return;
      }

      const menuOptionMatch = menuOptionRegex.exec(unparsed);

      if (menuOptionMatch !== null) {
        if (reachability !== `unreachable`) {
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

              const [condition, conditionEvents] = parseCondition(
                line,
                1 +
                  prefix.length +
                  unformattedContent.length +
                  betweenContentAndLabelName.length +
                  labelName.length,
                menuOptionMatch,
                5
              );

              events.push(
                {
                  type: `menuOption`,
                  line,
                  content,
                  label,
                  condition,
                },
                ...conditionEvents
              );

              if (condition === null) {
                reachability = `willBecomeUnreachableAtEndOfCurrentMenu`;
              }
            }
          );
        }

        return;
      }

      const setMatch = setRegex.exec(unparsed);

      if (setMatch !== null) {
        whenReachable(line, () => {
          const prefix = setMatch[1] as string;

          const [flags, flagEvents] = normalizeIdentifierList(
            line,
            1 + prefix.length,
            setMatch,
            2
          );

          for (const flag of flags) {
            events.push({
              type: `set`,
              line,
              flag,
            });
          }

          events.push(...flagEvents);
        });

        return;
      }

      const clearMatch = clearRegex.exec(unparsed);

      if (clearMatch !== null) {
        whenReachable(line, () => {
          const prefix = clearMatch[1] as string;

          const [flags, flagEvents] = normalizeIdentifierList(
            line,
            1 + prefix.length,
            clearMatch,
            2
          );

          for (const flag of flags) {
            events.push({
              type: `clear`,
              line,
              flag,
            });
          }

          events.push(...flagEvents);
        });

        return;
      }

      const jumpMatch = jumpRegex.exec(unparsed);

      if (jumpMatch !== null) {
        whenReachable(line, () => {
          const prefix = jumpMatch[1] as string;
          const labelName = jumpMatch[2] as string;

          const label = normalizeIdentifier(1 + prefix.length, labelName);

          const [condition, conditionEvents] = parseCondition(
            line,
            1 + prefix.length + labelName.length,
            jumpMatch,
            3
          );

          events.push(
            {
              type: `jump`,
              line,
              label,
              condition,
            },
            ...conditionEvents
          );

          if (condition === null) {
            reachability = `firstUnreachable`;
          }
        });

        return;
      }

      events.push({ type: `unparsable`, line });
    }
  });

  return { events };
};

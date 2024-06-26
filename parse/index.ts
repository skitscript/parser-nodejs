import type { Condition } from '../Condition'
import type { Document } from '../Document'
import type { Error } from '../Error'
import type { Formatted } from '../Formatted'
import type { Identifier } from '../Identifier'
import type { IdentifierContext } from '../IdentifierContext'
import type { IdentifierInstance } from '../IdentifierInstance'
import type { IdentifierReference } from '../IdentifierReference'
import type { IdentifierType } from '../IdentifierType'
import type { Instruction } from '../Instruction'
import type { Run } from '../Run'
import type { Warning } from '../Warning'

const identifierFilteredCharacterRegexFragment = '!?\'"{}@*/\\\\&#%`+<=>|$.-'

const identifierFilteredCharacterRegex = new RegExp(
  `[${identifierFilteredCharacterRegexFragment}]`,
  'ig'
)

const identifierDisallowedWords = [
  'and',
  'or',
  'when',
  'not',
  'is',
  'are',
  'enters',
  'enter',
  'exits',
  'exit',
  'leads',
  'to',
  'set',
  'clear',
  'jump'
]

const identifierDisallowedCharacters = [',', '(', ')', '\\s', ':', '~']

export const identifierRegexFragment = `(?=.*[^${identifierFilteredCharacterRegexFragment}\\s].*)(?:(?!(?:${identifierDisallowedWords.join(
  '|'
)})\\b)[^${identifierDisallowedCharacters.join(
  ''
)}]+)(?:\\s+(?!(?:${identifierDisallowedWords.join(
  '|'
)})\\b)[^${identifierDisallowedCharacters.join('')}]+)*`

const identifierListRegexFragmentFactory = (
  binaryOperators: readonly string[]
): string =>
  `(?:(${identifierRegexFragment}(?:\\s*,\\s*${identifierRegexFragment})*)(\\s+)(${binaryOperators.join(
    '|'
  )})(\\s+))?(${identifierRegexFragment})`

const identifierListAtLeastTwoRegexFragmentFactory = (
  binaryOperators: readonly string[]
): string =>
  `(${identifierRegexFragment}(?:\\s*,\\s*${identifierRegexFragment})*)(\\s+)(${binaryOperators.join(
    '|'
  )})(\\s+)(${identifierRegexFragment})`

const locationRegex = new RegExp(
  `^(location\\s*:\\s*)(${identifierRegexFragment})\\s*\\.\\s*$`,
  'i'
)

const singleCharacterEntryAnimationRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+enters\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

const multiCharacterEntryAnimationRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    'and'
  ])}(\\s+enter\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

const singleCharacterExitAnimationRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+exits\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

const multiCharacterExitAnimationRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    'and'
  ])}(\\s+exit\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

const speakerRegex = new RegExp(
  `^${identifierListRegexFragmentFactory([
    'and'
  ])}(?:(\\s*\\(\\s*)(${identifierRegexFragment})\\s*\\))?\\s*\\:\\s*$`,
  'i'
)

const singleCharacterEmoteRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+is\\s+)(${identifierRegexFragment})\\s*\\.\\s*$`,
  'i'
)

const multiCharacterEmoteRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    'and'
  ])}(\\s+are\\s+)(${identifierRegexFragment})\\s*\\.\\s*$`,
  'i'
)

const labelRegex = new RegExp(
  `^(\\s*~\\s*)(${identifierRegexFragment})\\s*~\\s*$`,
  'i'
)

const conditionRegexFragment = `(?:(\\s+when\\s+)(not\\s+)?${identifierListRegexFragmentFactory(
  ['and', 'or']
)})?`

const formattedRegexFragment = '\\S.*\\S|\\S'

const menuOptionRegex = new RegExp(
  `^(>\\s*)(${formattedRegexFragment})(\\s+leads\\s+to\\s+)(${identifierRegexFragment})${conditionRegexFragment}\\s*\\.\\s*$`,
  'i'
)

const lineRegex = new RegExp(`^(\\s+)(${formattedRegexFragment})\\s*$`, 'i')

const setRegex = new RegExp(
  `^(set\\s+)${identifierListRegexFragmentFactory(['and'])}\\s*\\.\\s*$`,
  'i'
)

const clearRegex = new RegExp(
  `^(clear\\s+)${identifierListRegexFragmentFactory(['and'])}\\s*\\.\\s*$`,
  'i'
)

const jumpRegex = new RegExp(
  `^(jump\\s+to\\s+)(${identifierRegexFragment})${conditionRegexFragment}\\s*\\.\\s*$`,
  'i'
)

interface LocalIdentifierInstance {
  readonly first: IdentifierReference
  reportedInconsistent: boolean
}

type Reachability =
  | 'reachable'
  | 'willBecomeUnreachableAtEndOfCurrentMenu'
  | 'firstUnreachable'
  | 'unreachable'

const unwrapIdentifier = (identifier: Identifier): Identifier => ({
  verbatim: identifier.verbatim,
  normalized: identifier.normalized,
  fromColumn: identifier.fromColumn,
  toColumn: identifier.toColumn
})

/**
 * Parses a Skitscript document from source.
 * @param source The Skitscript source to parse.
 * @returns      The parsed document.
 */
export const parse = (source: string): Document => {
  const identifiers: {
    readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>;
  } = {
    character: {},
    emote: {},
    entryAnimation: {},
    exitAnimation: {},
    label: {},
    flag: {},
    background: {}
  }

  const normalizeIdentifier = (
    line: number,
    type: IdentifierType,
    context: IdentifierContext,
    fromColumn: number,
    verbatim: string
  ): Identifier => {
    const identifier = {
      verbatim,
      normalized: verbatim
        .toLowerCase()
        .replace(identifierFilteredCharacterRegex, ' ')
        .trim()
        .replace(/\s+/g, '-'),
      fromColumn,
      toColumn: fromColumn + verbatim.length - 1
    }

    identifierInstances.push({
      ...identifier,
      type,
      line,
      context
    })

    return identifier
  }

  const checkIdentifierConsistency = (
    identifierType: IdentifierType,
    line: number,
    identifier: Identifier
  ): void => {
    const identifiersByType = identifiers[identifierType]

    const identifierReference = {
      ...identifier,
      line
    }

    if (
      Object.prototype.hasOwnProperty.call(
        identifiersByType,
        identifier.normalized
      )
    ) {
      const existing = identifiersByType[
        identifier.normalized
      ] as LocalIdentifierInstance

      if (
        !existing.reportedInconsistent &&
        existing.first.verbatim !== identifier.verbatim &&
        existing.first.line !== line
      ) {
        warnings.push({
          type: 'inconsistentIdentifier',
          first: existing.first,
          second: identifierReference
        })

        existing.reportedInconsistent = true
      }
    } else {
      identifiersByType[identifier.normalized] = {
        first: identifierReference,
        reportedInconsistent: false
      }
    }
  }

  const checkConditionConsistency = (
    line: number,
    condition: null | Condition
  ): void => {
    if (condition !== null) {
      switch (condition.type) {
        case 'flagClear':
        case 'flagSet':
          checkIdentifierConsistency('flag', line, condition.flag)
          break

        case 'someFlagsClear':
        case 'someFlagsSet':
        case 'everyFlagClear':
        case 'everyFlagSet':
          for (const flag of condition.flags) {
            checkIdentifierConsistency('flag', line, flag)
          }
          break
      }
    }
  }

  function normalizeIdentifierList<TBinaryOperator extends string> (
    line: number,
    type: IdentifierType,
    fromColumn: number,
    match: RegExpMatchArray,
    startingIndex: number
  ): readonly [
      readonly Identifier[],
      readonly Instruction[],
      readonly Warning[],
      null | TBinaryOperator
    ] {
    const commaDelimited = match[startingIndex]

    if (commaDelimited === undefined) {
      const single = match[startingIndex + 4]

      return [
        [
          normalizeIdentifier(
            line,
            type,
            'implicitDeclaration',
            fromColumn,
            single as string
          )
        ],
        [],
        [],
        null
      ]
    } else {
      const beforeBinaryOperator = match[startingIndex + 1] as string
      const binaryOperator = match[startingIndex + 2] as string
      const afterBinaryOperator = match[startingIndex + 3] as string
      const final = match[startingIndex + 4] as string

      const identifiers: Identifier[] = []

      fromColumn--

      for (const identifier of commaDelimited.split(',')) {
        fromColumn++

        fromColumn += identifier.length - identifier.trimStart().length

        identifiers.push(
          normalizeIdentifier(
            line,
            type,
            'implicitDeclaration',
            fromColumn,
            identifier.trim()
          )
        )

        fromColumn += identifier.trimStart().length
      }

      fromColumn += beforeBinaryOperator.length
      fromColumn += binaryOperator.length
      fromColumn += afterBinaryOperator.length

      identifiers.push(
        normalizeIdentifier(
          line,
          type,
          'implicitDeclaration',
          fromColumn,
          final
        )
      )

      const instructions: Instruction[] = []
      const warnings: Warning[] = []

      for (let i = 0; i < identifiers.length; i++) {
        const first = identifiers[i] as Identifier

        let firstDuplicate = true

        for (let j = i + 1; j < identifiers.length;) {
          const second = identifiers[j] as Identifier

          if (first.normalized === second.normalized) {
            identifiers.splice(j, 1)

            if (firstDuplicate) {
              warnings.push({
                type: 'duplicateIdentifierInList',
                line,
                first,
                second
              })

              firstDuplicate = false
            }
          } else {
            j++
          }
        }
      }

      return [
        identifiers,
        instructions,
        warnings,
        binaryOperator.toLowerCase() as TBinaryOperator
      ]
    }
  }

  function parseCondition (
    line: number,
    fromColumn: number,
    match: RegExpMatchArray,
    startingIndex: number
  ): [null | Condition, readonly Instruction[], readonly Warning[]] {
    const prefix = match[startingIndex]

    if (prefix === undefined) {
      return [null, [], []]
    } else {
      const not = match[startingIndex + 1]

      const [flags, instructions, warnings, binaryOperator] =
        normalizeIdentifierList<'and' | 'or'>(
          line,
          'flag',
          fromColumn + prefix.length + (not === undefined ? 0 : not.length),
          match,
          startingIndex + 2
        )

      switch (binaryOperator) {
        case null:
          return [
            {
              type: not === undefined ? 'flagSet' : 'flagClear',
              flag: flags[0] as Identifier
            },
            instructions,
            warnings
          ]

        case 'and':
          return [
            {
              type: not === undefined ? 'everyFlagSet' : 'someFlagsClear',
              flags
            },
            instructions,
            warnings
          ]

        case 'or':
          return [
            {
              type: not === undefined ? 'someFlagsSet' : 'everyFlagClear',
              flags
            },
            instructions,
            warnings
          ]
      }
    }
  }

  const instructions: Instruction[] = []
  const errors: Error[] = []
  const warnings: Warning[] = []
  const identifierInstances: IdentifierInstance[] = []

  const parseFormatted = (
    line: number,
    fromColumn: number,
    unformatted: string,
    onSuccess: (formatted: Formatted) => void
  ): void => {
    const formatted: Run[] = []

    let previousBold = false
    let previousItalic = false
    let previousCode = false

    let boldFromColumn: null | number = null
    let italicFromColumn: null | number = null
    let codeFromColumn: null | number = null

    let plainText = ''
    let verbatim = ''

    let state:
    | 'noSpecialCharacter'
    | 'backslash'
    | 'asterisk'
    | 'code'
    | 'codeBackslash' = 'noSpecialCharacter'

    let currentRunFromColumn = fromColumn
    let toColumn = fromColumn - 1

    for (const character of unformatted) {
      toColumn++

      let insertBackslash = false

      switch (state) {
        case 'noSpecialCharacter':
          switch (character) {
            case '\\':
              state = 'backslash'
              continue

            case '`':
              verbatim += '`'
              state = 'code'
              codeFromColumn = toColumn
              continue

            case '*':
              verbatim += '*'
              state = 'asterisk'
              continue

            default:
              break
          }
          break

        case 'backslash':
          switch (character) {
            case '\\':
            case '`':
            case '*':
              insertBackslash = true
              state = 'noSpecialCharacter'
              break

            default:
              errors.push({
                type: 'invalidEscapeSequence',
                line,
                verbatim: `\\${character}`,
                fromColumn: toColumn - 1,
                toColumn
              })

              return
          }
          break

        case 'asterisk':
          state = 'noSpecialCharacter'

          if (character === '*') {
            if (boldFromColumn === null) {
              boldFromColumn = toColumn - 1
            } else {
              boldFromColumn = null
            }
            verbatim += '*'
            continue
          } else {
            if (italicFromColumn === null) {
              italicFromColumn = toColumn - 1
            } else {
              italicFromColumn = null
            }

            switch (character) {
              case '\\':
                state = 'backslash'
                continue

              case '`':
                verbatim += '`'
                state = 'code'
                codeFromColumn = toColumn
                continue

              default:
                break
            }
          }
          break

        case 'code':
          switch (character) {
            case '\\':
              state = 'codeBackslash'
              continue

            case '`':
              codeFromColumn = null
              verbatim += '`'
              state = 'noSpecialCharacter'
              continue

            default:
              break
          }
          break

        case 'codeBackslash':
          switch (character) {
            case '\\':
            case '`':
              insertBackslash = true
              state = 'code'
              break

            default:
              errors.push({
                type: 'invalidEscapeSequence',
                line,
                verbatim: `\\${character}`,
                fromColumn: toColumn - 1,
                toColumn
              })

              return
          }
      }

      if (
        (previousBold !== (boldFromColumn !== null) ||
          previousItalic !== (italicFromColumn !== null) ||
          previousCode !== (codeFromColumn !== null)) &&
        ((previousCode && plainText !== '') ||
          (!previousCode && plainText.trim() !== ''))
      ) {
        formatted.push({
          bold: previousBold,
          italic: previousItalic,
          code: previousCode,
          verbatim,
          plainText,
          fromColumn: currentRunFromColumn,
          toColumn: toColumn - (insertBackslash ? 2 : 1)
        })

        plainText = ''
        verbatim = ''

        currentRunFromColumn = toColumn - (insertBackslash ? 1 : 0)
      }

      previousBold = boldFromColumn !== null
      previousItalic = italicFromColumn !== null
      previousCode = codeFromColumn !== null

      if (insertBackslash) {
        verbatim += '\\'
      }

      plainText += character
      verbatim += character
    }

    switch (state) {
      case 'backslash':
      case 'codeBackslash':
        errors.push({
          type: 'incompleteEscapeSequence',
          line,
          column: toColumn
        })

        return

      case 'asterisk':
        if (italicFromColumn === null) {
          italicFromColumn = toColumn
        } else {
          italicFromColumn = null
        }
        break
    }

    if (boldFromColumn !== null) {
      errors.push({
        type: 'unterminatedBold',
        line,
        verbatim: unformatted.slice(boldFromColumn - fromColumn),
        fromColumn: boldFromColumn,
        toColumn
      })
    } else if (italicFromColumn !== null) {
      errors.push({
        type: 'unterminatedItalic',
        line,
        verbatim: unformatted.slice(italicFromColumn - fromColumn),
        fromColumn: italicFromColumn,
        toColumn
      })
    } else if (codeFromColumn !== null) {
      errors.push({
        type: 'unterminatedCode',
        line,
        verbatim: unformatted.slice(codeFromColumn - fromColumn),
        fromColumn: codeFromColumn,
        toColumn
      })
    } else {
      formatted.push({
        bold: previousBold,
        italic: previousItalic,
        code: previousCode,
        verbatim,
        plainText,
        fromColumn: currentRunFromColumn,
        toColumn
      })

      onSuccess(formatted)
    }
  }

  let reachability: Reachability = 'reachable'

  let line = 0

  for (const unparsed of source.split(/\r\n|\r|\n/g)) {
    line++

    const checkReachable = (): boolean => {
      switch (reachability) {
        case 'reachable':
          return true

        case 'willBecomeUnreachableAtEndOfCurrentMenu':
        case 'firstUnreachable':
          warnings.push({
            type: 'unreachable',
            line,
            fromColumn: unparsed.length - unparsed.trimStart().length + 1,
            toColumn: unparsed.trimEnd().length
          })
          reachability = 'unreachable'
          return false

        case 'unreachable':
          return false
      }
    }

    if (/\S/.test(unparsed)) {
      const lineMatch = lineRegex.exec(unparsed)

      if (lineMatch !== null) {
        const prefix = lineMatch[1] as string
        const unformatted = lineMatch[2] as string

        parseFormatted(line, 1 + prefix.length, unformatted, (content) => {
          if (checkReachable()) {
            instructions.push({
              type: 'line',
              line,
              content
            })
          }
        })

        continue
      }

      const locationMatch = locationRegex.exec(unparsed)

      if (locationMatch !== null) {
        const prefix = locationMatch[1] as string
        const backgroundName = locationMatch[2] as string

        const background = normalizeIdentifier(
          line,
          'background',
          'implicitDeclaration',
          1 + prefix.length,
          backgroundName
        )

        if (checkReachable()) {
          instructions.push({
            type: 'location',
            line,
            background
          })

          checkIdentifierConsistency('background', line, background)
        }

        continue
      }

      const singleCharacterEntryAnimationMatch =
        singleCharacterEntryAnimationRegex.exec(unparsed)

      if (singleCharacterEntryAnimationMatch !== null) {
        const isReachable = checkReachable()
        const characterName = singleCharacterEntryAnimationMatch[1] as string
        const enters = singleCharacterEntryAnimationMatch[2] as string
        const animationName = singleCharacterEntryAnimationMatch[3] as string

        const character = normalizeIdentifier(
          line,
          'character',
          'implicitDeclaration',
          1,
          characterName
        )

        const animation = normalizeIdentifier(
          line,
          'entryAnimation',
          'implicitDeclaration',
          1 + characterName.length + enters.length,
          animationName
        )

        if (isReachable) {
          instructions.push({
            type: 'entryAnimation',
            line,
            character,
            animation
          })
        }

        const emotePrefix = singleCharacterEntryAnimationMatch[4]

        if (emotePrefix !== undefined) {
          const emoteName = singleCharacterEntryAnimationMatch[5] as string

          const emote = normalizeIdentifier(
            line,
            'emote',
            'implicitDeclaration',
            1 +
              characterName.length +
              enters.length +
              animationName.length +
              emotePrefix.length,
            emoteName
          )

          if (isReachable) {
            instructions.push({
              type: 'emote',
              line,
              character,
              emote
            })

            checkIdentifierConsistency('emote', line, emote)
          }
        }

        if (isReachable) {
          checkIdentifierConsistency('character', line, character)

          checkIdentifierConsistency('entryAnimation', line, animation)
        }

        continue
      }

      const multiCharacterEntryAnimationMatch =
        multiCharacterEntryAnimationRegex.exec(unparsed)

      if (multiCharacterEntryAnimationMatch !== null) {
        const isReachable = checkReachable()
        const [characters, characterInstructions, characterWarnings] =
          normalizeIdentifierList(
            line,
            'character',
            1,
            multiCharacterEntryAnimationMatch,
            1
          )

        const entry = multiCharacterEntryAnimationMatch[6] as string
        const animationName = multiCharacterEntryAnimationMatch[7] as string

        const animation = normalizeIdentifier(
          line,
          'entryAnimation',
          'implicitDeclaration',
          1 +
            (multiCharacterEntryAnimationMatch[1] as string).length +
            (multiCharacterEntryAnimationMatch[2] as string).length +
            (multiCharacterEntryAnimationMatch[3] as string).length +
            (multiCharacterEntryAnimationMatch[4] as string).length +
            (multiCharacterEntryAnimationMatch[5] as string).length +
            entry.length,
          animationName
        )

        if (isReachable) {
          for (const character of characters) {
            instructions.push({
              type: 'entryAnimation',
              line,
              character,
              animation
            })
          }
        }

        const emotePrefix = multiCharacterEntryAnimationMatch[8]

        if (emotePrefix !== undefined) {
          const emoteName = multiCharacterEntryAnimationMatch[9] as string

          const emote = normalizeIdentifier(
            line,
            'emote',
            'implicitDeclaration',
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
          )

          if (isReachable) {
            for (const character of characters) {
              instructions.push({
                type: 'emote',
                line,
                character,
                emote
              })
            }

            checkIdentifierConsistency('emote', line, emote)
          }
        }

        if (isReachable) {
          instructions.push(...characterInstructions)
          warnings.push(...characterWarnings)

          for (const character of characters) {
            checkIdentifierConsistency('character', line, character)
          }

          checkIdentifierConsistency('entryAnimation', line, animation)
        }

        continue
      }

      const singleCharacterExitAnimationMatch =
        singleCharacterExitAnimationRegex.exec(unparsed)

      if (singleCharacterExitAnimationMatch !== null) {
        const isReachable = checkReachable()
        const characterName = singleCharacterExitAnimationMatch[1] as string
        const enters = singleCharacterExitAnimationMatch[2] as string
        const animationName = singleCharacterExitAnimationMatch[3] as string

        const character = normalizeIdentifier(
          line,
          'character',
          'implicitDeclaration',
          1,
          characterName
        )

        const animation = normalizeIdentifier(
          line,
          'exitAnimation',
          'implicitDeclaration',
          1 + characterName.length + enters.length,
          animationName
        )

        if (isReachable) {
          instructions.push({
            type: 'exitAnimation',
            line,
            character,
            animation
          })
        }

        const emotePrefix = singleCharacterExitAnimationMatch[4]

        if (emotePrefix !== undefined) {
          const emoteName = singleCharacterExitAnimationMatch[5] as string

          const emote = normalizeIdentifier(
            line,
            'emote',
            'implicitDeclaration',
            1 +
              characterName.length +
              enters.length +
              animationName.length +
              emotePrefix.length,
            emoteName
          )

          if (isReachable) {
            instructions.push({
              type: 'emote',
              line,
              character,
              emote
            })

            checkIdentifierConsistency('emote', line, emote)
          }
        }

        if (isReachable) {
          checkIdentifierConsistency('character', line, character)

          checkIdentifierConsistency('exitAnimation', line, animation)
        }

        continue
      }

      const multiCharacterExitAnimationMatch =
        multiCharacterExitAnimationRegex.exec(unparsed)

      if (multiCharacterExitAnimationMatch !== null) {
        const isReachable = checkReachable()

        const [characters, characterInstructions, characterWarnings] =
          normalizeIdentifierList(
            line,
            'character',
            1,
            multiCharacterExitAnimationMatch,
            1
          )

        const exit = multiCharacterExitAnimationMatch[6] as string
        const animationName = multiCharacterExitAnimationMatch[7] as string

        const animation = normalizeIdentifier(
          line,
          'exitAnimation',
          'implicitDeclaration',
          1 +
            (multiCharacterExitAnimationMatch[1] as string).length +
            (multiCharacterExitAnimationMatch[2] as string).length +
            (multiCharacterExitAnimationMatch[3] as string).length +
            (multiCharacterExitAnimationMatch[4] as string).length +
            (multiCharacterExitAnimationMatch[5] as string).length +
            exit.length,
          animationName
        )

        if (isReachable) {
          for (const character of characters) {
            instructions.push({
              type: 'exitAnimation',
              line,
              character,
              animation
            })
          }
        }

        const emotePrefix = multiCharacterExitAnimationMatch[8]

        if (emotePrefix !== undefined) {
          const emoteName = multiCharacterExitAnimationMatch[9] as string

          const emote = normalizeIdentifier(
            line,
            'emote',
            'implicitDeclaration',
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
          )

          if (isReachable) {
            for (const character of characters) {
              instructions.push({
                type: 'emote',
                line,
                character,
                emote
              })
            }

            checkIdentifierConsistency('emote', line, emote)
          }
        }

        if (isReachable) {
          instructions.push(...characterInstructions)
          warnings.push(...characterWarnings)

          for (const character of characters) {
            checkIdentifierConsistency('character', line, character)
          }

          checkIdentifierConsistency('exitAnimation', line, animation)
        }

        continue
      }

      const speakerMatch = speakerRegex.exec(unparsed)

      if (speakerMatch !== null) {
        const isReachable = checkReachable()

        const [characters, characterInstructions, characterWarnings] =
          normalizeIdentifierList(line, 'character', 1, speakerMatch, 1)

        if (isReachable) {
          instructions.push({
            type: 'speaker',
            line,
            characters
          })
        }

        const emotePrefix = speakerMatch[6]

        if (emotePrefix !== undefined) {
          const emoteName = speakerMatch[7] as string

          const emote = normalizeIdentifier(
            line,
            'emote',
            'implicitDeclaration',
            1 +
              (speakerMatch[1] ?? '').length +
              (speakerMatch[2] ?? '').length +
              (speakerMatch[3] ?? '').length +
              (speakerMatch[4] ?? '').length +
              (speakerMatch[5] as string).length +
              emotePrefix.length,
            emoteName
          )

          if (isReachable) {
            for (const character of characters) {
              instructions.push({
                type: 'emote',
                line,
                character,
                emote
              })
            }

            checkIdentifierConsistency('emote', line, emote)
          }
        }

        if (isReachable) {
          instructions.push(...characterInstructions)
          warnings.push(...characterWarnings)

          for (const character of characters) {
            checkIdentifierConsistency('character', line, character)
          }
        }

        continue
      }

      const singleCharacterEmoteMatch =
        singleCharacterEmoteRegex.exec(unparsed)

      if (singleCharacterEmoteMatch !== null) {
        const characterName = singleCharacterEmoteMatch[1] as string
        const is = singleCharacterEmoteMatch[2] as string
        const emoteName = singleCharacterEmoteMatch[3] as string

        const character = normalizeIdentifier(
          line,
          'character',
          'implicitDeclaration',
          1,
          characterName
        )

        const emote = normalizeIdentifier(
          line,
          'emote',
          'implicitDeclaration',
          1 + characterName.length + is.length,
          emoteName
        )

        if (checkReachable()) {
          instructions.push({
            type: 'emote',
            line,
            character,
            emote
          })

          checkIdentifierConsistency('character', line, character)
          checkIdentifierConsistency('emote', line, emote)
        }

        continue
      }

      const multiCharacterEmoteMatch = multiCharacterEmoteRegex.exec(unparsed)

      if (multiCharacterEmoteMatch !== null) {
        const [characters, characterInstructions, characterWarnings] =
          normalizeIdentifierList(
            line,
            'character',
            1,
            multiCharacterEmoteMatch,
            1
          )

        const are = multiCharacterEmoteMatch[6] as string
        const emoteName = multiCharacterEmoteMatch[7] as string

        const emote = normalizeIdentifier(
          line,
          'emote',
          'implicitDeclaration',
          1 +
            (multiCharacterEmoteMatch[1] as string).length +
            (multiCharacterEmoteMatch[2] as string).length +
            (multiCharacterEmoteMatch[3] as string).length +
            (multiCharacterEmoteMatch[4] as string).length +
            (multiCharacterEmoteMatch[5] as string).length +
            are.length,
          emoteName
        )

        if (checkReachable()) {
          for (const character of characters) {
            instructions.push({
              type: 'emote',
              line,
              character,
              emote
            })
          }

          instructions.push(...characterInstructions)
          warnings.push(...characterWarnings)

          for (const character of characters) {
            checkIdentifierConsistency('character', line, character)
          }

          checkIdentifierConsistency('emote', line, emote)
        }

        continue
      }

      const labelMatch = labelRegex.exec(unparsed)

      if (labelMatch !== null) {
        const prefix = labelMatch[1] as string
        const nameString = labelMatch[2] as string

        const name = normalizeIdentifier(
          line,
          'label',
          'declaration',
          1 + prefix.length,
          nameString
        )

        let failed = false

        for (const previousInstruction of instructions) {
          if (
            previousInstruction.type === 'label' &&
            previousInstruction.label.normalized === name.normalized
          ) {
            errors.push({
              type: 'duplicateLabel',
              first: {
                line: previousInstruction.line,
                ...previousInstruction.label
              },
              second: {
                line,
                ...name
              }
            })

            failed = true
          }
        }

        if (failed) {
          continue
        }

        instructions.push({
          type: 'label',
          line,
          label: name
        })

        checkIdentifierConsistency('label', line, name)

        reachability = 'reachable'

        continue
      }

      const menuOptionMatch = menuOptionRegex.exec(unparsed)

      if (menuOptionMatch !== null) {
        const prefix = menuOptionMatch[1] as string
        const unformattedContent = menuOptionMatch[2] as string

        parseFormatted(
          line,
          1 + prefix.length,
          unformattedContent,
          (content) => {
            const betweenContentAndLabelName = menuOptionMatch[3] as string
            const labelName = menuOptionMatch[4] as string

            const label = normalizeIdentifier(
              line,
              'label',
              'reference',
              1 +
                unformattedContent.length +
                prefix.length +
                betweenContentAndLabelName.length,
              labelName
            )

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
              )

            // Workaround for https://github.com/microsoft/TypeScript/issues/46475.
            if ((reachability) !== 'unreachable') {
              instructions.push(
                {
                  type: 'menuOption',
                  line,
                  content,
                  label,
                  instructionIndex: -1,
                  condition
                },
                ...conditionInstructions
              )

              warnings.push(...conditionWarnings)

              checkIdentifierConsistency('label', line, label)

              checkConditionConsistency(line, condition)

              if (condition === null) {
                reachability = 'willBecomeUnreachableAtEndOfCurrentMenu'
              }
            }
          }
        )

        continue
      }

      const setMatch = setRegex.exec(unparsed)

      if (setMatch !== null) {
        const prefix = setMatch[1] as string

        const [flags, flagInstructions, flagWarnings] = normalizeIdentifierList(
          line,
          'flag',
          1 + prefix.length,
          setMatch,
          2
        )

        if (checkReachable()) {
          for (const flag of flags) {
            instructions.push({
              type: 'set',
              line,
              flag
            })

            checkIdentifierConsistency('flag', line, flag)
          }

          instructions.push(...flagInstructions)
          warnings.push(...flagWarnings)
        }

        continue
      }

      const clearMatch = clearRegex.exec(unparsed)

      if (clearMatch !== null) {
        const prefix = clearMatch[1] as string

        const [flags, flagInstructions, flagWarnings] = normalizeIdentifierList(
          line,
          'flag',
          1 + prefix.length,
          clearMatch,
          2
        )

        if (checkReachable()) {
          for (const flag of flags) {
            instructions.push({
              type: 'clear',
              line,
              flag
            })

            checkIdentifierConsistency('flag', line, flag)
          }

          instructions.push(...flagInstructions)
          warnings.push(...flagWarnings)
        }

        continue
      }

      const jumpMatch = jumpRegex.exec(unparsed)

      if (jumpMatch !== null) {
        const prefix = jumpMatch[1] as string
        const labelName = jumpMatch[2] as string

        const previousInstruction =
          instructions.length > 0
            ? instructions[instructions.length - 1]
            : undefined

        const label = normalizeIdentifier(
          line,
          'label',
          'reference',
          1 + prefix.length,
          labelName
        )

        const [condition, conditionInstructions, conditionWarnings] =
          parseCondition(
            line,
            1 + prefix.length + labelName.length,
            jumpMatch,
            3
          )

        if (checkReachable()) {
          if (
            previousInstruction !== undefined &&
            previousInstruction.type === 'label' &&
            condition === null
          ) {
            warnings.push({
              type: 'emptyLabel',
              line: previousInstruction.line,
              label: previousInstruction.label
            })
          }

          instructions.push(
            {
              type: 'jump',
              line,
              label,
              instructionIndex: -1,
              condition
            },
            ...conditionInstructions
          )

          warnings.push(...conditionWarnings)

          checkIdentifierConsistency('label', line, label)

          checkConditionConsistency(line, condition)

          if (condition === null) {
            reachability = 'firstUnreachable'
          }
        }

        continue
      }

      errors.push({
        type: 'unparsable',
        line,
        fromColumn: unparsed.length - unparsed.trimStart().length + 1,
        toColumn: unparsed.trimEnd().length
      })
    }
  }

  for (
    let instructionIndex = 0;
    instructionIndex < instructions.length;
    instructionIndex++
  ) {
    const statement = instructions[instructionIndex] as Instruction

    switch (statement.type) {
      case 'label': {
        const referencedByAJump = instructions.some(
          (jumpInstruction) =>
            jumpInstruction.type === 'jump' &&
            jumpInstruction.label.normalized === statement.label.normalized
        )

        const referencedByAMenuOption = instructions.some(
          (menuOptionInstruction) =>
            menuOptionInstruction.type === 'menuOption' &&
            menuOptionInstruction.label.normalized ===
              statement.label.normalized
        )

        if (!referencedByAJump && !referencedByAMenuOption) {
          warnings.push({
            type: 'unreferencedLabel',
            line: statement.line,
            label: statement.label
          })
        }

        break
      }

      case 'jump':
      case 'menuOption':
        if (
          !instructions.some(
            (labelInstruction) =>
              labelInstruction.type === 'label' &&
              labelInstruction.label.normalized === statement.label.normalized
          )
        ) {
          errors.push({
            type: 'undefinedLabel',
            line: statement.line,
            label: statement.label
          })
        }
    }
  }

  for (const normalizedFlag in identifiers.flag) {
    if (
      !instructions.some(
        (instruction) =>
          instruction.type === 'set' &&
          instruction.flag.normalized === normalizedFlag
      )
    ) {
      const flag = identifiers.flag[normalizedFlag] as LocalIdentifierInstance

      warnings.push({
        type: 'flagNeverSet',
        line: flag.first.line,
        flag: unwrapIdentifier(flag.first)
      })
    }

    if (
      !instructions.some(
        (instruction) =>
          (instruction.type === 'jump' || instruction.type === 'menuOption') &&
          instruction.condition !== null &&
          (instruction.condition.type === 'flagClear' ||
          instruction.condition.type === 'flagSet'
            ? instruction.condition.flag.normalized === normalizedFlag
            : instruction.condition.flags.some(
              (flag) => flag.normalized === normalizedFlag
            ))
      )
    ) {
      const flag = identifiers.flag[normalizedFlag] as LocalIdentifierInstance

      warnings.push({
        type: 'flagNeverReferenced',
        line: flag.first.line,
        flag: unwrapIdentifier(flag.first)
      })
    }
  }

  if (errors.length > 0) {
    return { type: 'invalid', errors, warnings, identifierInstances }
  }

  if (instructions.length > 0) {
    const lastInstruction = instructions[
      instructions.length - 1
    ] as Instruction

    if (
      lastInstruction.type === 'label' &&
      !warnings.some(
        (flagNeverReferencedWarning) =>
          flagNeverReferencedWarning.type === 'unreferencedLabel' &&
          flagNeverReferencedWarning.label.normalized ===
            lastInstruction.label.normalized
      )
    ) {
      warnings.push({
        type: 'emptyLabel',
        line: lastInstruction.line,
        label: lastInstruction.label
      })
    }
  }

  const labelInstructionIndices: Record<string, number> = {}

  let instructionIndex = 0

  for (const statement of instructions) {
    if (statement.type === 'label') {
      labelInstructionIndices[statement.label.normalized] = instructionIndex
    }

    instructionIndex++
  }

  const mappedInstructions = instructions.map((instruction): Instruction => {
    switch (instruction.type) {
      case 'clear':
      case 'emote':
      case 'entryAnimation':
      case 'exitAnimation':
      case 'line':
      case 'location':
      case 'set':
      case 'speaker':
      case 'label':
        return instruction

      case 'jump':
        return {
          ...instruction,
          instructionIndex: labelInstructionIndices[
            instruction.label.normalized
          ] as number
        }

      default:
        return {
          ...instruction,
          instructionIndex: labelInstructionIndices[
            instruction.label.normalized
          ] as number
        }
    }
  })

  return {
    type: 'valid',
    instructions: mappedInstructions,
    warnings,
    identifierInstances
  }
}

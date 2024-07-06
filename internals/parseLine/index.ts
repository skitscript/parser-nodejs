import { checkConditionConsistency } from '../checkConditionConsistency/index.js'
import { checkIdentifierConsistency } from '../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../normalizeIdentifier/index.js'
import { normalizeIdentifierList } from '../normalizeIdentifierList/index.js'
import { parseCondition } from '../parseCondition/index.js'
import { parseFormatted } from '../parseFormatted/index.js'
import type { ParserState } from '../ParserState'

const identifierFilteredCharacterRegexFragment = '!?\'"{}@*/\\\\&#%`+<=>|$.-'

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

export const parseLine = (parserState: ParserState): void => {
  const unparsed = parserState.lineAccumulator
  parserState.lineAccumulator = ''

  parserState.line++

  const checkReachable = (): boolean => {
    switch (parserState.reachability) {
      case 'reachable':
        return true

      case 'willBecomeUnreachableAtEndOfCurrentMenu':
      case 'firstUnreachable':
        parserState.warnings.push({
          type: 'unreachable',
          line: parserState.line,
          fromColumn: unparsed.length - unparsed.trimStart().length + 1,
          toColumn: unparsed.trimEnd().length
        })
        parserState.reachability = 'unreachable'
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

      parseFormatted(parserState, parserState.line, 1 + prefix.length, unformatted, (content) => {
        if (checkReachable()) {
          parserState.instructions.push({
            type: 'line',
            line: parserState.line,
            content
          })
        }
      })

      return
    }

    const locationMatch = locationRegex.exec(unparsed)

    if (locationMatch !== null) {
      const prefix = locationMatch[1] as string
      const backgroundName = locationMatch[2] as string

      const background = normalizeIdentifier(
        parserState,
        parserState.line,
        'background',
        'implicitDeclaration',
        1 + prefix.length,
        backgroundName
      )

      if (checkReachable()) {
        parserState.instructions.push({
          type: 'location',
          line: parserState.line,
          background
        })

        checkIdentifierConsistency(parserState, 'background', parserState.line, background)
      }

      return
    }

    const singleCharacterEntryAnimationMatch =
      singleCharacterEntryAnimationRegex.exec(unparsed)

    if (singleCharacterEntryAnimationMatch !== null) {
      const isReachable = checkReachable()
      const characterName = singleCharacterEntryAnimationMatch[1] as string
      const enters = singleCharacterEntryAnimationMatch[2] as string
      const animationName = singleCharacterEntryAnimationMatch[3] as string

      const character = normalizeIdentifier(
        parserState,
        parserState.line,
        'character',
        'implicitDeclaration',
        1,
        characterName
      )

      const animation = normalizeIdentifier(
        parserState,
        parserState.line,
        'entryAnimation',
        'implicitDeclaration',
        1 + characterName.length + enters.length,
        animationName
      )

      if (isReachable) {
        parserState.instructions.push({
          type: 'entryAnimation',
          line: parserState.line,
          character,
          animation
        })
      }

      const emotePrefix = singleCharacterEntryAnimationMatch[4]

      if (emotePrefix !== undefined) {
        const emoteName = singleCharacterEntryAnimationMatch[5] as string

        const emote = normalizeIdentifier(
          parserState,
          parserState.line,
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
          parserState.instructions.push({
            type: 'emote',
            line: parserState.line,
            character,
            emote
          })

          checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
        }
      }

      if (isReachable) {
        checkIdentifierConsistency(parserState, 'character', parserState.line, character)

        checkIdentifierConsistency(parserState, 'entryAnimation', parserState.line, animation)
      }

      return
    }

    const multiCharacterEntryAnimationMatch =
      multiCharacterEntryAnimationRegex.exec(unparsed)

    if (multiCharacterEntryAnimationMatch !== null) {
      const isReachable = checkReachable()
      const [characters, characterInstructions, characterWarnings] =
        normalizeIdentifierList(
          parserState,
          parserState.line,
          'character',
          1,
          multiCharacterEntryAnimationMatch,
          1
        )

      const entry = multiCharacterEntryAnimationMatch[6] as string
      const animationName = multiCharacterEntryAnimationMatch[7] as string

      const animation = normalizeIdentifier(
        parserState,
        parserState.line,
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
          parserState.instructions.push({
            type: 'entryAnimation',
            line: parserState.line,
            character,
            animation
          })
        }
      }

      const emotePrefix = multiCharacterEntryAnimationMatch[8]

      if (emotePrefix !== undefined) {
        const emoteName = multiCharacterEntryAnimationMatch[9] as string

        const emote = normalizeIdentifier(
          parserState,
          parserState.line,
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
            parserState.instructions.push({
              type: 'emote',
              line: parserState.line,
              character,
              emote
            })
          }

          checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
        }
      }

      if (isReachable) {
        parserState.instructions.push(...characterInstructions)
        parserState.warnings.push(...characterWarnings)

        for (const character of characters) {
          checkIdentifierConsistency(parserState, 'character', parserState.line, character)
        }

        checkIdentifierConsistency(parserState, 'entryAnimation', parserState.line, animation)
      }

      return
    }

    const singleCharacterExitAnimationMatch =
      singleCharacterExitAnimationRegex.exec(unparsed)

    if (singleCharacterExitAnimationMatch !== null) {
      const isReachable = checkReachable()
      const characterName = singleCharacterExitAnimationMatch[1] as string
      const enters = singleCharacterExitAnimationMatch[2] as string
      const animationName = singleCharacterExitAnimationMatch[3] as string

      const character = normalizeIdentifier(
        parserState,
        parserState.line,
        'character',
        'implicitDeclaration',
        1,
        characterName
      )

      const animation = normalizeIdentifier(
        parserState,
        parserState.line,
        'exitAnimation',
        'implicitDeclaration',
        1 + characterName.length + enters.length,
        animationName
      )

      if (isReachable) {
        parserState.instructions.push({
          type: 'exitAnimation',
          line: parserState.line,
          character,
          animation
        })
      }

      const emotePrefix = singleCharacterExitAnimationMatch[4]

      if (emotePrefix !== undefined) {
        const emoteName = singleCharacterExitAnimationMatch[5] as string

        const emote = normalizeIdentifier(
          parserState,
          parserState.line,
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
          parserState.instructions.push({
            type: 'emote',
            line: parserState.line,
            character,
            emote
          })

          checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
        }
      }

      if (isReachable) {
        checkIdentifierConsistency(parserState, 'character', parserState.line, character)

        checkIdentifierConsistency(parserState, 'exitAnimation', parserState.line, animation)
      }

      return
    }

    const multiCharacterExitAnimationMatch =
      multiCharacterExitAnimationRegex.exec(unparsed)

    if (multiCharacterExitAnimationMatch !== null) {
      const isReachable = checkReachable()

      const [characters, characterInstructions, characterWarnings] =
        normalizeIdentifierList(
          parserState,
          parserState.line,
          'character',
          1,
          multiCharacterExitAnimationMatch,
          1
        )

      const exit = multiCharacterExitAnimationMatch[6] as string
      const animationName = multiCharacterExitAnimationMatch[7] as string

      const animation = normalizeIdentifier(
        parserState,
        parserState.line,
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
          parserState.instructions.push({
            type: 'exitAnimation',
            line: parserState.line,
            character,
            animation
          })
        }
      }

      const emotePrefix = multiCharacterExitAnimationMatch[8]

      if (emotePrefix !== undefined) {
        const emoteName = multiCharacterExitAnimationMatch[9] as string

        const emote = normalizeIdentifier(
          parserState,
          parserState.line,
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
            parserState.instructions.push({
              type: 'emote',
              line: parserState.line,
              character,
              emote
            })
          }

          checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
        }
      }

      if (isReachable) {
        parserState.instructions.push(...characterInstructions)
        parserState.warnings.push(...characterWarnings)

        for (const character of characters) {
          checkIdentifierConsistency(parserState, 'character', parserState.line, character)
        }

        checkIdentifierConsistency(parserState, 'exitAnimation', parserState.line, animation)
      }

      return
    }

    const speakerMatch = speakerRegex.exec(unparsed)

    if (speakerMatch !== null) {
      const isReachable = checkReachable()

      const [characters, characterInstructions, characterWarnings] =
      normalizeIdentifierList(parserState, parserState.line, 'character', 1, speakerMatch, 1)

      if (isReachable) {
        parserState.instructions.push({
          type: 'speaker',
          line: parserState.line,
          characters
        })
      }

      const emotePrefix = speakerMatch[6]

      if (emotePrefix !== undefined) {
        const emoteName = speakerMatch[7] as string

        const emote = normalizeIdentifier(
          parserState,
          parserState.line,
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
            parserState.instructions.push({
              type: 'emote',
              line: parserState.line,
              character,
              emote
            })
          }

          checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
        }
      }

      if (isReachable) {
        parserState.instructions.push(...characterInstructions)
        parserState.warnings.push(...characterWarnings)

        for (const character of characters) {
          checkIdentifierConsistency(parserState, 'character', parserState.line, character)
        }
      }

      return
    }

    const singleCharacterEmoteMatch =
      singleCharacterEmoteRegex.exec(unparsed)

    if (singleCharacterEmoteMatch !== null) {
      const characterName = singleCharacterEmoteMatch[1] as string
      const is = singleCharacterEmoteMatch[2] as string
      const emoteName = singleCharacterEmoteMatch[3] as string

      const character = normalizeIdentifier(
        parserState,
        parserState.line,
        'character',
        'implicitDeclaration',
        1,
        characterName
      )

      const emote = normalizeIdentifier(
        parserState,
        parserState.line,
        'emote',
        'implicitDeclaration',
        1 + characterName.length + is.length,
        emoteName
      )

      if (checkReachable()) {
        parserState.instructions.push({
          type: 'emote',
          line: parserState.line,
          character,
          emote
        })

        checkIdentifierConsistency(parserState, 'character', parserState.line, character)
        checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
      }

      return
    }

    const multiCharacterEmoteMatch = multiCharacterEmoteRegex.exec(unparsed)

    if (multiCharacterEmoteMatch !== null) {
      const [characters, characterInstructions, characterWarnings] =
      normalizeIdentifierList(
        parserState,
        parserState.line,
        'character',
        1,
        multiCharacterEmoteMatch,
        1
      )

      const are = multiCharacterEmoteMatch[6] as string
      const emoteName = multiCharacterEmoteMatch[7] as string

      const emote = normalizeIdentifier(
        parserState,
        parserState.line,
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
          parserState.instructions.push({
            type: 'emote',
            line: parserState.line,
            character,
            emote
          })
        }

        parserState.instructions.push(...characterInstructions)
        parserState.warnings.push(...characterWarnings)

        for (const character of characters) {
          checkIdentifierConsistency(parserState, 'character', parserState.line, character)
        }

        checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
      }

      return
    }

    const labelMatch = labelRegex.exec(unparsed)

    if (labelMatch !== null) {
      const prefix = labelMatch[1] as string
      const nameString = labelMatch[2] as string

      const name = normalizeIdentifier(
        parserState,
        parserState.line,
        'label',
        'declaration',
        1 + prefix.length,
        nameString
      )

      let failed = false

      for (const previousInstruction of parserState.instructions) {
        if (
          previousInstruction.type === 'label' &&
          previousInstruction.label.normalized === name.normalized
        ) {
          parserState.errors.push({
            type: 'duplicateLabel',
            first: {
              line: previousInstruction.line,
              ...previousInstruction.label
            },
            second: {
              line: parserState.line,
              ...name
            }
          })

          failed = true
        }
      }

      if (failed) {
        return
      }

      parserState.instructions.push({
        type: 'label',
        line: parserState.line,
        label: name
      })

      checkIdentifierConsistency(parserState, 'label', parserState.line, name)

      parserState.reachability = 'reachable'

      return
    }

    const menuOptionMatch = menuOptionRegex.exec(unparsed)

    if (menuOptionMatch !== null) {
      const prefix = menuOptionMatch[1] as string
      const unformattedContent = menuOptionMatch[2] as string

      parseFormatted(
        parserState,
        parserState.line,
        1 + prefix.length,
        unformattedContent,
        (content) => {
          const betweenContentAndLabelName = menuOptionMatch[3] as string
          const labelName = menuOptionMatch[4] as string

          const label = normalizeIdentifier(
            parserState,
            parserState.line,
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
            parserState,
            parserState.line,
            1 +
                prefix.length +
                unformattedContent.length +
                betweenContentAndLabelName.length +
                labelName.length,
            menuOptionMatch,
            5
          )

          // Workaround for https://github.com/microsoft/TypeScript/issues/46475.
          if (parserState.reachability !== 'unreachable') {
            parserState.instructions.push(
              {
                type: 'menuOption',
                line: parserState.line,
                content,
                label,
                instructionIndex: -1,
                condition
              },
              ...conditionInstructions
            )

            parserState.warnings.push(...conditionWarnings)

            checkIdentifierConsistency(parserState, 'label', parserState.line, label)

            checkConditionConsistency(parserState, parserState.line, condition)

            if (condition === null) {
              parserState.reachability = 'willBecomeUnreachableAtEndOfCurrentMenu'
            }
          }
        }
      )

      return
    }

    const setMatch = setRegex.exec(unparsed)

    if (setMatch !== null) {
      const prefix = setMatch[1] as string

      const [flags, flagInstructions, flagWarnings] = normalizeIdentifierList(
        parserState,
        parserState.line,
        'flag',
        1 + prefix.length,
        setMatch,
        2
      )

      if (checkReachable()) {
        for (const flag of flags) {
          parserState.instructions.push({
            type: 'set',
            line: parserState.line,
            flag
          })

          checkIdentifierConsistency(parserState, 'flag', parserState.line, flag)
        }

        parserState.instructions.push(...flagInstructions)
        parserState.warnings.push(...flagWarnings)
      }

      return
    }

    const clearMatch = clearRegex.exec(unparsed)

    if (clearMatch !== null) {
      const prefix = clearMatch[1] as string

      const [flags, flagInstructions, flagWarnings] = normalizeIdentifierList(
        parserState,
        parserState.line,
        'flag',
        1 + prefix.length,
        clearMatch,
        2
      )

      if (checkReachable()) {
        for (const flag of flags) {
          parserState.instructions.push({
            type: 'clear',
            line: parserState.line,
            flag
          })

          checkIdentifierConsistency(parserState, 'flag', parserState.line, flag)
        }

        parserState.instructions.push(...flagInstructions)
        parserState.warnings.push(...flagWarnings)
      }

      return
    }

    const jumpMatch = jumpRegex.exec(unparsed)

    if (jumpMatch !== null) {
      const prefix = jumpMatch[1] as string
      const labelName = jumpMatch[2] as string

      const previousInstruction =
      parserState.instructions.length > 0
        ? parserState.instructions[parserState.instructions.length - 1]
        : undefined

      const label = normalizeIdentifier(
        parserState,
        parserState.line,
        'label',
        'reference',
        1 + prefix.length,
        labelName
      )

      const [condition, conditionInstructions, conditionWarnings] =
        parseCondition(
          parserState,
          parserState.line,
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
          parserState.warnings.push({
            type: 'emptyLabel',
            line: previousInstruction.line,
            label: previousInstruction.label
          })
        }

        parserState.instructions.push(
          {
            type: 'jump',
            line: parserState.line,
            label,
            instructionIndex: -1,
            condition
          },
          ...conditionInstructions
        )

        parserState.warnings.push(...conditionWarnings)

        checkIdentifierConsistency(parserState, 'label', parserState.line, label)

        checkConditionConsistency(parserState, parserState.line, condition)

        if (condition === null) {
          parserState.reachability = 'firstUnreachable'
        }
      }

      return
    }

    parserState.errors.push({
      type: 'unparsable',
      line: parserState.line,
      fromColumn: unparsed.length - unparsed.trimStart().length + 1,
      toColumn: unparsed.trimEnd().length
    })
  }
}

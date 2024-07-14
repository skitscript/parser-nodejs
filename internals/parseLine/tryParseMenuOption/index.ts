import { checkConditionConsistency } from '../../checkConditionConsistency/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../normalizeIdentifier/index.js'
import { parseCondition } from '../../parseCondition/index.js'
import { parseFormatted } from '../../parseFormatted/index.js'
import type { ParserState } from '../../ParserState'

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

const conditionRegexFragment = `(?:(\\s+when\\s+)(not\\s+)?${identifierListRegexFragmentFactory(
  ['and', 'or']
)})?`

const formattedRegexFragment = '\\S.*\\S|\\S'

const menuOptionRegex = new RegExp(
  `^(>\\s*)(${formattedRegexFragment})(\\s+leads\\s+to\\s+)(${identifierRegexFragment})${conditionRegexFragment}\\s*\\.\\s*$`,
  'i'
)
export const tryParseMenuOption = (parserState: ParserState): boolean => {
  const menuOptionMatch = menuOptionRegex.exec(parserState.mixedCaseLineAccumulator)

  if (menuOptionMatch !== null) {
    const prefix = menuOptionMatch[1] as string
    const unformattedContent = menuOptionMatch[2] as string

    const content = parseFormatted(
      parserState,
      prefix.length,
      prefix.length + unformattedContent.length - 1
    )

    if (content === null) {
      return true
    }

    const betweenContentAndLabelName = menuOptionMatch[3] as string
    const labelName = menuOptionMatch[4] as string

    const label = normalizeIdentifier(
      parserState,
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

      checkIdentifierConsistency(parserState, 'label', label)

      checkConditionConsistency(parserState, condition)

      if (condition === null) {
        parserState.reachability = 'willBecomeUnreachableAtEndOfCurrentMenu'
      }
    }

    return true
  } else {
    return false
  }
}

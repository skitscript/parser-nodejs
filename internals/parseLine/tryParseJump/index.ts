import { checkConditionConsistency } from '../../checkConditionConsistency/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../normalizeIdentifier/index.js'
import { parseCondition } from '../../parseCondition/index.js'
import type { ParserState } from '../../ParserState'
import { checkReachable } from '../checkReachable/index.js'

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

const jumpRegex = new RegExp(
  `^(jump\\s+to\\s+)(${identifierRegexFragment})${conditionRegexFragment}\\s*\\.\\s*$`,
  'i'
)

export const tryParseJump = (parserState: ParserState): boolean => {
  const jumpMatch = jumpRegex.exec(parserState.mixedCaseLineAccumulator)

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

    if (checkReachable(parserState)) {
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

    return true
  } else {
    return false
  }
}

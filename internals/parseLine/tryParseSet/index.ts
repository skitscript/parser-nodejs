import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { normalizeIdentifierList } from '../../normalizeIdentifierList/index.js'
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

const setRegex = new RegExp(
  `^(set\\s+)${identifierListRegexFragmentFactory(['and'])}\\s*\\.\\s*$`,
  'i'
)

export const tryParseSet = (parserState: ParserState): boolean => {
  const setMatch = setRegex.exec(parserState.lineAccumulator)

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

    if (checkReachable(parserState)) {
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

    return true
  } else {
    return false
  }
}

import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../normalizeIdentifier/index.js'
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

const locationRegex = new RegExp(
  `^(location\\s*:\\s*)(${identifierRegexFragment})\\s*\\.\\s*$`,
  'i'
)

export const tryParseLocation = (parserState: ParserState): boolean => {
  const locationMatch = locationRegex.exec(parserState.lineAccumulator)

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

    if (checkReachable(parserState)) {
      parserState.instructions.push({
        type: 'location',
        line: parserState.line,
        background
      })

      checkIdentifierConsistency(parserState, 'background', parserState.line, background)
    }

    return true
  } else {
    return false
  }
}

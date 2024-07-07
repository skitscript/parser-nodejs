import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../normalizeIdentifier/index.js'
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

const identifierListAtLeastTwoRegexFragmentFactory = (
  binaryOperators: readonly string[]
): string =>
  `(${identifierRegexFragment}(?:\\s*,\\s*${identifierRegexFragment})*)(\\s+)(${binaryOperators.join(
    '|'
  )})(\\s+)(${identifierRegexFragment})`

const multiCharacterEmoteRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    'and'
  ])}(\\s+are\\s+)(${identifierRegexFragment})\\s*\\.\\s*$`,
  'i'
)

export const tryParseMultiCharacterEmote = (parserState: ParserState): boolean => {
  const multiCharacterEmoteMatch = multiCharacterEmoteRegex.exec(parserState.lineAccumulator)

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

    if (checkReachable(parserState)) {
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

    return true
  } else {
    return false
  }
}

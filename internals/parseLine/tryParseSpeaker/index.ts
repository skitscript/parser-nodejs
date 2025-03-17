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

const identifierListRegexFragmentFactory = (
  binaryOperators: readonly string[]
): string =>
  `(?:(${identifierRegexFragment}(?:\\s*,\\s*${identifierRegexFragment})*)(\\s+)(${binaryOperators.join(
    '|'
  )})(\\s+))?(${identifierRegexFragment})`

const speakerRegex = new RegExp(
  `^${identifierListRegexFragmentFactory([
    'and'
  ])}(?:(\\s*\\(\\s*)(${identifierRegexFragment})\\s*\\))?\\s*\\:\\s*$`,
  'i'
)

export const tryParseSpeaker = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  // TODO: Remove regex
  const speakerMatch = speakerRegex.exec(parserState.lineAccumulator)

  if (speakerMatch !== null) {
    const isReachable = checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)

    const [characters, characterInstructions, characterWarnings] =
    normalizeIdentifierList(parserState, 'character', 1, speakerMatch, 1)

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

        checkIdentifierConsistency(parserState, 'emote', emote)
      }
    }

    if (isReachable) {
      parserState.instructions.push(...characterInstructions)
      parserState.warnings.push(...characterWarnings)

      for (const character of characters) {
        checkIdentifierConsistency(parserState, 'character', character)
      }
    }

    return true
  } else {
    return false
  }
}

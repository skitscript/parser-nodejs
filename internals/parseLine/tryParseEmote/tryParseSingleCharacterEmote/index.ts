import { checkIdentifierConsistency } from '../../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../../normalizeIdentifier/index.js'
import type { ParserState } from '../../../ParserState/index.js'
import { checkReachable } from '../../checkReachable/index.js'

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

const singleCharacterEmoteRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+is\\s+)(${identifierRegexFragment})\\s*\\.\\s*$`,
  'i'
)

export const tryParseSingleCharacterEmote = (parserState: ParserState): boolean => {
  const singleCharacterEmoteMatch =
  singleCharacterEmoteRegex.exec(parserState.lineAccumulator)

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

    if (checkReachable(parserState)) {
      parserState.instructions.push({
        type: 'emote',
        line: parserState.line,
        character,
        emote
      })

      checkIdentifierConsistency(parserState, 'character', parserState.line, character)
      checkIdentifierConsistency(parserState, 'emote', parserState.line, emote)
    }

    return true
  } else {
    return false
  }
}

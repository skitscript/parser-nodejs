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

const singleCharacterEntryAnimationRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+enters\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

export const tryParseSingleCharacterEntryAnimation = (parserState: ParserState): boolean => {
  const singleCharacterEntryAnimationMatch =
  singleCharacterEntryAnimationRegex.exec(parserState.lineAccumulator)

  if (singleCharacterEntryAnimationMatch !== null) {
    const isReachable = checkReachable(parserState)
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

    return true
  } else {
    return false
  }
}

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

const singleCharacterExitAnimationRegex = new RegExp(
  `^(${identifierRegexFragment})(\\s+exits\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

export const tryParseSingleCharacterExitAnimation = (parserState: ParserState): boolean => {
  const singleCharacterExitAnimationMatch =
  singleCharacterExitAnimationRegex.exec(parserState.lineAccumulator)

  if (singleCharacterExitAnimationMatch !== null) {
    const isReachable = checkReachable(parserState)
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

    return true
  } else {
    return false
  }
}

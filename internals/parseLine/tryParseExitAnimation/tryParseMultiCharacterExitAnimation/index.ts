import { checkIdentifierConsistency } from '../../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../../normalizeIdentifier/index.js'
import { normalizeIdentifierList } from '../../../normalizeIdentifierList/index.js'
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

const identifierListAtLeastTwoRegexFragmentFactory = (
  binaryOperators: readonly string[]
): string =>
  `(${identifierRegexFragment}(?:\\s*,\\s*${identifierRegexFragment})*)(\\s+)(${binaryOperators.join(
    '|'
  )})(\\s+)(${identifierRegexFragment})`

const multiCharacterExitAnimationRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    'and'
  ])}(\\s+exit\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

export const tryParseMultiCharacterExitAnimation = (parserState: ParserState): boolean => {
  const multiCharacterExitAnimationMatch =
  multiCharacterExitAnimationRegex.exec(parserState.lineAccumulator)

  if (multiCharacterExitAnimationMatch !== null) {
    const isReachable = checkReachable(parserState)

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

    return true
  } else {
    return false
  }
}

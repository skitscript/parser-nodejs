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

const multiCharacterEntryAnimationRegex = new RegExp(
  `^${identifierListAtLeastTwoRegexFragmentFactory([
    'and'
  ])}(\\s+enter\\s+)(${identifierRegexFragment})(?:(\\s*,\\s*)(${identifierRegexFragment}))?\\s*\\.\\s*$`,
  'i'
)

export const tryParseMultiCharacterEntryAnimation = (parserState: ParserState): boolean => {
  const multiCharacterEntryAnimationMatch =
  multiCharacterEntryAnimationRegex.exec(parserState.lineAccumulator)

  if (multiCharacterEntryAnimationMatch !== null) {
    const isReachable = checkReachable(parserState)
    const [characters, characterInstructions, characterWarnings] =
    normalizeIdentifierList(
      parserState,
      parserState.line,
      'character',
      1,
      multiCharacterEntryAnimationMatch,
      1
    )

    const entry = multiCharacterEntryAnimationMatch[6] as string
    const animationName = multiCharacterEntryAnimationMatch[7] as string

    const animation = normalizeIdentifier(
      parserState,
      parserState.line,
      'entryAnimation',
      'implicitDeclaration',
      1 +
      (multiCharacterEntryAnimationMatch[1] as string).length +
      (multiCharacterEntryAnimationMatch[2] as string).length +
      (multiCharacterEntryAnimationMatch[3] as string).length +
      (multiCharacterEntryAnimationMatch[4] as string).length +
      (multiCharacterEntryAnimationMatch[5] as string).length +
      entry.length,
      animationName
    )

    if (isReachable) {
      for (const character of characters) {
        parserState.instructions.push({
          type: 'entryAnimation',
          line: parserState.line,
          character,
          animation
        })
      }
    }

    const emotePrefix = multiCharacterEntryAnimationMatch[8]

    if (emotePrefix !== undefined) {
      const emoteName = multiCharacterEntryAnimationMatch[9] as string

      const emote = normalizeIdentifier(
        parserState,
        parserState.line,
        'emote',
        'implicitDeclaration',
        1 +
        (multiCharacterEntryAnimationMatch[1] as string).length +
        (multiCharacterEntryAnimationMatch[2] as string).length +
        (multiCharacterEntryAnimationMatch[3] as string).length +
        (multiCharacterEntryAnimationMatch[4] as string).length +
        (multiCharacterEntryAnimationMatch[5] as string).length +
        entry.length +
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

      checkIdentifierConsistency(parserState, 'entryAnimation', parserState.line, animation)
    }

    return true
  } else {
    return false
  }
}

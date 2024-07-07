import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../normalizeIdentifier/index.js'
import type { ParserState } from '../../ParserState'

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

const identifierRegexFragment = `(?=.*[^${identifierFilteredCharacterRegexFragment}\\s].*)(?:(?!(?:${identifierDisallowedWords.join(
  '|'
)})\\b)[^${identifierDisallowedCharacters.join(
  ''
)}]+)(?:\\s+(?!(?:${identifierDisallowedWords.join(
  '|'
)})\\b)[^${identifierDisallowedCharacters.join('')}]+)*`

const labelRegex = new RegExp(
  `^(\\s*~\\s*)(${identifierRegexFragment})\\s*~\\s*$`,
  'i'
)

export const tryParseLabel = (parserState: ParserState): boolean => {
  const labelMatch = labelRegex.exec(parserState.lineAccumulator)

  if (labelMatch !== null) {
    const prefix = labelMatch[1] as string
    const nameString = labelMatch[2] as string

    const name = normalizeIdentifier(
      parserState,
      parserState.line,
      'label',
      'declaration',
      1 + prefix.length,
      nameString
    )

    let failed = false

    for (const previousInstruction of parserState.instructions) {
      if (
        previousInstruction.type === 'label' &&
        previousInstruction.label.normalized === name.normalized
      ) {
        parserState.errors.push({
          type: 'duplicateLabel',
          first: {
            line: previousInstruction.line,
            ...previousInstruction.label
          },
          second: {
            line: parserState.line,
            ...name
          }
        })

        failed = true
      }
    }

    if (failed) {
      return true
    }

    parserState.instructions.push({
      type: 'label',
      line: parserState.line,
      label: name
    })

    checkIdentifierConsistency(parserState, 'label', parserState.line, name)

    parserState.reachability = 'reachable'

    return true
  } else {
    return false
  }
}

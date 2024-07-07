import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { normalizeIdentifier } from '../../normalizeIdentifier/index.js'
import type { ParserState } from '../../ParserState'

export const tryParseLabel = (parserState: ParserState): boolean => {
  if (parserState.lineAccumulator.length < 3) {
    return false
  }

  if (parserState.lineAccumulator.charAt(0) !== '~') {
    return false
  }

  if (parserState.lineAccumulator.charAt(parserState.lineAccumulator.length - 1) !== '~') {
    return false
  }

  let fromColumn = 1

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
    fromColumn++
  }

  if (fromColumn === parserState.lineAccumulator.length - 1) {
    return false
  }

  let toColumn = parserState.lineAccumulator.length - 2

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
    toColumn--
  }

  const nameString = parserState.lineAccumulator.slice(fromColumn, 3 + toColumn - fromColumn)

  const name = normalizeIdentifier(
    parserState,
    parserState.line,
    'label',
    'declaration',
    fromColumn + 1,
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

  if (!failed) {
    parserState.instructions.push({
      type: 'label',
      line: parserState.line,
      label: name
    })

    checkIdentifierConsistency(parserState, 'label', parserState.line, name)

    parserState.reachability = 'reachable'
  }

  return true
}

import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'

export const tryParseLabel = (parserState: ParserState): boolean => {
  if (parserState.lowerCaseLineAccumulator.length < 3) {
    return false
  }

  if (parserState.lowerCaseLineAccumulator.charAt(0) !== '~') {
    return false
  }

  if (parserState.lowerCaseLineAccumulator.charAt(parserState.lowerCaseLineAccumulator.length - 1) !== '~') {
    return false
  }

  let fromColumn = 1

  while (characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(fromColumn))) {
    fromColumn++
  }

  if (fromColumn === parserState.lowerCaseLineAccumulator.length - 1) {
    return false
  }

  let toColumn = parserState.lowerCaseLineAccumulator.length - 2

  while (characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(toColumn))) {
    toColumn--
  }

  const name = tryParseIdentifier(parserState, fromColumn, toColumn)

  if (name === null) {
    return false
  }

  addIdentifierToIndex(parserState, name, 'label', 'declaration')

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

      return true
    }
  }

  parserState.instructions.push({
    type: 'label',
    line: parserState.line,
    label: name
  })

  checkIdentifierConsistency(parserState, 'label', name)

  parserState.reachability = 'reachable'

  return true
}

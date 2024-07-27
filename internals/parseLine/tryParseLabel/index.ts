import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsTilde } from '../../characterIsTilde/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'

// TODO: Warning for immediately overwritten emote
// TODO: Warning for immediately overwritten speaker
// TODO: Warning for immediately overwritten exit/entry animation
export const tryParseLabel = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 2) {
    return false
  }

  if (!characterIsTilde(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!characterIsTilde(parserState.lineAccumulator.charAt(indexOfLastNonWhiteSpaceCharacter))) {
    return false
  }

  let fromColumn = 1

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
    fromColumn++
  }

  if (fromColumn === indexOfLastNonWhiteSpaceCharacter) {
    return false
  }

  let toColumn = indexOfLastNonWhiteSpaceCharacter - 1

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
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

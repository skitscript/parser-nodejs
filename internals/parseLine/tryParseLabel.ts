import { characterIsTilde } from './characterIsTilde.js'
import { characterIsWhitespace } from '../characterIsWhitespace.js'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from './tryParseIdentifier.js'

// TODO: Warning for immediately overwritten emote
// TODO: Warning for immediately overwritten speaker
// TODO: Warning for immediately overwritten exit/entry animation
export const tryParseLabel = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 2) {
    return false
  }

  if (!characterIsTilde(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!characterIsTilde(parserState.lineAccumulator.charAt(parserState.indexOfLastNonWhiteSpaceCharacter))) {
    return false
  }

  let fromColumn = 1

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
    fromColumn++
  }

  if (fromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
    return false
  }

  let toColumn = parserState.indexOfLastNonWhiteSpaceCharacter - 1

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
    toColumn--
  }

  const name = tryParseIdentifier(parserState, fromColumn, toColumn, 'label', 'declaration', parserState.identifierInstances, parserState.warnings, parserState.identifiers)

  if (name === null) {
    return false
  }

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

  parserState.reachability = 'reachable'

  return true
}

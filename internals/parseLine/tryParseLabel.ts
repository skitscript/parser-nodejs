import { codepointIsTilde } from './codepointIsTilde.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from './tryParseIdentifier.js'

// TODO: Warning for immediately overwritten emote
// TODO: Warning for immediately overwritten speaker
// TODO: Warning for immediately overwritten exit/entry animation
export const tryParseLabel = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 2) {
    return false
  }

  if (!codepointIsTilde(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!codepointIsTilde(parserState.lineAccumulator.charAt(parserState.indexOfLastNonWhiteSpaceCharacter))) {
    return false
  }

  let fromColumn = 1

  while (codepointIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
    fromColumn++
  }

  if (fromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
    return false
  }

  let toColumn = parserState.indexOfLastNonWhiteSpaceCharacter - 1

  while (codepointIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
    toColumn--
  }

  const name = tryParseIdentifier(parserState, fromColumn, toColumn, 'label', 'declaration', parserState.identifier_instances, parserState.warnings, parserState.identifiers)

  if (name === null) {
    return false
  }

  for (const previousInstruction of parserState.instructions) {
    if (
      previousInstruction.type === 'label' &&
        previousInstruction.label.normalized === name.normalized
    ) {
      parserState.errors.push({
        type: 'duplicate_label',
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

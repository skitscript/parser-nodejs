import type { ParserState } from '../../ParserState'

export const checkReachable = (parserState: ParserState): boolean => {
  switch (parserState.reachability) {
    case 'reachable':
      return true

    case 'willBecomeUnreachableAtEndOfCurrentMenu':
    case 'firstUnreachable':
      parserState.warnings.push({
        type: 'unreachable',
        line: parserState.line,
        fromColumn: parserState.lineAccumulator.length - parserState.lineAccumulator.trimStart().length + 1,
        toColumn: parserState.lineAccumulator.trimEnd().length
      })
      parserState.reachability = 'unreachable'
      return false

    case 'unreachable':
      return false
  }
}

import type { ParserState } from './ParserState'

export const calculateColumn = (_parserState: ParserState, index: number): number => {
  return index + 1
}

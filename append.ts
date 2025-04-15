import { parseCodepoint } from './internals/parseCodepoint.js'
import type { ParserState } from './internals/ParserState'

export const append = (parserState: ParserState, character: string): void => {
  if (parserState.state === 'ended') {
    throw new Error('Unable to append to a parser which has ended.')
  }

  parseCodepoint(parserState, character)
}

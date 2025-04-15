import { characterIsWhitespace } from './internals/characterIsWhitespace.js'
import { parseLine } from './internals/parseLine/index.js'
import type { ParserState } from './internals/ParserState'

export const append = (parserState: ParserState, character: string): void => {
  if (parserState.state === 'ended') {
    throw new Error('Unable to append to a parser which has ended.')
  }

  switch (character) {
    case '\r':
      parseLine(parserState)
      parserState.state = 'followingCarriageReturn'
      break

    case '\n':
      if (parserState.state === 'followingCarriageReturn') {
        parserState.state = 'normal'
      } else {
        parseLine(parserState)
      }
      break

    default:
      parserState.state = 'normal'

      if (!characterIsWhitespace(character)) {
        if (parserState.indexOfFirstNonWhiteSpaceCharacter === -1) {
          parserState.indexOfFirstNonWhiteSpaceCharacter = parserState.lineAccumulator.length
        }

        parserState.indexOfLastNonWhiteSpaceCharacter = parserState.lineAccumulator.length
      }

      parserState.lineAccumulator += character
      break
  }
}

import { parseLine } from './parseLine/index.js'
import { codepointIsWhitespace } from './codepointIsWhitespace.js'
import type { ParserState } from './ParserState'

export const parseCodepoint = (parserState: ParserState, codepoint: string): void => {
  switch (codepoint) {
    case '\r':
      parseLine(parserState)
      parserState.state = 'following_carriage_return'
      break

    case '\n':
      if (parserState.state === 'following_carriage_return') {
        parserState.state = 'normal'
      } else {
        parseLine(parserState)
      }
      break

    default:
      parserState.state = 'normal'

      if (!codepointIsWhitespace(codepoint)) {
        if (parserState.indexOfFirstNonWhiteSpaceCharacter === -1) {
          parserState.indexOfFirstNonWhiteSpaceCharacter = parserState.lineAccumulator.length
        }

        parserState.indexOfLastNonWhiteSpaceCharacter = parserState.lineAccumulator.length
      }

      parserState.lineAccumulator += codepoint
      break
  }
}

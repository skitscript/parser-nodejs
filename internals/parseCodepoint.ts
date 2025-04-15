import { parseLine } from './parseLine/index.js'
import { codepointIsWhitespace } from './codepointIsWhitespace.js'
import type { ParserState } from './ParserState'

export const parseCodepoint = (parserState: ParserState, codepoint: number): void => {
  switch (codepoint) {
    case 13:
      parseLine(parserState)
      parserState.state = 'following_carriage_return'
      break

    case 10:
      if (parserState.state === 'following_carriage_return') {
        parserState.state = 'normal'
      } else {
        parseLine(parserState)
      }
      break

    default: {
      parserState.state = 'normal'

      const character = String.fromCodePoint(codepoint)

      if (!codepointIsWhitespace(character)) {
        if (parserState.indexOfFirstNonWhiteSpaceCharacter === -1) {
          parserState.indexOfFirstNonWhiteSpaceCharacter = parserState.lineAccumulator.length
        }

        parserState.indexOfLastNonWhiteSpaceCharacter = parserState.lineAccumulator.length
      }

      parserState.lineAccumulator += character
      break
    }
  }
}

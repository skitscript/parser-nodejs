import { parseCodepoint } from './internals/parseCodepoint.js'
import type { ParserState } from './internals/ParserState'

export const append = (parserState: ParserState, byte: number): void => {
  if (parserState.state === 'ended') {
    throw new Error('Unable to append to a parser which has ended.')
  }

  if (parserState.state === 'invalid_codepoint') {
    return
  }

  if (!Number.isSafeInteger(byte) || byte < 0 || byte > 255 || Object.is(-0, byte)) {
    throw new Error('Bytes must be integers between 0 and 255.')
  }

  switch (parserState.codepointState) {
    case 'initial':
      if ((byte & 128) === 0) {
        parseCodepoint(parserState, byte)
      } else if ((byte & 224) === 192) {
        parserState.codepointState = 'two_byte_two'
        parserState.codepointAccumulator = (byte & 63) << 6
      } else if ((byte & 240) === 224) {
        parserState.codepointState = 'three_byte_two'
        parserState.codepointAccumulator = (byte & 15) << 12
      } else if ((byte & 248) === 240) {
        parserState.codepointState = 'four_byte_two'
        parserState.codepointAccumulator = (byte & 7) << 18
      } else {
        parserState.state = 'invalid_codepoint'
        parserState.errors.push({
          type: 'invalid_codepoint',
          line: parserState.line + 1,
          // TODO: WRONG!
          column: parserState.lineAccumulator.length + 1
        })
      }
      break

    case 'two_byte_two':
      if ((byte & 192) === 128) {
        parserState.codepointState = 'initial'
        parseCodepoint(parserState, parserState.codepointAccumulator | (byte & 63))
      } else {
        parserState.state = 'invalid_codepoint'
        parserState.errors.push({
          type: 'invalid_codepoint',
          line: parserState.line + 1,
          // TODO: WRONG!
          column: parserState.lineAccumulator.length + 1
        })
      }
      break

    case 'three_byte_two':
      if ((byte & 192) === 128) {
        parserState.codepointState = 'three_byte_three'
        parserState.codepointAccumulator |= (byte & 63) << 6
      } else {
        parserState.state = 'invalid_codepoint'
        parserState.errors.push({
          type: 'invalid_codepoint',
          line: parserState.line + 1,
          // TODO: WRONG!
          column: parserState.lineAccumulator.length + 1
        })
      }
      break

    case 'three_byte_three':
      if ((byte & 192) === 128) {
        parserState.codepointState = 'initial'
        parseCodepoint(parserState, parserState.codepointAccumulator | (byte & 63))
      } else {
        parserState.state = 'invalid_codepoint'
        parserState.errors.push({
          type: 'invalid_codepoint',
          line: parserState.line + 1,
          // TODO: WRONG!
          column: parserState.lineAccumulator.length + 1
        })
      }
      break

    case 'four_byte_two':
      if ((byte & 192) === 128) {
        parserState.codepointState = 'four_byte_three'
        parserState.codepointAccumulator |= (byte & 63) << 12
      } else {
        parserState.state = 'invalid_codepoint'
        parserState.errors.push({
          type: 'invalid_codepoint',
          line: parserState.line + 1,
          // TODO: WRONG!
          column: parserState.lineAccumulator.length + 1
        })
      }
      break

    case 'four_byte_three':
      if ((byte & 192) === 128) {
        parserState.codepointState = 'four_byte_four'
        parserState.codepointAccumulator |= (byte & 63) << 6
      } else {
        parserState.state = 'invalid_codepoint'
        parserState.errors.push({
          type: 'invalid_codepoint',
          line: parserState.line + 1,
          // TODO: WRONG!
          column: parserState.lineAccumulator.length + 1
        })
      }
      break

    case 'four_byte_four':
      if ((byte & 192) === 128) {
        parserState.codepointState = 'initial'
        parseCodepoint(parserState, parserState.codepointAccumulator | (byte & 63))
      } else {
        parserState.state = 'invalid_codepoint'
        parserState.errors.push({
          type: 'invalid_codepoint',
          line: parserState.line + 1,
          // TODO: WRONG!
          column: parserState.lineAccumulator.length + 1
        })
      }
      break
  }
}

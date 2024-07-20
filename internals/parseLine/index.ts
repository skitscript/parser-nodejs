import type { ParserState } from '../ParserState'
import { tryParseClear } from './tryParseClear/index.js'
import { tryParseJump } from './tryParseJump/index.js'
import { tryParseLabel } from './tryParseLabel/index.js'
import { tryParseLocation } from './tryParseLocation/index.js'
import { tryParseMenuOption } from './tryParseMenuOption/index.js'
import { tryParseSet } from './tryParseSet/index.js'
import { tryParseSpeaker } from './tryParseSpeaker/index.js'
import { tryParseEmote } from './tryParseEmote/index.js'
import { tryParseEntryAnimation } from './tryParseEntryAnimation/index.js'
import { tryParseExitAnimation } from './tryParseExitAnimation/index.js'
import { parseFormatted } from '../parseFormatted/index.js'
import { checkReachable } from './checkReachable/index.js'

export const parseLine = (parserState: ParserState): void => {
  parserState.line++

  switch (parserState.indexOfFirstNonWhiteSpaceCharacter) {
    case -1:
      break

    case 0:
      if (tryParseLabel(parserState)) {
        break
      }

      if (tryParseSpeaker(parserState)) {
        break
      }

      if (parserState.lowerCaseLineAccumulator.charAt(parserState.indexOfLastNonWhiteSpaceCharacter) === '.') {
        if (tryParseClear(parserState)) {
          break
        }

        if (tryParseJump(parserState)) {
          break
        }

        if (tryParseLocation(parserState)) {
          break
        }

        if (tryParseMenuOption(parserState)) {
          break
        }

        if (tryParseSet(parserState)) {
          break
        }

        if (tryParseEmote(parserState)) {
          break
        }

        if (tryParseEntryAnimation(parserState)) {
          break
        }

        if (tryParseExitAnimation(parserState)) {
          break
        }
      }

      parserState.errors.push({
        type: 'unparsable',
        line: parserState.line,
        fromColumn: parserState.indexOfFirstNonWhiteSpaceCharacter + 1,
        toColumn: parserState.indexOfLastNonWhiteSpaceCharacter + 1
      })
      break

    default: {
      const content = parseFormatted(parserState, parserState.indexOfFirstNonWhiteSpaceCharacter, parserState.indexOfLastNonWhiteSpaceCharacter)

      if (content !== null && checkReachable(parserState)) {
        parserState.instructions.push({
          type: 'line',
          line: parserState.line,
          content
        })
      }
    }
      break
  }

  parserState.mixedCaseLineAccumulator = ''
  parserState.lowerCaseLineAccumulator = ''
  parserState.indexOfFirstNonWhiteSpaceCharacter = -1
  parserState.indexOfLastNonWhiteSpaceCharacter = -1
}

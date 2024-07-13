import type { ParserState } from '../ParserState'
import { tryParseClear } from './tryParseClear/index.js'
import { tryParseJump } from './tryParseJump/index.js'
import { tryParseLabel } from './tryParseLabel/index.js'
import { tryParseLine } from './tryParseLine/index.js'
import { tryParseLocation } from './tryParseLocation/index.js'
import { tryParseMenuOption } from './tryParseMenuOption/index.js'
import { tryParseSet } from './tryParseSet/index.js'
import { tryParseSpeaker } from './tryParseSpeaker/index.js'
import { tryParseEmote } from './tryParseEmote/index.js'
import { tryParseEntryAnimation } from './tryParseEntryAnimation/index.js'
import { tryParseExitAnimation } from './tryParseExitAnimation/index.js'
import { characterIsWhitespace } from '../characterIsWhitespace/index.js'

export const parseLine = (parserState: ParserState): void => {
  parserState.line++

  if (parserState.lowerCaseLineAccumulator.length > 0) {
    let fromColumn = 0

    while (fromColumn < parserState.lowerCaseLineAccumulator.length && characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(fromColumn))) {
      fromColumn++
    }

    switch (fromColumn) {
      case 0: {
        if (tryParseLabel(parserState)) {
          break
        }

        if (tryParseSpeaker(parserState)) {
          break
        }

        if (parserState.lowerCaseLineAccumulator.charAt(parserState.lowerCaseLineAccumulator.length - 1) === '.') {
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

        let toColumn = parserState.lowerCaseLineAccumulator.length - 1

        while (toColumn >= fromColumn && characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(toColumn))) {
          toColumn--
        }

        parserState.errors.push({
          type: 'unparsable',
          line: parserState.line,
          fromColumn: fromColumn + 1,
          toColumn: toColumn + 1
        })
      }
        break

      case parserState.lowerCaseLineAccumulator.length:
        break

      default: {
        // TODO: Optimize, we already know where to start parsing from.
        if (tryParseLine(parserState)) {
          break
        }

        let toColumn = parserState.lowerCaseLineAccumulator.length - 1

        while (toColumn >= fromColumn && characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(toColumn))) {
          toColumn--
        }

        parserState.errors.push({
          type: 'unparsable',
          line: parserState.line,
          fromColumn: fromColumn + 1,
          toColumn: toColumn + 1
        })
      }
        break
    }
  }

  parserState.mixedCaseLineAccumulator = ''
  parserState.lowerCaseLineAccumulator = ''
}

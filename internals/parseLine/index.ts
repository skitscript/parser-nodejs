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
import { characterIsWhitespace } from '../characterIsWhitespace/index.js'
import { characterIsPeriod } from '../characterIsPeriod/index.js'

export const parseLine = (parserState: ParserState): void => {
  parserState.line++

  if (parserState.indexOfFirstNonWhiteSpaceCharacter !== -1) {
    let indexOfLastNonWhiteSpaceCharacter = parserState.lineAccumulator.length - 1

    while (characterIsWhitespace(parserState.lineAccumulator.charAt(indexOfLastNonWhiteSpaceCharacter))) {
      indexOfLastNonWhiteSpaceCharacter--
    }

    if (parserState.indexOfFirstNonWhiteSpaceCharacter === 0) {
      if (!tryParseLabel(parserState, indexOfLastNonWhiteSpaceCharacter) &&
        !tryParseSpeaker(parserState, indexOfLastNonWhiteSpaceCharacter) &&
        (
          !characterIsPeriod(parserState.lineAccumulator.charAt(indexOfLastNonWhiteSpaceCharacter)) ||
          (
            !tryParseClear(parserState, indexOfLastNonWhiteSpaceCharacter) &&
            !tryParseJump(parserState, indexOfLastNonWhiteSpaceCharacter) &&
            !tryParseLocation(parserState, indexOfLastNonWhiteSpaceCharacter) &&
            !tryParseMenuOption(parserState) &&
            !tryParseSet(parserState, indexOfLastNonWhiteSpaceCharacter) &&
            !tryParseEmote(parserState, indexOfLastNonWhiteSpaceCharacter) &&
            !tryParseEntryAnimation(parserState, indexOfLastNonWhiteSpaceCharacter) &&
            !tryParseExitAnimation(parserState, indexOfLastNonWhiteSpaceCharacter)
          ))) {
        parserState.errors.push({
          type: 'unparsable',
          line: parserState.line,
          fromColumn: parserState.indexOfFirstNonWhiteSpaceCharacter + 1,
          toColumn: indexOfLastNonWhiteSpaceCharacter + 1
        })
      }
    } else {
      const content = parseFormatted(parserState, parserState.indexOfFirstNonWhiteSpaceCharacter, indexOfLastNonWhiteSpaceCharacter)

      if (content !== null && checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
        parserState.instructions.push({
          type: 'line',
          line: parserState.line,
          content
        })
      }
    }
  }

  parserState.lineAccumulator = ''
  parserState.indexOfFirstNonWhiteSpaceCharacter = -1
}

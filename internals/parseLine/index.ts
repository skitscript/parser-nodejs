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

export const parseLine = (parserState: ParserState): void => {
  parserState.line++

  if (/\S/.test(parserState.lineAccumulator) && !(
    tryParseClear(parserState) ||
    tryParseEmote(parserState) ||
    tryParseEntryAnimation(parserState) ||
    tryParseExitAnimation(parserState) ||
    tryParseJump(parserState) ||
    tryParseLabel(parserState) ||
    tryParseLine(parserState) ||
    tryParseLocation(parserState) ||
    tryParseMenuOption(parserState) ||
    tryParseSet(parserState) ||
    tryParseSpeaker(parserState)
  )) {
    parserState.errors.push({
      type: 'unparsable',
      line: parserState.line,
      fromColumn: parserState.lineAccumulator.length - parserState.lineAccumulator.trimStart().length + 1,
      toColumn: parserState.lineAccumulator.trimEnd().length
    })
  }

  parserState.lineAccumulator = ''
}

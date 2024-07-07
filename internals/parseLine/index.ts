import type { ParserState } from '../ParserState'
import { tryParseClear } from './tryParseClear/index.js'
import { tryParseJump } from './tryParseJump/index.js'
import { tryParseLabel } from './tryParseLabel/index.js'
import { tryParseLine } from './tryParseLine/index.js'
import { tryParseLocation } from './tryParseLocation/index.js'
import { tryParseMenuOption } from './tryParseMenuOption/index.js'
import { tryParseMultiCharacterEmote } from './tryParseMultiCharacterEmote/index.js'
import { tryParseMultiCharacterEntryAnimation } from './tryParseMultiCharacterEntryAnimation/index.js'
import { tryParseMultiCharacterExitAnimation } from './tryParseMultiCharacterExitAnimation/index.js'
import { tryParseSet } from './tryParseSet/index.js'
import { tryParseSingleCharacterEmote } from './tryParseSingleCharacterEmote/index.js'
import { tryParseSingleCharacterEntryAnimation } from './tryParseSingleCharacterEntryAnimation/index.js'
import { tryParseSingleCharacterExitAnimation } from './tryParseSingleCharacterExitAnimation/index.js'
import { tryParseSpeaker } from './tryParseSpeaker/index.js'

export const parseLine = (parserState: ParserState): void => {
  parserState.line++

  if (/\S/.test(parserState.lineAccumulator) && !(
    tryParseClear(parserState) ||
    tryParseJump(parserState) ||
    tryParseLabel(parserState) ||
    tryParseLine(parserState) ||
    tryParseLocation(parserState) ||
    tryParseMenuOption(parserState) ||
    tryParseMultiCharacterEmote(parserState) ||
    tryParseMultiCharacterEntryAnimation(parserState) ||
    tryParseMultiCharacterExitAnimation(parserState) ||
    tryParseSet(parserState) ||
    tryParseSingleCharacterEmote(parserState) ||
    tryParseSingleCharacterEntryAnimation(parserState) ||
    tryParseSingleCharacterExitAnimation(parserState) ||
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

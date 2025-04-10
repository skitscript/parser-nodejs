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
import { characterIsPeriod } from '../characterIsPeriod/index.js'
import type { Warning } from '../../Warning'
import type { IdentifierType } from '../../IdentifierType'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'

export const parseLine = (parserState: ParserState): void => {
  parserState.line++

  if (parserState.indexOfFirstNonWhiteSpaceCharacter !== -1) {
    if (parserState.indexOfFirstNonWhiteSpaceCharacter === 0) {
      if (!tryParseLabel(parserState) &&
        !tryParseSpeaker(parserState) &&
        (
          !characterIsPeriod(parserState.lineAccumulator.charAt(parserState.indexOfLastNonWhiteSpaceCharacter)) ||
          (
            !tryParseClear(parserState) &&
            !tryParseJump(parserState) &&
            !tryParseLocation(parserState) &&
            !tryParseMenuOption(parserState) &&
            !tryParseSet(parserState) &&
            !tryParseEmote(parserState) &&
            !tryParseEntryAnimation(parserState) &&
            !tryParseExitAnimation(parserState)
          ))) {
        parserState.errors.push({
          type: 'unparsable',
          line: parserState.line,
          fromColumn: 1,
          toColumn: parserState.indexOfLastNonWhiteSpaceCharacter + 1
        })
      }
    } else {
      const content = parseFormatted(parserState, parserState.indexOfFirstNonWhiteSpaceCharacter, parserState.indexOfLastNonWhiteSpaceCharacter)

      const newWarnings: Warning[] = []
      const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
        character: {},
        emote: {},
        entryAnimation: {},
        exitAnimation: {},
        label: {},
        flag: {},
        location: {}
      }

      if (content !== null && checkReachable(parserState, newWarnings, newIdentifiers)) {
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
  parserState.indexOfLastNonWhiteSpaceCharacter = -1
}

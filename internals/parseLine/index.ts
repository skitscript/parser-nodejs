import type { ParserState } from '../ParserState'
import { tryParseClear } from './tryParseClear.js'
import { tryParseJump } from './tryParseJump.js'
import { tryParseLabel } from './tryParseLabel.js'
import { tryParseLocation } from './tryParseLocation.js'
import { tryParseMenuOption } from './tryParseMenuOption.js'
import { tryParseSet } from './tryParseSet.js'
import { tryParseSpeaker } from './tryParseSpeaker.js'
import { tryParseEmote } from './tryParseEmote.js'
import { tryParseEntryAnimation } from './tryParseEntryAnimation.js'
import { tryParseExitAnimation } from './tryParseExitAnimation.js'
import { parseFormatted } from './parseFormatted.js'
import { checkReachable } from './checkReachable.js'
import { characterIsPeriod } from './characterIsPeriod.js'
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
        entry_animation: {},
        exit_animation: {},
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

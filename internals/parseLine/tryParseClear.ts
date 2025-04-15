import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { characterIsA } from '../characterIsA.js'
import { characterIsC } from '../characterIsC.js'
import { characterIsE } from '../characterIsE.js'
import { characterIsL } from '../characterIsL.js'
import { characterIsR } from '../characterIsR.js'
import { characterIsWhitespace } from '../characterIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseAndIdentifierList } from '../tryParseAndIdentifierList.js'
import { checkReachable } from './checkReachable.js'

export const tryParseClear = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 7) {
    return false
  }

  if (
    !characterIsC(parserState.lineAccumulator.charAt(0))
  ) {
    return false
  }

  if (!characterIsL(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!characterIsE(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!characterIsA(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  if (!characterIsR(parserState.lineAccumulator.charAt(4))) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(5))) {
    return false
  }

  const newIdentifierInstances: IdentifierInstance[] = []
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

  const flags = tryParseAndIdentifierList(parserState, 6, parserState.indexOfLastNonWhiteSpaceCharacter - 1, 'flag', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

  if (flags === null) {
    return false
  }

  parserState.identifierInstances.push(...newIdentifierInstances)

  if (checkReachable(parserState, newWarnings, newIdentifiers)) {
    for (const flag of flags) {
      parserState.instructions.push({
        type: 'clear',
        line: parserState.line,
        flag
      })
    }
  }

  return true
}

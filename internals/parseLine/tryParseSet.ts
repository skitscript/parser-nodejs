import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { codepointIsE } from './codepointIsE.js'
import { codepointIsS } from './codepointIsS.js'
import { codepointIsT } from './codepointIsT.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseAndIdentifierList } from './tryParseAndIdentifierList.js'
import { checkReachable } from './checkReachable.js'

export const tryParseSet = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 5) {
    return false
  }

  if (!codepointIsS(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!codepointIsE(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!codepointIsT(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!codepointIsWhitespace(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  const newIdentifierInstances: IdentifierInstance[] = []
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

  const flags = tryParseAndIdentifierList(parserState, 4, parserState.indexOfLastNonWhiteSpaceCharacter - 1, 'flag', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

  if (flags === null) {
    return false
  }

  parserState.identifier_instances.push(...newIdentifierInstances)

  if (checkReachable(parserState, newWarnings, newIdentifiers)) {
    for (const flag of flags) {
      parserState.instructions.push({
        type: 'set',
        line: parserState.line,
        flag
      })
    }
  }

  return true
}

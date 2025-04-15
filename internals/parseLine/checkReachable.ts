import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'

export const checkReachable = (
  parserState: ParserState,
  newWarnings: readonly Warning[],
  newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; }
): boolean => {
  switch (parserState.reachability) {
    case 'reachable':
      parserState.warnings.push(...newWarnings)

      for (const identifierType in newIdentifiers) {
        const identifiersOfType = parserState.identifiers[identifierType as IdentifierType]
        const newIdentifiersOfType = newIdentifiers[identifierType as IdentifierType]

        for (const key in newIdentifiersOfType) {
          identifiersOfType[key] = newIdentifiersOfType[key] as LocalIdentifierInstance
        }
      }
      return true

    case 'willBecomeUnreachableAtEndOfCurrentMenu':
    case 'firstUnreachable':
      parserState.warnings.push({
        type: 'unreachable',
        line: parserState.line,
        fromColumn: parserState.indexOfFirstNonWhiteSpaceCharacter + 1,
        toColumn: parserState.indexOfLastNonWhiteSpaceCharacter + 1
      })
      parserState.reachability = 'unreachable'
      return false

    case 'unreachable':
      return false
  }
}

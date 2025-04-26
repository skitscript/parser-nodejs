import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { calculateColumn } from './calculateColumn.js'

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

    case 'will_become_unreachable_at_end_of_current_menu':
    case 'first_unreachable':
      parserState.warnings.push({
        type: 'unreachable',
        line: parserState.line,
        from_column: calculateColumn(parserState, parserState.indexOfFirstNonWhiteSpaceCharacter),
        to_column: calculateColumn(parserState, parserState.indexOfLastNonWhiteSpaceCharacter)
      })
      parserState.reachability = 'unreachable'
      return false

    case 'unreachable':
      return false
  }
}

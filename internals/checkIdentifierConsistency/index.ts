import type { Identifier } from '../../Identifier'
import type { IdentifierType } from '../../IdentifierType'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'

export const checkIdentifierConsistency = (
  parserState: ParserState,
  identifierType: IdentifierType,
  line: number,
  identifier: Identifier
): void => {
  const identifiersByType = parserState.identifiers[identifierType]

  const identifierReference = {
    ...identifier,
    line
  }

  if (
    Object.prototype.hasOwnProperty.call(
      identifiersByType,
      identifier.normalized
    )
  ) {
    const existing = identifiersByType[
      identifier.normalized
    ] as LocalIdentifierInstance

    if (
      !existing.reportedInconsistent &&
      existing.first.verbatim !== identifier.verbatim &&
      existing.first.line !== line
    ) {
      parserState.warnings.push({
        type: 'inconsistentIdentifier',
        first: existing.first,
        second: identifierReference
      })

      existing.reportedInconsistent = true
    }
  } else {
    identifiersByType[identifier.normalized] = {
      first: identifierReference,
      reportedInconsistent: false
    }
  }
}

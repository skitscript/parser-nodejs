import type { Identifier } from '../Identifier'

export const unwrapIdentifier = (identifier: Identifier): Identifier => ({
  verbatim: identifier.verbatim,
  normalized: identifier.normalized,
  from_column: identifier.from_column,
  to_column: identifier.to_column
})

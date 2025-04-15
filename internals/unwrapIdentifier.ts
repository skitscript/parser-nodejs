import type { Identifier } from '../Identifier'

export const unwrapIdentifier = (identifier: Identifier): Identifier => ({
  verbatim: identifier.verbatim,
  normalized: identifier.normalized,
  fromColumn: identifier.fromColumn,
  toColumn: identifier.toColumn
})

import type { Identifier } from '../../Identifier'
import type { IdentifierContext } from '../../IdentifierContext'
import type { IdentifierType } from '../../IdentifierType'
import { addIdentifierToIndex } from '../addIdentifierToIndex/index.js'
import type { ParserState } from '../ParserState'

export const addIdentifierListToIndex = (
  parserState: ParserState,
  identifiers: readonly Identifier[],
  type: IdentifierType,
  context: IdentifierContext): void => {
  for (const identifier of identifiers) {
    addIdentifierToIndex(parserState, identifier, type, context)
  }
}

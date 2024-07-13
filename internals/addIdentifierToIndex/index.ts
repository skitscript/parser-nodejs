import type { Identifier } from '../../Identifier'
import type { IdentifierContext } from '../../IdentifierContext'
import type { IdentifierType } from '../../IdentifierType'
import type { ParserState } from '../ParserState'

export const addIdentifierToIndex = (
  parserState: ParserState,
  identifier: Identifier,
  type: IdentifierType,
  context: IdentifierContext): void => {
  parserState.identifierInstances.push({
    ...identifier,
    type,
    line: parserState.line,
    context
  })
}

import type { Identifier } from '../../Identifier'
import type { IdentifierContext } from '../../IdentifierContext'
import type { IdentifierType } from '../../IdentifierType'
import type { ParserState } from '../ParserState'

const identifierFilteredCharacterRegex = /[!?'"{}@*/\\&#%`+<=>|$.-]/ig

// TODO: This will be removed eventually.
export const normalizeIdentifier = (
  parserState: ParserState,
  line: number,
  type: IdentifierType,
  context: IdentifierContext,
  fromColumn: number,
  verbatim: string
): Identifier => {
  const identifier = {
    verbatim,
    normalized: verbatim
      .toLowerCase()
      .replace(identifierFilteredCharacterRegex, ' ')
      .trim()
      .replace(/\s+/g, '-'),
    fromColumn,
    toColumn: fromColumn + verbatim.length - 1
  }

  parserState.identifierInstances.push({
    ...identifier,
    type,
    line,
    context
  })

  return identifier
}

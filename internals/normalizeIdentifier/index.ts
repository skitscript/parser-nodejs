import type { Identifier } from '../../Identifier'
import type { IdentifierContext } from '../../IdentifierContext'
import type { IdentifierType } from '../../IdentifierType'
import type { ParserState } from '../ParserState'

const identifierFilteredCharacterRegex = /[!?'"{}@*/\\&#%`+<=>|$.-]/ig

// TODO: This will be removed eventually.
export const normalizeIdentifier = (
  parserState: ParserState,
  type: IdentifierType,
  context: IdentifierContext,
  fromColumn: number,
  verbatim: string
): Identifier => {
  const identifier = {
    verbatim,
    normalized: verbatim
      .replace(identifierFilteredCharacterRegex, ' ')
      .trim()
      .replace(/\s+/g, '-')

      // TODO: These will be removed once this is fed from the lower case accumulator.
      .replace(/A/g, 'a')
      .replace(/B/g, 'b')
      .replace(/C/g, 'c')
      .replace(/D/g, 'd')
      .replace(/E/g, 'e')
      .replace(/F/g, 'f')
      .replace(/G/g, 'g')
      .replace(/H/g, 'h')
      .replace(/I/g, 'i')
      .replace(/J/g, 'j')
      .replace(/K/g, 'k')
      .replace(/L/g, 'l')
      .replace(/M/g, 'm')
      .replace(/N/g, 'n')
      .replace(/O/g, 'o')
      .replace(/P/g, 'p')
      .replace(/Q/g, 'q')
      .replace(/R/g, 'r')
      .replace(/S/g, 's')
      .replace(/T/g, 't')
      .replace(/U/g, 'u')
      .replace(/V/g, 'v')
      .replace(/W/g, 'w')
      .replace(/X/g, 'x')
      .replace(/Y/g, 'y')
      .replace(/Z/g, 'z'),
    fromColumn,
    toColumn: fromColumn + verbatim.length - 1
  }

  parserState.identifierInstances.push({
    ...identifier,
    type,
    line: parserState.line,
    context
  })

  return identifier
}

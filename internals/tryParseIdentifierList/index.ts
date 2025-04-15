import type { Identifier } from '../../Identifier'
import type { IdentifierContext } from '../../IdentifierContext'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { characterIsComma } from '../characterIsComma/index.js'
import { characterIsWhitespace } from '../characterIsWhitespace/index.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import { filterDuplicatesFromIdentifierList } from '../parseLine/filterDuplicatesFromIdentifierList/index.js'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from '../tryParseIdentifier/index.js'

export const tryParseIdentifierList = (
  parserState: ParserState,
  fromColumn: number,
  separatorFromColumn: number,
  separatorToColumn: number,
  toColumn: number,
  type: IdentifierType,
  context: IdentifierContext,
  newIdentifierInstances: IdentifierInstance[],
  newWarnings: Warning[],
  newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance> }
): null | readonly Identifier[] => {
  const output: Identifier[] = []
  let foundComma = false
  let identifierFromColumn = -1
  let identifierToColumn = -1

  for (let index = fromColumn; index < separatorFromColumn; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsComma(character)) {
      if (foundComma) {
        return null
      } else if (identifierFromColumn === -1) {
        return null
      } else {
        const identifier = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

        if (identifier === null) {
          return null
        } else {
          output.push(identifier)
          identifierFromColumn = -1
          foundComma = true
        }
      }
    } else if (!characterIsWhitespace(character)) {
      foundComma = false

      if (identifierFromColumn === -1) {
        identifierFromColumn = index
      }

      identifierToColumn = index
    }
  }

  if (foundComma) {
    return null
  }

  if (identifierFromColumn === -1) {
    return null
  }

  const penultimateIdentifier = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

  if (penultimateIdentifier === null) {
    return null
  } else {
    output.push(penultimateIdentifier)

    identifierFromColumn = -1

    for (let index = separatorToColumn + 1; index <= toColumn; index++) {
      if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
        if (identifierFromColumn === -1) {
          identifierFromColumn = index
        }

        identifierToColumn = index
      }
    }

    if (identifierFromColumn === -1) {
      return null
    }

    const finalIdentifier = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

    if (finalIdentifier === null) {
      return null
    } else {
      output.push(finalIdentifier)
      return filterDuplicatesFromIdentifierList(parserState, newWarnings, output)
    }
  }
}

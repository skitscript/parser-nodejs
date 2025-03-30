import type { Identifier } from '../../Identifier'
import type { IdentifierContext } from '../../IdentifierContext'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { characterIsComma } from '../characterIsComma/index.js'
import { characterIsO } from '../characterIsO/index.js'
import { characterIsR } from '../characterIsR/index.js'
import { characterIsWhitespace } from '../characterIsWhitespace/index.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from '../tryParseIdentifier/index.js'

const isOr = (parserState: ParserState, separatorFromColumn: number): boolean => {
  if (characterIsO(parserState.lineAccumulator.charAt(separatorFromColumn + 1))) {
    if (characterIsR(parserState.lineAccumulator.charAt(separatorFromColumn + 2))) {
      if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn + 3))) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

export const tryParseOrIdentifierList = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number,
  type: IdentifierType,
  context: IdentifierContext,
  newIdentifierInstances: IdentifierInstance[],
  newWarnings: Warning[],
  newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance> }
): null | readonly Identifier[] => {
  const lastPossibleSeparatorFromColumn = toColumn - 4
  let separatorFromColumn = fromColumn + 1
  let identifierFromColumn: number = characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn)) ? -1 : fromColumn
  let identifierToColumn: number = identifierFromColumn

  while (true) {
    if (separatorFromColumn > lastPossibleSeparatorFromColumn) {
      while (separatorFromColumn <= toColumn) {
        if (!characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn))) {
          if (identifierFromColumn === -1) {
            identifierFromColumn = separatorFromColumn
          }

          identifierToColumn = separatorFromColumn
        }

        separatorFromColumn++
      }

      if (identifierFromColumn === -1) {
        return null
      }

      const sole = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

      if (sole === null) {
        return null
      }

      return [sole]
    }

    if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn))) {
      if (isOr(parserState, separatorFromColumn)) {
        break
      }
    } else {
      if (identifierFromColumn === -1) {
        identifierFromColumn = separatorFromColumn
      }

      identifierToColumn = separatorFromColumn
    }

    separatorFromColumn++
  }

  identifierFromColumn = -1
  identifierToColumn = -1

  const output: Identifier[] = []

  for (let index = fromColumn; index < separatorFromColumn; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsComma(character)) {
      if (identifierFromColumn === -1) {
        return null
      } else {
        const next = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

        if (next === null) {
          return null
        }

        output.push(next)

        identifierFromColumn = -1
        identifierToColumn = -1
      }
    } else if (!characterIsWhitespace(character)) {
      if (identifierFromColumn === -1) {
        identifierFromColumn = index
      }

      identifierToColumn = index
    }
  }

  if (identifierFromColumn === -1) {
    return null
  }

  const lastBeforeKeyword = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

  if (lastBeforeKeyword === null) {
    return null
  }

  output.push(lastBeforeKeyword)

  identifierFromColumn = -1
  identifierToColumn = -1

  for (let index = separatorFromColumn + 4; index <= toColumn; index++) {
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

  const afterKeyword = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

  if (afterKeyword === null) {
    return null
  }

  output.push(afterKeyword)

  const filteredOutput: Identifier[] = []

  for (let index = 0; index < output.length; index++) {
    const second = output[index] as Identifier

    let first: null | Identifier = null
    let emitWarnings = true

    for (let previousIndex = 0; previousIndex < index; previousIndex++) {
      const candidate = output[previousIndex] as Identifier

      if (candidate.normalized === second.normalized) {
        if (first === null) {
          first = candidate
        } else {
          emitWarnings = false
          previousIndex = index
        }
      }
    }

    if (first === null) {
      filteredOutput.push(second)
    } else if (emitWarnings) {
      if (parserState.reachability === 'reachable') {
        newWarnings.push({
          type: 'duplicateIdentifierInList',
          line: parserState.line,
          first,
          second
        })

        for (let index = 0; index < newWarnings.length;) {
          const warning = newWarnings[index] as Warning

          if (warning.type === 'inconsistentIdentifier') {
            if (warning.second.fromColumn === second.fromColumn) {
              newWarnings.splice(index, 1)
            } else {
              index++
            }
          } else {
            index++
          }
        }
      }
    }
  }

  return filteredOutput
}

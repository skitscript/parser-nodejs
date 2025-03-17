import type { Identifier } from '../../Identifier'
import type { IdentifierType } from '../../IdentifierType'
import { addIdentifierToIndex } from '../addIdentifierToIndex/index.js'
import { characterIsA } from '../characterIsA/index.js'
import { characterIsComma } from '../characterIsComma/index.js'
import { characterIsD } from '../characterIsD/index.js'
import { characterIsN } from '../characterIsN/index.js'
import { characterIsWhitespace } from '../characterIsWhitespace/index.js'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from '../tryParseIdentifier/index.js'

const isAnd = (parserState: ParserState, separatorFromColumn: number): boolean => {
  if (!characterIsA(parserState.lineAccumulator.charAt(separatorFromColumn + 1))) {
    return false
  }

  if (!characterIsN(parserState.lineAccumulator.charAt(separatorFromColumn + 2))) {
    return false
  }

  if (!characterIsD(parserState.lineAccumulator.charAt(separatorFromColumn + 3))) {
    return false
  }

  return characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn + 4))
}

export const tryParseAndIdentifierList = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number,
  type: IdentifierType
): null | readonly Identifier[] => {
  const lastPossibleSeparatorFromColumn = toColumn - 5
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

      const sole = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn)

      if (sole === null) {
        return null
      }

      addIdentifierToIndex(parserState, sole, type, 'implicitDeclaration')

      return [sole]
    }

    if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn))) {
      if (isAnd(parserState, separatorFromColumn)) {
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
        const next = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn)

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

  const lastBeforeKeyword = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn)

  if (lastBeforeKeyword === null) {
    return null
  }

  output.push(lastBeforeKeyword)

  identifierFromColumn = -1
  identifierToColumn = -1

  for (let index = separatorFromColumn + 5; index <= toColumn; index++) {
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

  const afterKeyword = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn)

  if (afterKeyword === null) {
    return null
  }

  output.push(afterKeyword)

  const filteredOutput: Identifier[] = []

  for (let index = 0; index < output.length; index++) {
    const second = output[index] as Identifier

    addIdentifierToIndex(parserState, second, type, 'implicitDeclaration')

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
        parserState.warnings.push({
          type: 'duplicateIdentifierInList',
          line: parserState.line,
          first,
          second
        })
      }
    }
  }

  return filteredOutput
}

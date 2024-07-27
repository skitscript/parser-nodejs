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

export const tryParseAndIdentifierList = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number,
  type: IdentifierType
): null | readonly Identifier[] => {
  const lastPossibleSeparatorFromColumn = toColumn - 5
  let separatorFromColumn = fromColumn + 1
  let identifierFromColumn: null | number = characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn)) ? null : fromColumn
  let identifierToColumn: null | number = identifierFromColumn

  while (true) {
    if (separatorFromColumn > lastPossibleSeparatorFromColumn) {
      while (separatorFromColumn <= toColumn) {
        const whitespace = characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn))

        if (!whitespace) {
          if (identifierFromColumn === null) {
            identifierFromColumn = separatorFromColumn
          }

          identifierToColumn = separatorFromColumn
        }

        separatorFromColumn++
      }

      if (identifierFromColumn === null) {
        return null
      }

      const sole = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn as number)

      if (sole === null) {
        return null
      }

      addIdentifierToIndex(parserState, sole, type, 'implicitDeclaration')

      return [sole]
    }

    const whitespace = characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn))

    if (whitespace) {
      if (
        characterIsA(parserState.lineAccumulator.charAt(separatorFromColumn + 1)) &&
        characterIsN(parserState.lineAccumulator.charAt(separatorFromColumn + 2)) &&
        characterIsD(parserState.lineAccumulator.charAt(separatorFromColumn + 3)) &&
        characterIsWhitespace(parserState.lineAccumulator.charAt(separatorFromColumn + 4))) {
        break
      }
    } else {
      if (identifierFromColumn === null) {
        identifierFromColumn = separatorFromColumn
      }

      identifierToColumn = separatorFromColumn
    }

    separatorFromColumn++
  }

  identifierFromColumn = null
  identifierToColumn = null

  const output: Identifier[] = []

  for (let index = fromColumn; index < separatorFromColumn; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsComma(character)) {
      if (identifierFromColumn === null) {
        return null
      } else {
        const next = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn as number)

        if (next === null) {
          return null
        }

        output.push(next)

        identifierFromColumn = null
        identifierToColumn = null
      }
    } else if (!characterIsWhitespace(character)) {
      if (identifierFromColumn === null) {
        identifierFromColumn = index
      }

      identifierToColumn = index
    }
  }

  if (identifierFromColumn === null) {
    return null
  }

  const lastBeforeKeyword = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn as number)

  if (lastBeforeKeyword === null) {
    return null
  }

  output.push(lastBeforeKeyword)

  identifierFromColumn = null
  identifierToColumn = null

  for (let index = separatorFromColumn + 5; index <= toColumn; index++) {
    if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
      if (identifierFromColumn === null) {
        identifierFromColumn = index
      }

      identifierToColumn = index
    }
  }

  if (identifierFromColumn === null) {
    return null
  }

  const afterKeyword = tryParseIdentifier(parserState, identifierFromColumn, identifierToColumn as number)

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

import type { Identifier } from '../../Identifier'
import { characterIsExcludedFromIdentifiers } from '../characterIsExcludedFromIdentifiers/index.js'
import { characterIsInvalidInIdentifiers } from '../characterIsInvalidInIdentifiers/index.js'
import type { ParserState } from '../ParserState'
import { wordIsInvalidInIdentifiers } from '../wordIsInvalidInIdentifiers/index.js'

export const tryParseIdentifier = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number
): null | Identifier => {
  let includedFromColumn = fromColumn

  while (true) {
    const character = parserState.lowerCaseLineAccumulator.charAt(includedFromColumn)

    if (characterIsInvalidInIdentifiers(character)) {
      return null
    }

    if (!characterIsExcludedFromIdentifiers(character)) {
      break
    }

    if (includedFromColumn > toColumn) {
      return null
    }

    includedFromColumn++
  }

  let includedToColumn = toColumn

  while (includedToColumn > includedFromColumn) {
    const character = parserState.lowerCaseLineAccumulator.charAt(includedToColumn)

    if (characterIsInvalidInIdentifiers(character)) {
      return null
    }

    if (!characterIsExcludedFromIdentifiers(character)) {
      break
    }

    includedToColumn--
  }

  let startOfCurrentWord: null | number = null
  let normalized = ''

  for (let index = includedFromColumn; index <= includedToColumn; index++) {
    const character = parserState.lowerCaseLineAccumulator.charAt(index)

    if (characterIsInvalidInIdentifiers(character)) {
      return null
    }

    if (characterIsExcludedFromIdentifiers(character)) {
      if (startOfCurrentWord !== null) {
        if (wordIsInvalidInIdentifiers(parserState.lowerCaseLineAccumulator, startOfCurrentWord, index - 1)) {
          return null
        }

        normalized += `${parserState.lowerCaseLineAccumulator.slice(startOfCurrentWord, index)}-`

        startOfCurrentWord = null
      }
    } else if (startOfCurrentWord === null) {
      startOfCurrentWord = index
    }
  }

  if (startOfCurrentWord !== null) {
    if (wordIsInvalidInIdentifiers(parserState.lowerCaseLineAccumulator, startOfCurrentWord, includedToColumn)) {
      return null
    }

    normalized += parserState.lowerCaseLineAccumulator.slice(startOfCurrentWord, includedToColumn + 1)
  }

  const identifier: Identifier = {
    verbatim: parserState.mixedCaseLineAccumulator.slice(fromColumn, toColumn + 1),
    normalized,
    fromColumn: fromColumn + 1,
    toColumn: toColumn + 1
  }

  return identifier
}

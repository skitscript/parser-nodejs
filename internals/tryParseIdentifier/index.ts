import type { Identifier } from '../../Identifier'
import { characterIsExcludedFromIdentifiers } from '../characterIsExcludedFromIdentifiers/index.js'
import { characterIsInvalidInIdentifiers } from '../characterIsInvalidInIdentifiers/index.js'
import type { ParserState } from '../ParserState'
import { transformCharacterToLowerCase } from '../transformCharacterToLowerCase/index.js'
import { wordIsInvalidInIdentifiers } from '../wordIsInvalidInIdentifiers/index.js'

export const tryParseIdentifier = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number
): null | Identifier => {
  let includedFromColumn = fromColumn

  while (true) {
    const character = parserState.lineAccumulator.charAt(includedFromColumn)

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
    const character = parserState.lineAccumulator.charAt(includedToColumn)

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
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsInvalidInIdentifiers(character)) {
      return null
    }

    if (characterIsExcludedFromIdentifiers(character)) {
      if (startOfCurrentWord !== null) {
        const wordLength = index - startOfCurrentWord

        if (wordIsInvalidInIdentifiers(parserState, startOfCurrentWord, wordLength)) {
          return null
        }

        for (let wordCharacterIndex = 0; wordCharacterIndex < wordLength; wordCharacterIndex++) {
          normalized += transformCharacterToLowerCase(parserState.lineAccumulator.charAt(startOfCurrentWord + wordCharacterIndex))
        }

        normalized += '-'

        startOfCurrentWord = null
      }
    } else if (startOfCurrentWord === null) {
      startOfCurrentWord = index
    }
  }

  if (startOfCurrentWord !== null) {
    const wordLength = 1 + includedToColumn - startOfCurrentWord

    if (wordIsInvalidInIdentifiers(parserState, startOfCurrentWord, wordLength)) {
      return null
    }

    for (let wordCharacterIndex = 0; wordCharacterIndex < wordLength; wordCharacterIndex++) {
      normalized += transformCharacterToLowerCase(parserState.lineAccumulator.charAt(startOfCurrentWord + wordCharacterIndex))
    }
  }

  const identifier: Identifier = {
    verbatim: parserState.lineAccumulator.slice(fromColumn, toColumn + 1),
    normalized,
    fromColumn: fromColumn + 1,
    toColumn: toColumn + 1
  }

  return identifier
}

import type { Identifier } from '../Identifier'
import type { IdentifierContext } from '../IdentifierContext'
import type { IdentifierInstance } from '../IdentifierInstance'
import type { IdentifierType } from '../IdentifierType'
import type { Warning } from '../Warning'
import { characterIsExcludedFromIdentifiers } from './characterIsExcludedFromIdentifiers.js'
import { characterIsInvalidInIdentifiers } from './characterIsInvalidInIdentifiers.js'
import type { LocalIdentifierInstance } from './LocalIdentifierInstance'
import type { ParserState } from './ParserState'
import { transformCharacterToLowerCase } from './transformCharacterToLowerCase.js'
import { wordIsInvalidInIdentifiers } from './wordIsInvalidInIdentifiers.js'

export const tryParseIdentifier = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number,
  type: IdentifierType,
  context: IdentifierContext,
  newIdentifierInstances: IdentifierInstance[],
  newWarnings: Warning[],
  newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance> }
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

  let startOfCurrentWord: number = -1
  let normalized = ''

  for (let index = includedFromColumn; index <= includedToColumn; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsInvalidInIdentifiers(character)) {
      return null
    }

    if (characterIsExcludedFromIdentifiers(character)) {
      if (startOfCurrentWord !== -1) {
        const wordLength = index - startOfCurrentWord

        if (wordIsInvalidInIdentifiers(parserState, startOfCurrentWord, wordLength)) {
          return null
        }

        for (let wordCharacterIndex = 0; wordCharacterIndex < wordLength; wordCharacterIndex++) {
          normalized += transformCharacterToLowerCase(parserState.lineAccumulator.charAt(startOfCurrentWord + wordCharacterIndex))
        }

        normalized += '-'

        startOfCurrentWord = -1
      }
    } else if (startOfCurrentWord === -1) {
      startOfCurrentWord = index
    }
  }

  if (startOfCurrentWord !== -1) {
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

  const identifiersByType = parserState.identifiers[type]
  const newIdentifiersByType = newIdentifiers[type]

  const existing = Object.prototype.hasOwnProperty.call(
    identifiersByType,
    identifier.normalized
  )
    ? identifiersByType[identifier.normalized] as LocalIdentifierInstance
    : (
        Object.prototype.hasOwnProperty.call(
          newIdentifiersByType,
          identifier.normalized
        )
          ? newIdentifiersByType[identifier.normalized] as LocalIdentifierInstance
          : null
      )

  const identifierReference = {
    ...identifier,
    line: parserState.line
  }

  if (existing === null) {
    newIdentifiersByType[identifier.normalized] = {
      first: identifierReference,
      reportedInconsistent: false
    }
  } else {
    if (
      !existing.reportedInconsistent &&
      existing.first.verbatim !== identifier.verbatim &&
      existing.first.line !== parserState.line
    ) {
      newWarnings.push({
        type: 'inconsistentIdentifier',
        first: existing.first,
        second: identifierReference
      })

      existing.reportedInconsistent = true
    }
  }

  newIdentifierInstances.push({
    ...identifier,
    type,
    context,
    line: parserState.line
  })

  return identifier
}

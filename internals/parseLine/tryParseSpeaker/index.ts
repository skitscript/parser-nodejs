import type { Identifier } from '../../../Identifier'
import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { addIdentifierListToIndex } from '../../addIdentifierListToIndex/index.js'
import { characterIsClosingParenthesis } from '../../characterIsClosingParenthesis/index.js'
import { characterIsColon } from '../../characterIsColon/index.js'
import { characterIsOpeningParenthesis } from '../../characterIsOpeningParenthesis/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseSpeaker = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  let charactersToColumn = -1
  let foundOpeningParenthesis = false
  let emoteFromColumn = -1
  let emoteToColumn = -1
  let foundClosingParenthesis = false
  let foundColon = false

  for (let index = 0; index <= indexOfLastNonWhiteSpaceCharacter; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsOpeningParenthesis(character)) {
      if (charactersToColumn === -1) {
        return false
      }

      if (foundOpeningParenthesis) {
        return false
      }

      if (foundColon) {
        return false
      }

      foundOpeningParenthesis = true
    } else if (characterIsClosingParenthesis(character)) {
      if (emoteToColumn === -1) {
        return false
      }

      if (foundClosingParenthesis) {
        return false
      }

      foundClosingParenthesis = true
    } else if (characterIsColon(character)) {
      if (charactersToColumn === -1) {
        return false
      }

      if (foundColon) {
        return false
      }

      if (foundOpeningParenthesis && !foundClosingParenthesis) {
        return false
      }

      foundColon = true
    } else if (!characterIsWhitespace(character)) {
      if (foundColon) {
        return false
      }

      if (foundOpeningParenthesis) {
        if (foundClosingParenthesis) {
          return false
        } else {
          if (emoteFromColumn === -1) {
            emoteFromColumn = index
          }

          emoteToColumn = index
        }
      } else {
        charactersToColumn = index
      }
    }
  }

  if (!foundColon) {
    return false
  }

  let emote: null | Identifier = null

  if (foundOpeningParenthesis) {
    emote = tryParseIdentifier(parserState, emoteFromColumn, emoteToColumn)

    if (emote === null) {
      return false
    }
  }

  const charactersAndIdentifiers = tryParseAndIdentifierList(parserState, 0, charactersToColumn)

  if (charactersAndIdentifiers === null) {
    return false
  }

  addIdentifierListToIndex(parserState, charactersAndIdentifiers[1], 'character', 'implicitDeclaration')

  if (emote !== null) {
    addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')
  }

  if (checkReachable(parserState)) {
    for (const character of charactersAndIdentifiers[0]) {
      checkIdentifierConsistency(parserState, 'character', character)
    }

    parserState.instructions.push({
      type: 'speaker',
      line: parserState.line,
      characters: charactersAndIdentifiers[0]
    })

    if (emote !== null) {
      checkIdentifierConsistency(parserState, 'emote', emote)

      for (const character of charactersAndIdentifiers[0]) {
        parserState.instructions.push({
          type: 'emote',
          line: parserState.line,
          character,
          emote
        })
      }
    }
  }

  return true
}

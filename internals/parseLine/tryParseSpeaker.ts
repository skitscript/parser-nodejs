import type { Identifier } from '../../Identifier'
import { codepointIsClosingParenthesis } from './codepointIsClosingParenthesis.js'
import { codepointIsColon } from './codepointIsColon.js'
import { codepointIsOpeningParenthesis } from './codepointIsOpeningParenthesis.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { ParserState } from '../ParserState'
import { tryParseAndIdentifierList } from './tryParseAndIdentifierList.js'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { checkReachable } from './checkReachable.js'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { Warning } from '../../Warning'
import type { IdentifierType } from '../../IdentifierType'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'

export const tryParseSpeaker = (parserState: ParserState): boolean => {
  let charactersToColumn = -1
  let foundOpeningParenthesis = false
  let emoteFromColumn = -1
  let emoteToColumn = -1
  let foundClosingParenthesis = false
  let foundColon = false

  for (let index = 0; index <= parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (codepointIsOpeningParenthesis(character)) {
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
    } else if (codepointIsClosingParenthesis(character)) {
      if (emoteToColumn === -1) {
        return false
      }

      if (foundClosingParenthesis) {
        return false
      }

      foundClosingParenthesis = true
    } else if (codepointIsColon(character)) {
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
    } else if (!codepointIsWhitespace(character)) {
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

  const newIdentifierInstances: IdentifierInstance[] = []
  const newWarnings: Warning[] = []
  const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
    character: {},
    emote: {},
    entry_animation: {},
    exit_animation: {},
    label: {},
    flag: {},
    location: {}
  }

  const characters = tryParseAndIdentifierList(parserState, 0, charactersToColumn, 'character', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

  if (characters === null) {
    return false
  }

  let emote: null | Identifier = null

  if (foundOpeningParenthesis) {
    emote = tryParseIdentifier(parserState, emoteFromColumn, emoteToColumn, 'emote', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

    if (emote === null) {
      return false
    }
  }

  parserState.identifier_instances.push(...newIdentifierInstances)

  if (checkReachable(parserState, newWarnings, newIdentifiers)) {
    parserState.instructions.push({
      type: 'speaker',
      line: parserState.line,
      characters
    })

    if (emote !== null) {
      for (const character of characters) {
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

import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { characterIsA } from './characterIsA.js'
import { characterIsD } from './characterIsD.js'
import { characterIsE } from './characterIsE.js'
import { characterIsI } from './characterIsI.js'
import { characterIsN } from './characterIsN.js'
import { characterIsR } from './characterIsR.js'
import { characterIsS } from './characterIsS.js'
import { characterIsWhitespace } from '../characterIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseAndIdentifierList } from './tryParseAndIdentifierList.js'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { checkReachable } from './checkReachable.js'

const isAre = (parserState: ParserState, separatorColumn: number, secondCharacter: string): boolean => {
  if (!characterIsR(secondCharacter)) {
    return false
  }

  if (!characterIsE(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
    return false
  }

  return true
}

const isAnd = (parserState: ParserState, separatorColumn: number, secondCharacter: string): boolean => {
  if (!characterIsN(secondCharacter)) {
    return false
  }

  if (!characterIsD(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
    return false
  }

  return true
}

const isIs = (parserState: ParserState, separatorColumn: number, firstCharacter: string): boolean => {
  if (!characterIsI(firstCharacter)) {
    return false
  }

  if (!characterIsS(parserState.lineAccumulator.charAt(separatorColumn + 2))) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
    return false
  }

  return true
}

// TODO: Is there a test case for "ONE CHARACTER ARE EMOTE" or "MANY AND CHARACTER IS EMOTE"
export const tryParseEmote = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 6) {
    return false
  }

  let foundAnd = false
  let separatorColumn = 1
  let characterToColumn: number = 0

  while (true) {
    if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn))) {
      const firstCharacter = parserState.lineAccumulator.charAt(separatorColumn + 1)

      if (characterIsA(firstCharacter)) {
        if (separatorColumn <= parserState.indexOfLastNonWhiteSpaceCharacter - 6) {
          const secondCharacter = parserState.lineAccumulator.charAt(separatorColumn + 2)

          if (isAre(parserState, separatorColumn, secondCharacter)) {
            if (!foundAnd) {
              return false
            }

            let emoteFromColumn = separatorColumn + 4

            while (true) {
              if (emoteFromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
                return false
              }

              if (!characterIsWhitespace(parserState.lineAccumulator.charAt(emoteFromColumn))) {
                break
              }

              emoteFromColumn++
            }

            let emoteToColumn = emoteFromColumn

            for (let index = emoteFromColumn + 1; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
              if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
                emoteToColumn = index
              }
            }

            const newIdentifierInstances: IdentifierInstance[] = []
            const newWarnings: Warning[] = []
            const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
              character: {},
              emote: {},
              entryAnimation: {},
              exitAnimation: {},
              label: {},
              flag: {},
              location: {}
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (characters === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFromColumn, emoteToColumn, 'emote', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (emote === null) {
              return false
            }

            parserState.identifierInstances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
              for (const character of characters) {
                parserState.instructions.push({
                  type: 'emote',
                  line: parserState.line,
                  character,
                  emote
                })
              }
            }

            return true
          } else if (isAnd(parserState, separatorColumn, secondCharacter)) {
            if (foundAnd) {
              return false
            }

            foundAnd = true
          }
        }
      } else if (isIs(parserState, separatorColumn, firstCharacter)) {
        if (foundAnd) {
          return false
        }

        let emoteFromColumn = separatorColumn + 3

        while (true) {
          if (emoteFromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
            return false
          }

          if (!characterIsWhitespace(parserState.lineAccumulator.charAt(emoteFromColumn))) {
            break
          }

          emoteFromColumn++
        }

        const newIdentifierInstances: IdentifierInstance[] = []
        const newWarnings: Warning[] = []
        const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
          character: {},
          emote: {},
          entryAnimation: {},
          exitAnimation: {},
          label: {},
          flag: {},
          location: {}
        }

        const character = tryParseIdentifier(parserState, 0, characterToColumn, 'character', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

        if (character === null) {
          return false
        }

        let emoteToColumn = emoteFromColumn

        for (let index = emoteFromColumn + 1; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
          if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
            emoteToColumn = index
          }
        }

        const emote = tryParseIdentifier(parserState, emoteFromColumn, emoteToColumn, 'emote', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

        if (emote === null) {
          return false
        }

        parserState.identifierInstances.push(...newIdentifierInstances)

        if (checkReachable(parserState, newWarnings, newIdentifiers)) {
          parserState.instructions.push({
            type: 'emote',
            line: parserState.line,
            character,
            emote
          })
        }

        return true
      }
    } else {
      characterToColumn = separatorColumn
    }

    if (separatorColumn === parserState.indexOfLastNonWhiteSpaceCharacter - 5) {
      return false
    }

    separatorColumn++
  }
}

import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsD } from '../../characterIsD/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsI } from '../../characterIsI/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsR } from '../../characterIsR/index.js'
import { characterIsS } from '../../characterIsS/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { checkReachable } from '../checkReachable/index.js'

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
export const tryParseEmote = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 6) {
    return false
  }

  let foundAnd = false
  let separatorColumn = 1
  let characterToColumn: number = 0

  while (true) {
    if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn))) {
      const firstCharacter = parserState.lineAccumulator.charAt(separatorColumn + 1)

      if (characterIsA(firstCharacter)) {
        if (separatorColumn <= indexOfLastNonWhiteSpaceCharacter - 4) {
          const secondCharacter = parserState.lineAccumulator.charAt(separatorColumn + 2)

          if (isAre(parserState, separatorColumn, secondCharacter)) {
            if (!foundAnd) {
              return false
            }

            let emoteFromColumn = separatorColumn + 4

            while (true) {
              if (emoteFromColumn === indexOfLastNonWhiteSpaceCharacter) {
                return false
              }

              if (!characterIsWhitespace(parserState.lineAccumulator.charAt(emoteFromColumn))) {
                break
              }

              emoteFromColumn++
            }

            let emoteToColumn = emoteFromColumn

            for (let index = emoteFromColumn + 1; index < indexOfLastNonWhiteSpaceCharacter; index++) {
              if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
                emoteToColumn = index
              }
            }

            const emote = tryParseIdentifier(parserState, emoteFromColumn, emoteToColumn)

            if (emote === null) {
              return false
            }

            // TODO: Avoid side effects if unreachable, but still check whether parsable!

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character')

            if (characters === null) {
              return false
            }

            addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              for (const character of characters) {
                checkIdentifierConsistency(parserState, 'character', character)

                parserState.instructions.push({
                  type: 'emote',
                  line: parserState.line,
                  character,
                  emote
                })
              }

              checkIdentifierConsistency(parserState, 'emote', emote)
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

        let emoteFromColumn = separatorColumn + 4

        while (true) {
          if (emoteFromColumn === indexOfLastNonWhiteSpaceCharacter) {
            return false
          }

          if (!characterIsWhitespace(parserState.lineAccumulator.charAt(emoteFromColumn))) {
            break
          }

          emoteFromColumn++
        }

        const character = tryParseIdentifier(parserState, 0, characterToColumn)

        if (character === null) {
          return false
        }

        let emoteToColumn = emoteFromColumn

        for (let index = emoteFromColumn + 1; index < indexOfLastNonWhiteSpaceCharacter; index++) {
          if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
            emoteToColumn = index
          }
        }

        const emote = tryParseIdentifier(parserState, emoteFromColumn, emoteToColumn)

        if (emote === null) {
          return false
        }

        addIdentifierToIndex(parserState, character, 'character', 'implicitDeclaration')
        addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')

        if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
          checkIdentifierConsistency(parserState, 'character', character)
          checkIdentifierConsistency(parserState, 'emote', emote)

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

    if (separatorColumn === indexOfLastNonWhiteSpaceCharacter - 3) {
      return false
    }

    separatorColumn++
  }
}

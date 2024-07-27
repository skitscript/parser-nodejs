import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsComma } from '../../characterIsComma/index.js'
import { characterIsD } from '../../characterIsD/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsI } from '../../characterIsI/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsS } from '../../characterIsS/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { characterIsX } from '../../characterIsX/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseExitAnimation = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 7) {
    return false
  }

  let foundAnd = false
  let separatorColumn = 1
  let characterToColumn: number = 0

  while (true) {
    if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn))) {
      const character = parserState.lineAccumulator.charAt(separatorColumn + 1)

      if (characterIsA(character) && characterIsN(parserState.lineAccumulator.charAt(separatorColumn + 2)) &&
      characterIsD(parserState.lineAccumulator.charAt(separatorColumn + 3)) &&
    characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
        foundAnd = true
      } else if (characterIsE(character) && characterIsX(parserState.lineAccumulator.charAt(separatorColumn + 2)) &&
              characterIsI(parserState.lineAccumulator.charAt(separatorColumn + 3)) &&
              characterIsT(parserState.lineAccumulator.charAt(separatorColumn + 4))
      ) {
        if (
          separatorColumn < indexOfLastNonWhiteSpaceCharacter - 5 &&
                characterIsS(parserState.lineAccumulator.charAt(separatorColumn + 5)) &&
                  characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 6))
        ) {
          if (foundAnd) {
            return false
          }

          let animationFromColumn: null | number = null
          let animationToColumn: null | number = null
          let foundComma = false
          let emoteFrom: null | number = null
          let emoteTo: null | number = null

          for (let index = separatorColumn + 7; index < indexOfLastNonWhiteSpaceCharacter; index++) {
            const character = parserState.lineAccumulator.charAt(index)

            if (characterIsWhitespace(character)) {
              continue
            }

            if (characterIsComma(character)) {
              if (foundComma) {
                return false
              }

              if (animationFromColumn === null) {
                return false
              }

              foundComma = true
            } else if (foundComma) {
              if (emoteFrom === null) {
                emoteFrom = index
              }

              emoteTo = index
            } else {
              if (animationFromColumn === null) {
                animationFromColumn = index
              }

              animationToColumn = index
            }
          }

          if (foundComma) {
            if (emoteFrom === null) {
              return false
            }

            const character = tryParseIdentifier(parserState, 0, characterToColumn)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn as number, animationToColumn as number)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo as number)

            if (emote === null) {
              return false
            }

            addIdentifierToIndex(parserState, character, 'character', 'implicitDeclaration')
            addIdentifierToIndex(parserState, animation, 'exitAnimation', 'implicitDeclaration')
            addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              checkIdentifierConsistency(parserState, 'character', character)
              checkIdentifierConsistency(parserState, 'exitAnimation', animation)
              checkIdentifierConsistency(parserState, 'emote', emote)

              parserState.instructions.push({
                type: 'exitAnimation',
                line: parserState.line,
                character,
                animation
              }, {
                type: 'emote',
                line: parserState.line,
                character,
                emote
              })
            }
          } else {
            if (animationFromColumn === null) {
              return false
            }

            const character = tryParseIdentifier(parserState, 0, characterToColumn)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn as number)

            if (animation === null) {
              return false
            }

            addIdentifierToIndex(parserState, character, 'character', 'implicitDeclaration')
            addIdentifierToIndex(parserState, animation, 'exitAnimation', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              checkIdentifierConsistency(parserState, 'character', character)
              checkIdentifierConsistency(parserState, 'exitAnimation', animation)

              parserState.instructions.push({
                type: 'exitAnimation',
                line: parserState.line,
                character,
                animation
              })
            }
          }
        } else if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 5))) {
          if (!foundAnd) {
            return false
          }

          let animationFromColumn: null | number = null
          let animationToColumn: null | number = null
          let foundComma = false
          let emoteFrom: null | number = null
          let emoteTo: null | number = null

          for (let index = separatorColumn + 6; index < indexOfLastNonWhiteSpaceCharacter; index++) {
            const character = parserState.lineAccumulator.charAt(index)

            if (characterIsWhitespace(character)) {
              continue
            }

            if (characterIsComma(character)) {
              if (foundComma) {
                return false
              }

              if (animationFromColumn === null) {
                return false
              }

              foundComma = true
            } else if (foundComma) {
              if (emoteFrom === null) {
                emoteFrom = index
              }

              emoteTo = index
            } else {
              if (animationFromColumn === null) {
                animationFromColumn = index
              }

              animationToColumn = index
            }
          }

          if (foundComma) {
            if (emoteFrom === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn as number, animationToColumn as number)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo as number)

            if (emote === null) {
              return false
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character')

            if (characters === null) {
              return false
            }

            addIdentifierToIndex(parserState, animation, 'exitAnimation', 'implicitDeclaration')
            addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              for (const character of characters) {
                checkIdentifierConsistency(parserState, 'character', character)
              }

              checkIdentifierConsistency(parserState, 'exitAnimation', animation)
              checkIdentifierConsistency(parserState, 'emote', emote)

              for (const character of characters) {
                parserState.instructions.push({
                  type: 'exitAnimation',
                  line: parserState.line,
                  character,
                  animation
                })
              }

              for (const character of characters) {
                parserState.instructions.push({
                  type: 'emote',
                  line: parserState.line,
                  character,
                  emote
                })
              }
            }
          } else {
            if (animationFromColumn === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn as number)

            if (animation === null) {
              return false
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character')

            if (characters === null) {
              return false
            }

            addIdentifierToIndex(parserState, animation, 'exitAnimation', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              for (const character of characters) {
                parserState.instructions.push({
                  type: 'exitAnimation',
                  line: parserState.line,
                  character,
                  animation
                })

                checkIdentifierConsistency(parserState, 'character', character)
              }

              checkIdentifierConsistency(parserState, 'exitAnimation', animation)
            }
          }
        }

        return true
      }
    } else {
      characterToColumn = separatorColumn
    }

    if (separatorColumn === indexOfLastNonWhiteSpaceCharacter - 4) {
      return false
    }

    separatorColumn++
  }
}

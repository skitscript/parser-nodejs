import { addIdentifierListToIndex } from '../../addIdentifierListToIndex/index.js'
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

const isAnd = (parserState: ParserState, separatorColumn: number, firstCharacter: string): boolean => {
  if (!characterIsA(firstCharacter)) {
    return false
  }

  if (!characterIsN(parserState.lineAccumulator.charAt(separatorColumn + 2))) {
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

const isExit = (parserState: ParserState, separatorColumn: number, firstCharacter: string): boolean => {
  if (characterIsE(firstCharacter)) {
    if (characterIsX(parserState.lineAccumulator.charAt(separatorColumn + 2))) {
      if (characterIsI(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
        if (characterIsT(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

const isExits = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number, separatorColumn: number): boolean => {
  if (separatorColumn < indexOfLastNonWhiteSpaceCharacter - 7) {
    if (characterIsS(parserState.lineAccumulator.charAt(separatorColumn + 5))) {
      if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 6))) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

// TODO: Is there a test case for "ONE CHARACTER EXIT ANIMATION" or "MANY AND CHARACTER EXITS ANIMATION"

export const tryParseExitAnimation = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 7) {
    return false
  }

  let foundAnd = false
  let separatorColumn = 1
  let characterToColumn: number = 0

  while (true) {
    if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn))) {
      const firstCharacter = parserState.lineAccumulator.charAt(separatorColumn + 1)

      if (isAnd(parserState, separatorColumn, firstCharacter)) {
        foundAnd = true
      } else if (isExit(parserState, separatorColumn, firstCharacter)) {
        if (isExits(parserState, indexOfLastNonWhiteSpaceCharacter, separatorColumn)) {
          if (foundAnd) {
            return false
          }

          let animationFromColumn: number = -1
          let animationToColumn: number = -1
          let foundComma = false
          let emoteFrom: number = -1
          let emoteTo: number = -1

          for (let index = separatorColumn + 7; index < indexOfLastNonWhiteSpaceCharacter; index++) {
            const character = parserState.lineAccumulator.charAt(index)

            if (characterIsWhitespace(character)) {
              continue
            }

            if (characterIsComma(character)) {
              if (foundComma) {
                return false
              }

              if (animationFromColumn === -1) {
                return false
              }

              foundComma = true
            } else if (foundComma) {
              if (emoteFrom === -1) {
                emoteFrom = index
              }

              emoteTo = index
            } else {
              if (animationFromColumn === -1) {
                animationFromColumn = index
              }

              animationToColumn = index
            }
          }

          if (foundComma) {
            if (emoteFrom === -1) {
              return false
            }

            const character = tryParseIdentifier(parserState, 0, characterToColumn)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo)

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
            if (animationFromColumn === -1) {
              return false
            }

            const character = tryParseIdentifier(parserState, 0, characterToColumn)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn)

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

          return true
        } else if (characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 5))) {
          if (!foundAnd) {
            return false
          }

          let animationFromColumn: number = -1
          let animationToColumn: number = -1
          let foundComma = false
          let emoteFrom: number = -1
          let emoteTo: number = -1

          for (let index = separatorColumn + 6; index < indexOfLastNonWhiteSpaceCharacter; index++) {
            const character = parserState.lineAccumulator.charAt(index)

            if (characterIsWhitespace(character)) {
              continue
            }

            if (characterIsComma(character)) {
              if (foundComma) {
                return false
              }

              if (animationFromColumn === -1) {
                return false
              }

              foundComma = true
            } else if (foundComma) {
              if (emoteFrom === -1) {
                emoteFrom = index
              }

              emoteTo = index
            } else {
              if (animationFromColumn === -1) {
                animationFromColumn = index
              }

              animationToColumn = index
            }
          }

          if (foundComma) {
            if (emoteFrom === -1) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo)

            if (emote === null) {
              return false
            }

            const charactersAndIdentifiers = tryParseAndIdentifierList(parserState, 0, characterToColumn)

            if (charactersAndIdentifiers === null) {
              return false
            }

            addIdentifierListToIndex(parserState, charactersAndIdentifiers[1], 'character', 'implicitDeclaration')
            addIdentifierToIndex(parserState, animation, 'exitAnimation', 'implicitDeclaration')
            addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              for (const character of charactersAndIdentifiers[0]) {
                checkIdentifierConsistency(parserState, 'character', character)
              }

              checkIdentifierConsistency(parserState, 'exitAnimation', animation)
              checkIdentifierConsistency(parserState, 'emote', emote)

              for (const character of charactersAndIdentifiers[0]) {
                parserState.instructions.push({
                  type: 'exitAnimation',
                  line: parserState.line,
                  character,
                  animation
                })
              }

              for (const character of charactersAndIdentifiers[0]) {
                parserState.instructions.push({
                  type: 'emote',
                  line: parserState.line,
                  character,
                  emote
                })
              }
            }
          } else {
            if (animationFromColumn === -1) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn)

            if (animation === null) {
              return false
            }

            const charactersAndIdentifiers = tryParseAndIdentifierList(parserState, 0, characterToColumn)

            if (charactersAndIdentifiers === null) {
              return false
            }

            addIdentifierListToIndex(parserState, charactersAndIdentifiers[1], 'character', 'implicitDeclaration')
            addIdentifierToIndex(parserState, animation, 'exitAnimation', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              for (const character of charactersAndIdentifiers[0]) {
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

          return true
        }
      }
    }

    characterToColumn = separatorColumn

    if (separatorColumn === indexOfLastNonWhiteSpaceCharacter - 6) {
      return false
    }

    separatorColumn++
  }
}

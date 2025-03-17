import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsComma } from '../../characterIsComma/index.js'
import { characterIsD } from '../../characterIsD/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsR } from '../../characterIsR/index.js'
import { characterIsS } from '../../characterIsS/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
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

const isEnter = (parserState: ParserState, separatorColumn: number, firstCharacter: string): boolean => {
  if (!characterIsE(firstCharacter)) {
    return false
  }

  if (!characterIsN(parserState.lineAccumulator.charAt(separatorColumn + 2))) {
    return false
  }

  if (!characterIsT(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
    return false
  }

  if (!characterIsE(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
    return false
  }

  if (!characterIsR(parserState.lineAccumulator.charAt(separatorColumn + 5))) {
    return false
  }

  return true
}

const isEnters = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number, separatorColumn: number, nextCharacter: string): boolean => {
  if (separatorColumn >= indexOfLastNonWhiteSpaceCharacter - 4) {
    return false
  }

  if (!characterIsS(nextCharacter)) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 7))) {
    return false
  }

  return true
}

export const tryParseEntryAnimation = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 8) {
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
      } else if (isEnter(parserState, separatorColumn, firstCharacter)) {
        const nextCharacter = parserState.lineAccumulator.charAt(separatorColumn + 6)

        if (isEnters(parserState, indexOfLastNonWhiteSpaceCharacter, separatorColumn, nextCharacter)) {
          if (foundAnd) {
            return false
          }

          let animationFromColumn: number = -1
          let animationToColumn: number = -1
          let foundComma = false
          let emoteFrom: number = -1
          let emoteTo: number = -1

          for (let index = separatorColumn + 8; index < indexOfLastNonWhiteSpaceCharacter; index++) {
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
            addIdentifierToIndex(parserState, animation, 'entryAnimation', 'implicitDeclaration')
            addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              checkIdentifierConsistency(parserState, 'character', character)
              checkIdentifierConsistency(parserState, 'entryAnimation', animation)
              checkIdentifierConsistency(parserState, 'emote', emote)

              parserState.instructions.push({
                type: 'entryAnimation',
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
            addIdentifierToIndex(parserState, animation, 'entryAnimation', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              checkIdentifierConsistency(parserState, 'character', character)
              checkIdentifierConsistency(parserState, 'entryAnimation', animation)

              parserState.instructions.push({
                type: 'entryAnimation',
                line: parserState.line,
                character,
                animation
              })
            }
          }
        } else if (characterIsWhitespace(nextCharacter)) {
          if (!foundAnd) {
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

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo)

            if (emote === null) {
              return false
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character')

            if (characters === null) {
              return false
            }

            addIdentifierToIndex(parserState, animation, 'entryAnimation', 'implicitDeclaration')
            addIdentifierToIndex(parserState, emote, 'emote', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              for (const character of characters) {
                checkIdentifierConsistency(parserState, 'character', character)
              }

              checkIdentifierConsistency(parserState, 'entryAnimation', animation)
              checkIdentifierConsistency(parserState, 'emote', emote)

              for (const character of characters) {
                parserState.instructions.push({
                  type: 'entryAnimation',
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
            if (animationFromColumn === -1) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn)

            if (animation === null) {
              return false
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character')

            if (characters === null) {
              return false
            }

            addIdentifierToIndex(parserState, animation, 'entryAnimation', 'implicitDeclaration')

            if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
              for (const character of characters) {
                parserState.instructions.push({
                  type: 'entryAnimation',
                  line: parserState.line,
                  character,
                  animation
                })

                checkIdentifierConsistency(parserState, 'character', character)
              }

              checkIdentifierConsistency(parserState, 'entryAnimation', animation)
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

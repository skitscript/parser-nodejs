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
      switch (true) {
        case characterIsA(firstCharacter):
          if (
            characterIsN(parserState.lineAccumulator.charAt(separatorColumn + 2)) &&
            characterIsD(parserState.lineAccumulator.charAt(separatorColumn + 3)) &&
        characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
            foundAnd = true
          }
          break

        case characterIsE(firstCharacter):
          if (
            characterIsN(parserState.lineAccumulator.charAt(separatorColumn + 2)) &&
              characterIsT(parserState.lineAccumulator.charAt(separatorColumn + 3)) &&
              characterIsE(parserState.lineAccumulator.charAt(separatorColumn + 4)) &&
              characterIsR(parserState.lineAccumulator.charAt(separatorColumn + 5))
          ) {
            const nextCharacter = parserState.lineAccumulator.charAt(separatorColumn + 6)

            if (
              separatorColumn < indexOfLastNonWhiteSpaceCharacter - 4 &&
                  characterIsS(nextCharacter) &&
                  characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 7))
            ) {
              if (foundAnd) {
                return false
              }

              let animationFromColumn: null | number = null
              let animationToColumn: null | number = null
              let foundComma = false
              let emoteFrom: null | number = null
              let emoteTo: null | number = null

              for (let index = separatorColumn + 8; index < indexOfLastNonWhiteSpaceCharacter; index++) {
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
          break
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

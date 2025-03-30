import type { IdentifierInstance } from '../../../IdentifierInstance/index.js'
import type { IdentifierType } from '../../../IdentifierType/index.js'
import type { Warning } from '../../../Warning/index.js'
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
import type { LocalIdentifierInstance } from '../../LocalIdentifierInstance/index.js'
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

const isExits = (parserState: ParserState, separatorColumn: number): boolean => {
  if (separatorColumn < parserState.indexOfLastNonWhiteSpaceCharacter - 7) {
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

export const tryParseExitAnimation = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 7) {
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
        if (isExits(parserState, separatorColumn)) {
          if (foundAnd) {
            return false
          }

          let animationFromColumn: number = -1
          let animationToColumn: number = -1
          let foundComma = false
          let emoteFrom: number = -1
          let emoteTo: number = -1

          for (let index = separatorColumn + 7; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
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

          const newIdentifierInstances: IdentifierInstance[] = []
          const newWarnings: Warning[] = []
          const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
            character: {},
            emote: {},
            entryAnimation: {},
            exitAnimation: {},
            label: {},
            flag: {},
            background: {}
          }

          if (foundComma) {
            if (emoteFrom === -1) {
              return false
            }

            const character = tryParseIdentifier(parserState, 0, characterToColumn, 'character', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'exitAnimation', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo, 'emote', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (emote === null) {
              return false
            }

            parserState.identifierInstances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
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

            const character = tryParseIdentifier(parserState, 0, characterToColumn, 'character', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'exitAnimation', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            parserState.identifierInstances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
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

          for (let index = separatorColumn + 6; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
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

          const newIdentifierInstances: IdentifierInstance[] = []
          const newWarnings: Warning[] = []
          const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
            character: {},
            emote: {},
            entryAnimation: {},
            exitAnimation: {},
            label: {},
            flag: {},
            background: {}
          }

          if (foundComma) {
            if (emoteFrom === -1) {
              return false
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (characters === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'exitAnimation', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo, 'emote', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (emote === null) {
              return false
            }

            parserState.identifierInstances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
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
            if (animationFromColumn === -1) {
              return false
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (characters === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'exitAnimation', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            parserState.identifierInstances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
              for (const character of characters) {
                parserState.instructions.push({
                  type: 'exitAnimation',
                  line: parserState.line,
                  character,
                  animation
                })
              }
            }
          }

          return true
        }
      }
    }

    characterToColumn = separatorColumn

    if (separatorColumn === parserState.indexOfLastNonWhiteSpaceCharacter - 6) {
      return false
    }

    separatorColumn++
  }
}

import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseExitAnimation = (parserState: ParserState): boolean => {
  if (parserState.lowerCaseLineAccumulator.length < 8) {
    return false
  }

  let foundAnd = false
  let separatorColumn = 1
  let characterToColumn: number = 0

  while (true) {
    if (characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(separatorColumn))) {
      switch (parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 1)) {
        case 'a':
          if (parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 2) === 'n' &&
          parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 3) === 'd' &&
        characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 4))) {
            foundAnd = true
          }
          break

        case 'e':
          if (
            parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 2) === 'x' &&
              parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 3) === 'i' &&
              parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 4) === 't'
          ) {
            if (
              separatorColumn < parserState.lowerCaseLineAccumulator.length - 4 &&
                  parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 5) === 's' &&
                  characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 6))
            ) {
              if (foundAnd) {
                return false
              }

              let animationFromColumn: null | number = null
              let animationToColumn: null | number = null
              let foundComma = false
              let emoteFrom: null | number = null
              let emoteTo: null | number = null

              for (let index = separatorColumn + 7; index < parserState.lowerCaseLineAccumulator.length - 1; index++) {
                const character = parserState.lowerCaseLineAccumulator.charAt(index)

                if (characterIsWhitespace(character)) {
                  continue
                }

                if (character === ',') {
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

                if (checkReachable(parserState)) {
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

                if (checkReachable(parserState)) {
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
            } else if (characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(separatorColumn + 5))) {
              if (!foundAnd) {
                return false
              }

              let animationFromColumn: null | number = null
              let animationToColumn: null | number = null
              let foundComma = false
              let emoteFrom: null | number = null
              let emoteTo: null | number = null

              for (let index = separatorColumn + 6; index < parserState.lowerCaseLineAccumulator.length - 1; index++) {
                const character = parserState.lowerCaseLineAccumulator.charAt(index)

                if (characterIsWhitespace(character)) {
                  continue
                }

                if (character === ',') {
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

                if (checkReachable(parserState)) {
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

                if (checkReachable(parserState)) {
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
          break
      }
    } else {
      characterToColumn = separatorColumn
    }

    if (separatorColumn === parserState.lowerCaseLineAccumulator.length - 5) {
      return false
    }

    separatorColumn++
  }
}

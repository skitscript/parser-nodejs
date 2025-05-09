import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { codepointIsA } from './codepointIsA.js'
import { codepointIsComma } from './codepointIsComma.js'
import { codepointIsD } from './codepointIsD.js'
import { codepointIsE } from './codepointIsE.js'
import { codepointIsN } from './codepointIsN.js'
import { codepointIsR } from './codepointIsR.js'
import { codepointIsS } from './codepointIsS.js'
import { codepointIsT } from './codepointIsT.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseAndIdentifierList } from './tryParseAndIdentifierList.js'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { checkReachable } from './checkReachable.js'

const isAnd = (parserState: ParserState, separatorColumn: number, firstCharacter: string): boolean => {
  if (!codepointIsA(firstCharacter)) {
    return false
  }

  if (!codepointIsN(parserState.lineAccumulator.charAt(separatorColumn + 2))) {
    return false
  }

  if (!codepointIsD(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
    return false
  }

  if (!codepointIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
    return false
  }

  return true
}

const isEnter = (parserState: ParserState, separatorColumn: number, firstCharacter: string): boolean => {
  if (!codepointIsE(firstCharacter)) {
    return false
  }

  if (!codepointIsN(parserState.lineAccumulator.charAt(separatorColumn + 2))) {
    return false
  }

  if (!codepointIsT(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
    return false
  }

  if (!codepointIsE(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
    return false
  }

  if (!codepointIsR(parserState.lineAccumulator.charAt(separatorColumn + 5))) {
    return false
  }

  return true
}

const isEnters = (parserState: ParserState, separatorColumn: number, nextCharacter: string): boolean => {
  if (separatorColumn >= parserState.indexOfLastNonWhiteSpaceCharacter - 8) {
    return false
  }

  if (!codepointIsS(nextCharacter)) {
    return false
  }

  if (!codepointIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 7))) {
    return false
  }

  return true
}

// TODO: Is there a test case for "ONE CHARACTER ENTER ANIMATION" or "MANY AND CHARACTER ENTERS ANIMATION"
export const tryParseEntryAnimation = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 8) {
    return false
  }

  let foundAnd = false
  let separatorColumn = 1
  let characterToColumn: number = 0

  while (true) {
    if (codepointIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn))) {
      const firstCharacter = parserState.lineAccumulator.charAt(separatorColumn + 1)

      if (isAnd(parserState, separatorColumn, firstCharacter)) {
        foundAnd = true
      } else if (isEnter(parserState, separatorColumn, firstCharacter)) {
        const nextCharacter = parserState.lineAccumulator.charAt(separatorColumn + 6)

        if (isEnters(parserState, separatorColumn, nextCharacter)) {
          if (foundAnd) {
            return false
          }

          let animationFromColumn: number = -1
          let animationToColumn: number = -1
          let foundComma = false
          let emoteFrom: number = -1
          let emoteTo: number = -1

          for (let index = separatorColumn + 8; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
            const character = parserState.lineAccumulator.charAt(index)

            if (codepointIsWhitespace(character)) {
              continue
            }

            if (codepointIsComma(character)) {
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
            entry_animation: {},
            exit_animation: {},
            label: {},
            flag: {},
            location: {}
          }

          if (foundComma) {
            if (emoteFrom === -1) {
              return false
            }

            const character = tryParseIdentifier(parserState, 0, characterToColumn, 'character', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'entry_animation', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo, 'emote', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (emote === null) {
              return false
            }

            parserState.identifier_instances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
              parserState.instructions.push({
                type: 'entry_animation',
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

            const character = tryParseIdentifier(parserState, 0, characterToColumn, 'character', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (character === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'entry_animation', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            parserState.identifier_instances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
              parserState.instructions.push({
                type: 'entry_animation',
                line: parserState.line,
                character,
                animation
              })
            }
          }

          return true
        } else if (codepointIsWhitespace(nextCharacter)) {
          if (!foundAnd) {
            return false
          }

          let animationFromColumn: number = -1
          let animationToColumn: number = -1
          let foundComma = false
          let emoteFrom: number = -1
          let emoteTo: number = -1

          for (let index = separatorColumn + 7; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
            const character = parserState.lineAccumulator.charAt(index)

            if (codepointIsWhitespace(character)) {
              continue
            }

            if (codepointIsComma(character)) {
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
            entry_animation: {},
            exit_animation: {},
            label: {},
            flag: {},
            location: {}
          }

          if (foundComma) {
            if (emoteFrom === -1) {
              return false
            }

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (characters === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'entry_animation', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            const emote = tryParseIdentifier(parserState, emoteFrom, emoteTo, 'emote', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (emote === null) {
              return false
            }

            parserState.identifier_instances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
              for (const character of characters) {
                parserState.instructions.push({
                  type: 'entry_animation',
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

            const characters = tryParseAndIdentifierList(parserState, 0, characterToColumn, 'character', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (characters === null) {
              return false
            }

            const animation = tryParseIdentifier(parserState, animationFromColumn, animationToColumn, 'entry_animation', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

            if (animation === null) {
              return false
            }

            parserState.identifier_instances.push(...newIdentifierInstances)

            if (checkReachable(parserState, newWarnings, newIdentifiers)) {
              for (const character of characters) {
                parserState.instructions.push({
                  type: 'entry_animation',
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
    } else {
      characterToColumn = separatorColumn
    }

    if (separatorColumn === parserState.indexOfLastNonWhiteSpaceCharacter - 7) {
      return false
    }

    separatorColumn++
  }
}

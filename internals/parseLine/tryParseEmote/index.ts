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

// TODO: Are there cases we can skip other parsers (e.g. is -> even if all other parsing fails, don't try).
// TODO: Is there a test case for "ONE CHARACTER ARE EMOTE" or "MANY AND CHARACTER IS EMOTE"
// TODO: Test case with minimal white space, all one-letter identifiers
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

      switch (true) {
        case characterIsA(firstCharacter):
          if (separatorColumn <= indexOfLastNonWhiteSpaceCharacter - 4) {
            const secondCharacter = parserState.lineAccumulator.charAt(separatorColumn + 2)

            switch (true) {
              case characterIsR(secondCharacter):
                if (characterIsE(parserState.lineAccumulator.charAt(separatorColumn + 3)) &&
                characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
                  if (!foundAnd) {
                    return false
                  }

                  let emoteFromColumn = separatorColumn + 4

                  while (true) {
                    // TODO looks wrong
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
                }
                break

              case characterIsN(secondCharacter):
                if (characterIsD(parserState.lineAccumulator.charAt(separatorColumn + 3)) &&
                characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 4))) {
                  if (foundAnd) {
                    return false
                  }

                  foundAnd = true
                }
                break
            }
          }
          break

        case characterIsI(firstCharacter):
          if (
            characterIsS(parserState.lineAccumulator.charAt(separatorColumn + 2)) &&
          characterIsWhitespace(parserState.lineAccumulator.charAt(separatorColumn + 3))) {
            if (foundAnd) {
              return false
            }

            let emoteFromColumn = separatorColumn + 4

            while (true) {
              // TODO: looks wrong
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
          break
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

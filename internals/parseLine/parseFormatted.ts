import type { Formatted } from '../../Formatted'
import type { Run } from '../../Run'
import { characterIsAsterisk } from './characterIsAsterisk.js'
import { characterIsBackslash } from './characterIsBackslash.js'
import { characterIsBacktick } from './characterIsBacktick.js'
import type { ParserState } from '../ParserState'

export const parseFormatted = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number
): null | Formatted => {
  const output: Run[] = []

  let previousBold = false
  let previousItalic = false
  let previousCode = false

  let boldFromColumn: number = -1
  let italicFromColumn: number = -1
  let codeFromColumn: number = -1

  let plainText = ''
  let verbatim = ''

  let state:
  | 'noSpecialCharacter'
  | 'backslash'
  | 'asterisk'
  | 'code'
  | 'codeBackslash' = 'noSpecialCharacter'

  let currentRunFromColumn = fromColumn

  for (let index = fromColumn; index <= toColumn; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    let insertBackslash = false

    switch (state) {
      case 'noSpecialCharacter':
        if (characterIsBackslash(character)) {
          state = 'backslash'
          continue
        } else if (characterIsBacktick(character)) {
          verbatim += '`'
          state = 'code'
          codeFromColumn = index
          continue
        } else if (characterIsAsterisk(character)) {
          verbatim += '*'
          state = 'asterisk'
          continue
        }
        break

      case 'backslash':
        if (characterIsBackslash(character) || characterIsBacktick(character) || characterIsAsterisk(character)) {
          insertBackslash = true
          state = 'noSpecialCharacter'
        } else {
          parserState.errors.push({
            type: 'invalidEscapeSequence',
            line: parserState.line,
            verbatim: `\\${character}`,
            fromColumn: index,
            toColumn: index + 1
          })

          return null
        }
        break

      case 'asterisk':
        state = 'noSpecialCharacter'

        if (characterIsAsterisk(character)) {
          if (boldFromColumn === -1) {
            boldFromColumn = index - 1
          } else {
            boldFromColumn = -1
          }
          verbatim += '*'
          continue
        } else {
          if (italicFromColumn === -1) {
            italicFromColumn = index - 1
          } else {
            italicFromColumn = -1
          }

          if (characterIsBackslash(character)) {
            state = 'backslash'
            continue
          } else if (characterIsBacktick(character)) {
            verbatim += '`'
            state = 'code'
            codeFromColumn = index
            continue
          }
        }
        break

      case 'code':
        if (characterIsBackslash(character)) {
          state = 'codeBackslash'
          continue
        } else if (characterIsBacktick(character)) {
          codeFromColumn = -1
          verbatim += '`'
          state = 'noSpecialCharacter'
          continue
        }
        break

      case 'codeBackslash':
        if (characterIsBackslash(character) || characterIsBacktick(character)) {
          insertBackslash = true
          state = 'code'
        } else {
          parserState.errors.push({
            type: 'invalidEscapeSequence',
            line: parserState.line,
            verbatim: `\\${character}`,
            fromColumn: index,
            toColumn: index + 1
          })

          return null
        }
    }

    if (
      (previousBold !== (boldFromColumn !== -1) ||
        previousItalic !== (italicFromColumn !== -1) ||
        previousCode !== (codeFromColumn !== -1)) &&
      ((previousCode && plainText !== '') ||
        (!previousCode && plainText.trim() !== ''))
    ) {
      output.push({
        bold: previousBold,
        italic: previousItalic,
        code: previousCode,
        verbatim,
        plainText,
        fromColumn: currentRunFromColumn + 1,
        toColumn: index - (insertBackslash ? 1 : 0)
      })

      plainText = ''
      verbatim = ''

      currentRunFromColumn = insertBackslash ? index - 1 : index
    }

    previousBold = boldFromColumn !== -1
    previousItalic = italicFromColumn !== -1
    previousCode = codeFromColumn !== -1

    if (insertBackslash) {
      verbatim += '\\'
    }

    plainText += character
    verbatim += character
  }

  switch (state) {
    case 'backslash':
    case 'codeBackslash':
      parserState.errors.push({
        type: 'incompleteEscapeSequence',
        line: parserState.line,
        column: toColumn + 1
      })

      return null

    case 'asterisk':
      if (italicFromColumn === -1) {
        italicFromColumn = toColumn
      } else {
        italicFromColumn = -1
      }
      break
  }

  if (boldFromColumn !== -1) {
    parserState.errors.push({
      type: 'unterminatedBold',
      line: parserState.line,
      verbatim: parserState.lineAccumulator.slice(boldFromColumn, toColumn + 1),
      fromColumn: boldFromColumn + 1,
      toColumn: toColumn + 1
    })

    return null
  } else if (italicFromColumn !== -1) {
    parserState.errors.push({
      type: 'unterminatedItalic',
      line: parserState.line,
      verbatim: parserState.lineAccumulator.slice(italicFromColumn, toColumn + 1),
      fromColumn: italicFromColumn + 1,
      toColumn: toColumn + 1
    })

    return null
  } else if (codeFromColumn !== -1) {
    parserState.errors.push({
      type: 'unterminatedCode',
      line: parserState.line,
      verbatim: parserState.lineAccumulator.slice(codeFromColumn, toColumn + 1),
      fromColumn: codeFromColumn + 1,
      toColumn: toColumn + 1
    })

    return null
  } else {
    output.push({
      bold: previousBold,
      italic: previousItalic,
      code: previousCode,
      verbatim,
      plainText,
      fromColumn: currentRunFromColumn + 1,
      toColumn: toColumn + 1
    })

    return output
  }
}

import type { Formatted } from '../../Formatted'
import type { Run } from '../../Run'
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

  let boldFromColumn: null | number = null
  let italicFromColumn: null | number = null
  let codeFromColumn: null | number = null

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
    const character = parserState.mixedCaseLineAccumulator.charAt(index)

    let insertBackslash = false

    switch (state) {
      case 'noSpecialCharacter':
        switch (character) {
          case '\\':
            state = 'backslash'
            continue

          case '`':
            verbatim += '`'
            state = 'code'
            codeFromColumn = index
            continue

          case '*':
            verbatim += '*'
            state = 'asterisk'
            continue

          default:
            break
        }
        break

      case 'backslash':
        switch (character) {
          case '\\':
          case '`':
          case '*':
            insertBackslash = true
            state = 'noSpecialCharacter'
            break

          default:
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

        if (character === '*') {
          if (boldFromColumn === null) {
            boldFromColumn = index - 1
          } else {
            boldFromColumn = null
          }
          verbatim += '*'
          continue
        } else {
          if (italicFromColumn === null) {
            italicFromColumn = index - 1
          } else {
            italicFromColumn = null
          }

          switch (character) {
            case '\\':
              state = 'backslash'
              continue

            case '`':
              verbatim += '`'
              state = 'code'
              codeFromColumn = index
              continue

            default:
              break
          }
        }
        break

      case 'code':
        switch (character) {
          case '\\':
            state = 'codeBackslash'
            continue

          case '`':
            codeFromColumn = null
            verbatim += '`'
            state = 'noSpecialCharacter'
            continue

          default:
            break
        }
        break

      case 'codeBackslash':
        switch (character) {
          case '\\':
          case '`':
            insertBackslash = true
            state = 'code'
            break

          default:
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
      (previousBold !== (boldFromColumn !== null) ||
        previousItalic !== (italicFromColumn !== null) ||
        previousCode !== (codeFromColumn !== null)) &&
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

    previousBold = boldFromColumn !== null
    previousItalic = italicFromColumn !== null
    previousCode = codeFromColumn !== null

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
      if (italicFromColumn === null) {
        italicFromColumn = toColumn
      } else {
        italicFromColumn = null
      }
      break
  }

  if (boldFromColumn !== null) {
    parserState.errors.push({
      type: 'unterminatedBold',
      line: parserState.line,
      verbatim: parserState.mixedCaseLineAccumulator.slice(boldFromColumn, toColumn + 1),
      fromColumn: boldFromColumn + 1,
      toColumn: toColumn + 1
    })

    return null
  } else if (italicFromColumn !== null) {
    parserState.errors.push({
      type: 'unterminatedItalic',
      line: parserState.line,
      verbatim: parserState.mixedCaseLineAccumulator.slice(italicFromColumn, toColumn + 1),
      fromColumn: italicFromColumn + 1,
      toColumn: toColumn + 1
    })

    return null
  } else if (codeFromColumn !== null) {
    parserState.errors.push({
      type: 'unterminatedCode',
      line: parserState.line,
      verbatim: parserState.mixedCaseLineAccumulator.slice(codeFromColumn, toColumn + 1),
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

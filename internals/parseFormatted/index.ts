import type { Formatted } from '../../Formatted'
import type { Run } from '../../Run'
import type { ParserState } from '../ParserState'

export const parseFormatted = (
  parserState: ParserState,
  fromColumn: number,
  unformatted: string,
  onSuccess: (formatted: Formatted) => void
): void => {
  const formatted: Run[] = []

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
  let toColumn = fromColumn - 1

  for (const character of unformatted) {
    toColumn++

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
            codeFromColumn = toColumn
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
              fromColumn: toColumn - 1,
              toColumn
            })

            return
        }
        break

      case 'asterisk':
        state = 'noSpecialCharacter'

        if (character === '*') {
          if (boldFromColumn === null) {
            boldFromColumn = toColumn - 1
          } else {
            boldFromColumn = null
          }
          verbatim += '*'
          continue
        } else {
          if (italicFromColumn === null) {
            italicFromColumn = toColumn - 1
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
              codeFromColumn = toColumn
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
              fromColumn: toColumn - 1,
              toColumn
            })

            return
        }
    }

    if (
      (previousBold !== (boldFromColumn !== null) ||
        previousItalic !== (italicFromColumn !== null) ||
        previousCode !== (codeFromColumn !== null)) &&
      ((previousCode && plainText !== '') ||
        (!previousCode && plainText.trim() !== ''))
    ) {
      formatted.push({
        bold: previousBold,
        italic: previousItalic,
        code: previousCode,
        verbatim,
        plainText,
        fromColumn: currentRunFromColumn,
        toColumn: toColumn - (insertBackslash ? 2 : 1)
      })

      plainText = ''
      verbatim = ''

      currentRunFromColumn = toColumn - (insertBackslash ? 1 : 0)
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
        column: toColumn
      })

      return

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
      verbatim: unformatted.slice(boldFromColumn - fromColumn),
      fromColumn: boldFromColumn,
      toColumn
    })
  } else if (italicFromColumn !== null) {
    parserState.errors.push({
      type: 'unterminatedItalic',
      line: parserState.line,
      verbatim: unformatted.slice(italicFromColumn - fromColumn),
      fromColumn: italicFromColumn,
      toColumn
    })
  } else if (codeFromColumn !== null) {
    parserState.errors.push({
      type: 'unterminatedCode',
      line: parserState.line,
      verbatim: unformatted.slice(codeFromColumn - fromColumn),
      fromColumn: codeFromColumn,
      toColumn
    })
  } else {
    formatted.push({
      bold: previousBold,
      italic: previousItalic,
      code: previousCode,
      verbatim,
      plainText,
      fromColumn: currentRunFromColumn,
      toColumn
    })

    onSuccess(formatted)
  }
}

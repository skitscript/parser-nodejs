import type { Formatted } from '../../Formatted'
import type { Run } from '../../Run'
import { codepointIsAsterisk } from './codepointIsAsterisk.js'
import { codepointIsBackslash } from './codepointIsBackslash.js'
import { codepointIsBacktick } from './codepointIsBacktick.js'
import type { ParserState } from '../ParserState'
import { calculateColumn } from './calculateColumn.js'

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
  | 'no_special_character'
  | 'backslash'
  | 'asterisk'
  | 'code'
  | 'code_backslash' = 'no_special_character'

  let currentRunFromColumn = fromColumn

  for (let index = fromColumn; index <= toColumn; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    let insertBackslash = false

    switch (state) {
      case 'no_special_character':
        if (codepointIsBackslash(character)) {
          state = 'backslash'
          continue
        } else if (codepointIsBacktick(character)) {
          verbatim += '`'
          state = 'code'
          codeFromColumn = index
          continue
        } else if (codepointIsAsterisk(character)) {
          verbatim += '*'
          state = 'asterisk'
          continue
        }
        break

      case 'backslash':
        if (codepointIsBackslash(character) || codepointIsBacktick(character) || codepointIsAsterisk(character)) {
          insertBackslash = true
          state = 'no_special_character'
        } else {
          parserState.errors.push({
            type: 'invalid_escape_sequence',
            line: parserState.line,
            verbatim: `\\${character}`,
            from_column: calculateColumn(parserState, index - 1),
            to_column: calculateColumn(parserState, index)
          })

          return null
        }
        break

      case 'asterisk':
        state = 'no_special_character'

        if (codepointIsAsterisk(character)) {
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

          if (codepointIsBackslash(character)) {
            state = 'backslash'
            continue
          } else if (codepointIsBacktick(character)) {
            verbatim += '`'
            state = 'code'
            codeFromColumn = index
            continue
          }
        }
        break

      case 'code':
        if (codepointIsBackslash(character)) {
          state = 'code_backslash'
          continue
        } else if (codepointIsBacktick(character)) {
          codeFromColumn = -1
          verbatim += '`'
          state = 'no_special_character'
          continue
        }
        break

      case 'code_backslash':
        if (codepointIsBackslash(character) || codepointIsBacktick(character)) {
          insertBackslash = true
          state = 'code'
        } else {
          parserState.errors.push({
            type: 'invalid_escape_sequence',
            line: parserState.line,
            verbatim: `\\${character}`,
            from_column: calculateColumn(parserState, index - 1),
            to_column: calculateColumn(parserState, index)
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
        plain_text: plainText,
        from_column: calculateColumn(parserState, currentRunFromColumn),
        to_column: calculateColumn(parserState, index - (insertBackslash ? 2 : 1))
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
    case 'code_backslash':
      parserState.errors.push({
        type: 'incomplete_escape_sequence',
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
      type: 'unterminated_bold',
      line: parserState.line,
      verbatim: parserState.lineAccumulator.slice(boldFromColumn, toColumn + 1),
      from_column: calculateColumn(parserState, boldFromColumn),
      to_column: calculateColumn(parserState, toColumn)
    })

    return null
  } else if (italicFromColumn !== -1) {
    parserState.errors.push({
      type: 'unterminated_italic',
      line: parserState.line,
      verbatim: parserState.lineAccumulator.slice(italicFromColumn, toColumn + 1),
      from_column: calculateColumn(parserState, italicFromColumn),
      to_column: calculateColumn(parserState, toColumn)
    })

    return null
  } else if (codeFromColumn !== -1) {
    parserState.errors.push({
      type: 'unterminated_code',
      line: parserState.line,
      verbatim: parserState.lineAccumulator.slice(codeFromColumn, toColumn + 1),
      from_column: calculateColumn(parserState, codeFromColumn),
      to_column: calculateColumn(parserState, toColumn)
    })

    return null
  } else {
    output.push({
      bold: previousBold,
      italic: previousItalic,
      code: previousCode,
      verbatim,
      plain_text: plainText,
      from_column: calculateColumn(parserState, currentRunFromColumn),
      to_column: calculateColumn(parserState, toColumn)
    })

    return output
  }
}

import { parseFormatted } from '../../parseFormatted/index.js'
import type { ParserState } from '../../ParserState'
import { checkReachable } from '../checkReachable/index.js'

const formattedRegexFragment = '\\S.*\\S|\\S'

const lineRegex = new RegExp(`^(\\s+)(${formattedRegexFragment})\\s*$`, 'i')

export const tryParseLine = (parserState: ParserState): boolean => {
  const lineMatch = lineRegex.exec(parserState.mixedCaseLineAccumulator)

  if (lineMatch !== null) {
    const prefix = lineMatch[1] as string
    const unformatted = lineMatch[2] as string

    parseFormatted(parserState, 1 + prefix.length, unformatted, (content) => {
      if (checkReachable(parserState)) {
        parserState.instructions.push({
          type: 'line',
          line: parserState.line,
          content
        })
      }
    })

    return true
  } else {
    return false
  }
}

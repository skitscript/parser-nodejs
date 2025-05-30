import type { Identifier } from '../../Identifier'
import type { Warning } from '../../Warning'
import type { ParserState } from '../ParserState'

export const filterDuplicatesFromIdentifierList = (
  parserState: ParserState,
  newWarnings: Warning[],
  identifiers: readonly Identifier[]
): readonly Identifier[] => {
  const output: Identifier[] = []

  for (let index = 0; index < identifiers.length; index++) {
    const second = identifiers[index] as Identifier

    let first: null | Identifier = null
    let emitWarnings = true

    for (let previousIndex = 0; previousIndex < index; previousIndex++) {
      const candidate = identifiers[previousIndex] as Identifier

      if (candidate.normalized === second.normalized) {
        if (first === null) {
          first = candidate
        } else {
          emitWarnings = false
          previousIndex = index
        }
      }
    }

    if (first === null) {
      output.push(second)
    } else if (emitWarnings) {
      if (parserState.reachability === 'reachable') {
        newWarnings.push({
          type: 'duplicate_identifier_in_list',
          line: parserState.line,
          first,
          second
        })

        for (let index = 0; index < newWarnings.length;) {
          const warning = newWarnings[index] as Warning

          if (warning.type === 'inconsistent_identifier' && warning.second.from_column === second.from_column) {
            newWarnings.splice(index, 1)
          } else {
            index++
          }
        }
      }
    }
  }

  return output
}

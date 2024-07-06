import type { Condition } from '../../Condition'
import type { Identifier } from '../../Identifier'
import type { Instruction } from '../../Instruction'
import type { Warning } from '../../Warning'
import { normalizeIdentifierList } from '../normalizeIdentifierList/index.js'
import type { ParserState } from '../ParserState'

export const parseCondition = (
  parserState: ParserState,
  line: number,
  fromColumn: number,
  match: RegExpMatchArray,
  startingIndex: number
): [null | Condition, readonly Instruction[], readonly Warning[]] => {
  const prefix = match[startingIndex]

  if (prefix === undefined) {
    return [null, [], []]
  } else {
    const not = match[startingIndex + 1]

    const [flags, instructions, warnings, binaryOperator] =
      normalizeIdentifierList<'and' | 'or'>(
        parserState,
        line,
        'flag',
        fromColumn + prefix.length + (not === undefined ? 0 : not.length),
        match,
        startingIndex + 2
      )

    switch (binaryOperator) {
      case null:
        return [
          {
            type: not === undefined ? 'flagSet' : 'flagClear',
            flag: flags[0] as Identifier
          },
          instructions,
          warnings
        ]

      case 'and':
        return [
          {
            type: not === undefined ? 'everyFlagSet' : 'someFlagsClear',
            flags
          },
          instructions,
          warnings
        ]

      case 'or':
        return [
          {
            type: not === undefined ? 'someFlagsSet' : 'everyFlagClear',
            flags
          },
          instructions,
          warnings
        ]
    }
  }
}

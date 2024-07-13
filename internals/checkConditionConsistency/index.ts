import type { Condition } from '../../Condition'
import { checkIdentifierConsistency } from '../checkIdentifierConsistency/index.js'
import type { ParserState } from '../ParserState'

export const checkConditionConsistency = (
  parserState: ParserState,
  condition: null | Condition
): void => {
  if (condition !== null) {
    switch (condition.type) {
      case 'flagClear':
      case 'flagSet':
        checkIdentifierConsistency(parserState, 'flag', condition.flag)
        break

      case 'someFlagsClear':
      case 'someFlagsSet':
      case 'everyFlagClear':
      case 'everyFlagSet':
        for (const flag of condition.flags) {
          checkIdentifierConsistency(parserState, 'flag', flag)
        }
        break
    }
  }
}

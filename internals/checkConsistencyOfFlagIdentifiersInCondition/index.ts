import type { Condition } from '../../Condition'
import { checkIdentifierConsistency } from '../checkIdentifierConsistency/index.js'
import type { ParserState } from '../ParserState'

export const checkConsistencyOfFlagIdentifiersInCondition = (parserState: ParserState, condition: Condition): void => {
  switch (condition.type) {
    case 'everyFlagClear':
    case 'everyFlagSet':
    case 'someFlagsClear':
    case 'someFlagsSet':
      for (const flag of condition.flags) {
        checkIdentifierConsistency(parserState, 'flag', flag)
      }
      break

    case 'flagClear':
    case 'flagSet':
      checkIdentifierConsistency(parserState, 'flag', condition.flag)
      break
  }
}

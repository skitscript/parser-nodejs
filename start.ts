import type { ParserState } from './internals/ParserState'

export const start = (): ParserState => ({
  instructions: [],
  errors: [],
  warnings: [],
  identifierInstances: [],
  identifiers: {
    character: {},
    emote: {},
    entryAnimation: {},
    exitAnimation: {},
    label: {},
    flag: {},
    location: {}
  },
  line: 0,
  reachability: 'reachable',
  state: 'normal',
  lineAccumulator: '',
  indexOfFirstNonWhiteSpaceCharacter: -1,
  indexOfLastNonWhiteSpaceCharacter: -1
})

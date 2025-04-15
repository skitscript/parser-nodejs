import type { ParserState } from './internals/ParserState'

export const start = (): ParserState => ({
  instructions: [],
  errors: [],
  warnings: [],
  identifierInstances: [],
  identifiers: {
    character: {},
    emote: {},
    entry_animation: {},
    exit_animation: {},
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

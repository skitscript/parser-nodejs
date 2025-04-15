import type { ParserState } from './internals/ParserState'

export const start = (): ParserState => ({
  instructions: [],
  errors: [],
  warnings: [],
  identifier_instances: [],
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
  codepointState: 'initial',
  codepointAccumulator: 0,
  lineAccumulator: '',
  indexOfFirstNonWhiteSpaceCharacter: -1,
  indexOfLastNonWhiteSpaceCharacter: -1
})

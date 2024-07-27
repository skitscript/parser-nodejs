import type { ParserState } from '../internals/ParserState'

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
    background: {}
  },
  line: 0,
  reachability: 'reachable',
  state: 'normal',
  lineAccumulator: '',
  indexOfFirstNonWhiteSpaceCharacter: -1
})

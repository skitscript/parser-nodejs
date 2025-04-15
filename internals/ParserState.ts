import type { Error } from '../Error'
import type { IdentifierInstance } from '../IdentifierInstance'
import type { IdentifierType } from '../IdentifierType'
import type { Instruction } from '../Instruction'
import type { LocalIdentifierInstance } from './LocalIdentifierInstance'
import type { Reachability } from './Reachability'
import type { Warning } from '../Warning'

export interface ParserState {
  readonly instructions: Instruction[]
  readonly errors: Error[]
  readonly warnings: Warning[]
  readonly identifier_instances: IdentifierInstance[]
  readonly identifiers: {
    readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>;
  }
  line: number
  reachability: Reachability
  state: 'normal' | 'following_carriage_return' | 'ended' | 'invalid_codepoint'
  codepointState: 'initial' | 'two_byte_two' | 'three_byte_two' | 'three_byte_three' | 'four_byte_two' | 'four_byte_three' | 'four_byte_four'
  codepointAccumulator: number
  lineAccumulator: string
  indexOfFirstNonWhiteSpaceCharacter: number
  indexOfLastNonWhiteSpaceCharacter: number
}

/* c8 ignore next */

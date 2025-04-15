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
  state: 'normal' | 'following_carriage_return' | 'ended'
  lineAccumulator: string
  indexOfFirstNonWhiteSpaceCharacter: number
  indexOfLastNonWhiteSpaceCharacter: number
}

/* c8 ignore next */

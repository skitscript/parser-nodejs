import type { InvalidEscapeSequenceError } from './InvalidEscapeSequenceError'
import type { DuplicateLabelError } from './DuplicateLabelError'
import type { IncompleteEscapeSequenceError } from './IncompleteEscapeSequenceError'
import type { UndefinedLabelError } from './UndefinedLabelError'
import type { UnparsableError } from './UnparsableError'
import type { UnterminatedBoldError } from './UnterminatedBoldError'
import type { UnterminatedCodeError } from './UnterminatedCodeError'
import type { UnterminatedItalicError } from './UnterminatedItalicError'
import type { InvalidCodepointError } from './InvalidCodepointError'

/**
 * An error generated while parsing a document.
 */
export type Error =
  | DuplicateLabelError
  | IncompleteEscapeSequenceError
  | InvalidEscapeSequenceError
  | UndefinedLabelError
  | UnparsableError
  | UnterminatedBoldError
  | UnterminatedItalicError
  | UnterminatedCodeError
  | InvalidCodepointError

/* c8 ignore next */

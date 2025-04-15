/**
 * An escape sequence is started with a backslash, but is not followed by the
 * character to be escaped.
 */
export interface IncompleteEscapeSequenceError {
  /**
   * Identifies the type of error.
   */
  readonly type: 'incompleteEscapeSequence'

  /**
   * The line from which the error originates.
   */
  readonly line: number

  /**
   * The column from which the error originates.
   */
  readonly column: number
}

/* c8 ignore next */

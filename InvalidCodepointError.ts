/**
 * An invalid codepoint was found in the document.
 */
export interface InvalidCodepointError {
  /**
   * Identifies the type of error.
   */
  readonly type: 'invalid_codepoint'

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

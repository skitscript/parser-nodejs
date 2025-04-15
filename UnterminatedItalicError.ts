/**
 * Italic text is started but never ended within a formatted section of the
 * document.
 */
export interface UnterminatedItalicError {
  /**
   * Identifies the type of error.
   */
  readonly type: 'unterminated_italic'

  /**
   * The line from which the error originates.
   */
  readonly line: number

  /**
   * The unterminated italic text as written in the original document.
   */
  readonly verbatim: string

  /**
   * The column on which the unterminated italic text started in the original
   * document.
   */
  readonly from_column: number

  /**
   * The column on which the unterminated italic text ended in the original
   * document.
   */
  readonly to_column: number
}

/* c8 ignore next */

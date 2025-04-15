/**
 * Bold text is started but never ended within a formatted section of the
 * document.
 */
export interface UnterminatedBoldError {
  /**
   * Identifies the type of error.
   */
  readonly type: 'unterminated_bold'

  /**
   * The line from which the error originates.
   */
  readonly line: number

  /**
   * The unterminated bold text as written in the original document.
   */
  readonly verbatim: string

  /**
   * The column on which the unterminated bold text started in the original
   * document.
   */
  readonly fromColumn: number

  /**
   * The column on which the unterminated bold text ended in the original
   * document.
   */
  readonly toColumn: number
}

/* c8 ignore next */

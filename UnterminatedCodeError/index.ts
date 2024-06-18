/**
 * Code is started but never ended within a formatted section of the document.
 */
export interface UnterminatedCodeError {
  /**
   * Identifies the type of error.
   */
  readonly type: 'unterminatedCode'

  /**
   * The line from which the error originates.
   */
  readonly line: number

  /**
   * The unterminated code as written in the original document.
   */
  readonly verbatim: string

  /**
   * The column on which the unterminated code started in the original
   * document.
   */
  readonly fromColumn: number

  /**
   * The column on which the unterminated code ended in the original
   * document.
   */
  readonly toColumn: number
}

/**
 * An identifier, as parsed from a document.
 */
export interface Identifier {
  /**
   * The identifier's exact text as written in the original document.
   */
  readonly verbatim: string

  /**
   * The normalized identifier as parsed from the document.
   */
  readonly normalized: string

  /**
   * The column on which the identifier started in the original document.
   */
  readonly fromColumn: number

  /**
   * The column on which the identifier ended in the original document.
   */
  readonly toColumn: number
}

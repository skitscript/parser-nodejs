/**
 * A run of formatted text.
 */
export interface Run {
  /**
   * When true, the run is to be displayed in bold.  It is to otherwise be
   * displayed using the default font weight.
   */
  readonly bold: boolean

  /**
   * When true, the run is to be displayed in italics.  It is to otherwise be
   * displayed upright.
   */
  readonly italic: boolean

  /**
   * When true, the run is to be displayed in a mono-space font.  It is to
   * otherwise be displayed using the default font.
   */
  readonly code: boolean

  /**
   * The run's exact text as written in the original document.
   */
  readonly verbatim: string

  /**
   * The run's plain text content as parsed from the document.
   */
  readonly plainText: string

  /**
   * The column on which the run started in the original document.
   */
  readonly fromColumn: number

  /**
   * The column on which the run ended in the original document.
   */
  readonly toColumn: number
}

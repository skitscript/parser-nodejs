/**
 * A line was determined to be impossible to reach.
 */
export interface UnreachableWarning {
  /**
   * Identifies the type of warning.
   */
  readonly type: 'unreachable'

  /**
   * The line from which the warning originates.
   */
  readonly line: number

  /**
   * The column on which the warning started in the original document.
   */
  readonly fromColumn: number

  /**
   * The column on which the warning ended in the original document.
   */
  readonly toColumn: number
}

/* c8 ignore next */

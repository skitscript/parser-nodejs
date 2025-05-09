import type { Identifier } from './Identifier'

/**
 * A label is defined, but is never referenced.
 */
export interface UnreferencedLabelWarning {
  /**
   * Identifies the type of warning.
   */
  readonly type: 'unreferenced_label'

  /**
   * The line from which the warning originates.
   */
  readonly line: number

  /**
   * The name of the label which is not referenced.
   */
  readonly label: Identifier
}

/* c8 ignore next */

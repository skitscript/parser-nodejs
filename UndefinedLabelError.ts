import type { Identifier } from './Identifier'

/**
 * A jump or menu option references a nonexistent label.
 */
export interface UndefinedLabelError {
  /**
   * Identifies the type of error.
   */
  readonly type: 'undefinedLabel'

  /**
   * The line from which the error originates.
   */
  readonly line: number

  /**
   * The name of the label which does not exist.
   */
  readonly label: Identifier
}

/* c8 ignore next */

import type { DuplicateIdentifierInListWarning } from './DuplicateIdentifierInListWarning'
import type { EmptyLabelWarning } from './EmptyLabelWarning'
import type { FlagNeverReferencedWarning } from './FlagNeverReferencedWarning'
import type { FlagNeverSetWarning } from './FlagNeverSetWarning'
import type { InconsistentIdentifierWarning } from './InconsistentIdentifierWarning'
import type { UnreachableWarning } from './UnreachableWarning'
import type { UnreferencedLabelWarning } from './UnreferencedLabelWarning'

/**
 * A warning generated while parsing a document.
 */
export type Warning =
  | DuplicateIdentifierInListWarning
  | EmptyLabelWarning
  | FlagNeverReferencedWarning
  | FlagNeverSetWarning
  | InconsistentIdentifierWarning
  | UnreachableWarning
  | UnreferencedLabelWarning

/* c8 ignore next */

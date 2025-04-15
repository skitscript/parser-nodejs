import type { InvalidDocument } from './InvalidDocument'
import type { ValidDocument } from './ValidDocument'

/**
 * The result of attempting to parse a document.  This may be valid or invalid.
 */
export type Document = InvalidDocument | ValidDocument

/* c8 ignore next */

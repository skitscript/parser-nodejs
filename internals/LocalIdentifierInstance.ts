import type { IdentifierReference } from '../IdentifierReference'

export interface LocalIdentifierInstance {
  readonly first: IdentifierReference
  reportedInconsistent: boolean
}

/* c8 ignore next */

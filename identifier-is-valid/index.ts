import { identifierRegexFragment } from "../parse";

const regex = new RegExp(`^${identifierRegexFragment}$`, `i`);

/**
 * Determines whether text is a valid identifier.
 * @param verbatim The text of the possible identifier to check.
 * @returns True when the given text is a valid identifier, otherwise, false.
 */
export const identifierIsValid = (verbatim: string): boolean =>
  regex.test(verbatim);

export const characterIsInvalidInIdentifiers = (character: string): boolean => {
  switch (character) {
    case ':':
    case ',':
    case '(':
    case ')':
    case '~':
      return true

    default:
      return false
  }
}

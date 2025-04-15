export const characterIsWhitespace = (character: string): boolean => {
  switch (character) {
    case ' ':
    case '\t':
      return true

    default:
      return false
  }
}

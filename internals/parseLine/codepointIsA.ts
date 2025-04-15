export const codepointIsA = (codepoint: string): boolean => {
  switch (codepoint) {
    case 'a':
    case 'A':
      return true

    default:
      return false
  }
}

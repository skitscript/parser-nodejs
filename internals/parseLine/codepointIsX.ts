export const codepointIsX = (character: string): boolean => {
  switch (character) {
    case 'x':
    case 'X':
      return true

    default:
      return false
  }
}

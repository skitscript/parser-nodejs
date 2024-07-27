export const characterIsX = (character: string): boolean => {
  switch (character) {
    case 'x':
    case 'X':
      return true

    default:
      return false
  }
}

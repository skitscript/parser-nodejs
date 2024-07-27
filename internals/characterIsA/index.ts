export const characterIsA = (character: string): boolean => {
  switch (character) {
    case 'a':
    case 'A':
      return true

    default:
      return false
  }
}

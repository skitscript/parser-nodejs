export const characterIsT = (character: string): boolean => {
  switch (character) {
    case 't':
    case 'T':
      return true

    default:
      return false
  }
}

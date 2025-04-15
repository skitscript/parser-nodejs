export const characterIsN = (character: string): boolean => {
  switch (character) {
    case 'n':
    case 'N':
      return true

    default:
      return false
  }
}

export const characterIsP = (character: string): boolean => {
  switch (character) {
    case 'p':
    case 'P':
      return true

    default:
      return false
  }
}

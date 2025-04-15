export const codepointIsP = (character: string): boolean => {
  switch (character) {
    case 'p':
    case 'P':
      return true

    default:
      return false
  }
}

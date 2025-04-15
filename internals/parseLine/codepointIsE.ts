export const codepointIsE = (character: string): boolean => {
  switch (character) {
    case 'e':
    case 'E':
      return true

    default:
      return false
  }
}

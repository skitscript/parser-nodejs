export const codepointIsC = (character: string): boolean => {
  switch (character) {
    case 'c':
    case 'C':
      return true

    default:
      return false
  }
}

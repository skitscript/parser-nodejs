export const codepointIsR = (character: string): boolean => {
  switch (character) {
    case 'r':
    case 'R':
      return true

    default:
      return false
  }
}

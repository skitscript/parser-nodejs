export const codepointIsU = (character: string): boolean => {
  switch (character) {
    case 'u':
    case 'U':
      return true

    default:
      return false
  }
}

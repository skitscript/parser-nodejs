export const codepointIsL = (character: string): boolean => {
  switch (character) {
    case 'l':
    case 'L':
      return true

    default:
      return false
  }
}

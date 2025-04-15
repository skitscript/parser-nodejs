export const codepointIsS = (character: string): boolean => {
  switch (character) {
    case 's':
    case 'S':
      return true

    default:
      return false
  }
}

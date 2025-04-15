export const codepointIsT = (character: string): boolean => {
  switch (character) {
    case 't':
    case 'T':
      return true

    default:
      return false
  }
}

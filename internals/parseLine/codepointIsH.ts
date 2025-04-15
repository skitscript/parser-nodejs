export const codepointIsH = (character: string): boolean => {
  switch (character) {
    case 'h':
    case 'H':
      return true

    default:
      return false
  }
}

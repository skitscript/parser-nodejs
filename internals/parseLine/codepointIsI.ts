export const codepointIsI = (character: string): boolean => {
  switch (character) {
    case 'i':
    case 'I':
      return true

    default:
      return false
  }
}

export const codepointIsW = (character: string): boolean => {
  switch (character) {
    case 'w':
    case 'W':
      return true

    default:
      return false
  }
}

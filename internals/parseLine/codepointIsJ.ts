export const codepointIsJ = (character: string): boolean => {
  switch (character) {
    case 'j':
    case 'J':
      return true

    default:
      return false
  }
}

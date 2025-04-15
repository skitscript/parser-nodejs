export const characterIsW = (character: string): boolean => {
  switch (character) {
    case 'w':
    case 'W':
      return true

    default:
      return false
  }
}

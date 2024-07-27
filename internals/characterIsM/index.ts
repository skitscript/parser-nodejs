export const characterIsM = (character: string): boolean => {
  switch (character) {
    case 'm':
    case 'M':
      return true

    default:
      return false
  }
}

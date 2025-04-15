const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const transformCharacterToLowerCase = (character: string): string => {
  const index = upperCase.indexOf(character)

  return index === -1 ? character : lowerCase.charAt(index)
}

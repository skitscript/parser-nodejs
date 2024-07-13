export const wordIsInvalidInIdentifiers = (lowerCase: string, fromColumn: number, toColumn: number): boolean => {
  switch (toColumn - fromColumn) {
    case 1:
      switch (lowerCase.charAt(fromColumn)) {
        case 'i':
          return lowerCase.charAt(toColumn) === 's'

        case 'o':
          return lowerCase.charAt(toColumn) === 'r'

        case 't':
          return lowerCase.charAt(toColumn) === 'o'

        default:
          return false
      }

    case 2:
      switch (lowerCase.charAt(fromColumn)) {
        case 'a':
          switch (lowerCase.charAt(fromColumn + 1)) {
            case 'n':
              return lowerCase.charAt(toColumn) === 'd'

            case 'r':
              return lowerCase.charAt(toColumn) === 'e'

            default:
              return false
          }

        case 'n':
          return lowerCase.charAt(fromColumn + 1) === 'o' && lowerCase.charAt(toColumn) === 't'

        case 's':
          return lowerCase.charAt(fromColumn + 1) === 'e' && lowerCase.charAt(toColumn) === 't'

        default:
          return false
      }

    case 3:
      switch (lowerCase.charAt(fromColumn)) {
        case 'e':
          return lowerCase.charAt(fromColumn + 1) === 'x' && lowerCase.charAt(fromColumn + 2) === 'i' && lowerCase.charAt(toColumn) === 't'

        case 'j':
          return lowerCase.charAt(fromColumn + 1) === 'u' && lowerCase.charAt(fromColumn + 2) === 'm' && lowerCase.charAt(toColumn) === 'p'

        case 'w':
          return lowerCase.charAt(fromColumn + 1) === 'h' && lowerCase.charAt(fromColumn + 2) === 'e' && lowerCase.charAt(toColumn) === 'n'

        default:
          return false
      }

    case 4:
      switch (lowerCase.charAt(fromColumn)) {
        case 'c':
          return lowerCase.charAt(fromColumn + 1) === 'l' && lowerCase.charAt(fromColumn + 2) === 'e' && lowerCase.charAt(fromColumn + 3) === 'a' && lowerCase.charAt(toColumn) === 'r'

        case 'e':
          switch (lowerCase.charAt(fromColumn + 1)) {
            case 'n':
              return lowerCase.charAt(fromColumn + 2) === 't' && lowerCase.charAt(fromColumn + 3) === 'e' && lowerCase.charAt(toColumn) === 'r'

            case 'x':
              return lowerCase.charAt(fromColumn + 2) === 'i' && lowerCase.charAt(fromColumn + 3) === 't' && lowerCase.charAt(toColumn) === 's'

            default:
              return false
          }

        case 'l':
          return lowerCase.charAt(fromColumn + 1) === 'e' && lowerCase.charAt(fromColumn + 2) === 'a' && lowerCase.charAt(fromColumn + 3) === 'd' && lowerCase.charAt(toColumn) === 's'

        default:
          return false
      }

    case 5:
      return lowerCase.charAt(fromColumn) === 'e' && lowerCase.charAt(fromColumn + 1) === 'n' && lowerCase.charAt(fromColumn + 2) === 't' && lowerCase.charAt(fromColumn + 3) === 'e' && lowerCase.charAt(fromColumn + 4) === 'r' && lowerCase.charAt(toColumn) === 's'

    default:
      return false
  }
}


export const codepointIsExcludedFromIdentifiers = (character: string): boolean => {
  switch (character) {
    case '!':
    case '?':
    case '\'':
    case '"':
    case '{':
    case '}':
    case '@':
    case '*':
    case '/':
    case '\\':
    case '&':
    case '#':
    case '%':
    case '`':
    case '+':
    case '<':
    case '=':
    case '>':
    case '|':
    case '$':
    case '.':
    case '-':
    case ' ':
    case '\t':
      return true

    default:
      return false
  }
}

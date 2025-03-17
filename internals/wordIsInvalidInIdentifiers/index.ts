import { characterIsA } from '../characterIsA/index.js'
import { characterIsC } from '../characterIsC/index.js'
import { characterIsD } from '../characterIsD/index.js'
import { characterIsE } from '../characterIsE/index.js'
import { characterIsH } from '../characterIsH/index.js'
import { characterIsI } from '../characterIsI/index.js'
import { characterIsJ } from '../characterIsJ/index.js'
import { characterIsL } from '../characterIsL/index.js'
import { characterIsM } from '../characterIsM/index.js'
import { characterIsN } from '../characterIsN/index.js'
import { characterIsO } from '../characterIsO/index.js'
import { characterIsP } from '../characterIsP/index.js'
import { characterIsR } from '../characterIsR/index.js'
import { characterIsS } from '../characterIsS/index.js'
import { characterIsT } from '../characterIsT/index.js'
import { characterIsU } from '../characterIsU/index.js'
import { characterIsW } from '../characterIsW/index.js'
import { characterIsX } from '../characterIsX/index.js'
import type { ParserState } from '../ParserState'

export const wordIsInvalidInIdentifiers = (parserState: ParserState, fromColumn: number, length: number): boolean => {
  switch (length) {
    case 2:
    {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsI(firstCharacter)) {
        if (characterIsS(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return true
        } else {
          return false
        }
      } else if (characterIsO(firstCharacter)) {
        if (characterIsR(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return true
        } else {
          return true
        }
      } else if (characterIsT(firstCharacter)) {
        if (characterIsO(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }

    case 3:
    {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsA(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (characterIsN(secondCharacter)) {
          if (characterIsD(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return true
          } else {
            return false
          }
        } else if (characterIsR(secondCharacter)) {
          if (characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return true
          } else {
            return false
          }
        }

        return false
      } else if (characterIsN(firstCharacter)) {
        if (characterIsO(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        if (characterIsS(firstCharacter)) {
          if (characterIsE(parserState.lineAccumulator.charAt(fromColumn + 1))) {
            if (characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
              return true
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      }
    }

    case 4: {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsE(firstCharacter)) {
        if (characterIsX(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (characterIsI(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (characterIsT(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              return true
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      } else if (characterIsJ(firstCharacter)) {
        if (characterIsU(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (characterIsM(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (characterIsP(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              return true
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        if (characterIsW(firstCharacter)) {
          if (characterIsH(parserState.lineAccumulator.charAt(fromColumn + 1))) {
            if (characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
              if (characterIsN(parserState.lineAccumulator.charAt(fromColumn + 3))) {
                return true
              } else {
                return false
              }
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      }
    }

    case 5: {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsC(firstCharacter)) {
        if (characterIsL(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (characterIsA(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))) {
                return true
              } else {
                return false
              }
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      } else if (characterIsE(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (characterIsN(secondCharacter)) {
          if (characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (characterIsE(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))) {
                return true
              } else {
                return false
              }
            } else {
              return false
            }
          } else {
            return false
          }
        } else if (characterIsX(secondCharacter)) {
          if (characterIsI(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (characterIsT(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (characterIsS(parserState.lineAccumulator.charAt(fromColumn + 4))) {
                return true
              } else {
                return false
              }
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      } else if (characterIsL(firstCharacter)) {
        if (characterIsE(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (characterIsA(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (characterIsD(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (characterIsS(parserState.lineAccumulator.charAt(fromColumn + 4))) {
                return true
              } else {
                return false
              }
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        return false
      }
    }

    case 6:
      if (characterIsE(parserState.lineAccumulator.charAt(fromColumn))) {
        if (characterIsN(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (characterIsE(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))) {
                if (characterIsS(parserState.lineAccumulator.charAt(fromColumn + 5))) {
                  return true
                } else {
                  return false
                }
              } else {
                return false
              }
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        return false
      }

    default:
      return false
  }
}

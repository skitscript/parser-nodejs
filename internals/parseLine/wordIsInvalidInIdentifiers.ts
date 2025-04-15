import { codepointIsA } from './codepointIsA.js'
import { codepointIsC } from './codepointIsC.js'
import { codepointIsD } from './codepointIsD.js'
import { codepointIsE } from './codepointIsE.js'
import { codepointIsH } from './codepointIsH.js'
import { codepointIsI } from './codepointIsI.js'
import { codepointIsJ } from './codepointIsJ.js'
import { codepointIsL } from './codepointIsL.js'
import { codepointIsM } from './codepointIsM.js'
import { codepointIsN } from './codepointIsN.js'
import { codepointIsO } from './codepointIsO.js'
import { codepointIsP } from './codepointIsP.js'
import { codepointIsR } from './codepointIsR.js'
import { codepointIsS } from './codepointIsS.js'
import { codepointIsT } from './codepointIsT.js'
import { codepointIsU } from './codepointIsU.js'
import { codepointIsW } from './codepointIsW.js'
import { codepointIsX } from './codepointIsX.js'
import type { ParserState } from '../ParserState'

export const wordIsInvalidInIdentifiers = (parserState: ParserState, fromColumn: number, length: number): boolean => {
  switch (length) {
    case 2:
    {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (codepointIsI(firstCharacter)) {
        if (codepointIsS(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return true
        } else {
          return false
        }
      } else if (codepointIsO(firstCharacter)) {
        if (codepointIsR(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return true
        } else {
          return false
        }
      } else if (codepointIsT(firstCharacter)) {
        if (codepointIsO(parserState.lineAccumulator.charAt(fromColumn + 1))) {
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

      if (codepointIsA(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (codepointIsN(secondCharacter)) {
          if (codepointIsD(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return true
          } else {
            return false
          }
        } else if (codepointIsR(secondCharacter)) {
          if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return true
          } else {
            return false
          }
        }

        return false
      } else if (codepointIsN(firstCharacter)) {
        if (codepointIsO(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (codepointIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        if (codepointIsS(firstCharacter)) {
          if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn + 1))) {
            if (codepointIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
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

      if (codepointIsE(firstCharacter)) {
        if (codepointIsX(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (codepointIsI(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (codepointIsT(parserState.lineAccumulator.charAt(fromColumn + 3))) {
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
      } else if (codepointIsJ(firstCharacter)) {
        if (codepointIsU(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (codepointIsM(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (codepointIsP(parserState.lineAccumulator.charAt(fromColumn + 3))) {
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
        if (codepointIsW(firstCharacter)) {
          if (codepointIsH(parserState.lineAccumulator.charAt(fromColumn + 1))) {
            if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
              if (codepointIsN(parserState.lineAccumulator.charAt(fromColumn + 3))) {
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

      if (codepointIsC(firstCharacter)) {
        if (codepointIsL(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (codepointIsA(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (codepointIsR(parserState.lineAccumulator.charAt(fromColumn + 4))) {
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
      } else if (codepointIsE(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (codepointIsN(secondCharacter)) {
          if (codepointIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (codepointIsR(parserState.lineAccumulator.charAt(fromColumn + 4))) {
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
        } else if (codepointIsX(secondCharacter)) {
          if (codepointIsI(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (codepointIsT(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (codepointIsS(parserState.lineAccumulator.charAt(fromColumn + 4))) {
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
      } else if (codepointIsL(firstCharacter)) {
        if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (codepointIsA(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (codepointIsD(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (codepointIsS(parserState.lineAccumulator.charAt(fromColumn + 4))) {
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
      if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn))) {
        if (codepointIsN(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          if (codepointIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            if (codepointIsE(parserState.lineAccumulator.charAt(fromColumn + 3))) {
              if (codepointIsR(parserState.lineAccumulator.charAt(fromColumn + 4))) {
                if (codepointIsS(parserState.lineAccumulator.charAt(fromColumn + 5))) {
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

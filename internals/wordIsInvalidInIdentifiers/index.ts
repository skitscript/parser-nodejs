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
        return characterIsS(parserState.lineAccumulator.charAt(fromColumn + 1))
      } else if (characterIsO(firstCharacter)) {
        return characterIsR(parserState.lineAccumulator.charAt(fromColumn + 1))
      } else if (!characterIsT(firstCharacter)) {
        return false
      } else {
        return characterIsO(parserState.lineAccumulator.charAt(fromColumn + 1))
      }
    }

    case 3:
    {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsA(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (characterIsN(secondCharacter)) {
          return characterIsD(parserState.lineAccumulator.charAt(fromColumn + 2))
        }

        if (characterIsR(secondCharacter)) {
          return characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2))
        }

        return false
      } else if (characterIsN(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (characterIsO(secondCharacter)) {
          return characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))
        } else {
          if (!characterIsE(secondCharacter)) {
            return false
          }

          return characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))
        }
      } else {
        if (!characterIsS(firstCharacter)) {
          return false
        }

        if (!characterIsE(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return false
        }

        return characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))
      }
    }

    case 4: {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsE(firstCharacter)) {
        if (!characterIsX(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return false
        }

        if (!characterIsI(parserState.lineAccumulator.charAt(fromColumn + 2))) {
          return false
        }

        return characterIsT(parserState.lineAccumulator.charAt(fromColumn + 3))
      } else if (characterIsJ(firstCharacter)) {
        if (!characterIsU(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return false
        }

        if (!characterIsM(parserState.lineAccumulator.charAt(fromColumn + 2))) {
          return false
        }

        return characterIsP(parserState.lineAccumulator.charAt(fromColumn + 3))
      } else {
        if (!characterIsW(firstCharacter)) {
          return false
        }

        if (!characterIsH(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return false
        }

        if (!characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
          return false
        }

        return characterIsN(parserState.lineAccumulator.charAt(fromColumn + 3))
      }
    }

    case 5: {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsC(firstCharacter)) {
        if (!characterIsL(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return false
        }

        if (!characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2))) {
          return false
        }

        if (!characterIsA(parserState.lineAccumulator.charAt(fromColumn + 3))) {
          return false
        }

        return characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))
      } else if (characterIsE(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (characterIsN(secondCharacter)) {
          if (!characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return false
          }

          if (!characterIsE(parserState.lineAccumulator.charAt(fromColumn + 3))) {
            return false
          }

          return characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))
        } else {
          if (!characterIsX(secondCharacter)) {
            return false
          }

          if (!characterIsI(parserState.lineAccumulator.charAt(fromColumn + 2))) {
            return false
          }

          if (!characterIsT(parserState.lineAccumulator.charAt(fromColumn + 3))) {
            return false
          }

          return characterIsS(parserState.lineAccumulator.charAt(fromColumn + 4))
        }
      } else if (characterIsL(firstCharacter)) {
        if (!characterIsE(parserState.lineAccumulator.charAt(fromColumn + 1))) {
          return false
        }

        if (!characterIsA(parserState.lineAccumulator.charAt(fromColumn + 2))) {
          return false
        }

        if (!characterIsD(parserState.lineAccumulator.charAt(fromColumn + 3))) {
          return false
        }

        return characterIsS(parserState.lineAccumulator.charAt(fromColumn + 4))
      } else {
        return false
      }
    }

    case 6:
      if (!characterIsE(parserState.lineAccumulator.charAt(fromColumn))) {
        return false
      }

      if (!characterIsN(parserState.lineAccumulator.charAt(fromColumn + 1))) {
        return false
      }

      if (!characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))) {
        return false
      }

      if (!characterIsE(parserState.lineAccumulator.charAt(fromColumn + 3))) {
        return false
      }

      if (!characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))) {
        return false
      }

      return characterIsS(parserState.lineAccumulator.charAt(fromColumn + 5))

    default:
      return false
  }
}

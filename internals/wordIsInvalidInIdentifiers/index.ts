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
      } else {
        return characterIsT(firstCharacter) && characterIsO(parserState.lineAccumulator.charAt(fromColumn + 1))
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
          return characterIsE(secondCharacter) && characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))
        }
      } else {
        return characterIsS(firstCharacter) &&
          characterIsE(parserState.lineAccumulator.charAt(fromColumn + 1)) &&
          characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2))
      }
    }

    case 4: {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsE(firstCharacter)) {
        return characterIsX(parserState.lineAccumulator.charAt(fromColumn + 1)) && characterIsI(parserState.lineAccumulator.charAt(fromColumn + 2)) && characterIsT(parserState.lineAccumulator.charAt(fromColumn + 3))
      } else if (characterIsJ(firstCharacter)) {
        return characterIsU(parserState.lineAccumulator.charAt(fromColumn + 1)) && characterIsM(parserState.lineAccumulator.charAt(fromColumn + 2)) && characterIsP(parserState.lineAccumulator.charAt(fromColumn + 3))
      } else {
        return characterIsW(firstCharacter) && characterIsH(parserState.lineAccumulator.charAt(fromColumn + 1)) && characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2)) && characterIsN(parserState.lineAccumulator.charAt(fromColumn + 3))
      }
    }

    case 5: {
      const firstCharacter = parserState.lineAccumulator.charAt(fromColumn)

      if (characterIsC(firstCharacter)) {
        return characterIsL(parserState.lineAccumulator.charAt(fromColumn + 1)) &&
        characterIsE(parserState.lineAccumulator.charAt(fromColumn + 2)) &&
        characterIsA(parserState.lineAccumulator.charAt(fromColumn + 3)) &&
        characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))
      } else if (characterIsE(firstCharacter)) {
        const secondCharacter = parserState.lineAccumulator.charAt(fromColumn + 1)

        if (characterIsN(secondCharacter)) {
          return characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2)) &&
          characterIsE(parserState.lineAccumulator.charAt(fromColumn + 3)) &&
          characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4))
        } else {
          return characterIsX(secondCharacter) &&
          characterIsI(parserState.lineAccumulator.charAt(fromColumn + 2)) &&
          characterIsT(parserState.lineAccumulator.charAt(fromColumn + 3)) &&
          characterIsS(parserState.lineAccumulator.charAt(fromColumn + 4))
        }
      } else {
        return characterIsL(firstCharacter) &&
        characterIsE(parserState.lineAccumulator.charAt(fromColumn + 1)) &&
        characterIsA(parserState.lineAccumulator.charAt(fromColumn + 2)) &&
        characterIsD(parserState.lineAccumulator.charAt(fromColumn + 3)) &&
        characterIsS(parserState.lineAccumulator.charAt(fromColumn + 4))
      }
    }

    case 6:
      return characterIsE(parserState.lineAccumulator.charAt(fromColumn)) &&
      characterIsN(parserState.lineAccumulator.charAt(fromColumn + 1)) &&
      characterIsT(parserState.lineAccumulator.charAt(fromColumn + 2)) &&
      characterIsE(parserState.lineAccumulator.charAt(fromColumn + 3)) &&
      characterIsR(parserState.lineAccumulator.charAt(fromColumn + 4)) &&
      characterIsS(parserState.lineAccumulator.charAt(fromColumn + 5))

    default:
      return false
  }
}

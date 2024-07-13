import type { Identifier } from '../../Identifier'
import type { IdentifierType } from '../../IdentifierType'
import type { Instruction } from '../../Instruction'
import type { Warning } from '../../Warning'
import { normalizeIdentifier } from '../normalizeIdentifier/index.js'
import type { ParserState } from '../ParserState'

export const normalizeIdentifierList = <TBinaryOperator extends string>(
  parserState: ParserState,
  type: IdentifierType,
  fromColumn: number,
  match: RegExpMatchArray,
  startingIndex: number
): readonly [
    readonly Identifier[],
    readonly Instruction[],
    readonly Warning[],
    null | TBinaryOperator
  ] => {
  const commaDelimited = match[startingIndex]

  if (commaDelimited === undefined) {
    const single = match[startingIndex + 4]

    return [
      [
        normalizeIdentifier(
          parserState,
          type,
          'implicitDeclaration',
          fromColumn,
          single as string
        )
      ],
      [],
      [],
      null
    ]
  } else {
    const beforeBinaryOperator = match[startingIndex + 1] as string
    const binaryOperator = match[startingIndex + 2] as string
    const afterBinaryOperator = match[startingIndex + 3] as string
    const final = match[startingIndex + 4] as string

    const identifiers: Identifier[] = []

    fromColumn--

    for (const identifier of commaDelimited.split(',')) {
      fromColumn++

      fromColumn += identifier.length - identifier.trimStart().length

      identifiers.push(
        normalizeIdentifier(
          parserState,
          type,
          'implicitDeclaration',
          fromColumn,
          identifier.trim()
        )
      )

      fromColumn += identifier.trimStart().length
    }

    fromColumn += beforeBinaryOperator.length
    fromColumn += binaryOperator.length
    fromColumn += afterBinaryOperator.length

    identifiers.push(
      normalizeIdentifier(
        parserState,
        type,
        'implicitDeclaration',
        fromColumn,
        final
      )
    )

    const instructions: Instruction[] = []
    const warnings: Warning[] = []

    for (let i = 0; i < identifiers.length; i++) {
      const first = identifiers[i] as Identifier

      let firstDuplicate = true

      for (let j = i + 1; j < identifiers.length;) {
        const second = identifiers[j] as Identifier

        if (first.normalized === second.normalized) {
          identifiers.splice(j, 1)

          if (firstDuplicate) {
            warnings.push({
              type: 'duplicateIdentifierInList',
              line: parserState.line,
              first,
              second
            })

            firstDuplicate = false
          }
        } else {
          j++
        }
      }
    }

    return [
      identifiers,
      instructions,
      warnings,
      binaryOperator.toLowerCase() as TBinaryOperator
    ]
  }
}

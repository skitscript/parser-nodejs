import type { Document } from './Document'
import type { Instruction } from './Instruction'
import type { LocalIdentifierInstance } from './internals/LocalIdentifierInstance'
import { parseLine } from './internals/parseLine/index.js'
import type { ParserState } from './internals/ParserState'
import { unwrapIdentifier } from './internals/unwrapIdentifier.js'

export const end = (parserState: ParserState): Document => {
  if (parserState.state === 'ended') {
    throw new Error('Unable to end the same parser more than once.')
  }

  parseLine(parserState)

  parserState.state = 'ended'

  for (
    let instructionIndex = 0;
    instructionIndex < parserState.instructions.length;
    instructionIndex++
  ) {
    const statement = parserState.instructions[instructionIndex] as Instruction

    switch (statement.type) {
      case 'label': {
        const referencedByAJump = parserState.instructions.some(
          (jumpInstruction) =>
            jumpInstruction.type === 'jump' &&
            jumpInstruction.label.normalized === statement.label.normalized
        )

        const referencedByAMenuOption = parserState.instructions.some(
          (menuOptionInstruction) =>
            menuOptionInstruction.type === 'menuOption' &&
            menuOptionInstruction.label.normalized ===
              statement.label.normalized
        )

        if (!referencedByAJump && !referencedByAMenuOption) {
          parserState.warnings.push({
            type: 'unreferencedLabel',
            line: statement.line,
            label: statement.label
          })
        }

        break
      }

      case 'jump':
      case 'menuOption':
        if (
          !parserState.instructions.some(
            (labelInstruction) =>
              labelInstruction.type === 'label' &&
              labelInstruction.label.normalized === statement.label.normalized
          )
        ) {
          parserState.errors.push({
            type: 'undefinedLabel',
            line: statement.line,
            label: statement.label
          })
        }
    }
  }

  for (const normalizedFlag in parserState.identifiers.flag) {
    if (
      !parserState.instructions.some(
        (instruction) =>
          instruction.type === 'set' &&
          instruction.flag.normalized === normalizedFlag
      )
    ) {
      const flag = parserState.identifiers.flag[normalizedFlag] as LocalIdentifierInstance

      parserState.warnings.push({
        type: 'flagNeverSet',
        line: flag.first.line,
        flag: unwrapIdentifier(flag.first)
      })
    }

    if (
      !parserState.instructions.some(
        (instruction) =>
          (instruction.type === 'jump' || instruction.type === 'menuOption') &&
          instruction.condition !== null &&
          (instruction.condition.type === 'flagClear' ||
          instruction.condition.type === 'flagSet'
            ? instruction.condition.flag.normalized === normalizedFlag
            : instruction.condition.flags.some(
              (flag) => flag.normalized === normalizedFlag
            ))
      )
    ) {
      const flag = parserState.identifiers.flag[normalizedFlag] as LocalIdentifierInstance

      parserState.warnings.push({
        type: 'flagNeverReferenced',
        line: flag.first.line,
        flag: unwrapIdentifier(flag.first)
      })
    }
  }

  if (parserState.errors.length > 0) {
    return { type: 'invalid', errors: parserState.errors, warnings: parserState.warnings, identifierInstances: parserState.identifierInstances }
  }

  if (parserState.instructions.length > 0) {
    const lastInstruction = parserState.instructions[
      parserState.instructions.length - 1
    ] as Instruction

    if (
      lastInstruction.type === 'label' &&
      !parserState.warnings.some(
        (flagNeverReferencedWarning) =>
          flagNeverReferencedWarning.type === 'unreferencedLabel' &&
          flagNeverReferencedWarning.label.normalized ===
            lastInstruction.label.normalized
      )
    ) {
      parserState.warnings.push({
        type: 'emptyLabel',
        line: lastInstruction.line,
        label: lastInstruction.label
      })
    }
  }

  const labelInstructionIndices: Record<string, number> = {}

  let instructionIndex = 0

  for (const statement of parserState.instructions) {
    if (statement.type === 'label') {
      labelInstructionIndices[statement.label.normalized] = instructionIndex
    }

    instructionIndex++
  }

  const mappedInstructions = parserState.instructions.map((instruction): Instruction => {
    switch (instruction.type) {
      case 'clear':
      case 'emote':
      case 'entryAnimation':
      case 'exitAnimation':
      case 'line':
      case 'location':
      case 'set':
      case 'speaker':
      case 'label':
        return instruction

      case 'jump':
        return {
          ...instruction,
          instructionIndex: labelInstructionIndices[
            instruction.label.normalized
          ] as number
        }

      default:
        return {
          ...instruction,
          instructionIndex: labelInstructionIndices[
            instruction.label.normalized
          ] as number
        }
    }
  })

  return {
    type: 'valid',
    instructions: mappedInstructions,
    warnings: parserState.warnings,
    identifierInstances: parserState.identifierInstances
  }
}

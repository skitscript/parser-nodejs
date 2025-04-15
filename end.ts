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
            menuOptionInstruction.type === 'menu_option' &&
            menuOptionInstruction.label.normalized ===
              statement.label.normalized
        )

        if (!referencedByAJump && !referencedByAMenuOption) {
          parserState.warnings.push({
            type: 'unreferenced_label',
            line: statement.line,
            label: statement.label
          })
        }

        break
      }

      case 'jump':
      case 'menu_option':
        if (
          !parserState.instructions.some(
            (labelInstruction) =>
              labelInstruction.type === 'label' &&
              labelInstruction.label.normalized === statement.label.normalized
          )
        ) {
          parserState.errors.push({
            type: 'undefined_label',
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
        type: 'flag_never_set',
        line: flag.first.line,
        flag: unwrapIdentifier(flag.first)
      })
    }

    if (
      !parserState.instructions.some(
        (instruction) =>
          (instruction.type === 'jump' || instruction.type === 'menu_option') &&
          instruction.condition !== null &&
          (instruction.condition.type === 'flag_clear' ||
          instruction.condition.type === 'flag_set'
            ? instruction.condition.flag.normalized === normalizedFlag
            : instruction.condition.flags.some(
              (flag) => flag.normalized === normalizedFlag
            ))
      )
    ) {
      const flag = parserState.identifiers.flag[normalizedFlag] as LocalIdentifierInstance

      parserState.warnings.push({
        type: 'flag_never_referenced',
        line: flag.first.line,
        flag: unwrapIdentifier(flag.first)
      })
    }
  }

  if (parserState.errors.length > 0) {
    return { type: 'invalid', errors: parserState.errors, warnings: parserState.warnings, identifier_instances: parserState.identifier_instances }
  }

  if (parserState.instructions.length > 0) {
    const lastInstruction = parserState.instructions[
      parserState.instructions.length - 1
    ] as Instruction

    if (
      lastInstruction.type === 'label' &&
      !parserState.warnings.some(
        (flagNeverReferencedWarning) =>
          flagNeverReferencedWarning.type === 'unreferenced_label' &&
          flagNeverReferencedWarning.label.normalized ===
            lastInstruction.label.normalized
      )
    ) {
      parserState.warnings.push({
        type: 'empty_label',
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
      case 'entry_animation':
      case 'exit_animation':
      case 'line':
      case 'location':
      case 'set':
      case 'speaker':
      case 'label':
        return instruction

      case 'jump':
        return {
          ...instruction,
          instruction_index: labelInstructionIndices[
            instruction.label.normalized
          ] as number
        }

      default:
        return {
          ...instruction,
          instruction_index: labelInstructionIndices[
            instruction.label.normalized
          ] as number
        }
    }
  })

  return {
    type: 'valid',
    instructions: mappedInstructions,
    warnings: parserState.warnings,
    identifier_instances: parserState.identifier_instances
  }
}

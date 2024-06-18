import type { ClearInstruction } from '../ClearInstruction'
import type { EmoteInstruction } from '../EmoteInstruction'
import type { EntryAnimationInstruction } from '../EntryAnimationInstruction'
import type { ExitAnimationInstruction } from '../ExitAnimationInstruction'
import type { JumpInstruction } from '../JumpInstruction'
import type { LabelInstruction } from '../LabelInstruction'
import type { LineInstruction } from '../LineInstruction'
import type { LocationInstruction } from '../LocationInstruction'
import type { MenuOptionInstruction } from '../MenuOptionInstruction'
import type { SetInstruction } from '../SetInstruction'
import type { SpeakerInstruction } from '../SpeakerInstruction'

/**
 * A instruction parsed from a document.
 */
export type Instruction =
  | ClearInstruction
  | EmoteInstruction
  | EntryAnimationInstruction
  | ExitAnimationInstruction
  | JumpInstruction
  | LineInstruction
  | LocationInstruction
  | MenuOptionInstruction
  | SetInstruction
  | SpeakerInstruction
  | LabelInstruction

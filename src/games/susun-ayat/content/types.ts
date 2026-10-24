/**
 * Level definition contract for Phase 2+. No Quran text is bundled yet.
 *
 * Content rules (see AGENTS.md): Quran text comes only from a verified,
 * licensed source with preserved version metadata, and every level is
 * reviewed by a qualified person. Never generate or invent ayat.
 */
export type PuzzleType = 'orderAyat' | 'orderWords';
export type Difficulty = 'beginner' | 'medium' | 'hard' | 'expert';

export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'medium', 'hard', 'expert'];

export interface SourceReference {
  surah: number;
  ayah: number;
  /** Word index within the ayah, for `orderWords` puzzles. */
  word?: number;
}

export interface LevelDefinition {
  /** Stable forever once shipped; progress rows key on it. */
  id: string;
  contentVersion: string;
  surah: number;
  ayahRange: { from: number; to: number };
  puzzleType: PuzzleType;
  difficulty: Difficulty;
  /** The correct order, as references into the source text. */
  orderedSources: SourceReference[];
  allowedHints: number;
  access: 'free' | 'susun_ayat_full';
}

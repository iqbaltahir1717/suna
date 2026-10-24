/**
 * Level definition contract.
 *
 * Content rules (see AGENTS.md): Quran text comes only from a verified,
 * licensed source with preserved version metadata, and every level is
 * reviewed by a qualified person. Never generate or invent ayat.
 */
export type PuzzleType = 'orderAyat' | 'orderWords';
export type Difficulty = 'beginner' | 'medium' | 'hard' | 'expert';

export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'medium', 'hard', 'expert'];
export const PUZZLE_TYPES: readonly PuzzleType[] = ['orderAyat', 'orderWords'];

export interface SourceReference {
  surah: number;
  ayah: number;
  /** 1-based word index within the ayah, for `orderWords` puzzles. */
  word?: number;
}

/**
 * What a difficulty means. Difficulty is independent of which surah is
 * chosen; these rules are the single place to tune it.
 */
export interface DifficultyRule {
  /** Inclusive bounds on the number of pieces (ayat or words) in a level. */
  pieces: { min: number; max: number };
  /** Hints allowed per piece; a level always gets at least one hint. */
  hintsPerPiece: number;
  /** Word puzzles spanning several ayat show where each ayah starts. */
  showAyahBreaks: boolean;
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

import { Stack, useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppText, Button, EmptyState, Screen } from '@/components';
import { useGameFeedback } from '@/features/feedback/useGameFeedback';
import { MascotView, type MascotHandle } from '@/features/mascot/MascotView';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';
import { useSettings } from '@/features/settings/SettingsProvider';
import { borders, colors, motion, spacing } from '@/theme';

import { AnswerSlot } from '../components/AnswerSlot';
import { Celebration } from '../components/Celebration';
import { DragGhost, useDragController, useGhost } from '../components/drag';
import { resolveDropSlot, type SlotRect } from '../components/dropTargets';
import { PieceCard, type CardFrame, type PieceTone } from '../components/PieceCard';
import { ResultsView } from '../components/ResultsView';
import { WordSlot } from '../components/WordSlot';
import {
  buildLevelCards,
  canPlayLevel,
  getLevel,
  levelPassage,
  nextLevelId,
  showsAyahBreaks,
  type LevelCard,
} from '../content';
import {
  applyHint,
  checkAnswer,
  createPuzzle,
  hintsRemaining,
  isComplete,
  placePiece,
  returnPiece,
  type PuzzleState,
} from '../engine';
import { levelTitle } from './levelText';
import { usePlaySession } from './usePlaySession';

type MeasurableView = ComponentRef<typeof View>;
type Rect = { x: number; y: number; width: number; height: number };

function measure(view: MeasurableView | null): Promise<Rect | null> {
  return new Promise((resolve) => {
    if (!view) return resolve(null);
    view.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

export function SusunAyatPlayScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  const { t } = useTranslation();
  const router = useRouter();
  const { has } = useEntitlements();

  if (!level) {
    return (
      <Screen edges={['bottom', 'left', 'right']}>
        <EmptyState icon="alert-circle-outline" title={t('susunAyatPlay.unknownLevel')} body="" />
      </Screen>
    );
  }
  if (!canPlayLevel(level, has)) {
    return (
      <Screen edges={['bottom', 'left', 'right']}>
        <Stack.Screen options={{ title: levelTitle(t, level) }} />
        <EmptyState
          icon="lock-closed-outline"
          title={t('susunAyatPlay.lockedTitle')}
          body={t('susunAyatPlay.lockedBody')}
        >
          <Button label={t('premium.title')} onPress={() => router.push('/premium')} />
        </EmptyState>
      </Screen>
    );
  }
  return <PlayLevel key={level.id} levelId={level.id} />;
}

function PlayLevel({ levelId }: { levelId: string }) {
  const level = getLevel(levelId)!;
  const { t } = useTranslation();
  const router = useRouter();
  const { reduceMotion } = useSettings();
  // Pause the mascot loop while another screen (e.g. premium info) covers this one.
  const focused = useIsFocused();
  const { has } = useEntitlements();
  const { height: windowHeight } = useWindowDimensions();
  const session = usePlaySession(level);
  const feedback = useGameFeedback();
  const isWords = level.puzzleType === 'orderWords';
  const variant = isWords ? 'word' : 'ayah';

  const cards = useMemo(() => buildLevelCards(level), [level]);
  const cardsById = useMemo(
    () => Object.fromEntries(cards.map((card) => [card.id, card])) as Record<string, LevelCard>,
    [cards],
  );
  const [puzzle, setPuzzle] = useState<PuzzleState>(() => createPuzzle(cards));
  const [message, setMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mascot = useRef<MascotHandle>(null);
  const rootRef = useRef<MeasurableView>(null);
  const areaRef = useRef<MeasurableView>(null);
  const slotRefs = useRef<(MeasurableView | null)[]>([]);
  const drag = useDragController();
  const ghost = useGhost(drag, reduceMotion);

  useEffect(
    () => () => {
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    },
    [],
  );

  const title = levelTitle(t, level);
  const passage = useMemo(() => levelPassage(level), [level]);
  // Word puzzles: slot indexes grouped per ayah when the difficulty shows
  // ayah breaks, otherwise one continuous group.
  const slotGroups = useMemo(() => {
    if (!showsAyahBreaks(level)) return [{ ayah: null, slots: cards.map((_, i) => i) }];
    const groups: { ayah: number | null; slots: number[] }[] = [];
    cards.forEach((card, i) => {
      const last = groups.at(-1);
      if (last?.ayah === card.ref.ayah) last.slots.push(i);
      else groups.push({ ayah: card.ref.ayah, slots: [i] });
    });
    return groups;
  }, [cards, level]);

  /**
   * Applies a move. A move that fills the board is checked right away, so
   * dragging the last card in gives instant feedback without a button.
   */
  const apply = (next: PuzzleState, placed: boolean) => {
    if (next === puzzle) return;
    if (placed) feedback('place');
    session.touch({ hintsUsed: next.hintsUsed, mistakes: next.mistakes });
    if (!isComplete(next)) {
      setPuzzle(next);
      setMessage(null);
      return;
    }
    const { state, correct } = checkAnswer(next);
    setPuzzle(state);
    session.touch({ hintsUsed: state.hintsUsed, mistakes: state.mistakes });
    if (correct) {
      setMessage(null);
      setCelebrating(true);
      feedback('success');
      mascot.current?.react('happy');
      void session.complete({ hintsUsed: state.hintsUsed, mistakes: state.mistakes });
      celebrateTimer.current = setTimeout(
        () => setCelebrating(false),
        reduceMotion ? motion.celebrateMs / 3 : motion.celebrateMs,
      );
    } else {
      setMessage(t('susunAyatPlay.tryAgain'));
      setShakeKey((key) => key + 1);
      feedback('retry');
      mascot.current?.react('encourage');
    }
  };

  const handleDragStart = async (pieceId: string, frame: CardFrame) => {
    feedback('pick');
    const [root, area, ...slots] = await Promise.all([
      measure(rootRef.current),
      measure(areaRef.current),
      ...puzzle.slots.map((_, i) => measure(slotRefs.current[i] ?? null)),
    ]);
    drag.area.set(area);
    drag.slots.set(
      slots.map(
        (rect, i): SlotRect =>
          rect
            ? { ...rect, empty: puzzle.slots[i] === null, locked: !!puzzle.lockedSlots[i] }
            : { x: 0, y: 0, width: 0, height: 0, empty: false, locked: true },
      ),
    );
    ghost.show({
      pieceId,
      text: cardsById[pieceId]!.text,
      variant,
      left: frame.x - (root?.x ?? 0),
      top: frame.y - (root?.y ?? 0),
      width: frame.width,
    });
  };

  const handleDragEnd = (pieceId: string, canceled: boolean) => {
    const x = drag.px.get();
    const y = drag.py.get();
    const target =
      canceled || Number.isNaN(x) ? -1 : resolveDropSlot(drag.slots.get(), drag.area.get(), x, y);
    const from = puzzle.slots.indexOf(pieceId);
    if (target >= 0) {
      ghost.release(true);
      apply(placePiece(puzzle, pieceId, target), true);
    } else if (from >= 0 && !canceled) {
      // A placed card dragged off the answer area goes back to the bank.
      ghost.release(true);
      apply(returnPiece(puzzle, from), false);
    } else {
      ghost.release(false);
    }
  };

  const restart = () => {
    session.start();
    setPuzzle(createPuzzle(cards));
    setMessage(null);
  };

  if (puzzle.status === 'solved' && !celebrating) {
    const next = nextLevelId(level.id, (candidate) => canPlayLevel(candidate, has));
    return (
      <>
        <Stack.Screen options={{ title }} />
        <ResultsView
          passage={passage}
          hintsUsed={puzzle.hintsUsed}
          paused={!focused}
          reduceMotion={reduceMotion}
          onNext={next ? () => router.replace(`/games/susun-ayat/${next}`) : undefined}
          onReplay={restart}
          onBack={() => router.back()}
        />
      </>
    );
  }

  const hintsLeft = hintsRemaining(puzzle, level.allowedHints);
  const interactive = puzzle.status === 'playing';

  const renderCard = (pieceId: string, slotIndex: number | null) => {
    const card = cardsById[pieceId]!;
    const placed = slotIndex !== null;
    const locked = placed && (puzzle.lockedSlots[slotIndex] ?? false);
    const flagged = placed && puzzle.flaggedSlots.includes(slotIndex);
    const tone: PieceTone = celebrating
      ? 'success'
      : locked
        ? 'locked'
        : flagged
          ? 'flagged'
          : 'default';
    return (
      <PieceCard
        key={pieceId}
        text={card.text}
        variant={variant}
        tone={tone}
        disabled={locked || !interactive}
        hidden={ghost.ghost?.pieceId === pieceId}
        reduceMotion={reduceMotion}
        shakeKey={flagged ? shakeKey : 0}
        celebrateDelay={celebrating && placed ? slotIndex * motion.celebrateStaggerMs : null}
        accessibilityLabel={
          placed
            ? [
                t('susunAyatPlay.slotLabel', { number: slotIndex + 1 }),
                locked ? t('susunAyatPlay.hintLocked') : null,
                flagged ? t('susunAyatPlay.wrongMark') : null,
                card.text,
              ]
                .filter(Boolean)
                .join(', ')
            : card.text
        }
        accessibilityHint={t(
          placed ? 'susunAyatPlay.cardHintPlaced' : 'susunAyatPlay.cardHintPool',
        )}
        onPress={() =>
          apply(placed ? returnPiece(puzzle, slotIndex) : placePiece(puzzle, pieceId), !placed)
        }
        drag={drag}
        onDragStart={(frame) => void handleDragStart(pieceId, frame)}
        onDragEnd={(canceled) => handleDragEnd(pieceId, canceled)}
      />
    );
  };

  const slotRef = (index: number) => (view: MeasurableView | null) => {
    slotRefs.current[index] = view;
  };
  const placedAt = (index: number) => {
    const pieceId = puzzle.slots[index];
    return pieceId ? renderCard(pieceId, index) : undefined;
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <Stack.Screen options={{ title }} />
      <View ref={rootRef} style={styles.root}>
        <ScrollView style={styles.board} contentContainerStyle={styles.boardContent}>
          <View style={styles.intro}>
            <MascotView ref={mascot} size={56} paused={!focused} reduceMotion={reduceMotion} />
            <AppText color="textMuted" style={styles.introText}>
              {t(isWords ? 'susunAyatPlay.instructionsWords' : 'susunAyatPlay.instructions')}
            </AppText>
          </View>

          <View ref={areaRef} style={styles.slots}>
            {isWords
              ? slotGroups.map((group) => (
                  <View key={group.ayah ?? 'all'} style={styles.group}>
                    {group.ayah !== null ? (
                      <AppText variant="label" color="textMuted">
                        {t('susunAyatPlay.results.ayahNumber', { number: group.ayah })}
                      </AppText>
                    ) : null}
                    <View style={styles.wordRow}>
                      {group.slots.map((index) => (
                        <WordSlot
                          key={index}
                          number={index + 1}
                          label={t('susunAyatPlay.slotLabel', { number: index + 1 })}
                          hover={drag.hover}
                          reduceMotion={reduceMotion}
                          ref={slotRef(index)}
                        >
                          {placedAt(index)}
                        </WordSlot>
                      ))}
                    </View>
                  </View>
                ))
              : puzzle.slots.map((_, index) => (
                  <AnswerSlot
                    key={index}
                    number={index + 1}
                    label={t('susunAyatPlay.slotLabel', { number: index + 1 })}
                    emptyLabel={
                      index === puzzle.slots.indexOf(null)
                        ? t('susunAyatPlay.emptySlot')
                        : undefined
                    }
                    hover={drag.hover}
                    reduceMotion={reduceMotion}
                    ref={slotRef(index)}
                  >
                    {placedAt(index)}
                  </AnswerSlot>
                ))}
          </View>

          {message ? (
            <AppText
              variant="caption"
              color={puzzle.flaggedSlots.length ? 'danger' : 'textMuted'}
              accessibilityLiveRegion="polite"
            >
              {message}
            </AppText>
          ) : null}
          {celebrating ? (
            <AppText variant="heading" color="primary" accessibilityLiveRegion="polite">
              {t('susunAyatPlay.results.title')}
            </AppText>
          ) : null}
        </ScrollView>

        <View style={styles.bank}>
          <View style={styles.bankHeader}>
            <AppText variant="heading" style={styles.bankTitle}>
              {t(isWords ? 'susunAyatPlay.poolTitleWords' : 'susunAyatPlay.poolTitle')}
            </AppText>
            <Button
              label={
                hintsLeft > 0
                  ? t('susunAyatPlay.hint', { count: hintsLeft })
                  : t('susunAyatPlay.noHints')
              }
              variant="secondary"
              disabled={hintsLeft === 0 || !interactive}
              onPress={() => apply(applyHint(puzzle, level.allowedHints), true)}
            />
          </View>
          <ScrollView
            style={{ maxHeight: windowHeight * 0.38 }}
            contentContainerStyle={styles.bankContent}
          >
            {puzzle.pool.length === 0 ? (
              <AppText variant="caption" color="textMuted">
                {t('susunAyatPlay.poolEmpty')}
              </AppText>
            ) : (
              <View style={isWords ? styles.wordRow : styles.slots}>
                {puzzle.pool.map((pieceId) => renderCard(pieceId, null))}
              </View>
            )}
          </ScrollView>
        </View>

        <DragGhost ghost={ghost.ghost} drag={drag} reduceMotion={reduceMotion} />
        {celebrating ? <Celebration reduceMotion={reduceMotion} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  root: { flex: 1 },
  board: { flex: 1 },
  boardContent: { padding: spacing.lg, gap: spacing.lg },
  intro: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  introText: { flex: 1 },
  slots: { gap: spacing.sm },
  group: { gap: spacing.xs },
  // Arabic reads right to left, so word slots and chips flow that way too.
  wordRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  bank: {
    backgroundColor: colors.surface,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bankTitle: { flex: 1 },
  bankContent: { padding: spacing.lg, paddingTop: spacing.md },
});

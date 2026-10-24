import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppText, Button, EmptyState, Screen } from '@/components';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';
import { useSettings } from '@/features/settings/SettingsProvider';
import { colors, spacing } from '@/theme';

import { AnswerSlot } from '../components/AnswerSlot';
import { PieceCard, type DropPoint, type PieceCardTone } from '../components/PieceCard';
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

type SlotView = ComponentRef<typeof View>;
type Rect = { x: number; y: number; width: number; height: number };

function measure(view: SlotView | null): Promise<Rect | null> {
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
  const { has } = useEntitlements();
  const session = usePlaySession(level);
  const isWords = level.puzzleType === 'orderWords';

  const cards = useMemo(() => buildLevelCards(level), [level]);
  const cardsById = useMemo(
    () => Object.fromEntries(cards.map((card) => [card.id, card])) as Record<string, LevelCard>,
    [cards],
  );
  const [puzzle, setPuzzle] = useState<PuzzleState>(() => createPuzzle(cards));
  const [message, setMessage] = useState<string | null>(null);
  const [draggingFromSlot, setDraggingFromSlot] = useState(false);
  const slotRefs = useRef<(SlotView | null)[]>([]);

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

  const update = useCallback(
    (next: PuzzleState) => {
      if (next === puzzle) return;
      setPuzzle(next);
      setMessage(null);
      session.touch({ hintsUsed: next.hintsUsed, mistakes: next.mistakes });
    },
    [puzzle, session],
  );

  const handleCheck = () => {
    if (!isComplete(puzzle)) {
      setMessage(t('susunAyatPlay.fillAll'));
      return;
    }
    const { state, correct } = checkAnswer(puzzle);
    setPuzzle(state);
    session.touch({ hintsUsed: state.hintsUsed, mistakes: state.mistakes });
    if (correct) {
      void session.complete({ hintsUsed: state.hintsUsed, mistakes: state.mistakes });
    } else {
      setMessage(t('susunAyatPlay.tryAgain'));
    }
  };

  const handleDrop = async (pieceId: string, point: DropPoint) => {
    setDraggingFromSlot(false);
    const rects = await Promise.all(slotRefs.current.map(measure));
    const target = rects.findIndex(
      (r) =>
        r &&
        point.x >= r.x &&
        point.x <= r.x + r.width &&
        point.y >= r.y &&
        point.y <= r.y + r.height,
    );
    if (target >= 0) {
      update(placePiece(puzzle, pieceId, target));
      return;
    }
    // A placed card dropped outside every slot goes back to the pool.
    const from = puzzle.slots.indexOf(pieceId);
    if (from >= 0) update(returnPiece(puzzle, from));
  };

  const restart = () => {
    session.start();
    setPuzzle(createPuzzle(cards));
    setMessage(null);
  };

  if (puzzle.status === 'solved') {
    const next = nextLevelId(level.id, (candidate) => canPlayLevel(candidate, has));
    return (
      <>
        <Stack.Screen options={{ title }} />
        <ResultsView
          passage={passage}
          hintsUsed={puzzle.hintsUsed}
          reduceMotion={reduceMotion}
          onNext={next ? () => router.replace(`/games/susun-ayat/${next}`) : undefined}
          onReplay={restart}
          onBack={() => router.back()}
        />
      </>
    );
  }

  const hintsLeft = hintsRemaining(puzzle, level.allowedHints);

  const renderPlaced = (index: number) => {
    const pieceId = puzzle.slots[index];
    const card = pieceId ? cardsById[pieceId] : undefined;
    if (!card) return undefined;
    const locked = puzzle.lockedSlots[index] ?? false;
    const flagged = puzzle.flaggedSlots.includes(index);
    const tone: PieceCardTone = locked ? 'locked' : flagged ? 'flagged' : 'default';
    return (
      <PieceCard
        text={card.text}
        variant={isWords ? 'word' : 'ayah'}
        tone={tone}
        disabled={locked}
        reduceMotion={reduceMotion}
        accessibilityLabel={[
          t('susunAyatPlay.slotLabel', { number: index + 1 }),
          locked ? t('susunAyatPlay.hintLocked') : null,
          flagged ? t('susunAyatPlay.wrongMark') : null,
          card.text,
        ]
          .filter(Boolean)
          .join(', ')}
        accessibilityHint={t('susunAyatPlay.cardHintPlaced')}
        onPress={() => update(returnPiece(puzzle, index))}
        onDragStart={() => setDraggingFromSlot(true)}
        onDrop={(point) => void handleDrop(card.id, point)}
      />
    );
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText color="textMuted">
          {t(isWords ? 'susunAyatPlay.instructionsWords' : 'susunAyatPlay.instructions')}
        </AppText>

        <View style={[styles.slots, draggingFromSlot && styles.raised]}>
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
                        ref={(view) => {
                          slotRefs.current[index] = view;
                        }}
                      >
                        {renderPlaced(index)}
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
                    index === puzzle.slots.indexOf(null) ? t('susunAyatPlay.emptySlot') : undefined
                  }
                  ref={(view) => {
                    slotRefs.current[index] = view;
                  }}
                >
                  {renderPlaced(index)}
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

        <View style={styles.actions}>
          <Button label={t('susunAyatPlay.check')} onPress={handleCheck} />
          <Button
            label={
              hintsLeft > 0
                ? t('susunAyatPlay.hint', { count: hintsLeft })
                : t('susunAyatPlay.noHints')
            }
            variant="secondary"
            disabled={hintsLeft === 0}
            onPress={() => update(applyHint(puzzle, level.allowedHints))}
          />
        </View>

        <View style={styles.pool}>
          <AppText variant="heading">
            {t(isWords ? 'susunAyatPlay.poolTitleWords' : 'susunAyatPlay.poolTitle')}
          </AppText>
          {puzzle.pool.length === 0 ? (
            <AppText variant="caption" color="textMuted">
              {t('susunAyatPlay.poolEmpty')}
            </AppText>
          ) : (
            <View style={isWords ? styles.wordRow : styles.slots}>
              {puzzle.pool.map((pieceId) => {
                const card = cardsById[pieceId]!;
                return (
                  <PieceCard
                    key={pieceId}
                    text={card.text}
                    variant={isWords ? 'word' : 'ayah'}
                    reduceMotion={reduceMotion}
                    accessibilityLabel={card.text}
                    accessibilityHint={t('susunAyatPlay.cardHintPool')}
                    onPress={() => update(placePiece(puzzle, pieceId))}
                    onDrop={(point) => void handleDrop(pieceId, point)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  slots: { gap: spacing.sm },
  group: { gap: spacing.xs },
  // Arabic reads right to left, so word slots and chips flow that way too.
  wordRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.sm },
  raised: { zIndex: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pool: { gap: spacing.sm },
});

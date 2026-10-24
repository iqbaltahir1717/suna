import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppText, Button, EmptyState, Screen } from '@/components';
import { useSettings } from '@/features/settings/SettingsProvider';
import { colors, spacing } from '@/theme';

import { AnswerSlot } from '../components/AnswerSlot';
import { AyahCard, type DropPoint } from '../components/AyahCard';
import { ResultsView } from '../components/ResultsView';
import { buildLevelCards, getLevel, nextLevelId, SURAH_NAMES, type LevelCard } from '../content';
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

  if (!level) {
    return (
      <Screen edges={['bottom', 'left', 'right']}>
        <EmptyState icon="alert-circle-outline" title={t('susunAyatPlay.unknownLevel')} body="" />
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
  const session = usePlaySession(level);

  const cards = useMemo(() => buildLevelCards(level), [level]);
  const cardsById = useMemo(
    () => Object.fromEntries(cards.map((card) => [card.id, card])) as Record<string, LevelCard>,
    [cards],
  );
  const [puzzle, setPuzzle] = useState<PuzzleState>(() => createPuzzle(cards));
  const [message, setMessage] = useState<string | null>(null);
  const [draggingFromSlot, setDraggingFromSlot] = useState(false);
  const slotRefs = useRef<(SlotView | null)[]>([]);

  const title = t('susunAyatEntry.levelTitle', {
    surah: SURAH_NAMES[level.surah],
    from: level.ayahRange.from,
    to: level.ayahRange.to,
  });

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
    const next = nextLevelId(level.id);
    return (
      <>
        <Stack.Screen options={{ title }} />
        <ResultsView
          cards={cards}
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

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText color="textMuted">{t('susunAyatPlay.instructions')}</AppText>

        <View style={[styles.slots, draggingFromSlot && styles.raised]}>
          {puzzle.slots.map((pieceId, index) => {
            const card = pieceId ? cardsById[pieceId] : undefined;
            const locked = puzzle.lockedSlots[index] ?? false;
            const flagged = puzzle.flaggedSlots.includes(index);
            return (
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
                {card ? (
                  <AyahCard
                    text={card.text}
                    tone={locked ? 'locked' : flagged ? 'flagged' : 'default'}
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
                ) : undefined}
              </AnswerSlot>
            );
          })}
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
          <AppText variant="heading">{t('susunAyatPlay.poolTitle')}</AppText>
          {puzzle.pool.length === 0 ? (
            <AppText variant="caption" color="textMuted">
              {t('susunAyatPlay.poolEmpty')}
            </AppText>
          ) : (
            puzzle.pool.map((pieceId) => {
              const card = cardsById[pieceId]!;
              return (
                <AyahCard
                  key={pieceId}
                  text={card.text}
                  reduceMotion={reduceMotion}
                  accessibilityLabel={card.text}
                  accessibilityHint={t('susunAyatPlay.cardHintPool')}
                  onPress={() => update(placePiece(puzzle, pieceId))}
                  onDrop={(point) => void handleDrop(pieceId, point)}
                />
              );
            })
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
  raised: { zIndex: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pool: { gap: spacing.sm },
});

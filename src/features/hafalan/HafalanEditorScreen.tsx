import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppText,
  Button,
  Card,
  Icon,
  RowDivider,
  Screen,
  Section,
  SegmentedControl,
  TextField,
} from '@/components';
import { useRepositories } from '@/data/DataProvider';
import { getSurah } from '@/data/quran';
import { useEntitlements } from '@/features/purchases/EntitlementsProvider';
import { minTapTarget, motion, spacing } from '@/theme';

import { AyahStepper } from './AyahStepper';
import { HafalanLockedCard } from './HafalanAccessCard';
import { SurahArabicName } from './HafalanEntryRow';
import { validateRange } from './ranges';
import { StatusBadge } from './StatusBadge';
import { SurahPicker } from './SurahPicker';
import {
  HAFALAN_STATUSES,
  type HafalanEntry,
  type HafalanEvent,
  type HafalanStatus,
} from './types';
import { useHafalanFormat } from './useHafalanFormat';

/** Add (no `entryId`) or edit one self-reported ayah range. */
export function HafalanEditorScreen({ entryId }: { entryId?: string }) {
  const { t } = useTranslation();
  const { has } = useEntitlements();
  const title = entryId ? t('hafalan.editor.editTitle') : t('hafalan.editor.newTitle');

  return (
    <>
      <Stack.Screen options={{ title }} />
      {has('hafalan_tracker') ? (
        <Editor entryId={entryId} />
      ) : (
        <Screen edges={['bottom']}>
          <HafalanLockedCard />
        </Screen>
      )}
    </>
  );
}

interface Draft {
  surah: number | null;
  fromAyah: number;
  toAyah: number;
  status: HafalanStatus;
  note: string;
}

const EMPTY_DRAFT: Draft = { surah: null, fromAyah: 1, toAyah: 1, status: 'learning', note: '' };

function Editor({ entryId }: { entryId?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { hafalan } = useRepositories();
  const { surahName, rangeText, formatDate } = useHafalanFormat();

  const [entries, setEntries] = useState<HafalanEntry[] | null>(null);
  const [history, setHistory] = useState<HafalanEvent[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [missing, setMissing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reviewLogged, setReviewLogged] = useState(false);

  const fetchData = useCallback(async () => {
    const all = await hafalan.list();
    const entry = entryId ? (all.find((e) => e.id === entryId) ?? null) : null;
    const events = entry ? await hafalan.history(entry.id) : [];
    return { all, entry, events };
  }, [hafalan, entryId]);

  const refresh = useCallback(async () => {
    const { all, events } = await fetchData();
    setEntries(all);
    setHistory(events);
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;
    fetchData()
      .then(({ all, entry, events }) => {
        if (cancelled) return;
        setEntries(all);
        setHistory(events);
        if (entryId && !entry) setMissing(true);
        if (entry) {
          setDraft({
            surah: entry.range.surah,
            fromAyah: entry.range.fromAyah,
            toAyah: entry.range.toAyah,
            status: entry.status,
            note: entry.note ?? '',
          });
        }
      })
      .catch((error: unknown) => console.warn('Failed to load hafalan entry', error));
    return () => {
      cancelled = true;
    };
  }, [fetchData, entryId]);

  const surah = draft.surah ? getSurah(draft.surah) : undefined;
  const validation = useMemo(() => {
    if (!entries) return null;
    if (draft.surah === null) return { ok: false as const, reason: 'surah' as const };
    return validateRange(
      { surah: draft.surah, fromAyah: draft.fromAyah, toAyah: draft.toAyah },
      entries,
      entryId,
    );
  }, [entries, draft, entryId]);

  const errorText = (() => {
    if (!validation || validation.ok || validation.reason === 'surah') return null;
    if (validation.reason === 'overlap') {
      const other = entries?.find((e) => e.id === validation.conflictId);
      return t('hafalan.editor.errors.overlap', { range: other ? rangeText(other.range) : '' });
    }
    return t(`hafalan.editor.errors.${validation.reason}`);
  })();

  if (missing) {
    return (
      <Screen edges={['bottom']}>
        <Card>
          <AppText>{t('hafalan.editor.notFound')}</AppText>
          <Button label={t('common.back')} variant="secondary" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  if (!entries) {
    return (
      <Screen edges={['bottom']}>
        <AppText color="textMuted">{t('common.loading')}</AppText>
      </Screen>
    );
  }

  const selectSurah = (number: number) => {
    const meta = getSurah(number);
    setPickerOpen(false);
    if (!meta) return;
    // A new surah starts as the whole surah; the user narrows it if needed.
    setDraft((d) => ({ ...d, surah: number, fromAyah: 1, toAyah: meta.ayahCount }));
  };

  const save = async () => {
    if (!validation?.ok || draft.surah === null) return;
    setSaving(true);
    setFailed(false);
    const input = {
      range: { surah: draft.surah, fromAyah: draft.fromAyah, toAyah: draft.toAyah },
      status: draft.status,
      note: draft.note,
    };
    try {
      if (entryId) await hafalan.update(entryId, input, Date.now());
      else await hafalan.create(input, Date.now());
      router.back();
    } catch (error) {
      console.warn('Failed to save hafalan entry', error);
      setFailed(true);
      setSaving(false);
    }
  };

  const logReview = async () => {
    if (!entryId) return;
    await hafalan.logReview(entryId, Date.now());
    setReviewLogged(true);
    await refresh();
  };

  const remove = async () => {
    if (!entryId) return;
    await hafalan.remove(entryId);
    router.back();
  };

  return (
    <Screen edges={['bottom']}>
      <Section title={t('hafalan.editor.surah')}>
        <Card
          onPress={() => setPickerOpen(true)}
          accessibilityLabel={t('hafalan.editor.chooseSurah')}
        >
          <View style={styles.surahRow}>
            <View style={styles.flex}>
              <AppText variant="heading">
                {surah ? surahName(surah.surah) : t('hafalan.editor.chooseSurah')}
              </AppText>
              {surah ? (
                <AppText variant="caption" color="textMuted">
                  {t('hafalan.editor.ayahTotal', { count: surah.ayahCount })}
                </AppText>
              ) : null}
            </View>
            {surah ? <SurahArabicName surah={surah.surah} /> : null}
            <Icon name="chevron-forward" size={18} color="textMuted" />
          </View>
        </Card>
      </Section>

      {surah ? (
        <Section
          title={rangeText({ surah: surah.surah, fromAyah: draft.fromAyah, toAyah: draft.toAyah })}
        >
          <View style={styles.steppers}>
            <AyahStepper
              label={t('hafalan.editor.fromAyah')}
              value={draft.fromAyah}
              min={1}
              max={surah.ayahCount}
              onChange={(fromAyah) =>
                setDraft((d) => ({ ...d, fromAyah, toAyah: Math.max(d.toAyah, fromAyah) }))
              }
            />
            <AyahStepper
              label={t('hafalan.editor.toAyah')}
              value={draft.toAyah}
              min={1}
              max={surah.ayahCount}
              onChange={(toAyah) =>
                setDraft((d) => ({ ...d, toAyah, fromAyah: Math.min(d.fromAyah, toAyah) }))
              }
            />
          </View>
          {draft.fromAyah !== 1 || draft.toAyah !== surah.ayahCount ? (
            <Button
              label={t('hafalan.editor.wholeSurah')}
              variant="secondary"
              onPress={() => setDraft((d) => ({ ...d, fromAyah: 1, toAyah: surah.ayahCount }))}
            />
          ) : null}
          {errorText ? (
            <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
              {errorText}
            </AppText>
          ) : null}
        </Section>
      ) : null}

      <Section title={t('hafalan.editor.status')}>
        <SegmentedControl
          options={HAFALAN_STATUSES.map((value) => ({
            value,
            label: t(`hafalan.status.${value}`),
          }))}
          value={draft.status}
          onChange={(status) => setDraft((d) => ({ ...d, status }))}
          accessibilityLabel={t('hafalan.editor.status')}
        />
        <AppText variant="caption" color="textMuted">
          {t('hafalan.selfReported')}
        </AppText>
      </Section>

      <TextField
        label={t('hafalan.editor.note')}
        value={draft.note}
        onChangeText={(note) => setDraft((d) => ({ ...d, note }))}
        placeholder={t('hafalan.editor.notePlaceholder')}
        multiline
        maxLength={500}
      />

      <View style={styles.actions}>
        <Button
          label={saving ? t('hafalan.editor.saving') : t('hafalan.editor.save')}
          onPress={save}
          disabled={!validation?.ok || saving}
        />
        {failed ? (
          <AppText variant="caption" color="danger">
            {t('hafalan.editor.saveFailed')}
          </AppText>
        ) : null}
      </View>

      {entryId ? (
        <>
          <View style={styles.actions}>
            <Button label={t('hafalan.editor.logReview')} variant="secondary" onPress={logReview} />
            {reviewLogged ? (
              <AppText variant="caption" color="success" accessibilityLiveRegion="polite">
                {t('hafalan.editor.reviewLogged')}
              </AppText>
            ) : null}
          </View>

          <Section title={t('hafalan.editor.historyTitle')}>
            <Card>
              {history.map((event, index) => (
                <View key={event.id}>
                  {index > 0 ? <RowDivider /> : null}
                  <View style={styles.event}>
                    <View style={styles.flex}>
                      <AppText>
                        {t(`hafalan.event.${event.kind}`, {
                          status: t(`hafalan.status.${event.status}`),
                        })}
                      </AppText>
                      <AppText variant="caption" color="textMuted">
                        {formatDate(event.at)}
                      </AppText>
                    </View>
                    <StatusBadge status={event.status} />
                  </View>
                </View>
              ))}
            </Card>
          </Section>

          {confirmDelete ? (
            <Card>
              <AppText>{t('hafalan.editor.deleteConfirm')}</AppText>
              <View style={styles.confirm}>
                <Button label={t('hafalan.editor.deleteYes')} onPress={remove} />
                <Button
                  label={t('hafalan.editor.cancel')}
                  variant="secondary"
                  onPress={() => setConfirmDelete(false)}
                />
              </View>
            </Card>
          ) : (
            <Pressable
              onPress={() => setConfirmDelete(true)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
            >
              <Icon name="trash-outline" color="danger" />
              <AppText color="danger">{t('hafalan.editor.delete')}</AppText>
            </Pressable>
          )}
        </>
      ) : null}

      <SurahPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={selectSurah}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xxs },
  surahRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  steppers: { flexDirection: 'row', gap: spacing.md },
  actions: { gap: spacing.sm },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  confirm: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  delete: {
    minHeight: minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  pressed: { opacity: motion.pressFeedbackOpacity },
});

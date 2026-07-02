'use client';

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { FaArrowLeft } from "react-icons/fa6";
import { updateEnduranceSettingsAction } from "~/actions/updateEnduranceSettings";
import { IconTextButton } from "~/components/IconTextButton";
import { GlobalContext } from "~/contexts/GlobalContext";
import type { EnduranceSettings } from "~/types";

import styles from './AdminSettingsScreen.module.css';

interface AdminSettingsScreenProps {
  enduranceSettings: EnduranceSettings;
}

interface SettingSwitchProps {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  name: string;
  onChange: (checked: boolean) => void;
}

type NumberSettingName = Exclude<keyof EnduranceSettings, 'enabled' | 'infinityEnabled'>;

interface NumberSetting {
  name: NumberSettingName;
  label: string;
  description: string;
  min: number;
  unit: string;
}

interface SettingsSection {
  title: string;
  description: string;
  settings: NumberSetting[];
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Таймер',
    description: 'Стартовый запас времени и бонусы за следующие раунды.',
    settings: [
      {
        name: 'initialTime',
        label: 'Стартовое время',
        description: 'Сколько времени получает игрок при запуске испытания.',
        min: 1,
        unit: 'мс',
      },
      {
        name: 'minTimeBonus',
        label: 'Минимальный бонус времени',
        description: 'Нижняя граница бонуса за завершённый раунд.',
        min: 1,
        unit: 'мс',
      },
      {
        name: 'timeBonusStep',
        label: 'Шаг уменьшения бонуса',
        description: 'На сколько уменьшается бонус времени с каждым следующим раундом.',
        min: 0,
        unit: 'мс',
      },
    ],
  },
  {
    title: 'Очки и milestone',
    description: 'Базовые очки за сложность и бонус за каждый milestone-раунд.',
    settings: [
      {
        name: 'milestoneRounds',
        label: 'Частота milestone-бонуса',
        description: 'Каждый N-й раунд даёт дополнительный бонус очков.',
        min: 1,
        unit: 'раунд.',
      },
      {
        name: 'milestoneBaseBonus',
        label: 'База milestone-бонуса',
        description: 'Фиксированная часть бонуса перед добавкой за номер раунда.',
        min: 0,
        unit: 'очк.',
      },
      {
        name: 'easyBasePoints',
        label: 'Очки: лёгкая',
        description: 'Базовые очки за раунд лёгкой сложности.',
        min: 0,
        unit: 'очк.',
      },
      {
        name: 'mediumBasePoints',
        label: 'Очки: нормальная',
        description: 'Базовые очки за раунд нормальной сложности.',
        min: 0,
        unit: 'очк.',
      },
      {
        name: 'hardBasePoints',
        label: 'Очки: сложная',
        description: 'Базовые очки за раунд сложной сложности.',
        min: 0,
        unit: 'очк.',
      },
    ],
  },
  {
    title: 'Speed-множитель',
    description: 'Целевое время раунда для расчёта speed-множителя по сложностям.',
    settings: [
      {
        name: 'easyTargetTime',
        label: 'Целевое время: лёгкая',
        description: 'Время раунда для максимального speed-множителя.',
        min: 1,
        unit: 'мс',
      },
      {
        name: 'mediumTargetTime',
        label: 'Целевое время: нормальная',
        description: 'Время раунда для максимального speed-множителя.',
        min: 1,
        unit: 'мс',
      },
      {
        name: 'hardTargetTime',
        label: 'Целевое время: сложная',
        description: 'Время раунда для максимального speed-множителя.',
        min: 1,
        unit: 'мс',
      },
    ],
  },
];

function SettingSwitch({
  checked,
  description,
  disabled,
  label,
  name,
  onChange,
}: SettingSwitchProps) {
  return (
    <label className={styles.switchRow}>
      <span className={styles.switchCopy}>
        <span className={styles.switchTitle}>{label}</span>
        <span className={styles.switchDescription}>{description}</span>
      </span>
      <span className={styles.switchControl}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={styles.switchTrack}>
          <span className={styles.switchThumb} />
        </span>
      </span>
    </label>
  );
}

function AdminLoadingDismiss() {
  const ctx = use(GlobalContext);

  useEffect(() => {
    if (!ctx.loadingScreen.isEnabled) return;

    ctx.loadingScreen.toggle(false, { progress: 100 });
  }, [ctx]);

  return null;
}

function coerceNumberInput(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

export default function AdminSettingsScreen({ enduranceSettings }: AdminSettingsScreenProps) {
  const router = useRouter();
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const form = useForm({
    defaultValues: enduranceSettings,
    onSubmit: async ({ value }) => {
      const savedSettings = await updateEnduranceSettingsAction(value);

      form.reset(savedSettings);
      setLastSavedAt(Date.now());
    },
  });
  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <main className={styles.base}>
      <AdminLoadingDismiss />
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Admin</div>
          <div className={styles.headerLine}>
            <IconTextButton
              className={styles.backButton}
              icon={<FaArrowLeft />}
              onClick={handleBack}
            />
            <h1>Настройки</h1>
          </div>
        </div>
        <div className={styles.status}>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
          >
            {(isSubmitting) => (
              isSubmitting
                ? 'Сохраняем...'
                : lastSavedAt
                  ? 'Сохранено'
                  : 'Готово к настройке'
            )}
          </form.Subscribe>
        </div>
      </header>

      <form
        className={styles.panel}
        aria-labelledby="endurance-settings-title"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className={styles.panelHeader}>
          <div>
            <h2 id="endurance-settings-title">Игровые режимы</h2>
            <span>Управление доступностью режимов и балансом испытания.</span>
          </div>
        </div>

        <section className={styles.settingsBlock} aria-labelledby="endurance-availability-title">
          <div className={styles.blockHeader}>
            <div>
              <h3 id="endurance-availability-title">Доступность режимов</h3>
              <span>Независимые переключатели игровых режимов.</span>
            </div>
          </div>
          <div className={styles.settingsList}>
            <form.Field name="enabled">
              {(field) => (
                <SettingSwitch
                  name={field.name}
                  label="Включить испытание"
                  description="Показывает режим испытания на экране выбора сложности и разрешает запуск новых игр."
                  checked={field.state.value}
                  disabled={form.state.isSubmitting}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
            <form.Field name="infinityEnabled">
              {(field) => (
                <SettingSwitch
                  name={field.name}
                  label="Включить режим бесконечности"
                  description="Показывает отдельный режим бесконечности независимо от испытания."
                  checked={field.state.value}
                  disabled={form.state.isSubmitting}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>
        </section>

        <form.Subscribe
          selector={(state) => ({
            enduranceEnabled: state.values.enabled,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ enduranceEnabled, isSubmitting }) => {
            const settingsDisabled = !enduranceEnabled || isSubmitting;

            return (
              <fieldset
                className={styles.settingsBlock}
                disabled={settingsDisabled}
                data-disabled={settingsDisabled}
                aria-labelledby="endurance-mode-settings-title"
              >
                <div className={styles.blockHeader}>
                  <div>
                    <h3 id="endurance-mode-settings-title">Настройки режима испытания</h3>
                    <span>
                      {enduranceEnabled
                        ? 'Параметры активны и будут применяться к новым забегам.'
                        : 'Режим выключен, поэтому настройки временно недоступны.'}
                    </span>
                  </div>
                </div>

                {settingsSections.map((section) => (
                  <div className={styles.settingsSection} key={section.title}>
                    <div className={styles.sectionTitle}>
                      <span>{section.title}</span>
                      <small>{section.description}</small>
                    </div>
                    <div className={styles.fieldsGrid}>
                      {section.settings.map((setting) => (
                        <form.Field
                          key={setting.name}
                          name={setting.name}
                          validators={{
                            onChange: ({ value }) => value < setting.min
                              ? `Минимум: ${setting.min}`
                              : undefined,
                          }}
                        >
                          {(field) => (
                            <label className={styles.fieldRow}>
                              <span className={styles.switchCopy}>
                                <span className={styles.switchTitle}>{setting.label}</span>
                                <span className={styles.switchDescription}>{setting.description}</span>
                              </span>
                              <span className={styles.inputWrap}>
                                <input
                                  className={styles.input}
                                  type="number"
                                  min={setting.min}
                                  step="1"
                                  name={field.name}
                                  value={field.state.value}
                                  disabled={settingsDisabled}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => {
                                    field.handleChange(coerceNumberInput(
                                      event.target.valueAsNumber,
                                      setting.min
                                    ));
                                  }}
                                />
                                <span className={styles.unit}>{setting.unit}</span>
                                {field.state.meta.errors.length > 0 && (
                                  <span className={styles.error}>
                                    {field.state.meta.errors.join(', ')}
                                  </span>
                                )}
                              </span>
                            </label>
                          )}
                        </form.Field>
                      ))}
                    </div>
                  </div>
                ))}
              </fieldset>
            );
          }}
        </form.Subscribe>

        <div className={styles.formActions}>
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isDirty: state.isDirty,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isDirty, isSubmitting }) => (
              <button
                className={styles.saveButton}
                type="submit"
                disabled={!canSubmit || !isDirty || isSubmitting}
              >
                {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </main>
  );
}

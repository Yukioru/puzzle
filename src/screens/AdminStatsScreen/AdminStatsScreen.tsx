'use client';

import { use, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PROFILES } from "~/constants";
import { GlobalContext } from '~/contexts/GlobalContext';
import { AdminStats, GameStatus } from "~/types";

import styles from './AdminStatsScreen.module.css';
import { IconTextButton } from '~/components/IconTextButton';
import { FaArrowLeft } from 'react-icons/fa6';

interface AdminStatsScreenProps {
  stats: AdminStats;
}

const statusLabels: Record<GameStatus, string> = {
  active: 'Активные',
  completed: 'Завершенные',
  abandoned: 'Заброшенные',
};

const statusColors: Record<GameStatus, string> = {
  active: '#7cc8ff',
  completed: '#9be58f',
  abandoned: '#f6a17d',
};

const difficultyLabels = {
  easy: 'Легкая',
  medium: 'Нормальная',
  hard: 'Сложная',
};

const modeLabels = {
  classic: 'Классика',
  endurance: 'Endurance',
};

function getProfileName(profileId: string) {
  const profile = PROFILES.find((item) => item.id === profileId);

  return profile?.title || 'Безымянный герой';
}

function formatNumber(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('ru-RU').format(Math.round(value));
}

function formatDecimal(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value == null) return '—';
  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function formatTime(ms: number | null | undefined) {
  if (ms == null) return '—';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}ч ${minutes}м ${seconds}с`;
  if (minutes > 0) return `${minutes}м ${seconds}с`;
  return `${seconds}с`;
}

function formatDate(timestamp: number | null | undefined) {
  if (!timestamp) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function EmptyChart() {
  return (
    <div className={styles.emptyChart}>
      Данных пока нет
    </div>
  );
}

function AdminLoadingDismiss() {
  const ctx = use(GlobalContext);
  const pathname = usePathname();

  useEffect(() => {
    if (!ctx.loadingScreen.isEnabled || ctx.loadingScreen.seed !== pathname) return;

    ctx.loadingScreen.toggle(false, { progress: 100 });
  }, [ctx, pathname]);

  return null;
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      {label && <div className={styles.tooltipLabel}>{label}</div>}
      {payload.map((item) => (
        <div key={item.name} className={styles.tooltipRow}>
          <span style={{ backgroundColor: item.color }} />
          {item.name}: {formatNumber(item.value)}
        </div>
      ))}
    </div>
  );
}

export default function AdminStatsScreen({ stats }: AdminStatsScreenProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const dailyData = stats.dailyRows.map((row) => ({
    ...row,
    label: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(new Date(row.date)),
    avgSeconds: row.avgTime == null ? 0 : Math.round(row.avgTime / 1000),
  }));
  const statusData = stats.statusRows.map((row) => ({
    ...row,
    label: statusLabels[row.status],
  }));
  const difficultyData = stats.difficultyRows.map((row) => ({
    ...row,
    label: difficultyLabels[row.difficulty],
    avgSeconds: row.avgTime == null ? 0 : Math.round(row.avgTime / 1000),
  }));
  const modeData = stats.modeRows.map((row) => ({
    ...row,
    label: modeLabels[row.mode],
  }));

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
            <h1>Статистика игр</h1>
          </div>
        </div>
        <div className={styles.generatedAt}>
          Обновлено {formatDate(stats.generatedAt)}
        </div>
      </header>

      <section className={styles.metrics} aria-label="Ключевые показатели">
        {stats.metrics.map((metric) => (
          <article key={metric.label} className={styles.metric}>
            <div className={styles.metricLabel}>{metric.label}</div>
            <strong>{metric.value}</strong>
            {metric.hint && <span>{metric.hint}</span>}
          </article>
        ))}
      </section>

      <section className={styles.chartGrid} aria-label="Графики">
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Игры по дням</h2>
            <span>создано / завершено / заброшено</span>
          </div>
          <div className={styles.chart}>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="total" name="Всего" stroke="#f6d68b" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="completed" name="Завершено" stroke="#9be58f" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="abandoned" name="Заброшено" stroke="#f6a17d" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Статусы</h2>
            <span>распределение всех игр</span>
          </div>
          <div className={styles.chart}>
            {statusData.some((row) => row.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie data={statusData} dataKey="count" nameKey="label" innerRadius="54%" outerRadius="78%" paddingAngle={3}>
                    {statusData.map((row) => (
                      <Cell key={row.status} fill={statusColors[row.status]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className={styles.legend}>
            {statusData.map((row) => (
              <span key={row.status}>
                <i style={{ backgroundColor: statusColors[row.status] }} />
                {row.label}: {row.count}
              </span>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Сложности</h2>
            <span>игры и среднее время</span>
          </div>
          <div className={styles.chart}>
            {difficultyData.some((row) => row.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={difficultyData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="games" allowDecimals={false} stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="time" orientation="right" hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar yAxisId="games" dataKey="count" name="Игры" fill="#8bb8ff" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="time" type="monotone" dataKey="avgSeconds" name="Среднее время, сек" stroke="#face96" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Режимы</h2>
            <span>классика против endurance</span>
          </div>
          <div className={styles.chart}>
            {modeData.some((row) => row.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modeData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.55)" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="completed" stackId="status" name="Завершено" fill="#9be58f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="abandoned" stackId="status" name="Заброшено" fill="#f6a17d" />
                  <Bar dataKey="active" stackId="status" name="Активно" fill="#7cc8ff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>
      </section>

      <section className={styles.tableGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Статусы</h2>
            <span>доли от общего числа игр</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Статус</th>
                  <th>Игр</th>
                  <th>Доля</th>
                </tr>
              </thead>
              <tbody>
                {stats.statusRows.map((row) => (
                  <tr key={row.status}>
                    <td>{statusLabels[row.status]}</td>
                    <td>{row.count}</td>
                    <td>{formatPercent(row.percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Режимы</h2>
            <span>сводная таблица</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Режим</th>
                  <th>Всего</th>
                  <th>Активно</th>
                  <th>Завершено</th>
                  <th>Заброшено</th>
                  <th>Среднее время</th>
                  <th>Самое долгое</th>
                  <th>Средние очки</th>
                </tr>
              </thead>
              <tbody>
                {stats.modeRows.map((row) => (
                  <tr key={row.mode}>
                    <td>{modeLabels[row.mode]}</td>
                    <td>{row.count}</td>
                    <td>{row.active}</td>
                    <td>{row.completed}</td>
                    <td>{row.abandoned}</td>
                    <td>{formatTime(row.avgTime)}</td>
                    <td>{formatTime(row.longestTime)}</td>
                    <td>{formatNumber(row.avgPoints)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Сложности</h2>
            <span>качество прохождения</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Сложность</th>
                  <th>Всего</th>
                  <th>Активно</th>
                  <th>Завершено</th>
                  <th>Заброшено</th>
                  <th>Среднее время</th>
                  <th>Самое долгое</th>
                </tr>
              </thead>
              <tbody>
                {stats.difficultyRows.map((row) => (
                  <tr key={row.difficulty}>
                    <td>{difficultyLabels[row.difficulty]}</td>
                    <td>{row.count}</td>
                    <td>{row.active}</td>
                    <td>{row.completed}</td>
                    <td>{row.abandoned}</td>
                    <td>{formatTime(row.avgTime)}</td>
                    <td>{formatTime(row.longestTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Игроки</h2>
            <span>профили из базы</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Игрок</th>
                  <th>Игры</th>
                  <th>Endurance</th>
                  <th>Раунды</th>
                  <th>Очки</th>
                  <th>Среднее время</th>
                  <th>Лучшее время</th>
                  <th>Лучшие очки</th>
                </tr>
              </thead>
              <tbody>
                {stats.profileRows.map((row) => (
                  <tr key={row.profileId}>
                    <td>{getProfileName(row.profileId)}</td>
                    <td>{row.games}</td>
                    <td>{row.enduranceGames}</td>
                    <td>{row.rounds}</td>
                    <td>{formatNumber(row.points)}</td>
                    <td>{formatTime(row.avgTime)}</td>
                    <td>{formatTime(row.bestTime)}</td>
                    <td>{formatNumber(row.bestPoints)}</td>
                  </tr>
                ))}
                {stats.profileRows.length === 0 && (
                  <tr><td colSpan={8}>Игроков пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Endurance игры</h2>
            <span>все кейсы режима</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Игрок</th>
                  <th>Статус</th>
                  <th>Раунды</th>
                  <th>Очки</th>
                  <th>Время</th>
                  <th>Средний раунд</th>
                  <th>Лучший раунд</th>
                  <th>Осталось</th>
                  <th>Старт</th>
                </tr>
              </thead>
              <tbody>
                {stats.enduranceGames.map((row) => (
                  <tr key={row.gameId}>
                    <td>{getProfileName(row.profileId)}</td>
                    <td>{statusLabels[row.status]}</td>
                    <td>{row.rounds}</td>
                    <td>{formatNumber(row.points)}</td>
                    <td>{formatTime(row.time)}</td>
                    <td>{formatTime(row.avgRoundTime)}</td>
                    <td>{formatTime(row.bestRoundTime)}</td>
                    <td>{formatTime(row.timeLeft)}</td>
                    <td>{formatDate(row.startedAt)}</td>
                  </tr>
                ))}
                {stats.enduranceGames.length === 0 && (
                  <tr><td colSpan={9}>Endurance-игр пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Endurance раунды</h2>
            <span>агрегация по номеру раунда</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Раунд</th>
                  <th>Прохождений</th>
                  <th>Среднее время</th>
                  <th>Лучшее время</th>
                  <th>Базовые очки</th>
                  <th>Множитель</th>
                  <th>Очки скорости</th>
                  <th>Бонус этапа</th>
                  <th>Средние очки</th>
                  <th>Всего очков</th>
                  <th>Средний бонус времени</th>
                </tr>
              </thead>
              <tbody>
                {stats.enduranceRounds.map((row) => (
                  <tr key={row.round}>
                    <td>{row.round}</td>
                    <td>{row.games}</td>
                    <td>{formatTime(row.avgTime)}</td>
                    <td>{formatTime(row.bestTime)}</td>
                    <td>{formatNumber(row.avgBasePoints)}</td>
                    <td>{formatDecimal(row.avgSpeedMultiplier)}</td>
                    <td>{formatNumber(row.avgSpeedPoints)}</td>
                    <td>{formatNumber(row.avgMilestoneBonus)}</td>
                    <td>{formatNumber(row.avgPoints)}</td>
                    <td>{formatNumber(row.totalPoints)}</td>
                    <td>{formatTime(row.avgTimeBonus)}</td>
                  </tr>
                ))}
                {stats.enduranceRounds.length === 0 && (
                  <tr><td colSpan={11}>Раундов пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Доски</h2>
            <span>из сохраненного gameState</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Доска</th>
                  <th>Игры</th>
                  <th>Активно</th>
                  <th>Завершено</th>
                  <th>Заброшено</th>
                  <th>Среднее время</th>
                  <th>Лучшее время</th>
                </tr>
              </thead>
              <tbody>
                {stats.boardRows.map((row) => (
                  <tr key={row.boardId}>
                    <td>{row.boardId}</td>
                    <td>{row.games}</td>
                    <td>{row.active}</td>
                    <td>{row.completed}</td>
                    <td>{row.abandoned}</td>
                    <td>{formatTime(row.avgTime)}</td>
                    <td>{formatTime(row.bestTime)}</td>
                  </tr>
                ))}
                {stats.boardRows.length === 0 && (
                  <tr><td colSpan={7}>Сохраненных досок пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Последние игры</h2>
            <span>30 новых записей</span>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Старт</th>
                  <th>Игрок</th>
                  <th>Режим</th>
                  <th>Сложность</th>
                  <th>Статус</th>
                  <th>Время</th>
                  <th>Очки</th>
                  <th>Раунды</th>
                  <th>Доска</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentGames.map((row) => (
                  <tr key={row.gameId}>
                    <td>{formatDate(row.startedAt)}</td>
                    <td>{getProfileName(row.profileId)}</td>
                    <td>{modeLabels[row.mode]}</td>
                    <td>{difficultyLabels[row.difficulty]}</td>
                    <td>{statusLabels[row.status]}</td>
                    <td>{formatTime(row.time)}</td>
                    <td>{formatNumber(row.points)}</td>
                    <td>{row.rounds}</td>
                    <td>{row.boardId ?? '—'}</td>
                  </tr>
                ))}
                {stats.recentGames.length === 0 && (
                  <tr><td colSpan={9}>Игр пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}

'use client';

import { use, useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { FaArrowLeft, FaBolt } from "react-icons/fa6";
import clsx from "clsx";
import { createGameAction } from "~/actions/createGame";
import { Button } from "~/components/Button";
import { IconTextButton } from "~/components/IconTextButton";
import { JigsawPiece } from "~/components/JigsawPiece";
import { ProfileSelectModal } from "~/components/ProfileSelectModal";
import { GlobalContext } from "~/contexts/GlobalContext";
import { Difficulty, GameMode } from "~/types";
import { getDimensions } from "~/utils/getDimentions";

import styles from './StartScreen.module.css';

const gameModes: Array<{
  id: GameMode;
  title: string;
  description: string;
  layout: 'vertical' | 'horizontal';
}> = [
  {
    id: 'easy',
    title: 'Легкая',
    description: 'Увеличенный размер доски и меньше фрагментов для комфортной игры',
    layout: 'vertical',
  },
  {
    id: 'medium',
    title: 'Нормальная',
    description: 'Стандартная доска и больше фрагментов для тех, кто уже освоился с механикой.',
    layout: 'vertical',
  },
  {
    id: 'hard',
    title: 'Сложная',
    description: 'Плотная доска и максимальное количество фрагментов для настоящих мастеров мозаики.',
    layout: 'vertical',
  },
  {
    id: 'challenge',
    title: 'Испытание',
    description: 'Бесконечный режим с постоянно увеличивающейся сложностью.\nРейтинговая таблица для самых упорных игроков.',
    layout: 'horizontal',
  },
];

function isDifficulty(mode: GameMode): mode is Difficulty {
  return mode !== 'challenge';
}

const phantomPiecesByDifficulty: Record<Difficulty, Array<{
  sides: [number, number, number, number];
  className: string;
}>> = {
  easy: [
    {
      sides: [1, -1, 1, -1],
      className: styles.easyPiece,
    },
  ],
  medium: [
    {
      sides: [0, 1, -1, 0],
      className: styles.mediumPiecePrimary,
    },
    {
      sides: [-1, 0, 1, 1],
      className: styles.mediumPieceSecondary,
    },
  ],
  hard: [
    {
      sides: [1, 0, -1, 1],
      className: styles.hardPiecePrimary,
    },
    {
      sides: [-1, 1, 0, -1],
      className: styles.hardPieceSecondary,
    },
    {
      sides: [0, -1, 1, 0],
      className: styles.hardPieceTertiary,
    },
  ],
};

export default function StartScreen() {
  const ctx = use(GlobalContext);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleStartGame = useCallback((profileId: string) => {
    if (!selectedMode) return;

    ctx.loadingScreen.toggle(true, { seed: '/game', progress: 20 });
    startTransition(async () => {
      await createGameAction({
        profileId,
        mode: selectedMode,
      });
    });
  }, [ctx, selectedMode]);

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <IconTextButton
              className={styles.backButton}
              icon={<FaArrowLeft />}
              onClick={handleBack}
            />
            <h1 className={styles.title}>Выберите сложность</h1>
          </div>
        </div>

        <div className={styles.difficultyGrid}>
          {gameModes.filter(mode => mode.layout === 'vertical').map((mode) => {
            const isSelected = selectedMode === mode.id;
            const difficulty = isDifficulty(mode.id) ? mode.id : undefined;
            const piecesCount = difficulty ? getDimensions(difficulty).initialMissing : 0;
            const phantomPieces = difficulty ? phantomPiecesByDifficulty[difficulty] : [];

            return (
              <button
                key={mode.id}
                className={clsx(styles.modeCard, styles.verticalCard, {
                  [styles.selected]: isSelected,
                })}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMode(mode.id)}
              >
                <span className={styles.radio} />
                <span className={styles.pieceCounter}>
                  {phantomPieces.map((piece, pieceIndex) => (
                    <span
                      key={`${mode.id}-${pieceIndex}`}
                      className={clsx(styles.phantomPiece, piece.className)}
                      style={{
                        '--piece-layer': pieceIndex,
                      } as CSSProperties}
                    >
                      <JigsawPiece
                        image=""
                        initialSides={piece.sides}
                        isShadow
                        className={styles.phantomPieceShape}
                      />
                    </span>
                  ))}
                  <span className={styles.pieceCount}>x{piecesCount}</span>
                </span>
                <span className={styles.cardTitle}>{mode.title}</span>
                <span className={styles.cardDescription}>{mode.description}</span>
              </button>
            );
          })}
        </div>

        {gameModes.filter(mode => mode.layout === 'horizontal').map((mode) => {
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              className={clsx(styles.modeCard, styles.challengeCard, {
                [styles.selected]: isSelected,
              })}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedMode(mode.id)}
            >
              <span className={styles.cardIcon}>
                <FaBolt />
              </span>
              <span className={styles.challengeContent}>
                <span className={styles.cardTitle}>{mode.title}</span>
                <span className={styles.cardDescription}>{mode.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <ProfileSelectModal disabled={!selectedMode || isPending} onConfirm={handleStartGame}>
          <Button className={styles.button} disabled={!selectedMode || isPending}>
            Выбрать персонажа
          </Button>
        </ProfileSelectModal>
      </div>
    </div>
  );
}

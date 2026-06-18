"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import helpImage1 from "~/assets/help/help-1.png";
import helpImage2 from "~/assets/help/help-2.png";
import helpImage3 from "~/assets/help/help-3.png";
import { Modal, ModalProps } from "~/components/Modal";

import styles from './GameInfoModal.module.css';

interface GameInfoModalProps extends ModalProps {
  onClose: () => void;
}

const slides: Array<{
  image: StaticImageData;
  description: string;
}> = [
  {
    image: helpImage1,
    description: 'Перетаскивайте детали из запаса на поле и ищите для них подходящие места. Фрагмент фиксируется, когда оказывается рядом со своим настоящим положением.',
  },
  {
    image: helpImage2,
    description: 'Нажмите на фрагмент, чтобы повернуть его. Иногда правильная форма уже рядом, но ей нужен всего один поворот.',
  },
  {
    image: helpImage3,
    description: 'В режиме испытания каждый собранный раунд приносит очки и добавляет время. Правила можно открыть в любой момент: таймер остановится, пока эта подсказка на экране.',
  },
];

export function GameInfoModal({ isOpen, onClose }: GameInfoModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const hasPreviousSlide = currentSlide > 0;
  const hasNextSlide = currentSlide < slides.length - 1;

  const handlePrevious = () => {
    setCurrentSlide((index) => Math.max(0, index - 1));
  };

  const handleNext = () => {
    setCurrentSlide((index) => Math.min(slides.length - 1, index + 1));
  };

  return (
    <Modal
      isOpen={isOpen}
      variant="guide"
      onRequestClose={onClose}
    >
      <div className={styles.base}>
        <h2 className={styles.title}>Мозаика грёз</h2>
        <div className={styles.carousel} aria-live="polite">
          <button
            className={styles.navButton}
            type="button"
            onClick={handlePrevious}
            disabled={!hasPreviousSlide}
            aria-label="Предыдущий слайд"
          >
            <FaChevronLeft />
          </button>
          <div className={styles.slide}>
            <div className={styles.screenshot}>
              <Image
                className={styles.screenshotImage}
                src={slide.image}
                alt=""
                priority={currentSlide === 0}
              />
            </div>
            <div className={styles.text}>
              <p>{slide.description}</p>
            </div>
          </div>
          <button
            className={styles.navButton}
            type="button"
            onClick={handleNext}
            disabled={!hasNextSlide}
            aria-label="Следующий слайд"
          >
            <FaChevronRight />
          </button>
        </div>
        <div className={styles.dots} aria-label="Слайды">
          {slides.map((item, index) => (
            <button
              key={item.description}
              className={styles.dot}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Открыть слайд ${index + 1}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}

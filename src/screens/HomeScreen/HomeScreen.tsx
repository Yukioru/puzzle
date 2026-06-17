'use client';

import Link from "next/link";
import { Button } from "~/components/Button";

import styles from './HomeScreen.module.css';

export default function HomeScreen() {
  return (
    <div className={styles.overlay}>
      <h1>
        Honkai: Star Rail<br/>
        Мозаика грёз
      </h1>
      <div className={styles.footer}>
        <Button
          as={Link}
          href="/start"
          className={styles.button}
        >
          Начать игру
        </Button>
      </div>
    </div>
  );
}

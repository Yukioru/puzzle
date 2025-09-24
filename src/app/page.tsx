import { getGameById } from "~/dal/queries";
import JigsawGame from "~/components/JigsawGame";
import Link from "next/link";

import styles from './page.module.css';

export default async function Home() {
  const data = await getGameById('test');
  return (
    <div className={styles.base}>
      <JigsawGame {...data} showStock={false} />
      <div className={styles.overlay}>
        <h1>Honkai: Star Rail - Jigsaw Puzzle</h1>
        <div className={styles.footer}>
          <Link href={`/game/${data.id}`} className={styles.button}>Начать игру</Link>
        </div>
      </div>
    </div>
  );
}

import Boot from "@/components/Boot";
import MiniDeck from "@/components/MiniDeck";
import Recorder from "@/components/Recorder";
import TrackMenu from "@/components/TrackMenu";
import Tracks from "@/components/Tracks";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Boot />
      <div className={styles.shell}>
        <aside className={styles.deck} id="deck">
          <div className={styles.deckInner} data-deck>
            <Recorder />
          </div>
        </aside>
        <main className={styles.notes}>
          <Tracks />
        </main>
      </div>
      <TrackMenu />
      <MiniDeck />
    </>
  );
}

import Boot from "@/components/Boot";
import Hold from "@/components/Hold";
import MiniDeck from "@/components/MiniDeck";
import Motion from "@/components/Motion";
import TrackMenu from "@/components/TrackMenu";
import Tracks from "@/components/Tracks";
import Viz from "@/components/Viz";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Boot />
      <div className="ambient" data-glow="c" aria-hidden />
      <Viz />
      <main className={styles.album}>
        <Tracks />
      </main>
      <TrackMenu />
      <MiniDeck />
      <Hold />
      <Motion />
    </>
  );
}

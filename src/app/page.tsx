import { redirect } from "next/navigation";

// The root route forwards directly to Al-Fatiha so the app opens in the reader.
export default function Home() {
  redirect("/surah/1");
}

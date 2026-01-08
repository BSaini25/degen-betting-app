import { getBetsFromDatabase } from "@/lib/betsDB";
import MyBetsClient from "./MyBetsClient";

export default async function MyBets() {
  const bets = await getBetsFromDatabase();
  
  return <MyBetsClient initialBets={bets} />;
}

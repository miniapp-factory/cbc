import { description, title } from "@/lib/metadata";
import { generateMetadata } from "@/lib/farcaster-embed";
import Game from "@/components/2048-game";

export { generateMetadata };

export default function Home() {
  // NEVER write anything here, only use this page to import components
  return (
    <main className="flex flex-col gap-3 place-items-center px-4">
      <span className="text-2xl">{title}</span>
      <span className="text-muted-foreground">{description}</span>
      <Game />
    </main>
  );
}

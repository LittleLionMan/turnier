import { appUrl } from "@/lib/mail";
import { ShareButton } from "./ShareButton";

type SharePanelProps = {
  heading: string;
  text: string;
};

export function SharePanel({ heading, text }: SharePanelProps) {
  return (
    <section className="hinweis" aria-labelledby="teilen-titel">
      <h3 id="teilen-titel">{heading}</h3>
      <p>{text}</p>
      <ShareButton url={appUrl("/")} text="Ehemaligenturnier beim SC Münster 08 – ich bin dabei. Du auch?" />
    </section>
  );
}

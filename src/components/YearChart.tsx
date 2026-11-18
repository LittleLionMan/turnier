import type { YearCount } from "@/lib/registrations";
import styles from "./YearChart.module.css";

type YearChartProps = {
  data: YearCount[];
};

const AXIS_STEPS = [2, 4, 10, 20, 40, 60, 100, 200, 400, 1000];

function niceMax(value: number): number {
  return AXIS_STEPS.find((step) => step >= value) ?? Math.ceil(value / 1000) * 1000;
}

const LABEL_STEPS = [1, 2, 5, 10, 20, 25, 50];
const MAX_LABELS_MOBILE = 6;
const MAX_LABELS_DESKTOP = 10;

function labelStep(years: number, maxLabels: number): number {
  return LABEL_STEPS.find((step) => Math.ceil(years / step) <= maxLabels) ?? 100;
}

function labelClass(year: number, index: number, total: number, mobileStep: number, desktopStep: number): string {
  const classes = [styles.jahr];
  if (year % mobileStep === 0) classes.push(styles.jahrMobil);
  if (year % desktopStep === 0) classes.push(styles.jahrDesktop);
  if (index === 0) classes.push(styles.jahrAnfang);
  if (index === total - 1) classes.push(styles.jahrEnde);
  return classes.join(" ");
}

function personen(count: number): string {
  return count === 1 ? "1 Person" : `${count} Personen`;
}

export function YearChart({ data }: YearChartProps) {
  if (data.length === 0) {
    return <p className="leise">Sobald jemand angibt, wann er aktiv war, siehst du hier die Verteilung über die Jahre.</p>;
  }

  const peak = Math.max(...data.map((entry) => entry.count));
  const max = niceMax(peak);
  const mobileStep = labelStep(data.length, MAX_LABELS_MOBILE);
  const desktopStep = labelStep(data.length, MAX_LABELS_DESKTOP);
  const ticks = [max, max / 2, 0];

  return (
    <figure className={styles.figur}>
      <div className={styles.diagramm}>
        <div className={styles.achse} aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick}>{Math.round(tick)}</span>
          ))}
        </div>
        <div className={styles.flaeche}>
          <div className={styles.raster} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <ol className={styles.balken} style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
            {data.map((entry, entryIndex) => (
              <li key={entry.year} className={styles.spalte}>
                <button
                  type="button"
                  className={styles.treffer}
                  aria-label={`${entry.year}: ${personen(entry.count)}`}
                >
                  <span className={styles.balkenWert} style={{ height: `${(entry.count / max) * 100}%` }} />
                  <span className={styles.tooltip} role="tooltip">
                    <strong>{entry.year}</strong>
                    {personen(entry.count)}
                  </span>
                </button>
                <span
                  className={labelClass(entry.year, entryIndex, data.length, mobileStep, desktopStep)}
                  aria-hidden="true"
                >
                  {entry.year}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption className="leise">
        Jeder Balken zeigt, wie viele der Angemeldeten in diesem Jahr im Verein aktiv waren.
      </figcaption>
      <details className={styles.tabelle}>
        <summary>Als Tabelle anzeigen</summary>
        <table className="tabelle">
          <thead>
            <tr>
              <th scope="col">Jahr</th>
              <th scope="col">Aktive</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.year}>
                <td>{entry.year}</td>
                <td>{entry.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

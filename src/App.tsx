import { useState } from "react";
import "./App.css";

type Side = "L" | "R";
type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";
type MeridianKey =
  | "liver"
  | "gall"
  | "heart"
  | "small"
  | "pericard"
  | "triple"
  | "spleen"
  | "stomach"
  | "lungs"
  | "large"
  | "kidney"
  | "bladder";

type SelectedState = Partial<Record<MeridianKey, { L: boolean; R: boolean }>>;

const MERIDIANS = [
  { key: 'stomach', number: 3, label: '胃経', element: 'earth' },
  { key: 'spleen', number: 4, label: '脾経', element: 'earth' },
  { key: 'heart', number: 5, label: '心経', element: 'fire' },
  { key: 'small', number: 6, label: '小腸経', element: 'fire' },
  { key: 'bladder', number: 7, label: '膀胱経', element: 'water' },
  { key: 'kidney', number: 8, label: '腎経', element: 'water' },
  { key: 'pericard', number: 9, label: '心包経', element: 'fire' },
  { key: 'triple', number: 10, label: '三焦経', element: 'fire' },
  { key: 'gall', number: 11, label: '胆経', element: 'wood' },
  { key: 'liver', number: 12, label: '肝経', element: 'wood' },
  { key: 'lungs', number: 13, label: '肺経', element: 'metal' },
  { key: 'large', number: 14, label: '大腸経', element: 'metal' },
] as const satisfies ReadonlyArray<{
  key: MeridianKey;
  number: number;
  label: string;
  element: ElementKey;
}>;

const ELEMENT_POSITIONS: Record<ElementKey, { top: string; left: string }> = {
  wood: { top: "12%", left: "50%" },
  fire: { top: "38%", left: "84%" },
  earth: { top: "80%", left: "72%" },
  metal: { top: "80%", left: "28%" },
  water: { top: "38%", left: "16%" },
};

const ELEMENT_LABELS: Record<ElementKey, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

const ELEMENT_COLORS: Record<ElementKey, string> = {
  wood: "#7b9c7a",
  fire: "#d2a4a4",
  earth: "#ccb995",
  metal: "#aab0b7",
  water: "#8fa5bc",
};

const toAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}${cleanPath}`;
};

function App() {
  const [selected, setSelected] = useState<SelectedState>({});

  const toggleSide = (meridianKey: MeridianKey, side: Side) => {
    setSelected((prev) => {
      const current = prev[meridianKey] ?? { L: false, R: false };
      const nextForMeridian = { ...current, [side]: !current[side] };

      if (!nextForMeridian.L && !nextForMeridian.R) {
        const { [meridianKey]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [meridianKey]: nextForMeridian };
    });
  };

  const selectedTags = MERIDIANS.flatMap((meridian) => {
    const row = selected[meridian.key];
    if (!row) return [];

    const tags: string[] = [];
    if (row.L) tags.push(`${meridian.label}L`);
    if (row.R) tags.push(`${meridian.label}R`);
    return tags;
  });

  const groupedByElement = MERIDIANS.reduce<Record<ElementKey, string[]>>(
    (acc, meridian) => {
      const row = selected[meridian.key];
      if (row?.L) acc[meridian.element].push(`${meridian.label}L`);
      if (row?.R) acc[meridian.element].push(`${meridian.label}R`);
      return acc;
    },
    { wood: [], fire: [], earth: [], metal: [], water: [] },
  );

  return (
    <div className="app">
      <header className="header card">
        <h1>キネシオロジー調整リファレンス</h1>
        <button className="clear-button" onClick={() => setSelected({})} type="button">
          全解除
        </button>
      </header>

      <section className="chart card" aria-label="五行図">
        <div className="image-wrap">
          <img src={toAssetUrl("/gogyo.png")} alt="五行図" />

          {(Object.keys(ELEMENT_POSITIONS) as ElementKey[]).map((element) => {
            const items = groupedByElement[element];
            if (items.length === 0) return null;

            return (
              <div
                key={element}
                className="overlay"
                style={{ top: ELEMENT_POSITIONS[element].top, left: ELEMENT_POSITIONS[element].left }}
              >
                <div className="overlay-title">{ELEMENT_LABELS[element]}</div>
                <div className="overlay-content">{items.join(" / ")}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="selector card" aria-label="経絡選択">
        {MERIDIANS.map((meridian) => {
          const row = selected[meridian.key] ?? { L: false, R: false };
          return (
            <div key={meridian.key} className="meridian-row">
              <div className="meridian-name" style={{ borderColor: ELEMENT_COLORS[meridian.element] }}>
                {meridian.number}：{meridian.label}
              </div>
              <div className="side-buttons">
                {(["L", "R"] as Side[]).map((side) => (
                  <button
                    key={side}
                    type="button"
                    className={`side-button ${row[side] ? "active" : ""}`}
                    onClick={() => toggleSide(meridian.key, side)}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="selected card" aria-label="選択中OFF経絡">
        <div className="selected-header">
          <h2>選択中OFF経絡</h2>
          <span>合計 {selectedTags.length} 件</span>
        </div>
        <div className="tag-list">
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))
          ) : (
            <p className="empty">まだ選択されていません</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;

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
  { key: "liver", label: "肝", element: "wood" },
  { key: "gall", label: "胆", element: "wood" },
  { key: "heart", label: "心", element: "fire" },
  { key: "small", label: "小腸", element: "fire" },
  { key: "pericard", label: "心包", element: "fire" },
  { key: "triple", label: "三焦", element: "fire" },
  { key: "spleen", label: "脾", element: "earth" },
  { key: "stomach", label: "胃", element: "earth" },
  { key: "lungs", label: "肺", element: "metal" },
  { key: "large", label: "大腸", element: "metal" },
  { key: "kidney", label: "腎", element: "water" },
  { key: "bladder", label: "膀胱", element: "water" },
] as const satisfies ReadonlyArray<{ key: MeridianKey; label: string; element: ElementKey }>;

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
                {meridian.label}
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

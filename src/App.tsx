import { useState, useEffect } from "react";

const GlobalStyles = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <style>{`
      @keyframes spin { to { transform: rotate(360deg) } }
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent }
      input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }
      input[type=range] { height: 4px; border-radius: 2px }
      ::-webkit-scrollbar { width: 3px }
      ::-webkit-scrollbar-thumb { background: #c8cfe0; border-radius: 2px }
      textarea { resize: vertical }
    `}</style>
  </>
);

const C = {
  bg:      "#f5f6fa",
  card:    "#ffffff",
  border:  "#e2e6f0",
  accent:  "#4a7de8",
  accent2: "#e0437a",
  green:   "#18b854",
  yellow:  "#f0a500",
  muted:   "#9099ad",
  text:    "#1a1d2e",
  purple:  "#7c5cbf",
};

function calcBMR(age, weight, height, sex) {
  const b = 10 * weight + 6.25 * height - 5 * age;
  return sex === "male" ? b + 5 : b - 161;
}

const ACTIVITY_LEVELS = [
  { id: "low",  label: "1–2 days/week", icon: "🌿", desc: "Mostly sedentary — desk job, light daily movement",   pal: 1.40, palRange: "1.40–1.55" },
  { id: "mid",  label: "3–4 days/week", icon: "⚡", desc: "Mix of desk work and regular training sessions",       pal: 1.55, palRange: "1.55–1.70" },
  { id: "high", label: "5–7 days/week", icon: "🔥", desc: "Daily training + active lifestyle outside gym",        pal: 1.70, palRange: "1.70–1.85" },
];

const PROTEIN_TARGETS = {
  lose:     { gPerKg: 1.6, src: "ISSN 2017 — 1.6–2.4 g/kg in deficit preserves lean mass" },
  recomp:   { gPerKg: 2.0, src: "ISSN 2017 — 2.0–2.4 g/kg for body recomposition" },
  maintain: { gPerKg: 1.4, src: "ISSN 2017 — 1.4–2.0 g/kg for active individuals" },
  gain:     { gPerKg: 1.8, src: "ISSN 2017 — 1.6–2.2 g/kg for muscle hypertrophy" },
};

const GOAL_MOD = { lose: -300, recomp: 0, maintain: 0, gain: 250 };

const GOALS = [
  { id: "lose",     label: "Lose Weight",           icon: "⚖️",  desc: "−300 kcal deficit · 1.6 g protein/kg (ISSN)" },
  { id: "recomp",   label: "Lose Fat, Keep Muscle", icon: "🔄",  desc: "Maintenance calories · 2.0 g protein/kg · recomposition" },
  { id: "maintain", label: "Maintain",              icon: "🎯",  desc: "Match TDEE · 1.4 g protein/kg (ISSN)" },
  { id: "gain",     label: "Gain Muscle",           icon: "💪",  desc: "+250 kcal surplus · 1.8 g protein/kg (ISSN)" },
];

function calcMacros(kcal, goal, weight) {
  const protG = Math.round(PROTEIN_TARGETS[goal].gPerKg * weight);
  const fatG  = Math.round((kcal * 0.27) / 9);
  const carbG = Math.max(0, Math.round((kcal - protG * 4 - fatG * 9) / 4));
  return { protein: protG, carbs: carbG, fat: fatG, fibre: 25, sugar: Math.round(carbG * 0.25) };
}

const ACTIVITY_CATALOG = [
  { id: "gym",      label: "Gym / Weights", icon: "🏋️", met: 5.0 },
  { id: "run",      label: "Running",       icon: "🏃", met: 9.8 },
  { id: "padel",    label: "Padel",         icon: "🎾", met: 7.0 },
  { id: "pilates",  label: "Pilates",       icon: "🧘", met: 3.5 },
  { id: "cycling",  label: "Cycling",       icon: "🚴", met: 8.0 },
  { id: "swimming", label: "Swimming",      icon: "🏊", met: 8.3 },
  { id: "hiit",     label: "HIIT",          icon: "🤸", met: 10.0 },
  { id: "boxing",   label: "Boxing",        icon: "🥊", met: 9.0 },
  { id: "football", label: "Football",      icon: "⚽", met: 7.5 },
  { id: "walking",  label: "Walking",       icon: "🚶", met: 3.5 },
  { id: "climbing", label: "Climbing",      icon: "🧗", met: 7.5 },
  { id: "yoga",     label: "Yoga",          icon: "🌿", met: 2.5 },
];

const EFFORT_LEVELS = [
  { id: "easy",     label: "Easy",     icon: "😊", mult: 0.70, color: "#2ed573" },
  { id: "moderate", label: "Moderate", icon: "😤", mult: 1.00, color: "#ffd32a" },
  { id: "hard",     label: "Hard",     icon: "🥵", mult: 1.30, color: "#ff6b35" },
  { id: "max",      label: "Max",      icon: "💀", mult: 1.55, color: "#ee5b8d" },
];

const MACRO_GUIDANCE = [
  { authority: "WHO",  year: "2003/2015", flag: "🌍", protein: "10–15% TE (≈0.83 g/kg safe intake)",                           carbs: "45–75% TE (<10% free sugars)",       fat: "20–35% TE (<10% saturated)",                      fibre: "≥25 g/day", note: "Population health guidelines — not sport-specific" },
  { authority: "EFSA", year: "2017",      flag: "🇪🇺", protein: "0.83 g/kg/day (safe intake); 1.1 g/kg for older adults",       carbs: "45–60% TE (<10% added sugars)",      fat: "20–35% TE (<10% saturated, <1% trans)",           fibre: "≥25 g/day", note: "European DRVs — stricter carb upper limit than WHO" },
  { authority: "IOC",  year: "2011/2021", flag: "🏅", protein: "1.2–2.0 g/kg/day depending on sport & goal",                   carbs: "3–12 g/kg/day depending on training load", fat: "20–35% TE",                                  fibre: "Prioritise; sport-context dependent", note: "Athlete-specific consensus — carbs scaled to training intensity" },
  { authority: "ISSN", year: "2017",      flag: "🔬", protein: "1.4–2.0 g/kg/day; up to 3.1 g/kg in aggressive deficit",       carbs: "Periodise to training; ≥3 g/kg on heavy days", fat: "15–30% TE; ≥0.5 g/kg for hormonal health", fibre: "≥25 g/day", note: "Sports nutrition position stand — highest protein recommendations" },
];

const SCIENCE_REFS = [
  { label: "Mifflin-St Jeor (1990)",      tag: "WHO-endorsed", detail: "Most accurate BMR for modern adults per Frankenfield et al. (2005). Used in WHO TRS 916 (2003)." },
  { label: "FAO/WHO/UNU (2004)",           tag: "WHO/FAO",      detail: "PAL = total daily EE ÷ BMR. Lower bounds used: sedentary 1.40, moderate 1.55, vigorous 1.70. PAL 2.0+ reserved for elite/occupational activity." },
  { label: "EFSA DRVs (2017)",             tag: "EFSA",         detail: "EU Dietary Reference Values: protein 0.83 g/kg, carbs 45–60% TE, fat 20–35% TE, fibre ≥25 g/day." },
  { label: "IOC Consensus (2021)",         tag: "IOC",          detail: "Athlete nutrition consensus. Protein 1.2–2.0 g/kg; carbs periodised to training load 3–12 g/kg/day." },
  { label: "ISSN Position Stand (2017)",   tag: "ISSN",         detail: "Jäger et al. Protein 1.4–2.0 g/kg optimal; up to 3.1 g/kg in aggressive deficit. All four goal targets use ISSN values." },
  { label: "WHO TRS 916 (2003/2015)",      tag: "WHO",          detail: "Carbs 45–75% TE; free sugars <10% (<5% preferred). Saturated fat <10% TE." },
  { label: "USDA FoodData Central",        tag: "USDA",         detail: "Primary reference for ingredient macro estimates (fdc.nal.usda.gov)." },
  { label: "EuroFIR (eurofir.org)",        tag: "EuroFIR",      detail: "European Food Information Resource — used where values differ from USDA (e.g. wholemeal bread, dairy)." },
];

const DEFAULT_FOODS = [
  { id:"f1",  name:"Greek Yogurt + Berries",   refG:200, calories:220, protein:18, carbs:26, fat:4,  fibre:3,  sugar:8,  emoji:"🫐", ingredients:[{name:"Greek Yogurt",g:150},{name:"Mixed Berries",g:50}] },
  { id:"f2",  name:"Oat Porridge + Banana",    refG:310, calories:310, protein:9,  carbs:58, fat:5,  fibre:6,  sugar:14, emoji:"🥣", ingredients:[{name:"Rolled Oats",g:80},{name:"Semi-skimmed Milk",g:180},{name:"Banana",g:80}] },
  { id:"f3",  name:"Chicken Breast (grilled)", refG:150, calories:248, protein:46, carbs:0,  fat:5,  fibre:0,  sugar:0,  emoji:"🍗", ingredients:[{name:"Chicken Breast",g:150}] },
  { id:"f4",  name:"Chicken Salad",            refG:350, calories:380, protein:42, carbs:14, fat:16, fibre:4,  sugar:5,  emoji:"🥗", ingredients:[{name:"Chicken Breast",g:150},{name:"Mixed Salad Leaves",g:80},{name:"Cherry Tomatoes",g:60},{name:"Olive Oil",g:15},{name:"Feta Cheese",g:30}] },
  { id:"f5",  name:"Avocado Toast",            refG:180, calories:340, protein:10, carbs:36, fat:18, fibre:7,  sugar:3,  emoji:"🥑", ingredients:[{name:"Sourdough Bread",g:80},{name:"Avocado",g:100}] },
  { id:"f6",  name:"Protein Shake",            refG:310, calories:180, protein:30, carbs:10, fat:3,  fibre:1,  sugar:6,  emoji:"🥤", ingredients:[{name:"Whey Protein Powder",g:30},{name:"Semi-skimmed Milk",g:250},{name:"Banana",g:60}] },
  { id:"f7",  name:"Mixed Fruit Bowl",         refG:200, calories:150, protein:2,  carbs:36, fat:1,  fibre:5,  sugar:28, emoji:"🍓", ingredients:[{name:"Seasonal Mixed Fruit",g:200}] },
  { id:"f8",  name:"Tuna Rice Bowl",           refG:400, calories:430, protein:38, carbs:48, fat:8,  fibre:3,  sugar:2,  emoji:"🍱", ingredients:[{name:"Cooked Brown Rice",g:200},{name:"Canned Tuna in Water",g:140},{name:"Cucumber",g:60}] },
  { id:"f9",  name:"Almonds",                  refG:30,  calories:173, protein:6,  carbs:6,  fat:15, fibre:2,  sugar:1,  emoji:"🌰", ingredients:[{name:"Almonds",g:30}] },
  { id:"f10", name:"Eggs (2 large, boiled)",   refG:100, calories:143, protein:13, carbs:1,  fat:10, fibre:0,  sugar:0,  emoji:"🥚", ingredients:[{name:"Whole Egg",g:100}] },
];

const QUICK_PROMPTS = [
  "Feeling extra tired this week 😴",
  "Didn't sleep well last night 😔",
  "Heavy training day today 💪",
  "Feeling bloated after meals 😣",
  "Struggling to hit protein target 🥩",
  "Rest day — low activity ☁️",
  "Competition / event tomorrow 🏁",
  "Feeling stressed and anxious 😰",
];

const SK = "nutriai_v6";
function loadState() { try { return JSON.parse(localStorage.getItem(SK) || "{}"); } catch { return {}; } }
function saveState(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} }

async function callClaude(userMsg, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY || "",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data.content?.map(b => b.text || "").join("") || "";
}

function extractJSON(raw) {
  try { return JSON.parse(raw.trim()); } catch {}
  const fenced = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(fenced); } catch {}
  const m = fenced.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  throw new Error("No JSON found");
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressBar({ value, max, color, h = 8 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = value > max;
  return (
    <div style={{ background: C.border, borderRadius: 99, height: h, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: over ? "#ff4757" : color, borderRadius: 99, transition: "width .4s ease" }} />
    </div>
  );
}

function MacroRow({ label, consumed, target, color, emoji }) {
  const done = consumed >= target;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{emoji} {label}</span>
        <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: done ? C.green : C.muted, fontWeight: 500 }}>
          {consumed}g / {target}g
        </span>
      </div>
      <ProgressBar value={consumed} max={target} color={color} h={6} />
    </div>
  );
}

function Spinner({ color = C.accent }) {
  return (
    <div style={{ width: 16, height: 16, border: `2px solid ${color}30`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
  );
}

function Tag({ children, color = C.accent }) {
  return (
    <span style={{ background: `${color}18`, color, fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 5, fontFamily: "'DM Mono',monospace" }}>
      {children}
    </span>
  );
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ["🍽️","🫐","🥣","🍗","🥗","🥑","🥤","🍓","🍱","🌰","🥚","🥩","🍝","🥦","🍎","🧇","🥞","🫔","🌯","🥙","🍜","🍲","🥘","🫕","🍛","🍣","🥐","🧁","🍰","🍫","🥜","🫘","🧀","🥛","☕","🍵","🧃","🍊","🍋","🍇","🍉","🍌","🥝","🍑","🫐","🥕","🌽","🫑","🥒","🧄","🧅","🥔","🍠"];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: 52, height: 42, borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {value}
      </button>
      {open && (
        <div style={{ position: "absolute", top: 46, left: 0, zIndex: 50, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8, width: 220, display: "flex", flexWrap: "wrap", gap: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          {EMOJI_OPTIONS.map(e => (
            <button key={e} onClick={() => { onChange(e); setOpen(false); }} style={{ width: 32, height: 32, border: "none", background: e === value ? `${C.accent}15` : "transparent", borderRadius: 6, fontSize: 16, cursor: "pointer" }}>
              {e}
            </button>
          ))}
          <input placeholder="or type…" maxLength={2} onChange={ev => { if (ev.target.value) { onChange(ev.target.value); setOpen(false); } }} style={{ width: "100%", marginTop: 4, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 8px", fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif" }} />
        </div>
      )}
    </div>
  );
}

// ─── Edit Food Modal ──────────────────────────────────────────────────────────
function EditFoodModal({ food, onSave, onClose }) {
  const [f, setF] = useState({ ...food });
  const inp = { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif", width: "100%" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "20px 18px 32px", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>✏️ Edit Food</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <EmojiPicker value={f.emoji} onChange={v => setF(p => ({ ...p, emoji: v }))} />
          <input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="Food name" style={{ ...inp, flex: 1 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {["calories","protein","carbs","fat","fibre","sugar"].map(k => (
            <div key={k}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 3, textTransform: "capitalize" }}>{k}{k === "calories" ? " (kcal)" : " (g)"}</div>
              <input value={f[k] || ""} onChange={e => setF(p => ({ ...p, [k]: e.target.value }))} type="number" style={inp} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Reference serving size (g)</div>
        <input value={f.refG || ""} onChange={e => setF(p => ({ ...p, refG: e.target.value }))} type="number" style={{ ...inp, marginBottom: 14 }} />
        <button onClick={() => onSave({ ...f, calories: +f.calories, protein: +f.protein, carbs: +f.carbs, fat: +f.fat, fibre: +f.fibre, sugar: +(f.sugar||0), refG: +f.refG })} style={{ background: C.accent, border: "none", borderRadius: 11, padding: "12px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "'Outfit',sans-serif" }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

function IngredientPicker({ food, onAdd, onClose }) {
  const [mult, setMult] = useState(1);
  const totalG = Math.round(food.refG * mult);
  const scale = (v) => Math.round((v || 0) * mult);

  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: 14, marginTop: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: C.text }}>{food.emoji} {food.name}</div>
      {food.ingredients && food.ingredients.map((ing, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
          <span>{ing.name}</span>
          <span style={{ fontFamily: "'DM Mono',monospace" }}>{Math.round(ing.g * mult)}g</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 8 }}>
        <button onClick={() => setMult(m => Math.max(0.25, +(m - 0.25).toFixed(2)))} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
        <input type="range" min={0.25} max={4} step={0.25} value={mult} onChange={e => setMult(+e.target.value)} style={{ flex: 1, accentColor: C.accent }} />
        <button onClick={() => setMult(m => Math.min(4, +(m + 0.25).toFixed(2)))} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, minWidth: 36, color: C.accent }}>{mult}×</span>
      </div>
      <div style={{ background: `${C.accent}10`, borderRadius: 9, padding: "8px 12px", fontSize: 12, color: C.text, marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>
        {scale(food.calories)} kcal · P {scale(food.protein)}g · C {scale(food.carbs)}g · F {scale(food.fat)}g · 🍬 {scale(food.sugar||0)}g
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onAdd({ ...food, _mult: mult, servedG: totalG, calories: scale(food.calories), protein: scale(food.protein), carbs: scale(food.carbs), fat: scale(food.fat), fibre: scale(food.fibre), sugar: scale(food.sugar||0) })} style={{ flex: 1, background: C.accent, border: "none", borderRadius: 9, padding: "9px 12px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
          + Add {totalG}g to Log
        </button>
        <button onClick={onClose} style={{ background: C.border, border: "none", borderRadius: 9, padding: "9px 12px", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function NewFoodForm({ onSave, onCancel }) {
  const [mode, setMode] = useState("ingredients");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [ingredients, setIngredients] = useState([{ name: "", g: "" }]);
  const [macros, setMacros] = useState({ calories: "", protein: "", carbs: "", fat: "", fibre: "", sugar: "" });
  const [calcHighlight, setCalcHighlight] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inp = { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif" };

  const addIngredient = () => setIngredients(prev => [...prev, { name: "", g: "" }]);
  const updateIngredient = (i, field, val) => setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  const removeIngredient = (i) => setIngredients(prev => prev.filter((_, idx) => idx !== i));

  const calculateMacros = async () => {
    const valid = ingredients.filter(i => i.name && i.g);
    if (!valid.length) { setError("Add at least one ingredient with a name and weight."); return; }
    setError("");
    setLoading(true);
    try {
      const list = valid.map(i => `${i.name}: ${i.g}g`).join(", ");
      const raw = await callClaude(
        `Calculate total nutrition for this meal made of these ingredients: ${list}. Return ONLY a raw JSON object with no prose or markdown: {"calories":number,"protein":number,"carbs":number,"fat":number,"fibre":number,"sugar":number}`,
        "You are a nutrition scientist. Use USDA FoodData Central and EuroFIR as references. Respond with ONLY a raw JSON object — no prose, no markdown, no explanation."
      );
      const j = extractJSON(raw);
      setMacros({
        calories: String(Math.round(j.calories || 0)),
        protein:  String(Math.round(j.protein  || 0)),
        carbs:    String(Math.round(j.carbs    || 0)),
        fat:      String(Math.round(j.fat      || 0)),
        fibre:    String(Math.round(j.fibre    || 0)),
        sugar:    String(Math.round(j.sugar    || 0)),
      });
      setCalcHighlight(true);
      setTimeout(() => setCalcHighlight(false), 2500);
    } catch (e) {
      setError(`Calculation failed: ${e.message}. Please check your ingredients and try again.`);
    } finally { setLoading(false); }
  };

  const handleSave = () => {
    if (!name || !macros.calories) return;
    const totalG = ingredients.filter(i => i.g).reduce((s, i) => s + +i.g, 0);
    const food = {
      id: `custom_${Date.now()}`, name, emoji,
      refG: totalG || 100,
      calories: +macros.calories, protein: +macros.protein || 0,
      carbs: +macros.carbs || 0, fat: +macros.fat || 0,
      fibre: +macros.fibre || 0, sugar: +macros.sugar || 0,
      ingredients: mode === "ingredients" ? ingredients.filter(i => i.name && i.g).map(i => ({ name: i.name, g: +i.g })) : [],
    };
    onSave(food);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, background: C.bg, borderRadius: 10, padding: 4 }}>
        {[["ingredients", "🧪 By Ingredients"], ["manual", "✏️ Manual Macros"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setMode(id)} style={{ flex: 1, padding: "8px", borderRadius: 7, border: "none", background: mode === id ? C.accent : "transparent", color: mode === id ? "#fff" : C.muted, cursor: "pointer", fontSize: 13, fontWeight: mode === id ? 700 : 400, fontFamily: "'Outfit',sans-serif" }}>
            {lbl}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Food name" style={{ ...inp, flex: 1 }} />
      </div>
      {mode === "ingredients" && (
        <>
          {ingredients.map((ing, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={ing.name} onChange={e => updateIngredient(i, "name", e.target.value)} placeholder="Ingredient" style={{ ...inp, flex: 1 }} />
              <input value={ing.g} onChange={e => updateIngredient(i, "g", e.target.value)} placeholder="g" type="number" style={{ ...inp, width: 70 }} />
              {ingredients.length > 1 && <button onClick={() => removeIngredient(i)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>✕</button>}
            </div>
          ))}
          <button onClick={addIngredient} style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 9, padding: "8px", color: C.muted, fontSize: 13, cursor: "pointer", width: "100%", marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>
            + Add Ingredient
          </button>
          {error && <div style={{ background: "#ff475715", border: `1px solid #ff4757`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#ff4757", marginBottom: 8 }}>{error}</div>}
          <button onClick={calculateMacros} disabled={loading} style={{ background: loading ? C.border : C.accent, border: "none", borderRadius: 9, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "default" : "pointer", width: "100%", marginBottom: 12, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><Spinner color="#fff" /> Calculating…</> : "⚡ Calculate via USDA/EuroFIR"}
          </button>
        </>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12, background: calcHighlight ? "#eef3ff" : "transparent", borderRadius: 9, padding: calcHighlight ? 8 : 0, transition: "all .3s" }}>
        {["calories","protein","carbs","fat","fibre","sugar"].map(k => (
          <input key={k} value={macros[k]} onChange={e => setMacros(m => ({ ...m, [k]: e.target.value }))}
            placeholder={k.charAt(0).toUpperCase() + k.slice(1) + (k === "calories" ? " (kcal)" : " (g)")}
            type="number" style={{ ...inp, gridColumn: k === "calories" ? "1 / -1" : "auto" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={!name || !macros.calories} style={{ flex: 1, background: (!name || !macros.calories) ? C.border : C.green, border: "none", borderRadius: 9, padding: "11px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (!name || !macros.calories) ? "default" : "pointer", fontFamily: "'Outfit',sans-serif" }}>
          Save Food
        </button>
        <button onClick={onCancel} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: "11px 16px", color: C.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ActivityEntry({ entry, onRemove, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(String(entry.burnKcal));

  const confirmEdit = () => {
    const v = +editVal;
    if (!isNaN(v) && v > 0) { onEdit({ ...entry, burnKcal: v }); setEditing(false); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 18 }}>{entry.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{entry.label}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{entry.duration} min · {entry.effortLabel}</div>
        {entry.notes ? <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 2 }}>{entry.notes}</div> : null}
      </div>
      {editing ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") setEditing(false); }} type="number" style={{ width: 64, border: `1px solid ${C.accent}`, borderRadius: 6, padding: "4px 6px", fontSize: 12, outline: "none", fontFamily: "'DM Mono',monospace" }} autoFocus />
          <button onClick={confirmEdit} style={{ background: C.green, border: "none", borderRadius: 5, color: "#fff", padding: "4px 6px", cursor: "pointer", fontSize: 11 }}>✓</button>
          <button onClick={() => setEditing(false)} style={{ background: C.border, border: "none", borderRadius: 5, color: C.text, padding: "4px 6px", cursor: "pointer", fontSize: 11 }}>✕</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} style={{ background: `${entry.effortColor}20`, border: "none", borderRadius: 6, padding: "4px 8px", color: entry.effortColor, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
          🔥 {entry.burnKcal} kcal
        </button>
      )}
      <button onClick={() => onRemove(entry.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 2px" }}>✕</button>
    </div>
  );
}

function ActivityLogger({ logs, onAdd, onRemove, onEdit, userWeight }) {
  const [actType, setActType] = useState(null);
  const [duration, setDuration] = useState("");
  const [effort, setEffort] = useState(null);
  const [notes, setNotes] = useState("");
  const inpS2 = { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none", width: "100%", fontFamily: "'Outfit',sans-serif" };

  const cat = ACTIVITY_CATALOG.find(a => a.id === actType);
  const eff = EFFORT_LEVELS.find(e => e.id === effort);
  const burn = cat && eff && duration ? Math.round(cat.met * userWeight * (duration / 60) * eff.mult) : 0;

  const handleLog = () => {
    if (!actType || !duration || !effort || !burn) return;
    onAdd({ id: `act_${Date.now()}`, type: actType, label: cat.label, icon: cat.icon, duration: +duration, effort, effortLabel: eff.label, effortColor: eff.color, burnKcal: burn, notes });
    setActType(null); setDuration(""); setEffort(null); setNotes("");
  };

  const totalBurn = logs.reduce((s, l) => s + l.burnKcal, 0);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>🏃 Activity Logger</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {ACTIVITY_CATALOG.map(a => (
          <button key={a.id} onClick={() => setActType(a.id === actType ? null : a.id)} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${actType === a.id ? C.accent : C.border}`, background: actType === a.id ? `${C.accent}15` : "#fff", color: actType === a.id ? C.accent : C.text, cursor: "pointer", fontSize: 12, fontWeight: actType === a.id ? 700 : 400, fontFamily: "'Outfit',sans-serif" }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>
      <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (minutes)" type="number" style={{ ...inpS2, marginBottom: 10 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
        {EFFORT_LEVELS.map(e => (
          <button key={e.id} onClick={() => setEffort(e.id)} style={{ padding: "9px", borderRadius: 9, border: `1px solid ${effort === e.id ? e.color : C.border}`, background: effort === e.id ? `${e.color}15` : "#fff", cursor: "pointer", fontSize: 12, fontWeight: effort === e.id ? 700 : 400, color: effort === e.id ? e.color : C.text, fontFamily: "'Outfit',sans-serif" }}>
            {e.icon} {e.label}
          </button>
        ))}
      </div>
      {burn > 0 && (
        <div style={{ background: `${C.accent}10`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>~{burn} kcal burned</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono',monospace" }}>MET {cat.met} · {userWeight}kg</div>
        </div>
      )}
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" style={{ ...inpS2, minHeight: 56, marginBottom: 10 }} />
      <button onClick={handleLog} disabled={!burn} style={{ background: burn ? C.green : C.border, border: "none", borderRadius: 11, padding: "12px 18px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: burn ? "pointer" : "default", width: "100%", fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}>
        Log Activity ✓
      </button>
      {logs.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {logs.map(l => <ActivityEntry key={l.id} entry={l} onRemove={onRemove} onEdit={onEdit} />)}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, paddingTop: 10, color: C.accent }}>
            <span>Total Activity Burn</span>
            <span style={{ fontFamily: "'DM Mono',monospace" }}>🔥 {totalBurn} kcal</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationsTab({ rec, profile, goal, actLvl, dailyLogs }) {
  const [journalText, setJournalText] = useState("");
  const [advice, setAdvice] = useState("");
  const [loadingAdv, setLoadingAdv] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const actObj = ACTIVITY_LEVELS.find(a => a.id === actLvl);
  const goalObj = GOALS.find(g => g.id === goal);

  // Build 7-day trend summary for recommendations
  const trendSummary = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const log = dailyLogs[key] || [];
      if (log.length > 0) {
        const cal = log.reduce((s, f) => s + (f.calories||0), 0);
        const prot = log.reduce((s, f) => s + (f.protein||0), 0);
        const sugar = log.reduce((s, f) => s + (f.sugar||0), 0);
        days.push({ date: key, cal, prot, sugar });
      }
    }
    if (!days.length) return null;
    const avgCal  = Math.round(days.reduce((s,d) => s+d.cal,  0) / days.length);
    const avgProt = Math.round(days.reduce((s,d) => s+d.prot, 0) / days.length);
    const avgSugar= Math.round(days.reduce((s,d) => s+d.sugar,0) / days.length);
    const trend = avgCal > rec.calories * 1.05 ? "consistently over calorie target" : avgCal < rec.calories * 0.85 ? "consistently under calorie target" : "close to calorie target";
    return `Over the last ${days.length} logged days: avg ${avgCal} kcal/day (target ${rec.calories}, ${trend}), avg protein ${avgProt}g/day (target ${rec.protein}g), avg sugar ${avgSugar}g/day.`;
  })();

  const fetchAdvice = async (text) => {
    if (!text.trim()) return;
    setLoadingAdv(true); setAdvice("");
    try {
      const trendNote = trendSummary ? `\n\nRecent 7-day trend: ${trendSummary}` : "";
      const resp = await callClaude(
        `User profile: ${profile.age}yo ${profile.sex}, ${profile.weight}kg, ${profile.height}cm. Goal: ${goalObj?.label}. Activity: ${actObj?.label} (PAL ${actObj?.pal}). Daily targets: ${rec.calories} kcal, protein ${rec.protein}g, carbs ${rec.carbs}g, fat ${rec.fat}g, fibre ${rec.fibre}g, sugar <${rec.sugar}g.${trendNote}\n\nUser note: "${text}". Provide adjusted nutrition and activity recommendations for today/this week, addressing any trends observed.`,
        "You are a registered sports dietitian and performance coach. Provide evidence-based, personalised advice citing WHO, EFSA, IOC, or ISSN where relevant. Be concise and actionable — max 6 bullet points starting with •. Include specific numbers where helpful."
      );
      setAdvice(resp);
    } catch (e) { setAdvice(`• Error: ${e.message}`); }
    finally { setLoadingAdv(false); }
  };

  const cardS = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px", marginBottom: 14 };

  return (
    <div style={{ padding: "12px 16px 100px" }}>
      {/* Section 1 - Daily Baseline */}
      <div style={cardS}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Daily Baseline</div>
        <div style={{ fontSize: 42, fontWeight: 800, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1, marginBottom: 4 }}>
          {rec.calories.toLocaleString()}
          <span style={{ fontSize: 16, fontWeight: 400, WebkitTextFillColor: C.muted, marginLeft: 4 }}>kcal</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>BMR {rec.bmr} × PAL {actObj?.pal} = TDEE {rec.tdee}</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>PAL band {actObj?.palRange} · lower bound used — conservative (FAO/WHO/UNU 2004)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Protein", val: `${rec.protein}g`, sub: `${PROTEIN_TARGETS[goal]?.gPerKg}g/kg · ISSN 2017`, color: C.yellow },
            { label: "Carbs",   val: `${rec.carbs}g`,   sub: "45–60% TE · WHO/EFSA", color: C.accent },
            { label: "Fat",     val: `${rec.fat}g`,     sub: "27% TE · WHO/EFSA midpoint", color: C.accent2 },
            { label: "Fibre",   val: `${rec.fibre}g`,   sub: "≥25g/day · WHO/EFSA", color: C.green },
            { label: "Sugar",   val: `<${rec.sugar}g`,  sub: "<10% carbs · WHO guideline", color: C.purple },
          ].map(m => (
            <div key={m.label} style={{ background: `${m.color}10`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: m.color, fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{m.val}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 - Macro Guidelines */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 14, overflow: "hidden" }}>
        <button onClick={() => setShowGuide(g => !g)} style={{ width: "100%", background: "none", border: "none", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>📊 Macro Guidelines by Authority</span>
          <span style={{ color: C.muted, fontSize: 16 }}>{showGuide ? "▲" : "▼"}</span>
        </button>
        {showGuide && (
          <div style={{ padding: "0 18px 18px" }}>
            {MACRO_GUIDANCE.map(g => (
              <div key={g.authority} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{g.flag}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{g.authority}</span>
                  <Tag color={C.muted}>{g.year}</Tag>
                </div>
                {[["Protein", g.protein], ["Carbs", g.carbs], ["Fat", g.fat], ["Fibre", g.fibre]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.muted, minWidth: 48 }}>{k}</span>
                    <span style={{ color: C.text }}>{v}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 6 }}>{g.note}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3 - Trend-aware advice */}
      <div style={cardS}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>💬 How Are You Feeling?</div>
        {trendSummary && (
          <div style={{ background: `${C.accent}10`, borderRadius: 9, padding: "8px 12px", fontSize: 12, color: C.accent, marginBottom: 12, lineHeight: 1.5 }}>
            📈 <strong>7-day trend detected</strong> — advice will be personalised to your recent data
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => { setJournalText(p); fetchAdvice(p); }} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: journalText === p ? `${C.accent}15` : "#fff", color: journalText === p ? C.accent : C.text, cursor: "pointer", fontSize: 12, fontWeight: journalText === p ? 700 : 400, fontFamily: "'Outfit',sans-serif" }}>
              {p}
            </button>
          ))}
        </div>
        <textarea value={journalText} onChange={e => setJournalText(e.target.value)} placeholder="Or type your own note…" style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none", width: "100%", fontFamily: "'Outfit',sans-serif", minHeight: 72, marginBottom: 10 }} />
        <button onClick={() => fetchAdvice(journalText)} disabled={loadingAdv || !journalText.trim()} style={{ background: (!journalText.trim() || loadingAdv) ? C.border : C.accent, border: "none", borderRadius: 11, padding: "12px 18px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (!journalText.trim() || loadingAdv) ? "default" : "pointer", width: "100%", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loadingAdv ? <><Spinner color="#fff" /> Getting advice…</> : "Get Personalised Advice →"}
        </button>
        {advice && (
          <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px", marginTop: 12, fontSize: 13, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
            {advice}
          </div>
        )}
      </div>

      {/* Section 4 - Science & Sources */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <button onClick={() => setShowSources(s => !s)} style={{ width: "100%", background: "none", border: "none", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>🔬 Science & Sources</span>
          <span style={{ color: C.muted, fontSize: 16 }}>{showSources ? "▲" : "▼"}</span>
        </button>
        {showSources && (
          <div style={{ padding: "0 18px 18px" }}>
            {SCIENCE_REFS.map(r => (
              <div key={r.label} style={{ borderLeft: `3px solid ${C.accent}`, paddingLeft: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.label}</span>
                  <Tag color={C.accent}>{r.tag}</Tag>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{r.detail}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 8, lineHeight: 1.5 }}>
              Population and athlete-level guidelines. Individual needs vary. Consult a registered dietitian for personalised medical nutrition therapy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NutriAI() {
  const saved = loadState();

  const [screen, setScreen]         = useState(saved.rec ? "daily" : "onboard");
  const [tab, setTab]               = useState("daily");
  const [profile, setProfile]       = useState(saved.profile || { age: "", weight: "", height: "", sex: "male" });
  const [goal, setGoal]             = useState(saved.goal || null);
  const [actLvl, setActLvl]         = useState(saved.actLvl || null);
  const [rec, setRec]               = useState(saved.rec || null);
  const [savedFoods, setSavedFoods] = useState(saved.savedFoods || DEFAULT_FOODS);
  const [dailyLogs, setDailyLogs]   = useState(saved.dailyLogs || {});
  const [activityLogs, setActivityLogs] = useState(saved.activityLogs || {});
  const [step, setStep]             = useState(1);
  const [foodTab, setFoodTab]       = useState("log");
  const [logInput, setLogInput]     = useState("");
  const [loadingFood, setLoadingFood] = useState(false);
  const [analysedFood, setAnalysedFood] = useState(null);
  const [analyseError, setAnalyseError] = useState("");
  const [expandedFood, setExpandedFood] = useState(null);
  const [editingFood, setEditingFood] = useState(null);

  const dateKey = new Date().toISOString().slice(0, 10);
  const todayLog = dailyLogs[dateKey] || [];
  const todayAct = activityLogs[dateKey] || [];

  useEffect(() => {
    saveState({ profile, goal, actLvl, rec, savedFoods, dailyLogs, activityLogs });
  }, [profile, goal, actLvl, rec, savedFoods, dailyLogs, activityLogs]);

  const cardS = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px", marginBottom: 14 };
  const btnS  = (bg = C.accent, full = true) => ({ background: bg, border: "none", borderRadius: 11, padding: "12px 18px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", width: full ? "100%" : "auto", fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 });
  const inpS  = { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none", width: "100%", fontFamily: "'Outfit',sans-serif" };
  const tabS  = (a) => ({ padding: "8px 14px", borderRadius: 8, border: "none", background: a ? C.accent : "transparent", color: a ? "#fff" : C.muted, cursor: "pointer", fontSize: 13, fontWeight: a ? 700 : 400, fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap", transition: "all .2s" });
  const navS  = (a) => ({ flex: 1, padding: "9px 0 7px", border: "none", background: a ? `${C.accent}18` : "transparent", color: a ? C.accent : C.muted, cursor: "pointer", fontSize: 11, fontWeight: a ? 700 : 400, fontFamily: "'Outfit',sans-serif", borderTop: a ? `2px solid ${C.accent}` : "2px solid transparent" });

  const totals = todayLog.reduce((s, f) => ({
    calories: s.calories + (f.calories||0),
    protein:  s.protein  + (f.protein||0),
    carbs:    s.carbs    + (f.carbs||0),
    fat:      s.fat      + (f.fat||0),
    fibre:    s.fibre    + (f.fibre||0),
    sugar:    s.sugar    + (f.sugar||0),
  }), { calories:0, protein:0, carbs:0, fat:0, fibre:0, sugar:0 });

  const burnToday = todayAct.reduce((s, a) => s + a.burnKcal, 0);
  const netCals = totals.calories - burnToday;

  const addToLog = (food) => {
    setDailyLogs(prev => ({ ...prev, [dateKey]: [...(prev[dateKey]||[]), { ...food, _logId: `log_${Date.now()}` }] }));
    setAnalysedFood(null); setLogInput("");
  };
  const removeFromLog = (logId) => setDailyLogs(prev => ({ ...prev, [dateKey]: (prev[dateKey]||[]).filter(f => f._logId !== logId) }));
  const saveFood = (food) => { if (!savedFoods.find(f => f.name === food.name)) setSavedFoods(prev => [...prev, food]); };
  const updateSavedFood = (updated) => setSavedFoods(prev => prev.map(f => f.id === updated.id ? updated : f));
  const addActivity = (act) => setActivityLogs(prev => ({ ...prev, [dateKey]: [...(prev[dateKey]||[]), act] }));
  const removeActivity = (id) => setActivityLogs(prev => ({ ...prev, [dateKey]: (prev[dateKey]||[]).filter(a => a.id !== id) }));
  const editActivity = (updated) => setActivityLogs(prev => ({ ...prev, [dateKey]: (prev[dateKey]||[]).map(a => a.id === updated.id ? updated : a) }));

  const analyseFood = async () => {
    if (!logInput.trim()) return;
    setLoadingFood(true); setAnalysedFood(null); setAnalyseError("");
    try {
      const raw = await callClaude(
        `Analyse this food or meal: "${logInput}". Return a typical serving as a raw JSON object: {"name":string,"servedG":number,"refG":number,"calories":number,"protein":number,"carbs":number,"fat":number,"fibre":number,"sugar":number,"emoji":string,"notes":string}`,
        "You are a nutrition scientist. Use USDA FoodData Central and EuroFIR as references. Respond with ONLY a raw JSON object — no prose, no markdown."
      );
      setAnalysedFood(extractJSON(raw));
    } catch (e) { setAnalyseError(`Analysis failed: ${e.message}. Try again or rephrase.`); }
    finally { setLoadingFood(false); }
  };

  // ─── Onboarding ──────────────────────────────────────────────────────────────
  if (screen === "onboard") {
    const canContinue1 = profile.age && profile.weight && profile.height && profile.sex;
    const finishOnboard = () => {
      const lvl = ACTIVITY_LEVELS.find(a => a.id === actLvl);
      const bmr  = Math.round(calcBMR(+profile.age, +profile.weight, +profile.height, profile.sex));
      const tdee = Math.round(bmr * lvl.pal);
      const kcal = tdee + GOAL_MOD[goal];
      const macros = calcMacros(kcal, goal, +profile.weight);
      setRec({ calories: kcal, ...macros, bmr, tdee, weight: +profile.weight, goal });
      setScreen("daily");
    };

    return (
      <div style={{ fontFamily: "'Outfit',sans-serif", background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <GlobalStyles />
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🥗</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>NutriAI</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Science-backed nutrition, personalised</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center" }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 4, background: s === step ? C.accent : s < step ? C.green : C.border, transition: "all .3s" }} />
            ))}
          </div>
          {step === 1 && (
            <div style={cardS}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>👤 Your Body</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Age (years)</div>
                  <input value={profile.age} onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} type="number" placeholder="25" style={inpS} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Weight (kg)</div>
                  <input value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} type="number" placeholder="70" style={inpS} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Height (cm)</div>
                  <input value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} type="number" placeholder="175" style={inpS} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Sex</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["male","female"].map(s => (
                      <button key={s} onClick={() => setProfile(p => ({ ...p, sex: s }))} style={{ flex: 1, padding: "10px", borderRadius: 9, border: `1px solid ${profile.sex === s ? C.accent : C.border}`, background: profile.sex === s ? `${C.accent}15` : "#fff", color: profile.sex === s ? C.accent : C.text, cursor: "pointer", fontSize: 13, fontWeight: profile.sex === s ? 700 : 400, fontFamily: "'Outfit',sans-serif", textTransform: "capitalize" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button disabled={!canContinue1} onClick={() => setStep(2)} style={btnS(canContinue1 ? C.accent : C.border)}>Continue →</button>
            </div>
          )}
          {step === 2 && (
            <div style={cardS}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>🎯 Your Goal</div>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", background: goal === g.id ? `${C.accent}10` : "#fff", border: `1px solid ${goal === g.id ? C.accent : C.border}`, borderRadius: 11, padding: "12px 14px", marginBottom: 8, cursor: "pointer", textAlign: "left", fontFamily: "'Outfit',sans-serif" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: goal === g.id ? C.accent : C.text }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{g.desc}</div>
                  </div>
                </button>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button onClick={() => setStep(1)} style={{ ...btnS(C.bg, false), color: C.text, border: `1px solid ${C.border}` }}>← Back</button>
                <button disabled={!goal} onClick={() => setStep(3)} style={{ ...btnS(goal ? C.accent : C.border), flex: 1 }}>Continue →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={cardS}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>⚡ Activity Level</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.5, background: `${C.yellow}15`, borderRadius: 8, padding: "8px 10px" }}>
                PAL reflects your entire day's activity pattern, not just gym time. A desk worker training 5×/week has PAL ~1.70–1.85, not 2.0+.
              </div>
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.id} onClick={() => setActLvl(a.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", background: actLvl === a.id ? `${C.accent}10` : "#fff", border: `1px solid ${actLvl === a.id ? C.accent : C.border}`, borderRadius: 11, padding: "12px 14px", marginBottom: 8, cursor: "pointer", textAlign: "left", fontFamily: "'Outfit',sans-serif" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: actLvl === a.id ? C.accent : C.text }}>{a.label}</span>
                      <Tag color={C.accent}>PAL {a.palRange}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{a.desc}</div>
                  </div>
                </button>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button onClick={() => setStep(2)} style={{ ...btnS(C.bg, false), color: C.text, border: `1px solid ${C.border}` }}>← Back</button>
                <button disabled={!actLvl} onClick={finishOnboard} style={{ ...btnS(actLvl ? C.accent : C.border), flex: 1 }}>Get My Plan ✓</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Today Screen ─────────────────────────────────────────────────────────────
  const TodayScreen = () => {
    const isSaved = (food) => savedFoods.some(f => f.name === food?.name);
    return (
      <div style={{ padding: "12px 16px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
            {burnToday > 0 && <div style={{ fontSize: 12, color: C.accent2, marginTop: 2 }}>🔥 −{burnToday} · net {netCals} kcal</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: totals.calories > rec.calories ? C.accent2 : C.text }}>{totals.calories.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: C.muted }}>/ {rec.calories.toLocaleString()} kcal</div>
          </div>
        </div>

        <div style={cardS}>
          <div style={{ marginBottom: 12 }}><ProgressBar value={totals.calories} max={rec.calories} color={C.accent} h={10} /></div>
          <MacroRow label="Protein" emoji="🥩" consumed={totals.protein} target={rec.protein} color={C.yellow} />
          <MacroRow label="Carbs" emoji="🍞" consumed={totals.carbs} target={rec.carbs} color={C.accent} />
          <MacroRow label="Fat" emoji="🥑" consumed={totals.fat} target={rec.fat} color={C.accent2} />
          <MacroRow label="Fibre (WHO/EFSA ≥25g)" emoji="🥦" consumed={totals.fibre} target={rec.fibre} color={C.green} />
          <MacroRow label="Sugar (WHO <10% carbs)" emoji="🍬" consumed={totals.sugar} target={rec.sugar || 50} color={C.purple} />
        </div>

        <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 10, padding: 4, marginBottom: 14 }}>
          {[["log","📋 Log"],["quick","⭐ Quick Add"],["new","➕ New Food"]].map(([id,lbl]) => (
            <button key={id} onClick={() => setFoodTab(id)} style={{ ...tabS(foodTab === id), flex: 1 }}>{lbl}</button>
          ))}
        </div>

        {foodTab === "log" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={logInput} onChange={e => setLogInput(e.target.value)} onKeyDown={e => e.key === "Enter" && analyseFood()} placeholder="e.g. '2 scrambled eggs on toast'" style={{ ...inpS, flex: 1 }} />
              <button onClick={analyseFood} disabled={loadingFood || !logInput.trim()} style={{ ...btnS(loadingFood || !logInput.trim() ? C.border : C.accent, false), minWidth: 80, display: "flex", alignItems: "center", gap: 6 }}>
                {loadingFood ? <Spinner color="#fff" /> : "Analyse"}
              </button>
            </div>
            {loadingFood && <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: 12 }}><Spinner /> Analysing…</div>}
            {analyseError && <div style={{ background: "#ff475720", border: "1px solid #ff4757", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ff4757", marginBottom: 10 }}>{analyseError}</div>}
            {analysedFood && (
              <div style={{ ...cardS, border: `1px solid ${C.green}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 18 }}>{analysedFood.emoji} <strong>{analysedFood.name}</strong></div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{analysedFood.calories} kcal</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>
                  P {analysedFood.protein}g · C {analysedFood.carbs}g · F {analysedFood.fat}g · 🍬 {analysedFood.sugar||0}g sugar{analysedFood.servedG ? ` · ${analysedFood.servedG}g` : ""}
                </div>
                {analysedFood.notes && <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginBottom: 8 }}>{analysedFood.notes}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => addToLog({ ...analysedFood, _logId: `log_${Date.now()}` })} style={btnS(C.green)}>+ Add to Log</button>
                  {!isSaved(analysedFood) && (
                    <button onClick={() => saveFood({ ...analysedFood, id: `saved_${Date.now()}`, refG: analysedFood.refG||100, ingredients: [] })} style={{ ...btnS(C.yellow, false), flex: 1 }}>⭐ Save</button>
                  )}
                </div>
              </div>
            )}
            {todayLog.length > 0 && (
              <div style={cardS}>
                {todayLog.map(f => (
                  <div key={f._logId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 20 }}>{f.emoji||"🍽️"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Mono',monospace" }}>
                        {f.servedG ? `${f.servedG}g · ` : ""}P {f.protein}g · C {f.carbs}g · 🍬 {f.sugar||0}g
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'DM Mono',monospace" }}>{f.calories}</div>
                    <button onClick={() => removeFromLog(f._logId)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <ActivityLogger logs={todayAct} onAdd={addActivity} onRemove={removeActivity} onEdit={editActivity} userWeight={rec.weight} />
          </div>
        )}

        {foodTab === "quick" && (
          <div>
            {savedFoods.map(f => (
              <div key={f.id} style={cardS}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setExpandedFood(expandedFood === f.id ? null : f.id)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Outfit',sans-serif", padding: 0 }}>
                    <span style={{ fontSize: 22 }}>{f.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono',monospace" }}>{f.calories} kcal · P {f.protein}g · 🍬 {f.sugar||0}g</div>
                    </div>
                    <span style={{ color: C.muted, fontSize: 16 }}>{expandedFood === f.id ? "▲" : "▼"}</span>
                  </button>
                  <button onClick={() => setEditingFood(f)} style={{ background: `${C.accent}10`, border: "none", borderRadius: 7, padding: "5px 8px", color: C.accent, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif", marginLeft: 4 }}>
                    ✏️
                  </button>
                </div>
                {expandedFood === f.id && (
                  <IngredientPicker food={f} onAdd={(food) => { addToLog({ ...food, _logId: `log_${Date.now()}` }); setExpandedFood(null); }} onClose={() => setExpandedFood(null)} />
                )}
              </div>
            ))}
          </div>
        )}

        {foodTab === "new" && (
          <div style={cardS}>
            <NewFoodForm onSave={(food) => { saveFood(food); setFoodTab("quick"); }} onCancel={() => setFoodTab("quick")} />
          </div>
        )}

        {editingFood && (
          <EditFoodModal
            food={editingFood}
            onSave={(updated) => { updateSavedFood(updated); setEditingFood(null); }}
            onClose={() => setEditingFood(null)}
          />
        )}
      </div>
    );
  };

  // ─── Progress Screen ──────────────────────────────────────────────────────────
  const ProgressScreen = () => {
    const [range, setRange] = useState(7);
    const days = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const log = dailyLogs[key] || [];
      const acts = activityLogs[key] || [];
      const cal   = log.reduce((s, f) => s + (f.calories||0), 0);
      const prot  = log.reduce((s, f) => s + (f.protein||0), 0);
      const carb  = log.reduce((s, f) => s + (f.carbs||0), 0);
      const fat   = log.reduce((s, f) => s + (f.fat||0), 0);
      const sugar = log.reduce((s, f) => s + (f.sugar||0), 0);
      const totalBurn = acts.reduce((s, a) => s + a.burnKcal, 0);
      days.push({
        key, label: d.toLocaleDateString("en-GB", { weekday:"short", day:"numeric" }),
        shortLabel: d.toLocaleDateString("en-GB", { weekday:"short" }),
        cal, prot, carb, fat, sugar, totalBurn,
        actCount: acts.length,
        hasActivity: acts.length > 0,
        logged: log.length > 0,
      });
    }

    const logged = days.filter(d => d.logged);
    const avgCal   = logged.length ? Math.round(logged.reduce((s,d) => s+d.cal,  0)/logged.length) : 0;
    const avgProt  = logged.length ? Math.round(logged.reduce((s,d) => s+d.prot, 0)/logged.length) : 0;
    const avgBurn  = days.filter(d=>d.hasActivity).length ? Math.round(days.filter(d=>d.hasActivity).reduce((s,d)=>s+d.totalBurn,0)/days.filter(d=>d.hasActivity).length) : 0;
    const maxBar   = Math.max(...days.map(d => d.cal), rec.calories) * 1.1;
    const maxBurn  = Math.max(...days.map(d => d.totalBurn), 1);
    const outliers = logged.length >= 3 ? { high: logged.reduce((a,b) => a.cal>b.cal?a:b), low: logged.reduce((a,b) => a.cal<b.cal?a:b) } : null;

    // Trend analysis
    const trendMsg = (() => {
      if (logged.length < 3) return null;
      const over  = logged.filter(d => d.cal > rec.calories * 1.05).length;
      const under = logged.filter(d => d.cal < rec.calories * 0.85).length;
      const highSugar = logged.filter(d => d.sugar > (rec.sugar||50) * 1.2).length;
      const msgs = [];
      if (over >= logged.length * 0.5)  msgs.push(`📈 Over calorie target on ${over}/${logged.length} logged days`);
      if (under >= logged.length * 0.5) msgs.push(`📉 Under calorie target on ${under}/${logged.length} logged days`);
      if (highSugar >= 2) msgs.push(`🍬 High sugar intake on ${highSugar} days — consider reducing added sugars`);
      const avgProtPct = avgProt / rec.protein;
      if (avgProtPct < 0.8) msgs.push(`🥩 Avg protein ${avgProt}g is below your ${rec.protein}g target`);
      return msgs.length ? msgs : null;
    })();

    return (
      <div style={{ padding: "12px 16px 100px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[7,30].map(r => <button key={r} onClick={() => setRange(r)} style={tabS(range===r)}>{r} days</button>)}
        </div>

        {/* Trend insights */}
        {trendMsg && (
          <div style={{ ...cardS, background: `${C.accent}08`, border: `1px solid ${C.accent}30` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8 }}>🔍 Trend Insights</div>
            {trendMsg.map((m,i) => <div key={i} style={{ fontSize: 13, color: C.text, marginBottom: 4, lineHeight: 1.5 }}>{m}</div>)}
          </div>
        )}

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Avg Cal",     val: avgCal  ? avgCal.toLocaleString()  : "—", unit: "kcal", color: C.accent },
            { label: "Avg Protein", val: avgProt || "—",                           unit: "g",    color: C.yellow },
            { label: "Days Logged", val: logged.length,                            unit: `/ ${range}`, color: C.green },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{s.unit}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Calorie bar chart */}
        <div style={cardS}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>📊 Calories</div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 100 }}>
            {days.map(d => {
              const h = d.logged ? Math.round((d.cal / maxBar) * 100) : 0;
              const over = d.cal > rec.calories;
              return (
                <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  {d.logged && <div style={{ fontSize: 9, color: C.muted, fontFamily: "'DM Mono',monospace" }}>{d.cal>999?`${(d.cal/1000).toFixed(1)}k`:d.cal}</div>}
                  {d.hasActivity && <div style={{ width: 5, height: 5, background: C.yellow, borderRadius: "50%" }} />}
                  <div style={{ width: "100%", background: d.logged?(over?"#ff4757":C.green):C.border, borderRadius: "3px 3px 0 0", height: `${h}px`, minHeight: d.logged?4:0, transition: "height .4s ease" }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
            {days.map(d => <div key={d.key} style={{ flex: 1, fontSize: 9, color: C.muted, textAlign: "center" }}>{d.shortLabel}</div>)}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: C.muted }}>
            <span>🟢 On target</span><span style={{ color:"#ff4757" }}>🔴 Over</span><span>🟡 Activity day</span>
          </div>
        </div>

        {/* Activity trend chart */}
        <div style={cardS}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🏃 Activity Burn</div>
            {avgBurn > 0 && <div style={{ fontSize: 12, color: C.accent, fontFamily: "'DM Mono',monospace" }}>avg {avgBurn} kcal/session</div>}
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 80 }}>
            {days.map(d => {
              const h = d.hasActivity ? Math.round((d.totalBurn / maxBurn) * 80) : 0;
              return (
                <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  {d.hasActivity && <div style={{ fontSize: 9, color: C.accent2, fontFamily: "'DM Mono',monospace" }}>{d.totalBurn}</div>}
                  <div style={{ width: "100%", background: d.hasActivity ? C.accent2 : C.border, borderRadius: "3px 3px 0 0", height: `${h}px`, minHeight: d.hasActivity?3:0, transition: "height .4s ease" }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
            {days.map(d => <div key={d.key} style={{ flex: 1, fontSize: 9, color: C.muted, textAlign: "center" }}>{d.shortLabel}</div>)}
          </div>
          {days.some(d=>d.hasActivity) && (
            <div style={{ marginTop: 10 }}>
              {days.filter(d=>d.hasActivity).map(d => (
                <div key={d.key} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted, marginBottom:3 }}>
                  <span>{d.label}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace" }}>🔥 {d.totalBurn} kcal · {d.actCount} session{d.actCount>1?"s":""}</span>
                </div>
              ))}
            </div>
          )}
          {!days.some(d=>d.hasActivity) && <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 8 }}>No activity logged yet in this period</div>}
        </div>

        {/* Sugar trend */}
        {logged.length > 0 && (
          <div style={cardS}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>🍬 Sugar Trend</div>
            {logged.map(d => {
              const sugarTarget = rec.sugar || 50;
              const over = d.sugar > sugarTarget;
              return (
                <div key={d.key} style={{ marginBottom: 8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3 }}>
                    <span style={{ color: C.muted }}>{d.label}</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", color: over?"#ff4757":C.green, fontWeight:600 }}>{d.sugar}g {over?"▲":""}</span>
                  </div>
                  <ProgressBar value={d.sugar} max={sugarTarget} color={C.purple} h={5} />
                </div>
              );
            })}
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Target: &lt;{rec.sugar||50}g/day · WHO guideline &lt;10% of carb intake</div>
          </div>
        )}

        {/* Macro breakdown */}
        {logged.length > 0 && (
          <div style={cardS}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>🍽️ Macro Breakdown</div>
            {logged.map(d => {
              const total = d.prot*4 + d.carb*4 + d.fat*9;
              return (
                <div key={d.key} style={{ marginBottom: 10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                    <span style={{ color:C.muted }}>{d.label}</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", color:C.text, fontWeight:600 }}>{d.cal} kcal</span>
                  </div>
                  <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:1 }}>
                    {total>0 && [[d.prot*4,C.yellow],[d.carb*4,C.accent],[d.fat*9,C.accent2]].map(([v,col],i) => (
                      <div key={i} style={{ flex:v/total, background:col, minWidth:2 }} />
                    ))}
                    {!total && <div style={{ flex:1, background:C.border }} />}
                  </div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:3, fontFamily:"'DM Mono',monospace" }}>P {d.prot}g · C {d.carb}g · F {d.fat}g</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Outliers */}
        {outliers && (
          <div style={cardS}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>📈 Outliers</div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1, background:`${C.green}15`, borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:C.green, fontWeight:700 }}>HIGHEST</div>
                <div style={{ fontSize:18, fontWeight:800, color:C.text }}>{outliers.high.cal}</div>
                <div style={{ fontSize:11, color:C.muted }}>{outliers.high.label}</div>
              </div>
              <div style={{ flex:1, background:`${C.accent}15`, borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:C.accent, fontWeight:700 }}>LOWEST</div>
                <div style={{ fontSize:18, fontWeight:800, color:C.text }}>{outliers.low.cal}</div>
                <div style={{ fontSize:11, color:C.muted }}>{outliers.low.label}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:C.bg, minHeight:"100vh", maxWidth:480, margin:"0 auto", position:"relative" }}>
      <GlobalStyles />
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"14px 16px 10px", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:18, fontWeight:800, color:C.text }}>🥗 NutriAI</div>
          <button onClick={() => { setRec(null); setGoal(null); setActLvl(null); setStep(1); setScreen("onboard"); }} style={{ background:"none", border:"none", color:C.muted, fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
            Edit Profile
          </button>
        </div>
      </div>
      <div style={{ overflowY:"auto", paddingBottom:68 }}>
        {tab === "daily"    && <TodayScreen />}
        {tab === "plan"     && rec && <RecommendationsTab rec={rec} profile={profile} goal={goal} actLvl={actLvl} dailyLogs={dailyLogs} />}
        {tab === "progress" && <ProgressScreen />}
      </div>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, height:68, background:C.card, borderTop:`1px solid ${C.border}`, display:"flex", zIndex:20 }}>
        {[["daily","📋","Today"],["plan","🎯","Plan"],["progress","📊","Progress"]].map(([id,ico,lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{ ...navS(tab===id), display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <span style={{ fontSize:18 }}>{ico}</span>
            <span>{lbl}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

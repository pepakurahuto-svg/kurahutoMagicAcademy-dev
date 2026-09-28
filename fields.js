// フィールドマスター
const FIELD_MASTER = {
  fire_volcano_01: { name: "灼熱の火山洞窟", effect: "火属性魔法の威力＋20%" },
  wind_training_01: { name: "風の訓練場", effect: "行動速度＋10%" },
  earth_training_01: { name: "土の演習場", effect: "防御力＋10%" },
  dark_corridor_01: { name: "闇の回廊", effect: "闇属性魔法の威力＋10%" },
};

// 重み（40,30,20,10）
const FIELD_WEIGHTS = [
  { id: "fire_volcano_01", weight: 40 },
  { id: "wind_training_01", weight: 30 },
  { id: "earth_training_01", weight: 20 },
  { id: "dark_corridor_01", weight: 10 },
];

// フィールドID一覧（ランダム選択用）
const FIELD_IDS = Object.keys(FIELD_MASTER);

// 日付 YYYY-MM-DD
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

// slot の開始時刻
function getSlotStart(date, slot) {
  const d = new Date(date);
  d.setHours(slot * 6, 0, 0, 0);
  return d;
}

// Firestore から slot 情報を取得
async function fetchSlotField(dateStr, slot) {
  const docId = `${dateStr}-slot${slot}`;
  const ref = db.collection("battle_fields").doc(docId);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

// 現在＋未来4つのフィールド情報を表示
async function loadFieldDisplay() {
  const now = new Date();
  const currentSlot = Math.floor(now.getHours() / 6);

  const slotList = [];

  let d = new Date(now);

  // 現在＋未来4つ → 合計5スロット
  for (let i = 0; i < 5; i++) {
    const slot = Math.floor(d.getHours() / 6);
    const dateStr = formatDate(d);

    const start = getSlotStart(d, slot);
    const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);

    const slotData = await fetchSlotField(dateStr, slot);

    let fieldInfo;
    if (!slotData) {
      fieldInfo = { name: "未設定", effect: "なし" };
    } else {
      fieldInfo = FIELD_MASTER[slotData.fieldId] || {
        name: slotData.fieldId,
        effect: "効果未設定"
      };
    }

    slotList.push({
      start,
      end,
      field: fieldInfo
    });

    d = new Date(end);
  }

  // 現在の学院付与
  const nowField = slotList[0];
  document.getElementById("fieldsNowText").innerHTML =
    `${formatTime(nowField.start)} ～ ${formatTime(nowField.end)}　　フィールド名：${nowField.field.name}　　効果：${nowField.field.effect}`;

  // 今後の学院付与（未来4つ）
  const futureArea = document.getElementById("fieldsFutureText");
  futureArea.innerHTML = "";

  for (let i = 1; i < slotList.length; i++) {
    const s = slotList[i];

    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    div.innerHTML = `
      ${formatTime(s.start)} ～ ${formatTime(s.end)}　　フィールド名：${s.field.name}　　効果：${s.field.effect}
    `;

    futureArea.appendChild(div);
  }
}

// 時刻表示
function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
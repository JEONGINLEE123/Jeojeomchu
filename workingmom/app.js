const STORAGE_KEY = "doran-chores-v1";
const DEVICE_MEMBER_KEY = "doran-device-member-v1";
const PENDING_REPLACE_KEY = "doran-pending-replace-v1";
const DEVICE_LOGGED_OUT_KEY = "doran-device-logged-out-v1";
const INSTALL_HINT_DISMISSED_KEY = "doran-install-hint-dismissed-v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const SHOPPING_CATEGORIES = { food: "식품", baby: "육아", living: "생활", other: "기타" };
const FINANCE_CATEGORIES = {
  food: "식비", baby: "육아", living: "생활용품", transport: "교통",
  housing: "주거·공과금", medical: "의료", leisure: "여가", education: "교육", other: "기타",
};
const PAYMENT_METHODS = { card: "카드", cash: "현금", transfer: "계좌이체", other: "기타", unknown: "미확인" };
const QUICK_SHOPPING_ITEMS = [
  { name: "우유", category: "food" },
  { name: "계란", category: "food" },
  { name: "기저귀", category: "baby" },
  { name: "물티슈", category: "baby" },
  { name: "휴지", category: "living" },
  { name: "세제", category: "living" },
];

const TASKS = [
  {
    id: "ventilation",
    title: "환기",
    category: "living",
    icon: "wind",
    kind: "group",
    recurrence: "daily",
    estimate: 5,
    description: "집 안 공기를 가볍게 바꿔요.",
    subtasks: ["거실", "안방", "컴퓨터방"],
  },
  { id: "dishes", title: "설거지", category: "kitchen", icon: "dish", kind: "action", recurrence: "daily", estimate: 12, description: "싱크대에 남은 그릇을 정리해요." },
  { id: "table", title: "식탁 닦기", category: "kitchen", icon: "table", kind: "action", recurrence: "daily", estimate: 3, description: "식사 자리를 산뜻하게 닦아요." },
  { id: "vacuum", title: "바닥 쓸기", category: "floor", icon: "vacuum", kind: "action", recurrence: "daily", estimate: 12, description: "청소기로 눈에 띄는 먼지를 정리해요." },
  { id: "mat-wipe", title: "매트 닦기", category: "floor", icon: "mat", kind: "action", recurrence: "daily", estimate: 5, description: "평소 생긴 얼룩만 가볍게 닦아요." },
  { id: "toy-disinfect", title: "부름이 장난감 소독", category: "baby", icon: "toy", kind: "action", recurrence: "window", minDays: 2, maxDays: 3, estimate: 10, description: "자주 만지는 장난감을 소독해요." },
  { id: "mat-disinfect", title: "매트 소독", category: "floor", icon: "sparkle", kind: "action", recurrence: "window", minDays: 2, maxDays: 3, estimate: 8, description: "소독티슈로 매트 전체를 닦아요." },
  { id: "floor-mop", title: "바닥 걸레질", category: "floor", icon: "mop", kind: "action", recurrence: "window", minDays: 2, maxDays: 3, estimate: 15, description: "바닥을 한 번 깨끗하게 닦아요." },
  { id: "laundry-organize", title: "빨랫감 정리", category: "laundry", icon: "shirt", kind: "check", recurrence: "window", minDays: 2, maxDays: 3, estimate: 12, description: "마른 빨래를 개고 뒹구는 옷을 정리해요." },
  { id: "boil-water", title: "물 끓이기", category: "kitchen", icon: "kettle", kind: "action", recurrence: "window", minDays: 2, maxDays: 3, estimate: 8, description: "필요한 만큼 물을 끓여 준비해요." },
  {
    id: "laundry-bureumi",
    title: "부름이 빨래",
    category: "baby",
    icon: "washer",
    kind: "check-group",
    recurrence: "window",
    minDays: 2,
    maxDays: 3,
    estimate: 25,
    description: "부름이 손수건과 옷은 각각 세탁망에 넣어서 돌려요.",
    subtasks: ["손수건 세탁망", "옷 세탁망", "세탁"],
  },
  {
    id: "laundry-whites",
    title: "수건·속옷·흰옷 빨래",
    category: "laundry",
    icon: "washer",
    kind: "check",
    recurrence: "window",
    minDays: 2,
    maxDays: 3,
    estimate: 30,
    description: "수건과 속옷, 흰옷을 모아 함께 세탁해요.",
  },
  {
    id: "bottle-sterilize",
    title: "젖병·아기용품 소독",
    category: "baby",
    icon: "bottle",
    kind: "conditional",
    recurrence: "conditional",
    estimate: 15,
    description: "사용한 젖병과 쪽쪽이, 치발기를 함께 삶아요.",
    subtasks: ["젖병", "쪽쪽이", "치발기"],
  },
  { id: "window-frame", title: "창틀 닦기", category: "living", icon: "window", kind: "action", recurrence: "weekly", intervalDays: 7, estimate: 15, description: "눈에 띄는 먼지부터 한 칸씩 닦아요." },
  { id: "computer-room", title: "컴퓨터방 점검", category: "organize", icon: "computer", kind: "check", recurrence: "weekly", intervalDays: 7, estimate: 10, description: "치울 것이 있는지 먼저 둘러봐요." },
  { id: "drawer", title: "서랍장 속 옷 정리", category: "organize", icon: "drawer", kind: "timer", recurrence: "weekly", intervalDays: 7, estimate: 10, timerMinutes: 10, description: "전부 끝내지 않아도 괜찮아요. 딱 10분만 정리해요." },
  { id: "trash", title: "쓰레기통 비우기", category: "living", icon: "trash", kind: "check-group", recurrence: "weekly", intervalDays: 7, estimate: 10, description: "찬 곳만 골라 비워도 괜찮아요.", subtasks: ["거실", "안방", "재활용"] },
  { id: "stove", title: "가스레인지 쪽 청소", category: "kitchen", icon: "stove", kind: "action", recurrence: "weekly", intervalDays: 7, estimate: 15, description: "눌어붙기 전에 주변 기름때를 닦아요." },
  { id: "work-clothes", title: "검정옷 빨래", category: "laundry", icon: "shirt", kind: "check", recurrence: "weekly", intervalDays: 7, estimate: 25, description: "아빠 작업복과 검정옷을 모아 세탁해요." },
  { id: "bedding", title: "침구 세탁", category: "laundry", icon: "bed", kind: "group", recurrence: "biweekly", intervalDays: 14, estimate: 45, description: "세탁 후 건조는 빨래방에서 해요.", subtasks: ["침구 세탁", "빨래방 건조"] },
  { id: "under-mattress", title: "매트리스 아래 청소", category: "floor", icon: "bed", kind: "group", recurrence: "biweekly", intervalDays: 14, estimate: 30, description: "둘이 함께하면 훨씬 수월해요.", subtasks: ["매트리스 걷기", "바닥 쓸기", "바닥 닦기"] },
  { id: "bathroom", title: "화장실 청소", category: "bathroom", icon: "bath", kind: "action", recurrence: "monthly", estimate: 35, description: "한 달에 한 번, 전체를 산뜻하게 청소해요." },
  { id: "storage", title: "창고 정리", category: "organize", icon: "box", kind: "timer", recurrence: "monthly", estimate: 15, timerMinutes: 15, description: "한 번에 다 하지 말고 15분만 이어서 해요." },
];

const SEED_AGES = {
  "toy-disinfect": 3,
  "mat-disinfect": 1,
  "floor-mop": 0,
  "laundry-organize": 2,
  "boil-water": 1,
  "laundry-bureumi": 0,
  "laundry-whites": 0,
  "window-frame": 5,
  "computer-room": 3,
  drawer: 4,
  trash: 7,
  stove: 2,
  "work-clothes": 1,
  bedding: 10,
  "under-mattress": 9,
  bathroom: 18,
  storage: 12,
};

const CATEGORY_LABELS = {
  living: "생활",
  kitchen: "주방",
  floor: "바닥",
  laundry: "세탁",
  baby: "부름이",
  organize: "정리",
  bathroom: "욕실",
};

const RECURRENCE_LABELS = {
  daily: "매일",
  window: "2~3일",
  weekly: "매주",
  biweekly: "2주마다",
  monthly: "매월",
  interval: "직접 정한 간격",
  weekdays: "특정 요일",
  conditional: "조건부",
};

const ICONS = {
  wind: "⌁",
  dish: "◒",
  table: "▤",
  vacuum: "⌇",
  mat: "▭",
  toy: "✿",
  sparkle: "✦",
  mop: "♢",
  shirt: "♙",
  kettle: "♨",
  washer: "◉",
  bottle: "♧",
  window: "▦",
  computer: "▣",
  drawer: "▥",
  trash: "⌑",
  stove: "♨",
  bed: "▱",
  bath: "≋",
  box: "◇",
};

const HAD_SAVED_STATE = Boolean(localStorage.getItem(STORAGE_KEY));
let state = loadState();
const USE_REMOTE_SERVER = /^https?:$/.test(window.location.protocol);
let auth = {
  ready: !USE_REMOTE_SERVER,
  authenticated: !USE_REMOTE_SERVER,
  error: "",
};
let remoteStream = null;
let connectionAvailable = navigator.onLine;
let remotePushInFlight = false;
let remotePushQueued = false;
let serviceWorkerRegistration = null;
let pushInfo = { supported: false, enabled: false, permission: typeof Notification === "undefined" ? "unsupported" : Notification.permission, loading: false };
let syncInfo = { status: navigator.onLine ? "idle" : "offline", lastSyncedAt: 0 };
let deferredInstallPrompt = null;
let updateAvailable = false;
let backupSnapshots = { loading: false, loaded: false, items: [], error: "" };
let financeInfo = { aiEnabled: null, analyzing: false };
let ui = {
  page: "today",
  filter: "all",
  historyDate: operationalDate(),
  historyMonth: operationalDate().slice(0, 7),
  modal: null,
  modalData: null,
  completionMember: state.currentMember,
  shoppingTrip: false,
  settingsSection: "",
  financeMonth: operationalDate().slice(0, 7),
};

let channel = null;
if ("BroadcastChannel" in window) {
  channel = new BroadcastChannel("doran-chores-sync");
  channel.addEventListener("message", (event) => {
    if (!event.data || event.data.source === state.clientId) return;
    const incoming = event.data.state;
    if (incoming && incoming.updatedAt > state.updatedAt) {
      const currentMember = state.currentMember;
      const clientId = state.clientId;
      state = normalizeState(incoming, { currentMember, clientId });
      render();
      toast("상대방 화면의 변경사항을 반영했어요.");
    }
  });
}

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  const incoming = JSON.parse(event.newValue);
  if (incoming.updatedAt > state.updatedAt) {
    const currentMember = state.currentMember;
    const clientId = state.clientId;
    state = normalizeState(incoming, { currentMember, clientId });
    render();
  }
});

function makeInitialState() {
  const now = Date.now();
  const baselineEvents = Object.entries(SEED_AGES).map(([taskId, days], index) => ({
    id: `baseline-${taskId}`,
    taskId,
    eventType: "baseline",
    memberId: null,
    createdAt: new Date(now - days * DAY_MS - index * 60000).toISOString(),
    note: "",
  }));

  return {
    version: 9,
    clientId: `client-${Math.random().toString(36).slice(2)}`,
    updatedAt: now,
    startedAt: new Date(now).toISOString(),
    currentMember: "wife",
    household: {
      wifeName: "엄마",
      husbandName: "아빠",
      dayStart: 4,
      showStats: true,
      morningAlert: "09:00",
      eveningAlert: "20:30",
      partnerAlerts: false,
      bottlePromptDismissedOn: "",
      workSchedule: {
        wife: { nightDays: [1, 2], start: "23:00", end: "08:00", recoveryEnd: "18:00" },
        husband: { start: "10:30", end: "21:30", daysOff: [] },
      },
    },
    events: baselineEvents,
    claims: {},
    postponed: {},
    subtaskProgress: {},
    taskOverrides: {},
    customTasks: [],
    shoppingItems: [],
    shoppingHistory: [],
    expenses: [],
    recurringExpenses: [],
    financeSettings: { monthlyBudget: 0 },
    deletedEventIds: {},
    shoppingDeletedIds: {},
    expenseDeletedIds: {},
    recurringExpenseDeletedIds: {},
    syncMeta: { fields: {}, objects: {} },
    notificationSummary: { date: "", remaining: 0, overdue: 0, titles: [], needsDaysOff: false, wifeRecovering: false, recoveryUntil: "" },
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const initial = makeInitialState();
      const deviceMember = localStorage.getItem(DEVICE_MEMBER_KEY);
      if (["wife", "husband"].includes(deviceMember)) initial.currentMember = deviceMember;
      return initial;
    }
    const parsed = JSON.parse(saved);
    const deviceMember = localStorage.getItem(DEVICE_MEMBER_KEY);
    return normalizeState(parsed, {
      clientId: `client-${Math.random().toString(36).slice(2)}`,
      currentMember: ["wife", "husband"].includes(deviceMember) ? deviceMember : parsed.currentMember,
    });
  } catch (error) {
    console.warn("저장된 데이터를 불러오지 못했습니다.", error);
    return makeInitialState();
  }
}

function migrateState(input = {}) {
  const migrated = JSON.parse(JSON.stringify(input || {}));
  const version = Number(migrated.version || 1);
  const legacyEvents = Array.isArray(migrated.events) ? migrated.events.filter((event) => event.taskId === "laundry-batches") : [];
  if (version < 4 || legacyEvents.length) {
    const otherEvents = Array.isArray(migrated.events) ? migrated.events.filter((event) => event.taskId !== "laundry-batches") : [];
    for (const event of legacyEvents) {
      for (const taskId of ["laundry-bureumi", "laundry-whites"]) {
        const id = `${event.id}-${taskId}`;
        if (!otherEvents.some((candidate) => candidate.id === id)) otherEvents.push({ ...event, id, taskId });
      }
    }
    migrated.events = otherEvents;

    for (const field of ["claims", "postponed"]) {
      if (migrated[field]?.["laundry-batches"]) {
        migrated[field]["laundry-bureumi"] = { ...migrated[field]["laundry-batches"] };
        migrated[field]["laundry-whites"] = { ...migrated[field]["laundry-batches"] };
        delete migrated[field]["laundry-batches"];
      }
    }
    const oldProgress = migrated.subtaskProgress?.["laundry-batches"];
    if (oldProgress) {
      migrated.subtaskProgress["laundry-bureumi"] = { 0: Boolean(oldProgress[2]), 1: Boolean(oldProgress[3]), 2: false };
      migrated.subtaskProgress["laundry-whites"] = { 0: Boolean(oldProgress[0]) && Boolean(oldProgress[1]) };
      delete migrated.subtaskProgress["laundry-batches"];
    }
  }
  if (!migrated.startedAt) {
    const recordedDates = (migrated.events || [])
      .filter((event) => event.eventType !== "baseline" && event.createdAt)
      .map((event) => new Date(event.createdAt).getTime())
      .filter(Number.isFinite);
    migrated.startedAt = new Date(recordedDates.length ? Math.min(...recordedDates) : Date.now()).toISOString();
  }
  if (!Array.isArray(migrated.shoppingHistory)) migrated.shoppingHistory = [];
  if (version < 8) {
    migrated.household ||= {};
    migrated.household.workSchedule ||= {};
    migrated.household.workSchedule.wife ||= {};
    migrated.household.workSchedule.wife.nightDays = [1, 2];
    migrated.household.workSchedule.wife.recoveryEnd = "18:00";
  }
  if (version < 9) {
    migrated.expenses ||= [];
    migrated.recurringExpenses ||= [];
    migrated.financeSettings ||= { monthlyBudget: 0 };
    migrated.expenseDeletedIds ||= {};
    migrated.recurringExpenseDeletedIds ||= {};
  }
  migrated.version = 9;
  return migrated;
}

function normalizeState(input = {}, overrides = {}) {
  input = migrateState(input);
  const base = makeInitialState();
  const household = input.household || {};
  const workSchedule = household.workSchedule || {};
  const isLegacy = Number(input.version || 1) < 2;
  const timestamp = Number(input.updatedAt || Date.now());
  const shoppingItems = (Array.isArray(input.shoppingItems) ? input.shoppingItems : []).map((item) => ({
    category: "other",
    ...item,
    updatedAt: Number(item.updatedAt || new Date(item.checkedAt || item.createdAt || timestamp).getTime() || timestamp),
  }));
  const normalizeFinanceItems = (items) => (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    amount: Math.max(0, Math.round(Number(item.amount || 0))),
    updatedAt: Number(item.updatedAt || new Date(item.createdAt || timestamp).getTime() || timestamp),
  }));
  const syncMeta = {
    fields: { ...(input.syncMeta?.fields || {}) },
    objects: { ...(input.syncMeta?.objects || {}) },
  };
  for (const field of ["claims", "postponed", "subtaskProgress", "taskOverrides"]) {
    syncMeta.objects[field] = { ...(syncMeta.objects[field] || {}) };
    for (const key of Object.keys(input[field] || {})) syncMeta.objects[field][key] ||= timestamp;
  }
  syncMeta.fields.household ||= timestamp;
  syncMeta.fields.customTasks ||= timestamp;
  syncMeta.fields.shoppingHistory ||= timestamp;
  syncMeta.fields.financeSettings ||= timestamp;

  return {
    ...base,
    ...input,
    ...overrides,
    version: 9,
    household: {
      ...base.household,
      ...household,
      wifeName: isLegacy && household.wifeName === "아내" ? "엄마" : (household.wifeName || base.household.wifeName),
      husbandName: isLegacy && household.husbandName === "남편" ? "아빠" : (household.husbandName || base.household.husbandName),
      workSchedule: {
        wife: { ...base.household.workSchedule.wife, ...(workSchedule.wife || {}) },
        husband: { ...base.household.workSchedule.husband, ...(workSchedule.husband || {}) },
      },
    },
    events: Array.isArray(input.events) ? input.events : base.events,
    customTasks: Array.isArray(input.customTasks) ? input.customTasks : [],
    shoppingItems,
    shoppingHistory: (Array.isArray(input.shoppingHistory) ? input.shoppingHistory : []).slice(0, 40),
    expenses: normalizeFinanceItems(input.expenses),
    recurringExpenses: normalizeFinanceItems(input.recurringExpenses),
    financeSettings: { ...base.financeSettings, ...(input.financeSettings || {}) },
    deletedEventIds: { ...(input.deletedEventIds || {}) },
    shoppingDeletedIds: { ...(input.shoppingDeletedIds || {}) },
    expenseDeletedIds: { ...(input.expenseDeletedIds || {}) },
    recurringExpenseDeletedIds: { ...(input.recurringExpenseDeletedIds || {}) },
    syncMeta,
    notificationSummary: { ...base.notificationSummary, ...(input.notificationSummary || {}) },
  };
}

function jsonChanged(left, right) {
  return JSON.stringify(left) !== JSON.stringify(right);
}

function stampStateChanges(previous, now) {
  state.syncMeta ||= { fields: {}, objects: {} };
  state.syncMeta.fields ||= {};
  state.syncMeta.objects ||= {};
  for (const field of ["household", "customTasks", "shoppingHistory", "financeSettings"]) {
    if (jsonChanged(previous?.[field], state[field])) state.syncMeta.fields[field] = now;
  }
  for (const field of ["claims", "postponed", "subtaskProgress", "taskOverrides"]) {
    state.syncMeta.objects[field] ||= {};
    const before = previous?.[field] || {};
    const after = state[field] || {};
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      if (jsonChanged(before[key], after[key])) state.syncMeta.objects[field][key] = now;
    }
  }

  const currentEventIds = new Set((state.events || []).map((event) => event.id));
  state.deletedEventIds ||= {};
  for (const event of previous?.events || []) {
    if (!currentEventIds.has(event.id)) state.deletedEventIds[event.id] = now;
  }

  const previousShopping = new Map((previous?.shoppingItems || []).map((item) => [item.id, item]));
  const currentShoppingIds = new Set((state.shoppingItems || []).map((item) => item.id));
  state.shoppingDeletedIds ||= {};
  for (const item of state.shoppingItems || []) {
    if (jsonChanged(previousShopping.get(item.id), item)) item.updatedAt = now;
  }
  for (const item of previous?.shoppingItems || []) {
    if (!currentShoppingIds.has(item.id)) state.shoppingDeletedIds[item.id] = now;
  }

  for (const [itemsField, deletedField] of [["expenses", "expenseDeletedIds"], ["recurringExpenses", "recurringExpenseDeletedIds"]]) {
    const before = new Map((previous?.[itemsField] || []).map((item) => [item.id, item]));
    const currentIds = new Set((state[itemsField] || []).map((item) => item.id));
    state[deletedField] ||= {};
    for (const item of state[itemsField] || []) if (jsonChanged(before.get(item.id), item)) item.updatedAt = now;
    for (const item of previous?.[itemsField] || []) if (!currentIds.has(item.id)) state[deletedField][item.id] = now;
  }
}

function saveState(message, options = {}) {
  let previous = null;
  try { previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { previous = null; }
  const now = Date.now();
  stampStateChanges(previous, now);
  state.version = 9;
  state.updatedAt = now;
  state.notificationSummary = buildNotificationSummary();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (channel) channel.postMessage({ source: state.clientId, state });
  syncInfo.status = USE_REMOTE_SERVER ? (navigator.onLine ? "saving" : "offline") : "local";
  pushRemoteState();
  render();
  if (message) toast(message, options);
}

async function pushRemoteState() {
  if (!USE_REMOTE_SERVER || !auth.authenticated) return;
  remotePushQueued = true;
  syncInfo.status = navigator.onLine ? "saving" : "offline";
  if (remotePushInFlight) return;
  remotePushInFlight = true;
  while (remotePushQueued) {
    remotePushQueued = false;
    const snapshot = JSON.parse(JSON.stringify(state));
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      if (response.status === 401) {
        showLoginAgain();
        break;
      }
      if (response.ok) {
        const result = await response.json();
        syncInfo = { status: "synced", lastSyncedAt: Date.now() };
        if (result?.state && state.updatedAt <= snapshot.updatedAt) applyRemoteState(result.state, false);
        else if (state.updatedAt > snapshot.updatedAt) remotePushQueued = true;
      }
    } catch (error) {
      remotePushQueued = true;
      connectionAvailable = false;
      syncInfo.status = "offline";
      if (auth.authenticated) render();
      console.info("인터넷이 연결되면 변경사항을 다시 공유합니다.");
      break;
    }
  }
  remotePushInFlight = false;
}

async function initRemoteSync() {
  if (!USE_REMOTE_SERVER || !auth.authenticated) return;
  try {
    const response = await fetch("/api/state");
    if (response.status === 401) return showLoginAgain();
    if (!response.ok) return;
    connectionAvailable = true;
    syncInfo = { status: "synced", lastSyncedAt: Date.now() };
    const remote = await response.json();
    if (remote?.state && (!HAD_SAVED_STATE || remote.state.updatedAt > state.updatedAt)) {
      applyRemoteState(remote.state, false);
    } else if (!remote?.state) {
      pushRemoteState();
    }

    refreshNotificationSummary();

    if (remoteStream) remoteStream.close();
    remoteStream = new EventSource("/api/events");
    remoteStream.addEventListener("open", () => {
      syncInfo = { status: "synced", lastSyncedAt: Date.now() };
      if (!connectionAvailable) {
        connectionAvailable = true;
        render();
      }
    });
    remoteStream.addEventListener("error", () => {
      syncInfo.status = "offline";
      if (connectionAvailable) {
        connectionAvailable = false;
        render();
      }
    });
    remoteStream.addEventListener("state", (event) => {
      const incoming = JSON.parse(event.data);
      if (incoming.clientId === state.clientId || incoming.updatedAt <= state.updatedAt) return;
      syncInfo = { status: "synced", lastSyncedAt: Date.now() };
      applyRemoteState(incoming, true);
    });
  } catch (error) {
    connectionAvailable = false;
    syncInfo.status = "offline";
    if (auth.authenticated) render();
    console.info("공동 서버 연결 없이 로컬 모드로 시작합니다.");
  }
}

function refreshNotificationSummary() {
  const summary = buildNotificationSummary();
  if (jsonChanged(summary, state.notificationSummary)) {
    state.notificationSummary = summary;
    saveState();
  }
}

function showLoginAgain() {
  if (remoteStream) remoteStream.close();
  remoteStream = null;
  auth = { ready: true, authenticated: false, error: "자동 로그인 기간이 끝났어요. 다시 로그인해 주세요." };
  render();
}

async function initializeSession() {
  if (!USE_REMOTE_SERVER) {
    render();
    return;
  }
  render();
  try {
    const response = await fetch("/api/session", { cache: "no-store" });
    auth.ready = true;
    auth.authenticated = response.ok;
    connectionAvailable = true;
    if (response.ok) localStorage.removeItem(DEVICE_LOGGED_OUT_KEY);
    render();
    if (response.ok) {
      await flushPendingReplacement();
      initRemoteSync();
      syncPushMember();
      if (ui.page === "settings") loadBackupSnapshots();
    }
  } catch {
    connectionAvailable = false;
    const mayUseLocalCopy = localStorage.getItem(DEVICE_LOGGED_OUT_KEY) !== "1" && Boolean(localStorage.getItem(STORAGE_KEY));
    auth = mayUseLocalCopy
      ? { ready: true, authenticated: true, error: "" }
      : { ready: true, authenticated: false, error: "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." };
    render();
  }
}

function applyRemoteState(incoming, announce) {
  const currentMember = state.currentMember;
  const clientId = state.clientId;
  state = normalizeState(incoming, { currentMember, clientId });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncInfo = { status: "synced", lastSyncedAt: Date.now() };
  render();
  if (announce) toast("상대방의 변경사항이 바로 반영됐어요.");
}

function pushStatusText() {
  if (!USE_REMOTE_SERVER) return "배포된 주소에서 알림을 연결할 수 있어요.";
  if (pushInfo.permission === "denied") return "브라우저 설정에서 이 사이트의 알림 권한을 다시 허용해 주세요.";
  if (!pushInfo.supported) return "이 브라우저에서는 푸시 알림을 사용할 수 없어요. 홈 화면에 설치한 뒤 다시 확인해 주세요.";
  if (pushInfo.enabled && memberScheduleStatus("wife").recovering && state.currentMember === "wife") return `${clockLabel(state.household.workSchedule.wife.recoveryEnd || "18:00")}까지 회복 시간이라 알림을 쉬어요.`;
  if (pushInfo.enabled) return `오전 ${state.household.morningAlert} 요약과 저녁 남은 일 알림을 받아요.`;
  return "한 번만 허용하면 앱을 닫아도 정한 시각에 알려드려요.";
}

async function registerAppWorker() {
  if (!USE_REMOTE_SERVER || !("serviceWorker" in navigator)) return;
  try {
    const hadServiceWorkerController = Boolean(navigator.serviceWorker.controller);
    serviceWorkerRegistration = await navigator.serviceWorker.register("/sw.js");
    serviceWorkerRegistration.addEventListener("updatefound", () => {
      const worker = serviceWorkerRegistration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          updateAvailable = true;
          if (auth.authenticated) render();
        }
      });
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadServiceWorkerController) {
        updateAvailable = true;
        if (auth.authenticated) render();
      }
    });
    serviceWorkerRegistration = await navigator.serviceWorker.ready;
    pushInfo.supported = "PushManager" in window && typeof Notification !== "undefined";
    pushInfo.permission = typeof Notification === "undefined" ? "unsupported" : Notification.permission;
    await refreshPushInfo();
  } catch (error) {
    pushInfo.supported = false;
    console.info("오프라인 기능을 준비하지 못했습니다.", error);
  }
}

function syncStatusText() {
  if (!USE_REMOTE_SERVER) return "이 기기에 저장됨";
  if (!connectionAvailable || syncInfo.status === "offline") return "오프라인 · 연결 후 전송";
  if (syncInfo.status === "saving") return "저장 중…";
  if (syncInfo.lastSyncedAt) return "방금 동기화됨";
  return "공동 서버 연결됨";
}

async function refreshPushInfo(shouldRender = true) {
  if (!serviceWorkerRegistration || !pushInfo.supported) return;
  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    pushInfo.enabled = Boolean(subscription);
    pushInfo.permission = Notification.permission;
  } catch {
    pushInfo.enabled = false;
  }
  if (shouldRender && auth.authenticated) render();
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

async function syncPushMember() {
  if (!serviceWorkerRegistration || !auth.authenticated) return;
  const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
  if (!subscription) return;
  try {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON(), memberId: state.currentMember }),
    });
  } catch {}
}

async function enablePushNotifications() {
  if (pushInfo.loading || !pushInfo.supported || !serviceWorkerRegistration) return;
  pushInfo.loading = true;
  render();
  try {
    const permission = await Notification.requestPermission();
    pushInfo.permission = permission;
    if (permission !== "granted") throw new Error("permission_denied");
    const configResponse = await fetch("/api/push/config", { cache: "no-store" });
    const config = await configResponse.json();
    if (!configResponse.ok || !config.enabled || !config.publicKey) throw new Error("push_unavailable");
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey),
      });
    }
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON(), memberId: state.currentMember }),
    });
    if (!response.ok) throw new Error("subscribe_failed");
    pushInfo.enabled = true;
    toast("이 기기에서 알림을 받을 수 있어요.");
  } catch (error) {
    toast(error.message === "permission_denied" ? "알림 권한이 허용되지 않았어요." : "알림을 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
  } finally {
    pushInfo.loading = false;
    render();
  }
}

async function disablePushNotifications() {
  if (!serviceWorkerRegistration) return;
  const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
  if (!subscription) return refreshPushInfo();
  try {
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
    pushInfo.enabled = false;
    render();
    toast("이 기기의 알림을 껐어요.");
  } catch {
    toast("알림을 끄지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}

async function testPushNotification() {
  if (!serviceWorkerRegistration) return;
  const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
  if (!subscription) return toast("먼저 알림을 켜주세요.");
  try {
    const response = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    toast(response.ok ? "시험 알림을 보냈어요." : "시험 알림을 보내지 못했어요.");
  } catch {
    toast("인터넷 연결을 확인해 주세요.");
  }
}

function allTasks() {
  return [...TASKS, ...state.customTasks].map((task) => ({
    ...task,
    ...(state.taskOverrides[task.id] || {}),
    active: state.taskOverrides[task.id]?.active !== false,
  }));
}

function getTask(taskId) {
  return allTasks().find((task) => task.id === taskId);
}

function operationalDate(timestamp = Date.now()) {
  const date = new Date(timestamp);
  date.setHours(date.getHours() - Number(state.household.dayStart || 0));
  return localDateKey(date);
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKeyToUtc(key) {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function dateKeyPlusDays(key, days) {
  const date = new Date(dateKeyToUtc(key) + days * DAY_MS);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayDifference(fromTimestamp, toTimestamp = Date.now()) {
  const from = operationalDate(fromTimestamp);
  const to = operationalDate(toTimestamp);
  return Math.round((dateKeyToUtc(to) - dateKeyToUtc(from)) / DAY_MS);
}

function resetEventsFor(taskId) {
  return state.events
    .filter((event) => event.taskId === taskId && ["baseline", "completed", "not_needed"].includes(event.eventType))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function lastResetEvent(taskId) {
  return resetEventsFor(taskId)[0] || null;
}

function conditionalIsOpen(taskId) {
  const relevant = state.events
    .filter((event) => event.taskId === taskId && ["triggered", "completed"].includes(event.eventType))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return relevant[0]?.eventType === "triggered";
}

function getTaskStatus(task) {
  if (!task.active) return { key: "inactive", label: "비활성", age: null };
  const today = operationalDate();
  if (task.pausedUntil && today < task.pausedUntil) return { key: "postponed", label: `${formatHistoryDate(task.pausedUntil).replace("오늘 · ", "")}까지 쉼`, age: null };
  const postponement = state.postponed[task.id];
  if (postponement === today) return { key: "postponed", label: "오늘 미룸", age: null };
  if (postponement?.until && today < postponement.until) return { key: "postponed", label: "내일 하기로 함", age: null };

  if (task.recurrence === "conditional") {
    return conditionalIsOpen(task.id)
      ? { key: "due", label: "지금 필요", age: 0 }
      : { key: "future", label: "조건 없음", age: null };
  }

  const last = lastResetEvent(task.id);
  if (!last) return { key: "due", label: "처음 하는 일", age: null };
  const age = dayDifference(last.createdAt);

  if (task.recurrence === "weekdays") {
    const weekday = new Date(`${today}T12:00:00`).getDay();
    const weekdays = (task.weekdays || []).map(Number);
    if (!weekdays.includes(weekday)) return { key: "future", label: "선택 요일 아님", age };
    if (age <= 0) return { key: "future", label: "오늘 완료", age };
    return { key: "due", label: "오늘 할 일", age };
  }

  if (task.recurrence === "daily") {
    if (age <= 0) return { key: "future", label: "오늘 완료", age };
    return { key: "due", label: "오늘 할 일", age };
  }

  if (task.recurrence === "window") {
    if (age < task.minDays) return { key: "future", label: `${task.minDays - age}일 뒤`, age };
    if (age === task.minDays) return { key: "available", label: "해도 되는 일", age };
    if (age === task.maxDays) return { key: "due", label: "오늘 권장", age };
    if (age > task.maxDays) return { key: "overdue", label: `${age - task.maxDays}일 밀림`, age };
  }

  if (task.recurrence === "monthly") {
    const lastDate = new Date(last.createdAt);
    const dueDate = new Date(lastDate);
    dueDate.setMonth(dueDate.getMonth() + 1);
    const remaining = -dayDifference(dueDate.getTime());
    if (remaining > 0) return { key: "future", label: `${remaining}일 뒤`, age };
    if (remaining === 0) return { key: "due", label: "오늘 권장", age };
    return { key: "overdue", label: `${Math.abs(remaining)}일 밀림`, age };
  }

  const interval = task.intervalDays || (task.recurrence === "biweekly" ? 14 : 7);
  if (age < interval) return { key: "future", label: `${interval - age}일 뒤`, age };
  if (age === interval) return { key: "due", label: "오늘 권장", age };
  return { key: "overdue", label: `${age - interval}일 밀림`, age };
}

function dueTasks() {
  return allTasks()
    .filter((task) => task.active)
    .map((task) => ({ task, status: getTaskStatus(task) }))
    .filter(({ status }) => ["overdue", "due", "available"].includes(status.key));
}

function buildNotificationSummary() {
  const due = dueTasks();
  const wife = memberScheduleStatus("wife");
  return {
    date: operationalDate(),
    remaining: due.length,
    overdue: due.filter(({ status }) => status.key === "overdue").length,
    titles: due.slice(0, 3).map(({ task }) => task.title),
    needsDaysOff: needsDaysOffPlan(),
    wifeRecovering: Boolean(wife.recovering),
    recoveryUntil: wife.recovering ? state.household.workSchedule.wife.recoveryEnd || "18:00" : "",
  };
}

function eventsToday() {
  const today = operationalDate();
  return state.events
    .filter((event) => ["completed", "not_needed"].includes(event.eventType) && operationalDate(event.createdAt) === today)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function hasTodayCheckState() {
  const today = operationalDate();
  const hasEvents = state.events.some((event) => ["completed", "not_needed"].includes(event.eventType) && operationalDate(event.createdAt) === today);
  const hasPostponed = Object.values(state.postponed).some((value) => value === today || value?.hiddenOn === today);
  const hasSubtasks = Object.values(state.subtaskProgress).some((progress) => Object.values(progress || {}).some(Boolean));
  return hasEvents || hasPostponed || hasSubtasks;
}

function nameFor(memberId) {
  if (memberId === "wife") return state.household.wifeName || "엄마";
  if (memberId === "husband") return state.household.husbandName || "아빠";
  if (memberId === "together") return `${state.household.wifeName || "엄마"}와 ${state.household.husbandName || "아빠"}`;
  return "우리";
}

function subjectName(memberId) {
  const name = nameFor(memberId);
  const lastCode = name.charCodeAt(name.length - 1);
  const hasFinalConsonant = lastCode >= 0xac00 && lastCode <= 0xd7a3 && (lastCode - 0xac00) % 28 !== 0;
  return `${name}${hasFinalConsonant ? "이" : "가"}`;
}

function recurrenceLabel(task) {
  if (task.recurrence === "interval") return `${Number(task.intervalDays || 7)}일마다`;
  if (task.recurrence === "weekdays") {
    const names = ["일", "월", "화", "수", "목", "금", "토"];
    const selected = (task.weekdays || []).map((day) => names[Number(day)]).filter(Boolean);
    return selected.length ? `매주 ${selected.join("·")}` : "특정 요일";
  }
  return RECURRENCE_LABELS[task.recurrence] || "반복";
}

function relativeLastText(task) {
  const event = lastResetEvent(task.id);
  if (!event) return "아직 기록 없음";
  const age = dayDifference(event.createdAt);
  const verb = task.kind === "check" || task.kind === "check-group" ? "점검" : "완료";
  if (age <= 0) return `오늘 ${verb}`;
  if (age === 1) return `어제 ${verb}`;
  return `마지막 ${verb} 후 ${age}일`;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(new Date(timestamp));
}

function formatFullDate(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(date);
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "좋은 아침이에요";
  if (hour < 18) return "천천히 해도 괜찮아요";
  return "오늘도 수고했어요";
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  return hours * 60 + minutes;
}

function clockLabel(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  const date = new Date(2020, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(date);
}

function memberScheduleStatus(memberId, now = new Date()) {
  const schedules = state.household.workSchedule;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay();

  if (memberId === "wife") {
    const schedule = schedules.wife;
    const nightDays = (schedule.nightDays || []).map(Number);
    const start = timeToMinutes(schedule.start);
    const end = timeToMinutes(schedule.end);
    const recoveryEnd = timeToMinutes(schedule.recoveryEnd || "18:00");
    const previousDay = (day + 6) % 7;
    const finishingPreviousShift = nightDays.includes(previousDay) && currentMinutes < end;
    const recoveryDay = nightDays.includes(previousDay);
    const recovering = recoveryDay && currentMinutes >= end && currentMinutes < recoveryEnd;
    const startedTonight = nightDays.includes(day) && currentMinutes >= start;
    if (finishingPreviousShift) return { working: true, recovering: false, lightOnly: false, dayOff: false, tone: "busy", label: `근무 중 · ${clockLabel(schedule.end)} 퇴근` };
    if (recovering) return { working: false, recovering: true, lightOnly: false, dayOff: false, tone: "recovery", label: `야간근무 후 회복 · ${clockLabel(schedule.recoveryEnd || "18:00")}까지` };
    if (startedTonight) return { working: true, recovering: false, lightOnly: false, dayOff: false, tone: "busy", label: `근무 중 · 내일 ${clockLabel(schedule.end)} 퇴근` };
    if (nightDays.includes(day) && recoveryDay) return { working: false, recovering: false, lightOnly: true, dayOff: false, tone: "soon", label: `오늘 ${clockLabel(schedule.start)} 출근 · 가벼운 일만` };
    if (nightDays.includes(day)) return { working: false, recovering: false, lightOnly: false, dayOff: false, tone: "soon", label: `오늘 ${clockLabel(schedule.start)} 출근` };
    return { working: false, recovering: false, lightOnly: false, dayOff: true, tone: "free", label: "오늘 야간근무 없음" };
  }

  const schedule = schedules.husband;
  if ((schedule.daysOff || []).includes(localDateKey(now))) {
    return { working: false, dayOff: true, tone: "free", label: "오늘 휴무" };
  }
  const start = timeToMinutes(schedule.start);
  const end = timeToMinutes(schedule.end);
  if (currentMinutes < start) return { working: false, dayOff: false, tone: "soon", label: `${clockLabel(schedule.start)} 출근 전` };
  if (currentMinutes < end) return { working: true, dayOff: false, tone: "busy", label: `근무 중 · ${clockLabel(schedule.end)} 퇴근` };
  return { working: false, dayOff: false, tone: "free", label: "오늘 근무 마침" };
}

function isWifeRecoveryDate(dateKey) {
  const day = new Date(`${dateKey}T12:00:00`).getDay();
  const previousDay = (day + 6) % 7;
  return (state.household.workSchedule.wife.nightDays || []).map(Number).includes(previousDay);
}

function taskTimingHint(task) {
  const wife = memberScheduleStatus("wife");
  const husband = memberScheduleStatus("husband");
  const isHeavy = Number(task.estimate || 0) >= 25 || ["group", "check-group"].includes(task.kind);

  if (wife.recovering) {
    if (!husband.working) return `지금은 ${subjectName("husband")} 먼저 살펴보기 좋아요`;
    return isHeavy
      ? `${nameFor("wife")} 회복 시간 · 무거운 일은 다음 여유일에 해요`
      : `${nameFor("wife")} 회복 시간 · 오후 6시 이후 살펴봐요`;
  }
  if (wife.lightOnly) {
    return isHeavy
      ? `${nameFor("wife")} 오늘 밤 근무 · 무거운 일은 다음 여유일에 해요`
      : `${nameFor("wife")} 밤 11시 출근 · 가벼운 일만 해요`;
  }
  if (isHeavy) {
    if (husband.dayOff && !wife.working) return `오늘은 ${nameFor("wife")}·${nameFor("husband")}가 함께하기 좋아요`;
    if (husband.working) return `${nameFor("husband")} 퇴근 후 함께하면 수월해요`;
    if (wife.working && !husband.working) return `지금은 ${subjectName("husband")} 먼저 살펴보기 좋아요`;
    return "둘이 나눠 하기 좋은 일이에요";
  }
  if (wife.working && !husband.working) return `지금은 ${subjectName("husband")} 가능한 시간이에요`;
  if (husband.working && !wife.working) return `지금은 ${subjectName("wife")} 가능한 시간이에요`;
  if (husband.dayOff) return `${nameFor("husband")} 휴무일 · 여유 있을 때 해요`;
  if (wife.tone === "soon") return `${nameFor("wife")} 야간근무일 · 무리하지 않기`;
  return "";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function navIcon(name) {
  const paths = {
    today: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9 20v-6h6v6"/>',
    all: '<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="3" cy="6" r=".4"/><circle cx="3" cy="12" r=".4"/><circle cx="3" cy="18" r=".4"/>',
    shopping: '<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>',
    finance: '<path d="M4 7h16v12H4z"/><path d="M16 11h4v4h-4a2 2 0 1 1 0-4ZM7 7V5h10v2"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1v.1h-4v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4h-.1v-4H3a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1v-.1h4V3a1.7 1.7 0 0 0 1.1 1.6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.37.37.7.6 1 .27.3.62.4 1 .4h.1v4H21a1.7 1.7 0 0 0-1.6.6Z"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function render() {
  const app = document.getElementById("app");
  if (!auth.ready) {
    app.innerHTML = renderAuthLoading();
    return;
  }
  if (!auth.authenticated) {
    app.innerHTML = renderLogin();
    return;
  }
  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      ${renderSystemBanner()}
      <main class="main">${renderPage()}</main>
      ${renderBottomNav()}
    </div>
  `;
  renderModal();
}

function renderAuthLoading() {
  return `<main class="auth-page"><section class="auth-card auth-loading"><span class="brand-mark"></span><p>우리 집을 불러오는 중이에요…</p></section></main>`;
}

function renderLogin() {
  return `
    <main class="auth-page">
      <section class="auth-card">
        <div class="auth-brand"><span class="brand-mark"></span><div><small>Our little home</small><strong>도란도란</strong></div></div>
        <div class="auth-copy"><p class="eyebrow">우리 가족만 들어와요</p><h1>다시 만나 반가워요</h1><p>한 번 로그인하면 이 기기에서는 90일 동안 자동으로 연결돼요.</p></div>
        <form id="login-form" class="auth-form">
          <label class="field-label">가족 아이디<input class="form-control" name="username" value="family" autocomplete="username" autocapitalize="none" required></label>
          <label class="field-label">비밀번호<input class="form-control" type="password" name="password" autocomplete="current-password" required autofocus></label>
          ${auth.error ? `<p class="auth-error" role="alert">${escapeHtml(auth.error)}</p>` : ""}
          <button class="btn primary auth-submit" type="submit">우리 집 들어가기</button>
        </form>
        <p class="auth-note">비밀번호는 이 휴대폰에 저장하지 않아요. 공용 기기에서는 설정의 로그아웃을 눌러주세요.</p>
      </section>
    </main>
  `;
}

function renderTopbar() {
  const wifeName = escapeHtml(state.household.wifeName || "엄마");
  const husbandName = escapeHtml(state.household.husbandName || "아빠");
  return `
    <header class="topbar">
      <button class="brand" data-page="today" aria-label="오늘 화면으로 이동">
        <span class="brand-mark"></span>
        <span class="brand-copy"><small>Our little home</small><strong>도란도란</strong></span>
      </button>
      <div class="topbar-actions">
        <span class="sync-pill ${!connectionAvailable ? "offline" : syncInfo.status}">${escapeHtml(syncStatusText())}</span>
        <div class="member-switch" aria-label="현재 사용자 선택">
          <button class="${state.currentMember === "wife" ? "active" : ""}" data-member="wife"><span class="avatar">${wifeName.slice(0, 1)}</span><span>${wifeName}</span></button>
          <button class="${state.currentMember === "husband" ? "active" : ""}" data-member="husband"><span class="avatar husband">${husbandName.slice(0, 1)}</span><span>${husbandName}</span></button>
        </div>
        <button class="icon-btn" data-action="show-alerts" aria-label="알림 안내">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>
        </button>
      </div>
    </header>
  `;
}

function renderSystemBanner() {
  const banners = [];
  if (updateAvailable) banners.push(`<div class="system-banner"><span>새 버전이 준비됐어요.</span><button data-action="app-update">업데이트하기</button></div>`);
  if (!isStandaloneApp() && localStorage.getItem(INSTALL_HINT_DISMISSED_KEY) !== "1") {
    banners.push(`<div class="system-banner install-banner"><span>홈 화면에 추가하면 앱처럼 바로 열 수 있어요.</span><div><button data-page="settings" data-settings-open="install">설치 방법</button><button data-action="dismiss-install-hint">나중에</button></div></div>`);
  }
  return banners.join("");
}

function isStandaloneApp() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function installGuideText() {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isStandaloneApp()) return "이 기기에서는 이미 홈 화면 앱으로 사용하고 있어요.";
  if (deferredInstallPrompt) return "아래 버튼을 누르면 홈 화면에 바로 설치할 수 있어요.";
  if (isIos) return "Safari의 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택해 주세요.";
  return "브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해 주세요.";
}

async function installApp() {
  if (!deferredInstallPrompt) {
    ui.page = "settings";
    ui.settingsSection = "install";
    render();
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice.outcome === "accepted") localStorage.setItem(INSTALL_HINT_DISMISSED_KEY, "1");
  deferredInstallPrompt = null;
  render();
}

function renderBottomNav() {
  const count = dueTasks().length;
  const items = [
    ["today", "오늘"],
    ["all", "집안일"],
    ["shopping", "장보기"],
    ["finance", "가계부"],
    ["history", "기록"],
    ["settings", "설정"],
  ];
  return `
    <nav class="bottom-nav" aria-label="주 메뉴">
      <div class="bottom-nav-inner">
        ${items.map(([key, label]) => `
          <button class="nav-btn ${ui.page === key ? "active" : ""}" data-page="${key}">
            ${navIcon(key)}<span>${label}</span>${key === "today" && count ? `<b class="nav-dot">${count}</b>` : ""}
          </button>
        `).join("")}
      </div>
    </nav>
  `;
}

function renderPage() {
  if (ui.page === "all") return renderAllTasks();
  if (ui.page === "shopping") return renderShopping();
  if (ui.page === "finance") return renderFinance();
  if (ui.page === "history") return renderHistory();
  if (ui.page === "settings") return renderSettings();
  return renderToday();
}

function renderShopping() {
  const categoryOrder = Object.keys(SHOPPING_CATEGORIES);
  const items = [...state.shoppingItems].sort((a, b) =>
    Number(a.checked) - Number(b.checked)
    || categoryOrder.indexOf(a.category || "other") - categoryOrder.indexOf(b.category || "other")
    || new Date(a.createdAt) - new Date(b.createdAt));
  const remaining = items.filter((item) => !item.checked).length;
  const bought = items.length - remaining;
  const activeNames = new Set(items.map((item) => item.name.trim().toLocaleLowerCase("ko-KR")));
  const recent = (state.shoppingHistory || []).filter((item) => !activeNames.has(String(item.name || "").trim().toLocaleLowerCase("ko-KR"))).slice(0, 6);
  const activeGroups = categoryOrder.map((category) => ({ category, items: items.filter((item) => !item.checked && (item.category || "other") === category) })).filter((group) => group.items.length);
  const checkedItems = items.filter((item) => item.checked);
  return `
    <div class="inner-page shopping-page ${ui.shoppingTrip ? "trip-mode" : ""}">
      <header class="inner-header">
        <div><p class="eyebrow">잊지 않고 함께</p><h1>장보기 목록</h1><p>${remaining ? `살 것 ${remaining}개가 남아 있어요.` : items.length ? "모두 장바구니에 담았어요." : "필요한 것을 함께 적어두세요."}</p></div>
        <div class="shopping-header-actions"><button class="btn ${ui.shoppingTrip ? "primary" : ""}" data-action="shopping-trip">${ui.shoppingTrip ? "장보기 끝내기" : "장보기 시작"}</button>${bought ? `<button class="btn primary" data-action="shopping-to-expense">구매 금액 기록</button><button class="btn" data-action="shopping-clear-bought">산 품목 정리</button>` : ""}</div>
      </header>
      <section class="shopping-panel">
        <div class="quick-shopping shopping-setup">
          <div><strong>자주 사는 것</strong><span>한 번 눌러 바로 추가해요</span></div>
          <div class="quick-shopping-chips">${QUICK_SHOPPING_ITEMS.map((item) => `<button class="quick-shopping-chip" data-action="shopping-quick-add" data-name="${escapeHtml(item.name)}" data-category="${item.category}">+ ${escapeHtml(item.name)}</button>`).join("")}</div>
        </div>
        ${recent.length ? `<div class="quick-shopping shopping-recent shopping-setup"><div><strong>최근 샀던 것</strong><span>필요하면 다시 담아요</span></div><div class="quick-shopping-chips">${recent.map((item) => `<button class="quick-shopping-chip" data-action="shopping-quick-add" data-name="${escapeHtml(item.name)}" data-category="${item.category || "other"}">+ ${escapeHtml(item.name)}</button>`).join("")}</div></div>` : ""}
        <form id="shopping-form" class="shopping-form shopping-setup">
          <label class="shopping-name"><span class="sr-only">살 품목</span><input class="form-control" name="name" maxlength="60" placeholder="무엇을 살까요?" autocomplete="off" required></label>
          <label><span class="sr-only">분류</span><select class="form-control" name="category">${Object.entries(SHOPPING_CATEGORIES).map(([key, label]) => `<option value="${key}">${label}</option>`).join("")}</select></label>
          <label><span class="sr-only">수량 또는 메모</span><input class="form-control" name="detail" maxlength="60" placeholder="수량·메모 (선택)" autocomplete="off"></label>
          <button class="btn primary" type="submit">목록에 추가</button>
        </form>
        <div class="shopping-summary"><span><strong>${remaining}</strong>개 남음</span><span>${bought}개 구매</span></div>
        ${items.length ? `<div class="shopping-list grouped-shopping-list">
          ${activeGroups.map((group) => `<section class="shopping-group"><h2>${SHOPPING_CATEGORIES[group.category]}</h2>${group.items.map(renderShoppingItem).join("")}</section>`).join("")}
          ${checkedItems.length ? `<section class="shopping-group bought-group"><h2>산 품목</h2>${checkedItems.map(renderShoppingItem).join("")}</section>` : ""}
        </div>` : `<div class="shopping-empty"><span>🛒</span><strong>아직 장볼 것이 없어요</strong><p>우유, 기저귀처럼 생각난 순간 바로 적어두세요.</p></div>`}
      </section>
    </div>
  `;
}

function renderShoppingItem(item) {
  return `<article class="shopping-row ${item.checked ? "checked" : ""}">
    <button class="shopping-check" data-action="shopping-toggle" data-shopping-id="${item.id}" aria-label="${escapeHtml(item.name)} ${item.checked ? "다시 살 것으로 표시" : "구매 완료"}" aria-pressed="${item.checked}">${item.checked ? "✓" : ""}</button>
    <button class="shopping-content" data-action="shopping-toggle" data-shopping-id="${item.id}">
      <span class="shopping-title-line"><strong>${escapeHtml(item.name)}</strong><em>${SHOPPING_CATEGORIES[item.category] || SHOPPING_CATEGORIES.other}</em></span>
      ${item.detail ? `<span class="shopping-detail">${escapeHtml(item.detail)}</span>` : ""}
      <span class="shopping-meta">${escapeHtml(subjectName(item.addedBy))} 추가${item.checked && item.checkedBy ? ` · ${escapeHtml(nameFor(item.checkedBy))} 구매` : ""}</span>
    </button>
    <div class="shopping-row-actions"><button data-action="shopping-edit" data-shopping-id="${item.id}" aria-label="${escapeHtml(item.name)} 수정">수정</button><button class="shopping-delete" data-action="shopping-delete" data-shopping-id="${item.id}" aria-label="${escapeHtml(item.name)} 삭제">×</button></div>
  </article>`;
}

function formatWon(amount) {
  return `${Math.max(0, Math.round(Number(amount || 0))).toLocaleString("ko-KR")}원`;
}

function financeMemberLabel(member) {
  if (member === "shared") return "공동 결제";
  return `${escapeHtml(nameFor(member === "husband" ? "husband" : "wife"))} 결제`;
}

function renderFinance() {
  const month = ui.financeMonth;
  const currentMonth = operationalDate().slice(0, 7);
  const monthExpenses = (state.expenses || []).filter((item) => String(item.date || "").slice(0, 7) === month)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || Number(b.createdAt || 0) - Number(a.createdAt || 0));
  const previousExpenses = (state.expenses || []).filter((item) => String(item.date || "").slice(0, 7) === shiftMonthKey(month, -1));
  const householdExpenses = monthExpenses.filter((item) => item.scope !== "personal");
  const total = householdExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const personalTotal = monthExpenses.filter((item) => item.scope === "personal").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const previousTotal = previousExpenses.filter((item) => item.scope !== "personal").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const difference = total - previousTotal;
  const budget = Math.max(0, Number(state.financeSettings?.monthlyBudget || 0));
  const categoryTotals = Object.keys(FINANCE_CATEGORIES).map((category) => ({
    category,
    amount: householdExpenses.filter((item) => (item.category || "other") === category).reduce((sum, item) => sum + Number(item.amount || 0), 0),
  })).filter((item) => item.amount).sort((a, b) => b.amount - a.amount);
  const payerTotals = ["wife", "husband", "shared"].map((paidBy) => ({
    paidBy,
    amount: householdExpenses.filter((item) => (item.paidBy || "shared") === paidBy).reduce((sum, item) => sum + Number(item.amount || 0), 0),
  })).filter((item) => item.amount);
  const budgetPercent = budget ? Math.min(100, Math.round(total / budget * 100)) : 0;
  const grouped = new Map();
  for (const expense of monthExpenses) {
    if (!grouped.has(expense.date)) grouped.set(expense.date, []);
    grouped.get(expense.date).push(expense);
  }
  const recurring = [...(state.recurringExpenses || [])].sort((a, b) => Number(a.dayOfMonth || 1) - Number(b.dayOfMonth || 1));
  return `
    <div class="inner-page finance-page">
      <header class="inner-header finance-header">
        <div><p class="eyebrow">우리 집 돈의 흐름</p><h1>가계부</h1><p>사진으로 빠르게, 필요할 때는 직접 기록해요.</p></div>
        <div class="finance-header-actions">
          <button class="btn receipt-button" data-action="receipt-select">📷 영수증 찍기</button>
          <button class="btn primary" data-action="expense-add">직접 기록</button>
          <input id="receipt-image-input" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden>
        </div>
      </header>
      <p class="receipt-privacy">무료 글자 인식으로 처리해 별도 사용료가 없어요. 사진은 도란도란 서버 메모리에서만 읽고 앱과 백업에는 저장하지 않습니다.</p>
      <section class="finance-summary-card">
        <div class="finance-month-nav"><button data-action="finance-prev-month" aria-label="이전 달">‹</button><strong>${formatHistoryMonth(month)}</strong><button data-action="finance-next-month" aria-label="다음 달" ${month >= currentMonth ? "disabled" : ""}>›</button></div>
        <div class="finance-total"><span>생활비 지출</span><strong>${formatWon(total)}</strong><small>${previousTotal ? `지난달보다 ${difference === 0 ? "같아요" : `${formatWon(Math.abs(difference))} ${difference > 0 ? "더 썼어요" : "덜 썼어요"}`}` : "지난달 기록이 아직 없어요"}</small></div>
        ${budget ? `<div class="budget-track"><div style="width:${budgetPercent}%"></div></div><div class="budget-copy"><span>예산 ${formatWon(budget)}</span><strong class="${total > budget ? "over" : ""}">${total > budget ? `${formatWon(total - budget)} 초과` : `${formatWon(budget - total)} 남음`}</strong></div>` : `<button class="budget-empty" data-action="budget-edit">이번 달 예산을 정해보세요 →</button>`}
        ${budget ? `<button class="finance-inline-link" data-action="budget-edit">예산 수정</button>` : ""}
      </section>
      <section class="finance-grid">
        <article class="finance-breakdown"><h2>분류별 생활비</h2>${categoryTotals.length ? `<div class="category-bars">${categoryTotals.map((item) => `<div><span>${FINANCE_CATEGORIES[item.category]}</span><i><b style="width:${Math.max(5, Math.round(item.amount / Math.max(total, 1) * 100))}%"></b></i><strong>${formatWon(item.amount)}</strong></div>`).join("")}</div>` : `<p class="finance-empty-copy">이번 달 생활비 기록이 없어요.</p>`}</article>
        <article class="finance-breakdown"><h2>누가 결제했나요</h2>${payerTotals.length ? `<div class="payer-totals">${payerTotals.map((item) => `<div><span>${financeMemberLabel(item.paidBy)}</span><strong>${formatWon(item.amount)}</strong></div>`).join("")}</div>` : `<p class="finance-empty-copy">기록하면 두 사람의 결제 흐름을 볼 수 있어요.</p>`}${personalTotal ? `<p class="personal-total">개인 지출은 생활비 합계와 분리 · ${formatWon(personalTotal)}</p>` : ""}</article>
      </section>
      <section class="recurring-panel">
        <div class="section-heading"><div><p class="eyebrow">자동으로 빠짐없이</p><h2>매달 고정비</h2></div><button class="btn" data-action="recurring-add">고정비 추가</button></div>
        ${recurring.length ? `<div class="recurring-list">${recurring.map((item) => `<article class="recurring-row ${item.active === false ? "inactive" : ""}"><div><strong>${escapeHtml(item.title)}</strong><span>매월 ${Number(item.dayOfMonth || 1)}일 · ${FINANCE_CATEGORIES[item.category] || FINANCE_CATEGORIES.other} · ${financeMemberLabel(item.paidBy)}</span></div><b>${formatWon(item.amount)}</b><button data-action="recurring-edit" data-recurring-id="${item.id}">수정</button></article>`).join("")}</div>` : `<p class="finance-empty-copy">월세, 통신비처럼 매달 반복되는 지출을 등록해 보세요.</p>`}
      </section>
      <section class="expense-history-panel">
        <div class="section-heading"><div><p class="eyebrow">상세 내역</p><h2>${formatHistoryMonth(month)} 지출</h2></div><button class="btn ghost" data-action="expenses-export" ${monthExpenses.length ? "" : "disabled"}>CSV 내려받기</button></div>
        ${monthExpenses.length ? [...grouped.entries()].map(([date, expenses]) => `<section class="expense-day"><h3>${formatHistoryDate(date).replace("오늘 · ", "")}</h3>${expenses.map(renderExpenseRow).join("")}</section>`).join("") : `<div class="finance-empty"><span>₩</span><strong>아직 지출 기록이 없어요</strong><p>영수증을 찍거나 직접 기록해 첫 내역을 남겨보세요.</p></div>`}
      </section>
    </div>`;
}

function renderExpenseRow(expense) {
  const itemCount = Array.isArray(expense.items) ? expense.items.length : 0;
  return `<article class="expense-row">
    <button class="expense-main" data-action="expense-edit" data-expense-id="${expense.id}">
      <span class="expense-category">${FINANCE_CATEGORIES[expense.category] || FINANCE_CATEGORIES.other}</span>
      <span class="expense-copy"><strong>${escapeHtml(expense.merchant || "지출")}</strong><small>${financeMemberLabel(expense.paidBy)} · ${expense.scope === "personal" ? "개인 지출" : "생활비"}${itemCount ? ` · 품목 ${itemCount}개` : ""}${expense.source === "receipt" ? " · 영수증" : expense.source === "recurring" ? " · 고정비" : ""}</small>${expense.memo ? `<em>${escapeHtml(expense.memo)}</em>` : ""}</span>
      <b>${formatWon(expense.amount)}</b>
    </button>
    <button class="expense-delete" data-action="expense-delete" data-expense-id="${expense.id}" aria-label="${escapeHtml(expense.merchant || "지출")} 삭제">×</button>
  </article>`;
}

function renderToday() {
  const due = dueTasks();
  const groups = {
    overdue: due.filter(({ status }) => status.key === "overdue"),
    due: due.filter(({ status }) => status.key === "due"),
    available: due.filter(({ status }) => status.key === "available"),
  };
  const completed = eventsToday();
  const estimate = due.reduce((sum, item) => sum + Number(item.task.estimate || 0), 0);
  const total = due.length + completed.length;
  const progress = total ? Math.round((completed.length / total) * 100) : 100;

  return `
    <div class="today-layout">
      <div>
        <section class="hero">
          <p class="eyebrow">${formatFullDate()}</p>
          <h1 class="page-title">${greeting()},<br><span class="highlight">${escapeHtml(nameFor(state.currentMember))}</span></h1>
          <p class="title-note">지금 할 때가 된 일만 모아뒀어요. 전부 끝내기보다, 오늘 할 수 있는 만큼만 함께 해요.</p>
          <div class="summary-strip">
            <div class="summary-copy">
              <span class="summary-number">${due.length}</span>
              <p><strong>오늘 살펴볼 일</strong>예상 ${minutesText(estimate)} · ${completed.length}개 완료</p>
            </div>
            <div class="progress-wrap">
              <div class="progress-label"><span>오늘의 가벼움</span><span>${progress}%</span></div>
              <div class="progress-track"><span style="width:${progress}%"></span></div>
            </div>
          </div>
        </section>
        <div class="today-notices">${renderScheduleCard()}${renderConditionalCard()}</div>
        ${renderTaskSection("overdue", "조금 밀린 일", "오늘 하나만 골라도 충분해요", groups.overdue)}
        ${renderTaskSection("due", "오늘 권장", "지금 해두면 다음 며칠이 편해져요", groups.due)}
        ${renderTaskSection("available", "해도 되는 일", "여유가 있을 때 미리 해둘 수 있어요", groups.available)}
        ${renderCompletedSection(completed)}
      </div>
      <aside class="sidebar">
        ${state.household.showStats ? renderBalanceCard() : ""}
      </aside>
    </div>
  `;
}

function renderTaskSection(key, title, description, items) {
  if (!items.length) return "";
  return `
    <section class="task-section">
      <div class="section-heading">
        <div class="section-title-wrap"><h2 class="section-title">${title}</h2><span class="count-badge">${items.length}</span></div>
        <p class="section-description">${description}</p>
      </div>
      <div class="task-list">${items.map(({ task, status }) => renderTaskCard(task, status)).join("")}</div>
    </section>
  `;
}

function renderTaskCard(task, status) {
  const claim = state.claims[task.id];
  const progress = state.subtaskProgress[task.id] || {};
  const ownClaim = claim?.memberId === state.currentMember;
  const otherClaim = claim && !ownClaim;
  const allChecked = !task.subtasks?.length || task.subtasks.every((_, index) => Boolean(progress[index]));
  const isCheck = ["check", "check-group"].includes(task.kind);
  const statusClass = status.key === "overdue" ? "status-overdue" : status.key === "due" ? "status-due" : "";
  const timingHint = taskTimingHint(task);

  return `
    <article class="task-card ${status.key === "overdue" ? "overdue" : ""}">
      <div class="task-icon ${task.category}">${ICONS[task.icon] || "·"}</div>
      <div class="task-main">
        <div class="task-kicker"><span class="${statusClass}">${status.label}</span><span>·</span><span>${relativeLastText(task)}</span><span>·</span><span>${task.estimate}분</span></div>
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
        <p class="task-description">${escapeHtml(task.description || "")}</p>
        ${timingHint ? `<span class="timing-hint">◷ ${escapeHtml(timingHint)}</span>` : ""}
        ${claim ? `<span class="claim-label">${claim.memberId === state.currentMember ? "내가 하기로 했어요" : `${escapeHtml(subjectName(claim.memberId))} 하기로 했어요`}</span>` : ""}
        ${task.subtasks?.length ? `
          <div class="subtasks">
            ${task.subtasks.map((subtask, index) => `<label class="subtask ${progress[index] ? "checked" : ""}"><input type="checkbox" data-subtask="${task.id}" data-index="${index}" ${progress[index] ? "checked" : ""}><span>${escapeHtml(subtask)}</span></label>`).join("")}
          </div>
        ` : ""}
      </div>
      <div class="task-actions">
        <button class="btn ${ownClaim ? "ghost" : ""}" data-action="claim" data-task="${task.id}" aria-label="${escapeHtml(task.title)} ${ownClaim ? "맡기 취소" : otherClaim ? `${escapeHtml(nameFor(claim.memberId))} 맡음` : "내가 할게"}" ${otherClaim ? "disabled" : ""}>${ownClaim ? "맡기 취소" : otherClaim ? `${escapeHtml(nameFor(claim.memberId))} 맡음` : "내가 할게"}</button>
        ${isCheck ? `<button class="btn" data-action="not-needed" data-task="${task.id}" aria-label="${escapeHtml(task.title)} 아직 괜찮음">아직 괜찮음</button>` : ""}
        <button class="btn tomorrow" data-action="postpone-tomorrow" data-task="${task.id}" aria-label="${escapeHtml(task.title)} 내일 하자">내일 하자</button>
        <button class="btn ghost date-postpone" data-action="postpone-open" data-task="${task.id}" aria-label="${escapeHtml(task.title)} 다른 날">다른 날</button>
        <button class="btn primary" data-action="complete-quick" data-task="${task.id}" aria-label="${escapeHtml(task.title)} ${task.kind === "timer" ? `${task.timerMinutes}분 완료` : "완료"}" ${task.subtasks?.length && !allChecked ? "disabled title=\"세부 항목을 먼저 확인해 주세요\"" : ""}>${task.kind === "timer" ? `${task.timerMinutes}분 완료` : "완료"}</button>
      </div>
    </article>
  `;
}

function renderCompletedSection(events) {
  return `
    <section class="task-section">
      <div class="section-heading">
        <div class="section-title-wrap"><h2 class="section-title">오늘 완료한 일</h2><span class="count-badge">${events.length}</span></div>
        <div class="section-heading-actions"><p class="section-description">두 사람의 작은 수고가 모였어요</p><button class="reset-today-btn" data-action="reset-today" ${hasTodayCheckState() ? "" : "disabled"}>↶ 오늘 체크 초기화</button></div>
      </div>
      ${events.length ? `<div class="task-list">${events.map((event) => {
        const task = getTask(event.taskId);
        if (!task) return "";
        return `<article class="task-card completed-card">
          <div class="task-icon small ${task.category}">✓</div>
          <div class="task-main">
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
            <p class="task-description">${event.eventType === "not_needed" ? "아직 괜찮다고 점검" : event.memberId === "together" ? `${escapeHtml(nameFor(event.memberId))} 완료` : `${escapeHtml(subjectName(event.memberId))} 완료`} · ${formatTime(event.createdAt)}</p>
            ${event.note ? `<p class="completion-note">“${escapeHtml(event.note)}”</p>` : ""}
          </div>
          <div class="task-actions"><button class="btn ghost" data-page="history">기록 보기</button></div>
        </article>`;
      }).join("")}</div>` : `<div class="empty-state"><strong>첫 체크를 기다리고 있어요</strong>작은 일 하나를 끝내면 여기에 따뜻하게 기록해둘게요.</div>`}
    </section>
  `;
}

function renderConditionalCard() {
  const task = getTask("bottle-sterilize");
  const open = conditionalIsOpen(task.id);
  if (open || state.household.bottlePromptDismissedOn === operationalDate()) return "";
  return `
    <section class="sidebar-card accent">
      <p class="sidebar-label">조건 확인</p>
      <h2 class="sidebar-title">오늘 젖병을<br>사용했나요?</h2>
      <p class="sidebar-text">사용했을 때만 소독할 일로 만들게요. 쪽쪽이와 치발기도 함께 확인해요.</p>
      <div class="trigger-buttons">
        <button class="btn" data-action="bottle-no">사용 안 함</button>
        <button class="btn primary" data-action="bottle-trigger" ${open ? "disabled" : ""}>${open ? "할 일에 추가됨" : "사용했어요"}</button>
      </div>
    </section>
  `;
}

function renderScheduleCard() {
  const wife = memberScheduleStatus("wife");
  const husband = memberScheduleStatus("husband");
  const today = localDateKey(new Date());
  const nextDayOff = (state.household.workSchedule.husband.daysOff || [])
    .filter((date) => date >= today)
    .sort()[0];
  const needsPlan = needsDaysOffPlan();
  const rhythmTitle = wife.recovering ? "오늘은 회복이<br>먼저예요" : wife.lightOnly ? "저녁에는<br>가벼운 일만" : "가능한 시간에<br>서로 조금씩";
  return `
    <section class="sidebar-card schedule-card ${needsPlan ? "needs-plan" : ""} ${wife.recovering ? "recovering" : ""}">
      <div class="schedule-heading">
        <div><p class="sidebar-label">오늘의 근무 리듬</p><h2 class="sidebar-title">${rhythmTitle}</h2></div>
        <span class="schedule-icon">◷</span>
      </div>
      ${wife.recovering ? `<p class="recovery-callout"><strong>${escapeHtml(nameFor("wife"))} 회복 시간</strong><span>오전 8시부터 오후 6시까지 추천과 알림을 잠시 쉬어요.</span></p>` : ""}
      ${wife.lightOnly ? `<p class="recovery-callout light"><strong>오후 6시 이후</strong><span>밤 11시 출근 전에는 가벼운 일만 권해요.</span></p>` : ""}
      <div class="schedule-people">
        <div class="schedule-person">
          <span class="avatar">${escapeHtml(nameFor("wife").slice(0, 1))}</span>
          <div><strong>${escapeHtml(nameFor("wife"))}</strong><span>${wife.label}</span></div>
          <i class="status-dot ${wife.tone}"></i>
        </div>
        <div class="schedule-person">
          <span class="avatar husband">${escapeHtml(nameFor("husband").slice(0, 1))}</span>
          <div><strong>${escapeHtml(nameFor("husband"))}</strong><span>${husband.label}</span></div>
          <i class="status-dot ${husband.tone}"></i>
        </div>
      </div>
      <p class="schedule-note">${needsPlan ? `앞으로 2주 휴무가 비어 있어요. 일정을 넣으면 안내가 더 정확해져요.` : nextDayOff ? `${escapeHtml(nameFor("husband"))} 다음 휴무 · ${formatHistoryDate(nextDayOff).replace("오늘 · ", "")}` : `${escapeHtml(nameFor("husband"))} 휴무일은 매주 설정에서 눌러주세요.`}</p>
      <button class="btn schedule-link" data-page="settings" data-settings-open="schedule">${needsPlan ? "휴무 입력하기 →" : "근무 일정 바꾸기 →"}</button>
    </section>
  `;
}

function needsDaysOffPlan() {
  const today = operationalDate();
  const lastDay = dateKeyPlusDays(today, 13);
  return !(state.household.workSchedule.husband.daysOff || []).some((date) => date >= today && date <= lastDay);
}

function weeklyBalance() {
  const from = Date.now() - 7 * DAY_MS;
  const result = { wife: 0, husband: 0 };
  state.events.filter((event) => event.eventType === "completed" && new Date(event.createdAt).getTime() >= from).forEach((event) => {
    const task = getTask(event.taskId);
    const estimate = Number(task?.estimate || 0);
    if (event.memberId === "together") {
      result.wife += estimate / 2;
      result.husband += estimate / 2;
    } else if (result[event.memberId] !== undefined) {
      result[event.memberId] += estimate;
    }
  });
  return result;
}

function renderBalanceCard() {
  const balance = weeklyBalance();
  const max = Math.max(balance.wife, balance.husband, 30);
  return `
    <section class="sidebar-card">
      <p class="sidebar-label">이번 주 함께한 시간</p>
      <h2 class="sidebar-title">누구에게도<br>몰리지 않도록</h2>
      <p class="sidebar-text">경쟁이 아니라 서로의 수고를 알아보기 위한 기록이에요.</p>
      <div class="balance-row"><span>${escapeHtml(nameFor("wife"))}</span><div class="balance-bar"><span style="width:${Math.round(balance.wife / max * 100)}%"></span></div><span class="balance-time">${minutesText(balance.wife)}</span></div>
      <div class="balance-row husband"><span>${escapeHtml(nameFor("husband"))}</span><div class="balance-bar"><span style="width:${Math.round(balance.husband / max * 100)}%"></span></div><span class="balance-time">${minutesText(balance.husband)}</span></div>
    </section>
  `;
}

function minutesText(minutes) {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded}분`;
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return remainder ? `${hours}시간 ${remainder}분` : `${hours}시간`;
}

function renderAllTasks() {
  const filters = [
    ["all", "전체"], ["daily", "매일"], ["window", "2~3일"], ["weekly", "매주"], ["biweekly", "2주"], ["monthly", "매월"], ["interval", "직접 간격"], ["weekdays", "요일"], ["conditional", "조건부"],
  ];
  const tasks = allTasks().filter((task) => ui.filter === "all" || task.recurrence === ui.filter);
  return `
    <div class="inner-page">
      <header class="inner-header">
        <div><p class="eyebrow">우리 집의 리듬</p><h1>전체 집안일</h1><p>미래의 일은 오늘 화면에서 숨기고, 여기서만 차분히 관리해요.</p></div>
        <button class="btn primary" data-action="task-add">+ 집안일 추가</button>
      </header>
      <div class="filter-bar">${filters.map(([key, label]) => `<button class="filter-chip ${ui.filter === key ? "active" : ""}" data-filter="${key}">${label}</button>`).join("")}</div>
      <section class="all-task-list">
        ${tasks.map((task) => {
          const status = getTaskStatus(task);
          return `<article class="all-task-row ${task.active ? "" : "inactive"}">
            <div class="task-icon small ${task.category}">${ICONS[task.icon] || "·"}</div>
            <div><h3>${escapeHtml(task.title)}</h3><p>${recurrenceLabel(task)} · 예상 ${task.estimate}분${task.kind === "timer" ? ` · ${task.timerMinutes}분씩` : ""}</p></div>
            <div class="row-status">${status.label}<br>${task.active && status.age !== null ? relativeLastText(task) : ""}</div>
            <div style="display:flex;align-items:center;gap:7px">
              <button class="btn ghost" data-action="task-edit" data-task="${task.id}" aria-label="${escapeHtml(task.title)} 수정">수정</button>
              <label class="toggle" aria-label="${escapeHtml(task.title)} 활성화"><input type="checkbox" data-active="${task.id}" ${task.active ? "checked" : ""}><span></span></label>
            </div>
          </article>`;
        }).join("")}
      </section>
    </div>
  `;
}

function historyTrackingStartDate() {
  return operationalDate(state.startedAt || Date.now());
}

function eventsOnDate(dateKey, eventTypes = ["completed", "not_needed", "postponed"]) {
  return state.events
    .filter((event) => eventTypes.includes(event.eventType) && operationalDate(event.createdAt) === dateKey)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function lastResetBeforeDate(taskId, dateKey) {
  return state.events
    .filter((event) => {
      if (event.taskId !== taskId || !["baseline", "completed", "not_needed"].includes(event.eventType)) return false;
      const eventDate = operationalDate(event.createdAt);
      return event.eventType === "baseline" ? eventDate <= dateKey : eventDate < dateKey;
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0] || null;
}

function conditionalWasOpenOnDate(taskId, dateKey) {
  const latest = state.events
    .filter((event) => event.taskId === taskId && ["triggered", "completed"].includes(event.eventType) && operationalDate(event.createdAt) <= dateKey)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];
  return latest?.eventType === "triggered";
}

function taskExistedOnDate(task, dateKey) {
  const firstBaseline = state.events
    .filter((event) => event.taskId === task.id && event.eventType === "baseline")
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))[0];
  if (task.id.startsWith("custom-") && firstBaseline && operationalDate(firstBaseline.createdAt) > dateKey) return false;
  return dateKey >= historyTrackingStartDate();
}

function historicalTaskExpectation(task, dateKey) {
  if (!task.active || !taskExistedOnDate(task, dateKey)) return null;
  if (task.recurrence === "conditional") {
    return conditionalWasOpenOnDate(task.id, dateKey) ? { key: "due", label: "사용 기록으로 필요한 일" } : null;
  }
  if (task.recurrence === "daily") return { key: "due", label: "매일 하는 일" };
  if (task.recurrence === "weekdays") {
    const weekday = new Date(`${dateKey}T12:00:00`).getDay();
    return (task.weekdays || []).map(Number).includes(weekday) ? { key: "due", label: "선택한 요일의 일" } : null;
  }

  const last = lastResetBeforeDate(task.id, dateKey);
  if (!last) return { key: "due", label: "완료 기록이 없던 일" };
  const lastDate = operationalDate(last.createdAt);
  const age = Math.round((dateKeyToUtc(dateKey) - dateKeyToUtc(lastDate)) / DAY_MS);

  if (task.recurrence === "window") {
    if (age < Number(task.maxDays || 3)) return null;
    return { key: age > Number(task.maxDays || 3) ? "overdue" : "due", label: age > Number(task.maxDays || 3) ? `${age - Number(task.maxDays || 3)}일 밀려 있던 일` : "그날 권장된 일" };
  }
  if (task.recurrence === "monthly") {
    const dueDate = new Date(last.createdAt);
    dueDate.setMonth(dueDate.getMonth() + 1);
    const dueKey = operationalDate(dueDate.getTime());
    if (dateKey < dueKey) return null;
    const overdueDays = Math.round((dateKeyToUtc(dateKey) - dateKeyToUtc(dueKey)) / DAY_MS);
    return { key: overdueDays > 0 ? "overdue" : "due", label: overdueDays > 0 ? `${overdueDays}일 밀려 있던 일` : "그날 권장된 일" };
  }

  const interval = Number(task.intervalDays || 7);
  if (age < interval) return null;
  return { key: age > interval ? "overdue" : "due", label: age > interval ? `${age - interval}일 밀려 있던 일` : "그날 권장된 일" };
}

function historyDayData(dateKey) {
  const dayEvents = eventsOnDate(dateKey);
  const completed = dayEvents.filter((event) => event.eventType === "completed");
  const checked = dayEvents.filter((event) => event.eventType === "not_needed");
  const postponed = dayEvents.filter((event) => event.eventType === "postponed");
  const handledTaskIds = new Set([...completed, ...checked].map((event) => event.taskId));
  const postponedByTask = new Map(postponed.map((event) => [event.taskId, event]));
  const missed = allTasks()
    .map((task) => {
      const postponedEvent = postponedByTask.get(task.id);
      const wasPostponed = Boolean(postponedEvent);
      return {
        task,
        expectation: historicalTaskExpectation(task, dateKey) || (wasPostponed ? { key: "postponed", label: "다른 날로 미룬 일" } : null),
        postponed: wasPostponed,
        postponedUntil: postponedEvent?.note || "",
      };
    })
    .filter(({ task, expectation }) => expectation && !handledTaskIds.has(task.id));
  return { completed, checked, postponed, missed };
}

function shiftMonthKey(monthKey, amount) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthDays(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(year, month - 1, 1, 12);
  const count = new Date(year, month, 0, 12).getDate();
  return {
    leading: first.getDay(),
    dates: Array.from({ length: count }, (_, index) => localDateKey(new Date(year, month - 1, index + 1, 12))),
  };
}

function formatHistoryMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(new Date(year, month - 1, 1, 12));
}

function moveHistoryMonth(amount) {
  const startMonth = historyTrackingStartDate().slice(0, 7);
  const currentMonth = operationalDate().slice(0, 7);
  const targetMonth = shiftMonthKey(ui.historyMonth, amount);
  if (targetMonth < startMonth || targetMonth > currentMonth) return;
  const preferredDay = Number(ui.historyDate.slice(-2));
  const availableDates = monthDays(targetMonth).dates;
  let selected = availableDates[Math.min(preferredDay, availableDates.length) - 1];
  if (selected > operationalDate()) selected = operationalDate();
  if (selected < historyTrackingStartDate()) selected = historyTrackingStartDate();
  ui.historyMonth = targetMonth;
  ui.historyDate = selected;
  render();
}

function selectHistoryDate(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || dateKey > operationalDate() || dateKey < historyTrackingStartDate()) return;
  ui.historyDate = dateKey;
  ui.historyMonth = dateKey.slice(0, 7);
  render();
}

function selectHistoryToday() {
  ui.historyDate = operationalDate();
  ui.historyMonth = ui.historyDate.slice(0, 7);
  render();
}

function renderHistoryCalendar() {
  const today = operationalDate();
  const startMonth = historyTrackingStartDate().slice(0, 7);
  const currentMonth = today.slice(0, 7);
  if (ui.historyMonth < startMonth) ui.historyMonth = startMonth;
  if (ui.historyMonth > currentMonth) ui.historyMonth = currentMonth;
  const calendar = monthDays(ui.historyMonth);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `
    <section class="history-calendar-card" aria-label="날짜 선택 달력">
      <div class="history-calendar-heading">
        <button class="calendar-arrow" data-action="history-prev-month" aria-label="이전 달" ${ui.historyMonth <= startMonth ? "disabled" : ""}>‹</button>
        <strong>${formatHistoryMonth(ui.historyMonth)}</strong>
        <button class="calendar-arrow" data-action="history-next-month" aria-label="다음 달" ${ui.historyMonth >= currentMonth ? "disabled" : ""}>›</button>
      </div>
      <div class="history-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join("")}</div>
      <div class="history-calendar-grid">
        ${Array.from({ length: calendar.leading }, () => `<span class="calendar-blank"></span>`).join("")}
        ${calendar.dates.map((dateKey) => {
          const beforeStart = dateKey < historyTrackingStartDate();
          const future = dateKey > today;
          const data = beforeStart || future ? { completed: [], checked: [], missed: [] } : historyDayData(dateKey);
          const doneCount = data.completed.length + data.checked.length;
          const day = Number(dateKey.slice(-2));
          const selected = dateKey === ui.historyDate;
          const labelParts = [`${Number(dateKey.slice(5, 7))}월 ${day}일`];
          if (doneCount) labelParts.push(`기록 ${doneCount}개`);
          if (data.missed.length) labelParts.push(`하지 않은 일 ${data.missed.length}개`);
          return `<button class="history-calendar-day ${selected ? "selected" : ""} ${dateKey === today ? "today" : ""}" data-action="history-select-date" data-date="${dateKey}" aria-label="${labelParts.join(", ")}" ${beforeStart || future ? "disabled" : ""}>
            <span>${day}</span>
            <i>${doneCount ? `<b class="done-dot"></b>` : ""}${data.missed.length ? `<b class="missed-dot"></b>` : ""}</i>
          </button>`;
        }).join("")}
      </div>
      <div class="history-calendar-footer">
        <span><i class="done-dot"></i> 확인한 기록</span><span><i class="missed-dot"></i> 하지 않은 일</span>
        <button class="calendar-today-btn" data-action="history-today">오늘</button>
      </div>
    </section>
  `;
}

function renderHistoryEvent(event) {
  const task = getTask(event.taskId);
  if (!task) return "";
  const isChecked = event.eventType === "not_needed";
  const memberText = isChecked
    ? `${escapeHtml(subjectName(event.memberId))} 확인 · 아직 괜찮음`
    : `${escapeHtml(subjectName(event.memberId))} 완료`;
  return `<article class="history-row">
    <div class="history-check ${isChecked ? "not-needed" : ""}">${isChecked ? "○" : "✓"}</div>
    <div><h3>${escapeHtml(task.title)}</h3><p>${memberText} · ${formatTime(event.createdAt)}${event.note ? ` · ${escapeHtml(event.note)}` : ""}</p></div>
    <div class="history-action"><span class="row-status">${task.estimate}분</span><button class="btn ghost danger" data-action="undo-event" data-event="${event.id}">취소</button></div>
  </article>`;
}

function weekStartKey(dateKey = operationalDate()) {
  const date = new Date(`${dateKey}T12:00:00`);
  const offset = (date.getDay() + 6) % 7;
  return dateKeyPlusDays(dateKey, -offset);
}

function weeklyHistorySummary() {
  const start = weekStartKey();
  const end = dateKeyPlusDays(start, 6);
  const previousStart = dateKeyPlusDays(start, -7);
  const previousEnd = dateKeyPlusDays(start, -1);
  const inRange = (event, from, to) => {
    const key = operationalDate(event.createdAt);
    return key >= from && key <= to;
  };
  const current = state.events.filter((event) => ["completed", "not_needed", "postponed"].includes(event.eventType) && inRange(event, start, end));
  const previous = state.events.filter((event) => ["completed", "not_needed"].includes(event.eventType) && inRange(event, previousStart, previousEnd));
  const minutes = { wife: 0, husband: 0 };
  current.filter((event) => event.eventType === "completed").forEach((event) => {
    const estimate = Number(getTask(event.taskId)?.estimate || 0);
    if (event.memberId === "together") {
      minutes.wife += estimate / 2;
      minutes.husband += estimate / 2;
    } else if (minutes[event.memberId] !== undefined) minutes[event.memberId] += estimate;
  });
  const postponedCounts = new Map();
  current.filter((event) => event.eventType === "postponed").forEach((event) => postponedCounts.set(event.taskId, (postponedCounts.get(event.taskId) || 0) + 1));
  const repeated = [...postponedCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([taskId, count]) => ({ task: getTask(taskId), count }))
    .filter(({ task }) => task)
    .sort((left, right) => right.count - left.count);
  const handled = current.filter((event) => ["completed", "not_needed"].includes(event.eventType)).length;
  return { start, end, handled, previousHandled: previous.length, minutes, repeated };
}

function renderWeeklyHistorySummary() {
  const summary = weeklyHistorySummary();
  const difference = summary.handled - summary.previousHandled;
  const comparison = difference > 0 ? `지난주보다 ${difference}개 더 확인했어요` : difference < 0 ? `지난주보다 ${Math.abs(difference)}개 덜 했어요` : "지난주와 같은 수예요";
  return `<section class="weekly-summary-panel">
    <div class="weekly-summary-heading"><div><p class="eyebrow">이번 주 돌아보기</p><h2>${formatHistoryDate(summary.start).replace("오늘 · ", "")}부터</h2></div><span>${escapeHtml(comparison)}</span></div>
    <div class="weekly-summary-grid">
      <div><strong>${summary.handled}</strong><span>완료·점검</span></div>
      <div><strong>${minutesText(summary.minutes.wife)}</strong><span>${escapeHtml(nameFor("wife"))}의 수고</span></div>
      <div><strong>${minutesText(summary.minutes.husband)}</strong><span>${escapeHtml(nameFor("husband"))}의 수고</span></div>
    </div>
    ${summary.repeated.length ? `<div class="repeated-postponed"><strong>이번 주 계속 미룬 일</strong><div>${summary.repeated.map(({ task, count }) => `<span>${escapeHtml(task.title)} · ${count}번</span>`).join("")}</div></div>` : `<p class="weekly-gentle-note">반복해서 미룬 일이 없어요. 서로의 흐름을 잘 맞추고 있어요.</p>`}
  </section>`;
}

function renderHistory() {
  const today = operationalDate();
  ui.historyDate = ui.historyDate > today ? today : ui.historyDate;
  ui.historyDate = ui.historyDate < historyTrackingStartDate() ? historyTrackingStartDate() : ui.historyDate;
  const data = historyDayData(ui.historyDate);
  const isToday = ui.historyDate === today;
  const handledCount = data.completed.length + data.checked.length;
  const hasResettable = handledCount || data.postponed.length;
  const recoveryDate = isWifeRecoveryDate(ui.historyDate);

  return `
    <div class="inner-page history-page">
      <header class="inner-header"><div><p class="eyebrow">함께 쌓인 하루</p><h1>날짜별 기록</h1><p>날짜를 고르면 누가 무엇을 했고, 그날 하지 못한 일은 무엇인지 볼 수 있어요.</p></div></header>
      ${renderWeeklyHistorySummary()}
      <div class="history-layout">
        ${renderHistoryCalendar()}
        <section class="history-day-panel">
          <div class="history-day-heading">
            <div><p class="eyebrow">${isToday ? "오늘" : "선택한 날"}</p><h2>${formatHistoryDate(ui.historyDate)}</h2></div>
            ${hasResettable ? `<button class="reset-today-btn" data-action="reset-date" data-date="${ui.historyDate}">↶ 이날 기록 초기화</button>` : ""}
          </div>
          <div class="history-summary-cards">
            <div><strong>${data.completed.length}</strong><span>완료</span></div>
            <div><strong>${data.checked.length}</strong><span>점검</span></div>
            <div class="missed"><strong>${data.missed.length}</strong><span>${isToday ? "아직 안 함" : "하지 않음"}</span></div>
          </div>
          ${recoveryDate ? `<p class="history-recovery-note"><strong>${escapeHtml(nameFor("wife"))} 회복일</strong> · 오전 8시~오후 6시는 아내 몫의 미완료 부담으로 계산하지 않아요.</p>` : ""}

          <section class="history-detail-section">
            <div class="history-detail-title"><h3>완료한 일</h3><span>누가 했는지 함께 보여드려요</span></div>
            ${data.completed.length ? `<div class="history-list">${data.completed.map(renderHistoryEvent).join("")}</div>` : `<div class="history-mini-empty">${isToday ? "아직 완료한 일이 없어요." : "완료 기록이 없어요."}</div>`}
          </section>

          ${data.checked.length ? `<section class="history-detail-section">
            <div class="history-detail-title"><h3>확인한 일</h3><span>‘아직 괜찮음’으로 점검했어요</span></div>
            <div class="history-list">${data.checked.map(renderHistoryEvent).join("")}</div>
          </section>` : ""}

          <section class="history-detail-section missed-section">
            <div class="history-detail-title"><h3>${isToday ? "아직 하지 않은 일" : "하지 않았던 일"}</h3><span>그날 주기가 실제로 돌아온 일만 보여줘요</span></div>
            ${data.missed.length ? `<div class="history-list">${data.missed.map(({ task, expectation, postponed, postponedUntil }) => `
              <article class="history-row missed-row">
                <div class="history-check missed">!</div>
                <div><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(expectation.label)} · ${recurrenceLabel(task)}</p></div>
                <span class="history-missed-label ${postponed ? "postponed" : ""}">${postponed ? `${postponedUntil ? `${escapeHtml(formatHistoryDate(postponedUntil).replace("오늘 · ", ""))}로 ` : ""}미룸` : isToday ? "아직 미완료" : "완료 기록 없음"}</span>
              </article>
            `).join("")}</div>` : `<div class="history-all-done"><span>✓</span><div><strong>${isToday ? "현재까지 놓친 일이 없어요" : "그날 할 일을 모두 확인했어요"}</strong><p>작은 수고가 차곡차곡 기록되어 있어요.</p></div></div>`}
          </section>
        </section>
      </div>
    </div>
  `;
}

function formatHistoryDate(key) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  const text = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(date);
  return key === operationalDate() ? `오늘 · ${text}` : text;
}

function upcomingDates(count = 14) {
  const dates = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let index = 0; index < count; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    dates.push(date);
  }
  return dates;
}

function renderBackupSnapshots() {
  if (backupSnapshots.loading) return `<div class="backup-snapshots"><p>복원 지점을 불러오는 중이에요…</p></div>`;
  if (backupSnapshots.error) return `<div class="backup-snapshots error"><p>${escapeHtml(backupSnapshots.error)}</p></div>`;
  if (!backupSnapshots.loaded) return `<div class="backup-snapshots"><p>자동 백업 날짜를 불러오면 원하는 날로 복원할 수 있어요.</p></div>`;
  if (!backupSnapshots.items.length) return `<div class="backup-snapshots"><p>아직 자동 백업이 없어요.</p></div>`;
  return `<details class="backup-snapshots"><summary>자동 복원 지점 ${backupSnapshots.items.length}개 보기</summary><div class="backup-snapshot-list">${backupSnapshots.items.map((item) => `<div><span><strong>${formatHistoryDate(item.date).replace("오늘 · ", "")}</strong><small>${Math.max(1, Math.round(Number(item.size || 0) / 1024))}KB</small></span><button class="btn ghost danger" data-action="backup-restore" data-date="${item.date}">이날로 복원</button></div>`).join("")}</div></details>`;
}

async function loadBackupSnapshots(force = false) {
  if (!USE_REMOTE_SERVER || backupSnapshots.loading || (backupSnapshots.loaded && !force)) return;
  backupSnapshots = { ...backupSnapshots, loading: true, error: "" };
  if (auth.authenticated) render();
  try {
    const response = await fetch("/api/backups", { cache: "no-store" });
    if (!response.ok) throw new Error("load_failed");
    const result = await response.json();
    backupSnapshots = { loading: false, loaded: true, items: Array.isArray(result.backups) ? result.backups : [], error: "" };
  } catch {
    backupSnapshots = { loading: false, loaded: true, items: [], error: "복원 지점을 불러오지 못했어요. 잠시 후 다시 확인해 주세요." };
  }
  if (auth.authenticated) render();
}

async function restoreBackupSnapshot(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  if (!window.confirm(`${formatHistoryDate(date).replace("오늘 · ", "")}의 자동 백업으로 공동 기록을 되돌릴까요?\n오늘 만들어진 자동 백업은 그대로 유지됩니다.`)) return;
  try {
    const response = await fetch(`/api/backups/${date}`, { cache: "no-store" });
    if (!response.ok) throw new Error("restore_failed");
    const result = await response.json();
    const incoming = result.state;
    if (!incoming?.household || !Array.isArray(incoming.events)) throw new Error("invalid_backup");
    const currentMember = state.currentMember;
    const clientId = state.clientId;
    state = normalizeState(incoming, { currentMember, clientId, updatedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(PENDING_REPLACE_KEY, JSON.stringify(state));
    render();
    const replaced = await flushPendingReplacement();
    toast(replaced ? "선택한 날짜의 백업을 두 기기에 복원했어요." : "이 기기에 복원했어요. 연결되면 함께 반영할게요.");
  } catch {
    toast("백업을 복원하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
}

function renderSettings() {
  const wifeSchedule = state.household.workSchedule.wife;
  const husbandSchedule = state.household.workSchedule.husband;
  const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `
    <div class="inner-page">
      <header class="inner-header"><div><p class="eyebrow">우리답게 맞추기</p><h1>우리 집 설정</h1><p>두 사람의 근무와 하루의 경계를 생활 리듬에 맞게 조절해요.</p></div></header>
      <section class="settings-section">
        <h2>함께 쓰는 사람</h2>
        <div class="setting-row">
          <div><h3>두 사람의 이름</h3><p>앱 곳곳의 완료자와 맡은 사람 표시에 사용해요.</p></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label class="field-label">첫 번째 사람<input class="form-control" data-setting="wifeName" value="${escapeHtml(state.household.wifeName)}"></label><label class="field-label">두 번째 사람<input class="form-control" data-setting="husbandName" value="${escapeHtml(state.household.husbandName)}"></label></div>
        </div>
        <div class="setting-row">
          <div><h3>이 휴대폰의 기본 사용자</h3><p>앱을 다시 열어도 이 사람으로 시작해요. 위쪽 이름을 눌러 잠시 바꿀 수도 있어요.</p></div>
          <div class="device-member-choice">
            <button class="btn ${state.currentMember === "wife" ? "primary" : ""}" data-action="set-device-member" data-member-id="wife">${escapeHtml(nameFor("wife"))}</button>
            <button class="btn ${state.currentMember === "husband" ? "primary" : ""}" data-action="set-device-member" data-member-id="husband">${escapeHtml(nameFor("husband"))}</button>
          </div>
        </div>
      </section>
      <section class="settings-section" id="schedule-settings">
        <h2>근무 일정</h2>
        <div class="setting-row">
          <div><h3>${escapeHtml(nameFor("wife"))} 야간근무</h3><p>선택한 요일 밤에 출근해 다음 날 아침 퇴근하는 일정이에요.</p></div>
          <div class="work-schedule-control">
            <div class="weekday-picker">${weekdayNames.map((day, index) => `<button class="weekday-btn ${(wifeSchedule.nightDays || []).map(Number).includes(index) ? "active" : ""}" data-action="toggle-night-day" data-day="${index}">${day}</button>`).join("")}</div>
            <div class="time-pair"><label class="field-label">출근<input type="time" class="form-control" data-work-member="wife" data-work-field="start" value="${wifeSchedule.start}"></label><span>→</span><label class="field-label">퇴근<input type="time" class="form-control" data-work-member="wife" data-work-field="end" value="${wifeSchedule.end}"></label></div>
            <div class="recovery-setting"><div><strong>야간근무 후 회복 시간</strong><span>퇴근한 날에는 이 시각까지 아내 대상 추천과 알림을 쉬어요.</span></div><label class="field-label">회복 종료<input type="time" class="form-control" data-work-member="wife" data-work-field="recoveryEnd" value="${wifeSchedule.recoveryEnd || "18:00"}"></label></div>
          </div>
        </div>
        <div class="setting-row">
          <div><h3>${escapeHtml(nameFor("husband"))} 근무시간</h3><p>휴무로 표시하지 않은 날에는 이 근무시간을 기준으로 안내해요.</p></div>
          <div class="time-pair"><label class="field-label">출근<input type="time" class="form-control" data-work-member="husband" data-work-field="start" value="${husbandSchedule.start}"></label><span>→</span><label class="field-label">퇴근<input type="time" class="form-control" data-work-member="husband" data-work-field="end" value="${husbandSchedule.end}"></label></div>
        </div>
        <div class="setting-row offday-setting">
          <div><h3>${escapeHtml(nameFor("husband"))} 변동 휴무</h3><p>앞으로 5주 중 쉬는 날을 눌러주세요. 초록색 날짜가 휴무예요.</p></div>
          <details class="offday-details" ${ui.settingsSection === "schedule" || needsDaysOffPlan() ? "open" : ""}>
            <summary>${needsDaysOffPlan() ? "휴무 입력이 필요해요" : "5주 휴무 달력 열기"}</summary>
            <div class="offday-calendar-wrap">
            <div class="offday-calendar-actions"><span>앞으로 5주</span><div><button class="btn ghost" data-action="copy-days-off">이번 주 → 다음 주</button><button class="btn ghost" data-action="repeat-days-off">최근 패턴 적용</button></div></div>
            <div class="offday-weekdays">${weekdayNames.map((day) => `<span>${day}</span>`).join("")}</div>
            <div class="offday-grid">
              ${Array.from({ length: new Date().getDay() }, () => `<span class="offday-blank"></span>`).join("")}
              ${upcomingDates(35).map((date) => {
            const key = localDateKey(date);
            const active = (husbandSchedule.daysOff || []).includes(key);
            return `<button class="offday-btn ${active ? "active" : ""}" data-action="toggle-day-off" data-date="${key}"><small>${weekdayNames[date.getDay()]}</small><strong>${date.getMonth() + 1}/${date.getDate()}</strong></button>`;
              }).join("")}
            </div>
            </div>
          </details>
        </div>
      </section>
      <section class="settings-section">
        <h2>하루와 알림</h2>
        <div class="setting-row">
          <div><h3>하루가 시작되는 시각</h3><p>육아로 자정이 지나도 같은 날로 기록할 수 있어요.</p></div>
          <select class="form-control" data-setting="dayStart">${[0, 2, 3, 4, 5, 6].map((hour) => `<option value="${hour}" ${Number(state.household.dayStart) === hour ? "selected" : ""}>${hour === 0 ? "자정" : `새벽 ${hour}시`}</option>`).join("")}</select>
        </div>
        <div class="setting-row">
          <div><h3>오전 요약</h3><p>오늘 할 일을 한 번만 모아 알려주는 시각이에요.</p></div>
          <input type="time" class="form-control" data-setting="morningAlert" value="${state.household.morningAlert}">
        </div>
        <div class="setting-row">
          <div><h3>저녁 확인</h3><p>밀린 일이 있을 때만 알려주는 시각이에요.</p></div>
          <input type="time" class="form-control" data-setting="eveningAlert" value="${state.household.eveningAlert}">
        </div>
        <div class="setting-row">
          <div><h3>이 기기 푸시 알림</h3><p>${pushStatusText()}</p></div>
          <div class="notification-actions">
            ${pushInfo.enabled
              ? `<button class="btn" data-action="push-test">시험 알림</button><button class="btn danger" data-action="push-disable">알림 끄기</button>`
              : `<button class="btn primary" data-action="push-enable" ${!pushInfo.supported || pushInfo.loading ? "disabled" : ""}>${pushInfo.loading ? "연결 중…" : "알림 켜기"}</button>`}
          </div>
        </div>
        <div class="setting-row">
          <div><h3>서로의 완료 알림</h3><p>상대가 맡기나 완료를 기록했을 때 알려줘요. 부담스러우면 꺼두세요.</p></div>
          <label class="toggle" style="justify-self:end"><input type="checkbox" data-setting-toggle="partnerAlerts" ${state.household.partnerAlerts ? "checked" : ""}><span></span></label>
        </div>
      </section>
      <section class="settings-section">
        <h2>표시 방법</h2>
        <div class="setting-row">
          <div><h3>예상 시간 통계</h3><p>경쟁이 아닌 업무 쏠림 확인용으로만 보여줘요.</p></div>
          <label class="toggle" style="justify-self:end"><input type="checkbox" data-setting-toggle="showStats" ${state.household.showStats ? "checked" : ""}><span></span></label>
        </div>
      </section>
      <section class="settings-section ${ui.settingsSection === "install" ? "highlight-setting" : ""}" id="install-settings">
        <h2>홈 화면 앱</h2>
        <div class="setting-row">
          <div><h3>${isStandaloneApp() ? "앱으로 사용 중" : "도란도란 바로 열기"}</h3><p>${escapeHtml(installGuideText())}</p></div>
          ${isStandaloneApp() ? `<span class="setting-ok">설치됨</span>` : `<button class="btn primary" data-action="install-app">${deferredInstallPrompt ? "홈 화면에 설치" : "설치 방법 보기"}</button>`}
        </div>
        <div class="setting-row">
          <div><h3>공동 데이터 상태</h3><p>두 휴대폰의 마지막 저장 상태를 확인해요.</p></div>
          <span class="sync-detail ${syncInfo.status}">${escapeHtml(syncStatusText())}</span>
        </div>
      </section>
      ${USE_REMOTE_SERVER ? `<section class="settings-section">
        <h2>로그인</h2>
        <div class="setting-row">
          <div><h3>이 기기 자동 로그인</h3><p>90일 동안 유지돼요. 휴대폰을 바꾸거나 공용 기기에서 사용했다면 로그아웃해 주세요.</p></div>
          <button class="btn" data-action="logout">이 기기 로그아웃</button>
        </div>
      </section>` : ""}
      <section class="settings-section">
        <h2>데이터 보관</h2>
        <div class="setting-row">
          <div><h3>자동 백업과 직접 보관</h3><p>서버에는 하루 한 번 최근 31일을 자동 보관해요. 파일로 내려받아 휴대폰이나 드라이브에도 따로 보관할 수 있어요.</p></div>
          <div class="data-actions">
            <button class="btn" data-action="data-export">백업 내려받기</button>
            <button class="btn" data-action="data-import">백업 불러오기</button>
            ${USE_REMOTE_SERVER ? `<button class="btn ghost" data-action="backup-refresh">복원 지점 새로고침</button>` : ""}
            <input id="backup-import-input" type="file" accept="application/json,.json" hidden>
          </div>
        </div>
        ${USE_REMOTE_SERVER ? renderBackupSnapshots() : ""}
      </section>
      <section class="danger-zone">
        <div><h3>처음 상태로 되돌리기</h3><p>공유된 완료 기록, 장보기 목록과 설정을 모두 지워요.</p></div>
        <button class="btn danger" data-action="reset">모든 기록 초기화</button>
      </section>
    </div>
  `;
}

function renderModal() {
  const root = document.getElementById("modal-root");
  if (!ui.modal) {
    root.innerHTML = "";
    return;
  }
  if (ui.modal === "complete") root.innerHTML = renderCompleteModal();
  if (ui.modal === "postpone") root.innerHTML = renderPostponeModal();
  if (ui.modal === "task") root.innerHTML = renderTaskModal();
  if (ui.modal === "shopping") root.innerHTML = renderShoppingEditModal();
  if (ui.modal === "expense") root.innerHTML = renderExpenseModal();
  if (ui.modal === "recurring") root.innerHTML = renderRecurringExpenseModal();
  if (ui.modal === "budget") root.innerHTML = renderBudgetModal();
  if (ui.modal === "receipt-loading") root.innerHTML = renderReceiptLoadingModal();
  if (ui.modal === "alerts") root.innerHTML = renderAlertsModal();
}

function modalShell(title, subtitle, content) {
  return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><header class="modal-header"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div><button class="modal-close" data-action="modal-close" aria-label="닫기">×</button></header>${content}</section></div>`;
}

function renderCompleteModal() {
  const task = getTask(ui.modalData.taskId);
  if (!task) return "";
  const existing = ui.modalData.eventId ? state.events.find((event) => event.id === ui.modalData.eventId) : null;
  const options = ["wife", "husband", "together"];
  const content = `
    <form id="complete-form">
      <label class="field-label">누가 완료했나요?</label>
      <div class="choice-grid">${options.map((member) => `<label class="choice ${ui.completionMember === member ? "selected" : ""}"><input type="radio" name="member" value="${member}" ${ui.completionMember === member ? "checked" : ""} data-completion-member="${member}"><span>${member === "together" ? "둘이 함께" : escapeHtml(nameFor(member))}</span></label>`).join("")}</div>
      <label class="field-label">짧은 메모 · 선택<textarea class="form-control" name="note" rows="3" placeholder="특별히 남길 내용이 있다면 적어주세요">${escapeHtml(existing?.note || "")}</textarea></label>
      <div class="modal-actions"><button type="button" class="btn" data-action="modal-close">취소</button><button type="submit" class="btn primary">${existing ? "완료자 변경" : "완료로 기록"}</button></div>
    </form>`;
  return modalShell(task.title, `${task.estimate}분의 수고를 따뜻하게 기록할게요.`, content);
}

function renderPostponeModal() {
  const task = getTask(ui.modalData?.taskId);
  if (!task) return "";
  const today = operationalDate();
  const tomorrow = dateKeyPlusDays(today, 1);
  const weekendOffset = (6 - new Date(`${today}T12:00:00`).getDay() + 7) % 7 || 7;
  const weekend = dateKeyPlusDays(today, weekendOffset);
  const nextMondayOffset = (8 - new Date(`${today}T12:00:00`).getDay()) % 7 || 7;
  const nextMonday = dateKeyPlusDays(today, nextMondayOffset);
  const content = `<div class="postpone-options">
    <button class="postpone-choice" data-action="postpone-choice" data-task="${task.id}" data-date="${tomorrow}"><strong>내일</strong><span>${formatHistoryDate(tomorrow).replace("오늘 · ", "")}</span></button>
    <button class="postpone-choice" data-action="postpone-choice" data-task="${task.id}" data-date="${weekend}"><strong>이번 주말</strong><span>${formatHistoryDate(weekend).replace("오늘 · ", "")}</span></button>
    <button class="postpone-choice" data-action="postpone-choice" data-task="${task.id}" data-date="${nextMonday}"><strong>이번 주 쉬기</strong><span>다음 월요일 다시 표시</span></button>
    <form id="postpone-form" class="postpone-date-form">
      <input type="hidden" name="taskId" value="${task.id}">
      <label class="field-label">직접 날짜 선택<input class="form-control" type="date" name="date" min="${tomorrow}" required></label>
      <button class="btn primary" type="submit">이 날짜로 미루기</button>
    </form>
  </div>`;
  return modalShell(`${task.title} 미루기`, "내일 하자는 그대로 바로 누를 수 있고, 필요할 때만 날짜를 골라요.", content);
}

function renderShoppingEditModal() {
  const item = state.shoppingItems.find((entry) => entry.id === ui.modalData?.shoppingId);
  if (!item) return "";
  const content = `<form id="shopping-edit-form" class="modal-form">
    <input type="hidden" name="shoppingId" value="${item.id}">
    <label class="field-label">품목 이름<input class="form-control" name="name" maxlength="60" required value="${escapeHtml(item.name)}"></label>
    <label class="field-label">분류<select class="form-control" name="category">${Object.entries(SHOPPING_CATEGORIES).map(([key, label]) => `<option value="${key}" ${item.category === key ? "selected" : ""}>${label}</option>`).join("")}</select></label>
    <label class="field-label">수량 또는 메모<input class="form-control" name="detail" maxlength="60" value="${escapeHtml(item.detail || "")}"></label>
    <div class="modal-actions"><button type="button" class="btn" data-action="modal-close">취소</button><button type="submit" class="btn primary">수정 저장</button></div>
  </form>`;
  return modalShell("장보기 품목 수정", "수량이나 분류가 달라져도 바로 고칠 수 있어요.", content);
}

function financeOptions(options, selected) {
  return Object.entries(options).map(([key, label]) => `<option value="${key}" ${key === selected ? "selected" : ""}>${label}</option>`).join("");
}

function renderExpenseModal() {
  const existing = ui.modalData?.expenseId ? state.expenses.find((item) => item.id === ui.modalData.expenseId) : null;
  const draft = existing || ui.modalData?.draft || {};
  const itemsText = (draft.items || []).map((item) => `${item.name} | ${Number(item.quantity || 1)} | ${Number(item.amount || 0)}`).join("\n");
  const confidence = Number(draft.receiptMeta?.confidence ?? draft.confidence ?? 0);
  const warnings = draft.receiptMeta?.warnings || draft.warnings || [];
  const content = `<form id="expense-form" class="modal-form expense-form">
    <input type="hidden" name="expenseId" value="${existing?.id || ""}">
    <input type="hidden" name="source" value="${escapeHtml(draft.source || (ui.modalData?.fromReceipt ? "receipt" : "manual"))}">
    ${ui.modalData?.fromReceipt ? `<div class="analysis-result ${confidence < .7 ? "low" : ""}"><strong>${confidence >= .8 ? "영수증을 읽었어요" : "확인이 필요한 영수증이에요"}</strong><span>무료 OCR이 만든 초안입니다. 금액과 날짜를 확인한 뒤 저장해 주세요.</span>${warnings.length ? `<ul>${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</div>` : ""}
    <div class="finance-form-grid">
      <label class="field-label">날짜<input class="form-control" type="date" name="date" required value="${escapeHtml(draft.date || operationalDate())}"></label>
      <label class="field-label">사용처<input class="form-control" name="merchant" maxlength="80" required value="${escapeHtml(draft.merchant || "")}" placeholder="예: 마트, 병원"></label>
      <label class="field-label full">금액 · 원<input class="form-control expense-amount-input" type="number" inputmode="numeric" name="amount" min="0" max="999999999" required value="${Number(draft.amount || 0) || ""}" placeholder="0"></label>
      <label class="field-label">분류<select class="form-control" name="category">${financeOptions(FINANCE_CATEGORIES, draft.category || "food")}</select></label>
      <label class="field-label">결제 수단<select class="form-control" name="paymentMethod">${financeOptions(PAYMENT_METHODS, draft.paymentMethod || "unknown")}</select></label>
      <label class="field-label">누가 결제했나요?<select class="form-control" name="paidBy"><option value="wife" ${(draft.paidBy || state.currentMember) === "wife" ? "selected" : ""}>${escapeHtml(nameFor("wife"))}</option><option value="husband" ${(draft.paidBy || state.currentMember) === "husband" ? "selected" : ""}>${escapeHtml(nameFor("husband"))}</option><option value="shared" ${draft.paidBy === "shared" ? "selected" : ""}>공동</option></select></label>
      <label class="field-label">지출 구분<select class="form-control" name="scope"><option value="household" ${draft.scope !== "personal" ? "selected" : ""}>생활비</option><option value="personal" ${draft.scope === "personal" ? "selected" : ""}>개인 지출</option></select></label>
    </div>
    <label class="field-label">메모 · 선택<input class="form-control" name="memo" maxlength="140" value="${escapeHtml(draft.memo || "")}" placeholder="기억할 내용"></label>
    <details class="expense-items-details" ${itemsText ? "open" : ""}><summary>품목 ${itemsText ? `${(draft.items || []).length}개` : "직접 적기"}</summary><p>한 줄에 ‘품목 | 수량 | 금액’ 형식으로 적어요.</p><textarea class="form-control" name="items" rows="5" placeholder="우유 | 1 | 2800">${escapeHtml(itemsText)}</textarea></details>
    <div class="modal-actions"><button type="button" class="btn" data-action="modal-close">취소</button><button type="submit" class="btn primary">${existing ? "수정 저장" : "가계부에 저장"}</button></div>
  </form>`;
  return modalShell(existing ? "지출 내역 수정" : "지출 기록", ui.modalData?.fromReceipt ? "영수증 원본은 저장하지 않았어요." : "두 사람이 함께 확인할 수 있게 기록해요.", content);
}

function renderRecurringExpenseModal() {
  const existing = ui.modalData?.recurringId ? state.recurringExpenses.find((item) => item.id === ui.modalData.recurringId) : null;
  const item = existing || {};
  const content = `<form id="recurring-expense-form" class="modal-form">
    <input type="hidden" name="recurringId" value="${existing?.id || ""}">
    <label class="field-label">고정비 이름<input class="form-control" name="title" maxlength="80" required value="${escapeHtml(item.title || "")}" placeholder="예: 휴대폰 요금"></label>
    <div class="finance-form-grid">
      <label class="field-label">금액 · 원<input class="form-control" type="number" inputmode="numeric" name="amount" min="0" max="999999999" required value="${Number(item.amount || 0) || ""}"></label>
      <label class="field-label">매월 결제일<input class="form-control" type="number" name="dayOfMonth" min="1" max="31" required value="${Number(item.dayOfMonth || 1)}"></label>
      <label class="field-label">분류<select class="form-control" name="category">${financeOptions(FINANCE_CATEGORIES, item.category || "housing")}</select></label>
      <label class="field-label">결제 수단<select class="form-control" name="paymentMethod">${financeOptions(PAYMENT_METHODS, item.paymentMethod || "card")}</select></label>
      <label class="field-label">누가 결제하나요?<select class="form-control" name="paidBy"><option value="wife" ${(item.paidBy || state.currentMember) === "wife" ? "selected" : ""}>${escapeHtml(nameFor("wife"))}</option><option value="husband" ${(item.paidBy || state.currentMember) === "husband" ? "selected" : ""}>${escapeHtml(nameFor("husband"))}</option><option value="shared" ${item.paidBy === "shared" ? "selected" : ""}>공동</option></select></label>
      <label class="field-label">지출 구분<select class="form-control" name="scope"><option value="household" ${item.scope !== "personal" ? "selected" : ""}>생활비</option><option value="personal" ${item.scope === "personal" ? "selected" : ""}>개인 지출</option></select></label>
    </div>
    <label class="toggle recurring-active"><input type="checkbox" name="active" ${item.active !== false ? "checked" : ""}><span></span><b>매달 자동 기록</b></label>
    <div class="modal-actions">${existing ? `<button type="button" class="btn danger" data-action="recurring-delete" data-recurring-id="${existing.id}">삭제</button>` : ""}<button type="button" class="btn" data-action="modal-close">취소</button><button type="submit" class="btn primary">저장</button></div>
  </form>`;
  return modalShell(existing ? "고정비 수정" : "고정비 추가", "결제일이 되면 해당 월 가계부에 자동으로 기록해요.", content);
}

function renderBudgetModal() {
  const content = `<form id="budget-form" class="modal-form"><label class="field-label">한 달 생활비 예산 · 원<input class="form-control expense-amount-input" type="number" inputmode="numeric" name="monthlyBudget" min="0" max="999999999" value="${Number(state.financeSettings?.monthlyBudget || 0) || ""}" placeholder="예: 1000000"></label><p class="form-help">개인 지출은 예산 사용액에서 제외해요. 0원으로 저장하면 예산 표시를 끕니다.</p><div class="modal-actions"><button type="button" class="btn" data-action="modal-close">취소</button><button class="btn primary" type="submit">예산 저장</button></div></form>`;
  return modalShell("월 생활비 예산", "이번 달과 다음 달에 같은 기준을 사용해요.", content);
}

function renderReceiptLoadingModal() {
  return modalShell("영수증을 읽는 중", "첫 분석은 글자 사전을 준비하느라 조금 더 걸릴 수 있어요.", `<div class="receipt-loading"><span class="receipt-spinner"></span><strong>무료 글자 인식으로 금액을 확인하고 있어요</strong><p>사진은 처리가 끝나면 서버 메모리에서 바로 지워집니다.</p></div>`);
}

function renderTaskModal() {
  const task = ui.modalData?.taskId ? getTask(ui.modalData.taskId) : null;
  const recurrenceOptions = ["daily", "window", "weekly", "biweekly", "monthly", "interval", "weekdays"];
  if (task?.recurrence === "conditional") recurrenceOptions.push("conditional");
  const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const selectedWeekdays = (task?.weekdays || []).map(Number);
  const content = `
    <form id="task-form" class="modal-form">
      <input type="hidden" name="taskId" value="${task?.id || ""}">
      <label class="field-label">집안일 이름<input class="form-control" name="title" required maxlength="40" value="${escapeHtml(task?.title || "")}" placeholder="예: 공기청정기 필터 확인"></label>
      <label class="field-label">간단한 설명<input class="form-control" name="description" maxlength="100" value="${escapeHtml(task?.description || "")}" placeholder="부담 없이 알아볼 수 있게 적어주세요"></label>
      <label class="field-label">반복 주기<select class="form-control" name="recurrence" data-task-recurrence>${recurrenceOptions.map((recurrence) => `<option value="${recurrence}" ${task?.recurrence === recurrence ? "selected" : ""}>${RECURRENCE_LABELS[recurrence]}</option>`).join("")}</select></label>
      <div class="recurrence-panel" data-recurrence-fields="interval" ${task?.recurrence === "interval" ? "" : "hidden"}><label class="field-label">며칠마다<input class="form-control" type="number" name="intervalDays" min="2" max="365" value="${Number(task?.intervalDays || 7)}"></label></div>
      <div class="recurrence-panel" data-recurrence-fields="weekdays" ${task?.recurrence === "weekdays" ? "" : "hidden"}><span class="field-label">반복할 요일</span><div class="weekday-picker task-weekday-picker">${weekdayNames.map((day, index) => `<label class="weekday-choice"><input type="checkbox" name="weekdays" value="${index}" ${selectedWeekdays.includes(index) ? "checked" : ""}><span>${day}</span></label>`).join("")}</div></div>
      <label class="field-label">예상 시간 · 분<input class="form-control" type="number" name="estimate" min="1" max="240" value="${task?.estimate || 10}"></label>
      <label class="field-label">세부 체크 항목 · 선택<textarea class="form-control" name="subtasks" rows="4" placeholder="한 줄에 하나씩 적어주세요">${escapeHtml((task?.subtasks || []).join("\n"))}</textarea></label>
      <label class="field-label">이 날짜까지 잠시 쉬기 · 선택<input class="form-control" type="date" name="pausedUntil" min="${dateKeyPlusDays(operationalDate(), 1)}" value="${escapeHtml(task?.pausedUntil || "")}"></label>
      <div class="modal-actions"><button type="button" class="btn" data-action="modal-close">취소</button><button type="submit" class="btn primary">${task ? "수정 저장" : "집안일 추가"}</button></div>
    </form>`;
  return modalShell(task ? "집안일 수정" : "새 집안일", "실제 생활에 맞게 언제든 바꿀 수 있어요.", content);
}

function renderAlertsModal() {
  const content = `<div>
    <p class="sidebar-text" style="font-size:12px;margin-top:0">집안일마다 울리지 않아요. 오전 ${state.household.morningAlert}에 오늘 할 일을 한 번 요약하고, 저녁 ${state.household.eveningAlert}에는 남은 일이 있을 때만 알려드려요.</p>
    <div class="notification-status ${pushInfo.enabled ? "enabled" : ""}"><strong>${pushInfo.enabled ? "이 기기 알림 켜짐" : "이 기기 알림 꺼짐"}</strong><span>${pushStatusText()}</span></div>
    <div class="modal-actions">
      ${pushInfo.enabled ? `<button class="btn" data-action="push-test">시험 알림</button><button class="btn danger" data-action="push-disable">알림 끄기</button>` : `<button class="btn primary" data-action="push-enable" ${!pushInfo.supported || pushInfo.loading ? "disabled" : ""}>알림 켜기</button>`}
      <button class="btn" data-action="modal-close">닫기</button>
    </div>
  </div>`;
  return modalShell("알림은 가볍게", "집안일보다 앱이 더 부담스럽지 않도록", content);
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    ui.page = pageButton.dataset.page;
    if (pageButton.dataset.settingsOpen) ui.settingsSection = pageButton.dataset.settingsOpen;
    if (ui.page === "settings" && USE_REMOTE_SERVER && !backupSnapshots.loaded && !backupSnapshots.loading) loadBackupSnapshots();
    if (ui.page === "finance") {
      loadFinanceConfig();
      if (ensureRecurringExpenses()) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        saveState();
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    render();
    if (pageButton.dataset.settingsOpen) requestAnimationFrame(() => document.getElementById(`${pageButton.dataset.settingsOpen}-settings`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return;
  }

  const memberButton = event.target.closest("[data-member]");
  if (memberButton) {
    state.currentMember = memberButton.dataset.member;
    ui.completionMember = state.currentMember;
    localStorage.setItem(DEVICE_MEMBER_KEY, state.currentMember);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncPushMember();
    render();
    return;
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    ui.filter = filterButton.dataset.filter;
    render();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const taskId = actionButton.dataset.task;

  if (action === "claim") return toggleClaim(taskId);
  if (action === "postpone-tomorrow") return postponeUntilTomorrow(taskId);
  if (action === "postpone-open") {
    ui.modal = "postpone";
    ui.modalData = { taskId };
    renderModal();
    return;
  }
  if (action === "postpone-choice") return postponeTaskUntil(taskId, actionButton.dataset.date);
  if (action === "not-needed") return markNotNeeded(taskId);
  if (action === "complete-quick") return completeTask(taskId, state.currentMember, "", { quick: true });
  if (action === "bottle-trigger") return triggerBottle();
  if (action === "bottle-no") return dismissBottlePrompt();
  if (action === "undo-event") return undoEvent(actionButton.dataset.event);
  if (action === "task-add") {
    ui.modal = "task";
    ui.modalData = null;
    renderModal();
    return;
  }
  if (action === "task-edit") {
    ui.modal = "task";
    ui.modalData = { taskId };
    renderModal();
    return;
  }
  if (action === "show-alerts") {
    ui.modal = "alerts";
    renderModal();
    return;
  }
  if (action === "history-prev-month") return moveHistoryMonth(-1);
  if (action === "history-next-month") return moveHistoryMonth(1);
  if (action === "history-select-date") return selectHistoryDate(actionButton.dataset.date);
  if (action === "history-today") return selectHistoryToday();
  if (action === "toggle-night-day") return toggleNightDay(Number(actionButton.dataset.day));
  if (action === "toggle-day-off") return toggleDayOff(actionButton.dataset.date);
  if (action === "copy-days-off") return copyPreviousWeekDaysOff();
  if (action === "repeat-days-off") return repeatRecentDaysOffPattern();
  if (action === "set-device-member") return setDeviceMember(actionButton.dataset.memberId);
  if (action === "shopping-quick-add") return addQuickShoppingItem(actionButton.dataset.name, actionButton.dataset.category);
  if (action === "shopping-toggle") return toggleShoppingItem(actionButton.dataset.shoppingId);
  if (action === "shopping-delete") return deleteShoppingItem(actionButton.dataset.shoppingId);
  if (action === "shopping-edit") return openShoppingEdit(actionButton.dataset.shoppingId);
  if (action === "shopping-trip") { ui.shoppingTrip = !ui.shoppingTrip; render(); return; }
  if (action === "shopping-clear-bought") return clearBoughtShoppingItems();
  if (action === "shopping-to-expense") return openShoppingExpense();
  if (action === "receipt-select") return document.getElementById("receipt-image-input")?.click();
  if (action === "expense-add") return openExpenseModal();
  if (action === "expense-edit") return openExpenseModal(actionButton.dataset.expenseId);
  if (action === "expense-delete") return deleteExpense(actionButton.dataset.expenseId);
  if (action === "finance-prev-month") { ui.financeMonth = shiftMonthKey(ui.financeMonth, -1); render(); return; }
  if (action === "finance-next-month" && ui.financeMonth < operationalDate().slice(0, 7)) { ui.financeMonth = shiftMonthKey(ui.financeMonth, 1); render(); return; }
  if (action === "budget-edit") { ui.modal = "budget"; ui.modalData = null; renderModal(); return; }
  if (action === "recurring-add") { ui.modal = "recurring"; ui.modalData = null; renderModal(); return; }
  if (action === "recurring-edit") { ui.modal = "recurring"; ui.modalData = { recurringId: actionButton.dataset.recurringId }; renderModal(); return; }
  if (action === "recurring-delete") return deleteRecurringExpense(actionButton.dataset.recurringId);
  if (action === "expenses-export") return exportExpensesCsv();
  if (action === "push-enable") return enablePushNotifications();
  if (action === "push-disable") return disablePushNotifications();
  if (action === "push-test") return testPushNotification();
  if (action === "data-export") return exportBackup();
  if (action === "data-import") return document.getElementById("backup-import-input")?.click();
  if (action === "backup-refresh") return loadBackupSnapshots(true);
  if (action === "backup-restore") return restoreBackupSnapshot(actionButton.dataset.date);
  if (action === "install-app") return installApp();
  if (action === "dismiss-install-hint") { localStorage.setItem(INSTALL_HINT_DISMISSED_KEY, "1"); render(); return; }
  if (action === "app-update") return window.location.reload();
  if (action === "reset-today") return resetTodayChecks();
  if (action === "reset-date") return resetDateChecks(actionButton.dataset.date);
  if (action === "logout") return logout();
  if (action === "modal-close") return closeModal();
  if (action === "modal-backdrop" && event.target === actionButton) return closeModal();
  if (action === "reset") return resetAll();
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.matches("[data-task-recurrence]")) {
    document.querySelectorAll("[data-recurrence-fields]").forEach((panel) => { panel.hidden = panel.dataset.recurrenceFields !== target.value; });
    return;
  }
  if (target.id === "backup-import-input") {
    const file = target.files?.[0];
    if (file) importBackup(file);
    target.value = "";
    return;
  }
  if (target.id === "receipt-image-input") {
    const file = target.files?.[0];
    target.value = "";
    if (file) analyzeReceiptFile(file);
    return;
  }
  if (target.matches("[data-subtask]")) {
    const taskId = target.dataset.subtask;
    state.subtaskProgress[taskId] ||= {};
    state.subtaskProgress[taskId][target.dataset.index] = target.checked;
    saveState();
    return;
  }
  if (target.matches("[data-active]")) {
    const taskId = target.dataset.active;
    state.taskOverrides[taskId] ||= {};
    state.taskOverrides[taskId].active = target.checked;
    saveState(target.checked ? "다시 오늘의 흐름에 포함했어요." : "전체 기록은 두고 목록에서 쉬게 했어요.");
    return;
  }
  if (target.matches("[data-setting]")) {
    state.household[target.dataset.setting] = target.value;
    saveState("설정을 저장했어요.");
    return;
  }
  if (target.matches("[data-setting-toggle]")) {
    state.household[target.dataset.settingToggle] = target.checked;
    saveState("표시 설정을 바꿨어요.");
    return;
  }
  if (target.matches("[data-work-member]")) {
    const member = target.dataset.workMember;
    const field = target.dataset.workField;
    state.household.workSchedule[member][field] = target.value;
    saveState("근무시간을 저장했어요.");
    return;
  }
  if (target.matches("[data-completion-member]")) {
    ui.completionMember = target.value;
    renderModal();
  }
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.target.id === "login-form") {
    const form = new FormData(event.target);
    const button = event.target.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "확인하는 중…";
    auth.error = "";
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      if (!response.ok) {
        auth.error = response.status === 429 ? "잠시 동안 로그인 시도가 많았어요. 15분 뒤 다시 시도해 주세요." : "아이디 또는 비밀번호를 다시 확인해 주세요.";
        render();
        return;
      }
      auth = { ready: true, authenticated: true, error: "" };
      localStorage.removeItem(DEVICE_LOGGED_OUT_KEY);
      render();
      await flushPendingReplacement();
      initRemoteSync();
      syncPushMember();
    } catch {
      auth.error = "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";
      render();
    }
    return;
  }
  if (event.target.id === "complete-form") {
    const form = new FormData(event.target);
    if (ui.modalData.eventId) updateCompletionEvent(ui.modalData.eventId, form.get("member"), String(form.get("note") || "").trim());
    else completeTask(ui.modalData.taskId, form.get("member"), String(form.get("note") || "").trim());
  }
  if (event.target.id === "postpone-form") {
    const form = new FormData(event.target);
    postponeTaskUntil(String(form.get("taskId") || ""), String(form.get("date") || ""));
  }
  if (event.target.id === "task-form") {
    saveTaskFromForm(new FormData(event.target));
  }
  if (event.target.id === "shopping-form") {
    addShoppingItem(new FormData(event.target));
  }
  if (event.target.id === "shopping-edit-form") {
    saveShoppingEdit(new FormData(event.target));
  }
  if (event.target.id === "expense-form") saveExpenseFromForm(new FormData(event.target));
  if (event.target.id === "recurring-expense-form") saveRecurringExpenseFromForm(new FormData(event.target));
  if (event.target.id === "budget-form") saveBudgetFromForm(new FormData(event.target));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && ui.modal) closeModal();
});

function toggleClaim(taskId) {
  const claim = state.claims[taskId];
  if (claim?.memberId === state.currentMember) {
    delete state.claims[taskId];
    saveState("맡기를 취소했어요.");
    return;
  }
  if (claim) return;
  state.claims[taskId] = { memberId: state.currentMember, claimedAt: new Date().toISOString() };
  saveState(`${subjectName(state.currentMember)} 하기로 했어요.`);
}

function addShoppingItem(form) {
  const name = String(form.get("name") || "").trim();
  const detail = String(form.get("detail") || "").trim();
  const category = SHOPPING_CATEGORIES[form.get("category")] ? String(form.get("category")) : "other";
  if (!name) return;
  addShoppingItemValues(name, detail, category);
  requestAnimationFrame(() => document.querySelector("#shopping-form input[name='name']")?.focus());
}

function addQuickShoppingItem(name, category) {
  addShoppingItemValues(String(name || "").trim(), "", SHOPPING_CATEGORIES[category] ? category : "other");
}

function addShoppingItemValues(name, detail, category) {
  if (!name) return;
  const duplicate = state.shoppingItems.find((item) => item.name.trim().toLocaleLowerCase("ko-KR") === name.toLocaleLowerCase("ko-KR"));
  if (duplicate) {
    if (!duplicate.checked) return toast(`${name}은(는) 이미 목록에 있어요.`);
    const before = { ...duplicate };
    duplicate.checked = false;
    duplicate.checkedBy = null;
    duplicate.checkedAt = null;
    duplicate.category = category || duplicate.category;
    saveState(`${name}, 다시 살 목록으로 옮겼어요.`, {
      onUndo: () => { Object.assign(duplicate, before); saveState("되돌렸어요."); },
    });
    return;
  }
  const item = {
    id: `shopping-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.slice(0, 60),
    detail: detail.slice(0, 60),
    category,
    checked: false,
    addedBy: state.currentMember,
    checkedBy: null,
    createdAt: new Date().toISOString(),
    checkedAt: null,
    updatedAt: Date.now(),
  };
  state.shoppingItems.push(item);
  saveState(`${name}, 장보기 목록에 추가했어요.`, {
    onUndo: () => {
      state.shoppingItems = state.shoppingItems.filter((entry) => entry.id !== item.id);
      saveState("추가를 되돌렸어요.");
    },
  });
}

function toggleShoppingItem(itemId) {
  const item = state.shoppingItems.find((entry) => entry.id === itemId);
  if (!item) return;
  const before = { ...item };
  item.checked = !item.checked;
  item.checkedBy = item.checked ? state.currentMember : null;
  item.checkedAt = item.checked ? new Date().toISOString() : null;
  saveState(item.checked ? `${item.name}, 장바구니에 담았어요.` : `${item.name}, 다시 살 목록으로 옮겼어요.`, {
    onUndo: () => { Object.assign(item, before); saveState("장보기 체크를 되돌렸어요."); },
  });
}

function openShoppingEdit(itemId) {
  if (!state.shoppingItems.some((item) => item.id === itemId)) return;
  ui.modal = "shopping";
  ui.modalData = { shoppingId: itemId };
  renderModal();
}

function saveShoppingEdit(form) {
  const item = state.shoppingItems.find((entry) => entry.id === String(form.get("shoppingId") || ""));
  if (!item) return closeModal();
  const name = String(form.get("name") || "").trim();
  if (!name) return;
  item.name = name.slice(0, 60);
  item.detail = String(form.get("detail") || "").trim().slice(0, 60);
  item.category = SHOPPING_CATEGORIES[form.get("category")] ? String(form.get("category")) : "other";
  closeModal(false);
  saveState("장보기 품목을 수정했어요.");
}

function deleteShoppingItem(itemId) {
  const item = state.shoppingItems.find((entry) => entry.id === itemId);
  if (!item) return;
  const index = state.shoppingItems.indexOf(item);
  state.shoppingItems = state.shoppingItems.filter((entry) => entry.id !== itemId);
  saveState(`${item.name}, 목록에서 지웠어요.`, {
    onUndo: () => {
      state.shoppingItems.splice(Math.min(index, state.shoppingItems.length), 0, item);
      saveState("삭제를 되돌렸어요.");
    },
  });
}

function clearBoughtShoppingItems() {
  const removed = state.shoppingItems.filter((item) => item.checked);
  const bought = removed.length;
  if (!removed.length) return;
  const previousHistory = JSON.parse(JSON.stringify(state.shoppingHistory || []));
  const history = new Map((state.shoppingHistory || []).map((item) => [`${String(item.name || "").trim().toLocaleLowerCase("ko-KR")}|${item.category || "other"}`, item]));
  removed.forEach((item) => {
    const record = { name: item.name, detail: item.detail || "", category: item.category || "other", lastBoughtAt: item.checkedAt || new Date().toISOString() };
    history.set(`${record.name.trim().toLocaleLowerCase("ko-KR")}|${record.category}`, record);
  });
  state.shoppingHistory = [...history.values()].sort((left, right) => new Date(right.lastBoughtAt || 0) - new Date(left.lastBoughtAt || 0)).slice(0, 40);
  state.shoppingItems = state.shoppingItems.filter((item) => !item.checked);
  saveState(`구매한 품목 ${bought}개를 정리했어요.`, {
    onUndo: () => { state.shoppingItems.push(...removed); state.shoppingHistory = previousHistory; saveState("정리를 되돌렸어요."); },
  });
}

async function loadFinanceConfig() {
  if (!USE_REMOTE_SERVER || financeInfo.aiEnabled !== null) return;
  try {
    const response = await fetch("/api/finance/config");
    if (response.ok) {
      const result = await response.json();
      const changed = financeInfo.aiEnabled !== Boolean(result.aiEnabled);
      financeInfo.aiEnabled = Boolean(result.aiEnabled);
      if (changed && ui.page === "finance") render();
    }
  } catch {
    financeInfo.aiEnabled = false;
  }
}

function openExpenseModal(expenseId = "", draft = null, options = {}) {
  ui.modal = "expense";
  ui.modalData = { expenseId, draft, fromReceipt: Boolean(options.fromReceipt) };
  renderModal();
  requestAnimationFrame(() => document.querySelector("#expense-form input[name='merchant']")?.focus());
}

function parseExpenseItems(text, fallbackCategory) {
  return String(text || "").split(/\r?\n/).map((line) => {
    const [name, quantity, amount] = line.split("|").map((value) => String(value || "").trim());
    return {
      name: name.slice(0, 80),
      quantity: Math.max(0, Number(quantity || 1) || 1),
      amount: Math.max(0, Math.round(Number(String(amount || "").replace(/[^0-9.-]/g, "")) || 0)),
      category: fallbackCategory,
    };
  }).filter((item) => item.name).slice(0, 100);
}

function saveExpenseFromForm(form) {
  const expenseId = String(form.get("expenseId") || "");
  const existing = expenseId ? state.expenses.find((item) => item.id === expenseId) : null;
  const draft = ui.modalData?.draft || {};
  const merchant = String(form.get("merchant") || "").trim();
  const amount = Math.max(0, Math.round(Number(form.get("amount") || 0)));
  if (!merchant || !amount) return toast("사용처와 금액을 확인해 주세요.");
  const now = Date.now();
  const category = FINANCE_CATEGORIES[form.get("category")] ? String(form.get("category")) : "other";
  const source = ["manual", "receipt", "shopping", "recurring"].includes(form.get("source")) ? String(form.get("source")) : "manual";
  const value = {
    ...(existing || {}),
    id: existing?.id || `expense-${now}-${Math.random().toString(36).slice(2, 7)}`,
    date: String(form.get("date") || operationalDate()),
    merchant: merchant.slice(0, 80),
    amount,
    category,
    paidBy: ["wife", "husband", "shared"].includes(form.get("paidBy")) ? String(form.get("paidBy")) : state.currentMember,
    scope: form.get("scope") === "personal" ? "personal" : "household",
    paymentMethod: PAYMENT_METHODS[form.get("paymentMethod")] ? String(form.get("paymentMethod")) : "unknown",
    memo: String(form.get("memo") || "").trim().slice(0, 140),
    items: parseExpenseItems(form.get("items"), category),
    source,
    shoppingItemIds: draft.shoppingItemIds || existing?.shoppingItemIds || [],
    receiptMeta: source === "receipt" ? {
      confidence: Number(draft.confidence ?? existing?.receiptMeta?.confidence ?? 0),
      warnings: (draft.warnings || existing?.receiptMeta?.warnings || []).slice(0, 5),
    } : existing?.receiptMeta,
    createdAt: existing?.createdAt || new Date().toISOString(),
    createdBy: existing?.createdBy || state.currentMember,
    updatedAt: now,
  };
  if (existing) Object.assign(existing, value);
  else state.expenses.push(value);
  closeModal(false);
  ui.financeMonth = value.date.slice(0, 7);
  saveState(existing ? "지출 내역을 수정했어요." : "가계부에 기록했어요.");
}

function deleteExpense(expenseId) {
  const item = state.expenses.find((expense) => expense.id === expenseId);
  if (!item) return;
  const index = state.expenses.indexOf(item);
  state.expenses = state.expenses.filter((expense) => expense.id !== expenseId);
  saveState(`${item.merchant || "지출"} 기록을 지웠어요.`, {
    onUndo: () => { state.expenses.splice(Math.min(index, state.expenses.length), 0, item); saveState("삭제를 되돌렸어요."); },
  });
}

function openShoppingExpense() {
  const bought = state.shoppingItems.filter((item) => item.checked);
  if (!bought.length) return toast("구매 완료한 품목이 없어요.");
  const categories = bought.map((item) => item.category);
  const category = categories.every((value) => value === "baby") ? "baby" : categories.every((value) => value === "living") ? "living" : "food";
  openExpenseModal("", {
    date: operationalDate(), merchant: "장보기", amount: 0, category, paidBy: state.currentMember,
    scope: "household", paymentMethod: "card", source: "shopping",
    memo: bought.map((item) => item.name).join(", ").slice(0, 140),
    items: bought.map((item) => ({ name: item.name, quantity: 1, amount: 0, category })),
    shoppingItemIds: bought.map((item) => item.id),
  });
}

function saveRecurringExpenseFromForm(form) {
  const id = String(form.get("recurringId") || "");
  const existing = id ? state.recurringExpenses.find((item) => item.id === id) : null;
  const title = String(form.get("title") || "").trim();
  const amount = Math.max(0, Math.round(Number(form.get("amount") || 0)));
  if (!title || !amount) return toast("고정비 이름과 금액을 확인해 주세요.");
  const now = Date.now();
  const value = {
    ...(existing || {}), id: existing?.id || `recurring-${now}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.slice(0, 80), amount,
    dayOfMonth: Math.max(1, Math.min(31, Number(form.get("dayOfMonth") || 1))),
    category: FINANCE_CATEGORIES[form.get("category")] ? String(form.get("category")) : "other",
    paidBy: ["wife", "husband", "shared"].includes(form.get("paidBy")) ? String(form.get("paidBy")) : state.currentMember,
    scope: form.get("scope") === "personal" ? "personal" : "household",
    paymentMethod: PAYMENT_METHODS[form.get("paymentMethod")] ? String(form.get("paymentMethod")) : "unknown",
    active: form.get("active") === "on", createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: now,
  };
  if (existing) Object.assign(existing, value); else state.recurringExpenses.push(value);
  closeModal(false);
  ensureRecurringExpenses();
  saveState(existing ? "고정비를 수정했어요." : "고정비를 추가했어요.");
}

function deleteRecurringExpense(recurringId) {
  const item = state.recurringExpenses.find((entry) => entry.id === recurringId);
  if (!item) return;
  state.recurringExpenses = state.recurringExpenses.filter((entry) => entry.id !== recurringId);
  closeModal(false);
  saveState("고정비를 삭제했어요. 이미 기록된 지난 지출은 그대로 남아요.");
}

function ensureRecurringExpenses() {
  const today = operationalDate();
  const month = today.slice(0, 7);
  const todayDay = Number(today.slice(8, 10));
  const lastDay = monthDays(month).dates.length;
  let changed = false;
  for (const item of state.recurringExpenses || []) {
    const dueDay = Math.min(Number(item.dayOfMonth || 1), lastDay);
    if (item.active === false || todayDay < dueDay) continue;
    const id = `expense-${item.id}-${month}`;
    if (state.expenses.some((expense) => expense.id === id) || state.expenseDeletedIds?.[id]) continue;
    state.expenses.push({
      id, recurringId: item.id, date: `${month}-${String(dueDay).padStart(2, "0")}`,
      merchant: item.title, amount: item.amount, category: item.category, paidBy: item.paidBy,
      scope: item.scope, paymentMethod: item.paymentMethod, memo: "매달 고정비 자동 기록",
      items: [], source: "recurring", createdAt: new Date().toISOString(), createdBy: state.currentMember, updatedAt: Date.now(),
    });
    changed = true;
  }
  return changed;
}

function saveBudgetFromForm(form) {
  state.financeSettings ||= {};
  state.financeSettings.monthlyBudget = Math.max(0, Math.round(Number(form.get("monthlyBudget") || 0)));
  closeModal(false);
  saveState(state.financeSettings.monthlyBudget ? "월 예산을 저장했어요." : "월 예산 표시를 껐어요.");
}

function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type || "")) return reject(new Error("unsupported"));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read_failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode_failed"));
      img.onload = () => {
        const maxEdge = 2200;
        const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        let data = canvas.toDataURL("image/jpeg", .88);
        if (data.length > 10_000_000) data = canvas.toDataURL("image/jpeg", .68);
        resolve(data);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function analyzeReceiptFile(file) {
  ui.modal = "receipt-loading";
  ui.modalData = null;
  renderModal();
  financeInfo.analyzing = true;
  try {
    const image = await imageFileToDataUrl(file);
    const response = await fetch("/api/finance/receipt-analysis", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "analysis_failed");
    }
    financeInfo.aiEnabled = true;
    if (!result.draft?.isReceipt) {
      openExpenseModal();
      toast("영수증으로 확인하기 어려워 직접 입력을 열었어요.");
      return;
    }
    openExpenseModal("", { ...result.draft, source: "receipt", paidBy: state.currentMember, scope: "household" }, { fromReceipt: true });
  } catch (error) {
    openExpenseModal();
    const message = error.message === "unsupported" ? "JPG, PNG 또는 WebP 사진을 선택해 주세요." : error.message === "too_many_receipts" ? "영수증 분석을 잠시 많이 사용했어요. 조금 뒤 다시 해주세요." : "사진을 읽지 못했어요. 직접 입력으로 기록할 수 있어요.";
    toast(message);
  } finally {
    financeInfo.analyzing = false;
  }
}

function exportExpensesCsv() {
  const rows = [["날짜", "사용처", "금액", "분류", "결제자", "구분", "결제수단", "메모"]];
  const items = (state.expenses || []).filter((item) => String(item.date || "").slice(0, 7) === ui.financeMonth).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  for (const item of items) rows.push([item.date, item.merchant, item.amount, FINANCE_CATEGORIES[item.category] || "기타", item.paidBy === "shared" ? "공동" : nameFor(item.paidBy), item.scope === "personal" ? "개인" : "생활비", PAYMENT_METHODS[item.paymentMethod] || "미확인", item.memo || ""]);
  const quote = (value) => {
    let safe = String(value ?? "");
    if (/^[=+\-@]/.test(safe)) safe = `'${safe}`;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const blob = new Blob(["\ufeff", rows.map((row) => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = `doran-expenses-${ui.financeMonth}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toggleNightDay(day) {
  const current = new Set((state.household.workSchedule.wife.nightDays || []).map(Number));
  if (current.has(day)) current.delete(day);
  else current.add(day);
  state.household.workSchedule.wife.nightDays = [...current].sort((a, b) => a - b);
  saveState(`${nameFor("wife")} 야간근무 요일을 바꿨어요.`);
}

function toggleDayOff(date) {
  ui.settingsSection = "schedule";
  const current = new Set(state.household.workSchedule.husband.daysOff || []);
  const wasDayOff = current.has(date);
  if (wasDayOff) current.delete(date);
  else current.add(date);
  state.household.workSchedule.husband.daysOff = [...current].sort();
  saveState(wasDayOff ? `${nameFor("husband")} 근무일로 바꿨어요.` : `${nameFor("husband")} 휴무일로 표시했어요.`);
}

function copyPreviousWeekDaysOff() {
  ui.settingsSection = "schedule";
  const current = new Set(state.household.workSchedule.husband.daysOff || []);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  let copied = 0;
  for (let index = 0; index < 7; index += 1) {
    const source = new Date(monday);
    source.setDate(monday.getDate() + index);
    const target = new Date(source);
    target.setDate(source.getDate() + 7);
    const sourceKey = localDateKey(source);
    const targetKey = localDateKey(target);
    current.delete(targetKey);
    if (current.has(sourceKey)) {
      current.add(targetKey);
      copied += 1;
    }
  }
  state.household.workSchedule.husband.daysOff = [...current].sort();
  saveState(copied ? `이번 주 휴무 ${copied}일을 다음 주에 복사했어요.` : "이번 주에 선택한 휴무가 없어 다음 주를 비워뒀어요.");
}

function repeatRecentDaysOffPattern() {
  ui.settingsSection = "schedule";
  const today = operationalDate();
  const current = new Set(state.household.workSchedule.husband.daysOff || []);
  const recentStart = dateKeyPlusDays(today, -21);
  const recentWeekdays = new Set([...current]
    .filter((date) => date >= recentStart && date < today)
    .map((date) => new Date(`${date}T12:00:00`).getDay()));
  if (!recentWeekdays.size) return toast("최근 3주에 기록된 휴무가 없어 패턴을 찾지 못했어요.");
  for (let offset = 0; offset < 35; offset += 1) {
    const date = dateKeyPlusDays(today, offset);
    current.delete(date);
    if (recentWeekdays.has(new Date(`${date}T12:00:00`).getDay())) current.add(date);
  }
  state.household.workSchedule.husband.daysOff = [...current].sort();
  saveState(`최근 휴무 요일을 앞으로 5주에 적용했어요.`);
}

function setDeviceMember(memberId) {
  if (!["wife", "husband"].includes(memberId)) return;
  state.currentMember = memberId;
  ui.completionMember = memberId;
  localStorage.setItem(DEVICE_MEMBER_KEY, memberId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncPushMember();
  render();
  toast(`이 휴대폰은 ${nameFor(memberId)}으로 기억할게요.`);
}

function resetTodayChecks() {
  if (!hasTodayCheckState()) return;
  resetDateChecks(operationalDate());
}

function resetDateChecks(date) {
  const isToday = date === operationalDate();
  const completedCount = state.events.filter((event) => ["completed", "not_needed", "postponed"].includes(event.eventType) && operationalDate(event.createdAt) === date).length;
  const message = completedCount
    ? `${isToday ? "오늘" : formatHistoryDate(date)} 체크한 ${completedCount}개 기록을 되돌릴까요?\n집안일 목록과 근무일정은 그대로 유지됩니다.`
    : "오늘의 미루기와 세부 체크를 되돌릴까요?\n집안일 목록과 근무일정은 그대로 유지됩니다.";
  if (!window.confirm(message)) return;

  state.events = state.events.filter((event) => !(["completed", "not_needed", "postponed"].includes(event.eventType) && operationalDate(event.createdAt) === date));
  if (isToday) {
    state.postponed = Object.fromEntries(Object.entries(state.postponed).filter(([, value]) => value !== date && value?.hiddenOn !== date));
    state.subtaskProgress = {};
  }
  saveState(`${isToday ? "오늘" : "선택한 날"} 체크만 초기화했어요. 집안일과 설정은 그대로예요.`);
}

function captureEntry(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key)
    ? { exists: true, value: JSON.parse(JSON.stringify(object[key])) }
    : { exists: false, value: null };
}

function restoreEntry(object, key, captured) {
  if (captured.exists) object[key] = captured.value;
  else delete object[key];
}

function postponeUntilTomorrow(taskId) {
  postponeTaskUntil(taskId, dateKeyPlusDays(operationalDate(), 1));
}

function postponeTaskUntil(taskId, targetDate) {
  const today = operationalDate();
  if (!getTask(taskId) || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate) || targetDate <= today) return toast("오늘보다 뒤의 날짜를 골라주세요.");
  const previous = captureEntry(state.postponed, taskId);
  const created = {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taskId,
    eventType: "postponed",
    memberId: state.currentMember,
    createdAt: new Date().toISOString(),
    note: targetDate,
  };
  state.events.push(created);
  state.postponed[taskId] = { hiddenOn: today, until: targetDate };
  closeModal(false);
  const targetLabel = targetDate === dateKeyPlusDays(today, 1) ? "내일" : formatHistoryDate(targetDate).replace("오늘 · ", "");
  saveState(`${targetLabel} 다시 나타나도록 옮겼어요.`, {
    onUndo: () => {
      state.events = state.events.filter((event) => event.id !== created.id);
      restoreEntry(state.postponed, taskId, previous);
      saveState("미루기를 되돌렸어요.");
    },
  });
}

function markNotNeeded(taskId) {
  const previousClaim = captureEntry(state.claims, taskId);
  const previousProgress = captureEntry(state.subtaskProgress, taskId);
  const previousPostponed = captureEntry(state.postponed, taskId);
  const created = {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taskId,
    eventType: "not_needed",
    memberId: state.currentMember,
    createdAt: new Date().toISOString(),
    note: "",
  };
  state.events.push(created);
  delete state.claims[taskId];
  delete state.subtaskProgress[taskId];
  delete state.postponed[taskId];
  saveState("아직 괜찮다고 기록했어요. 다음 점검일부터 다시 계산할게요.", {
    onUndo: () => {
      state.events = state.events.filter((event) => event.id !== created.id);
      restoreEntry(state.claims, taskId, previousClaim);
      restoreEntry(state.subtaskProgress, taskId, previousProgress);
      restoreEntry(state.postponed, taskId, previousPostponed);
      saveState("점검 기록을 되돌렸어요.");
    },
  });
}

function completeTask(taskId, memberId, note, options = {}) {
  const previousClaim = captureEntry(state.claims, taskId);
  const previousProgress = captureEntry(state.subtaskProgress, taskId);
  const previousPostponed = captureEntry(state.postponed, taskId);
  const created = {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taskId,
    eventType: "completed",
    memberId: memberId || state.currentMember,
    createdAt: new Date().toISOString(),
    note,
  };
  state.events.push(created);
  delete state.claims[taskId];
  delete state.subtaskProgress[taskId];
  delete state.postponed[taskId];
  closeModal(false);
  const undo = () => {
      state.events = state.events.filter((event) => event.id !== created.id);
      restoreEntry(state.claims, taskId, previousClaim);
      restoreEntry(state.subtaskProgress, taskId, previousProgress);
      restoreEntry(state.postponed, taskId, previousPostponed);
      saveState("완료를 되돌렸어요.");
  };
  const message = memberId === "together" ? "함께 완료했어요. 두 분 모두 수고했어요!" : `${nameFor(memberId)}의 완료로 기록했어요.`;
  saveState(message, options.quick ? {
    actions: [
      { label: "완료자 변경", onClick: () => openCompletionEdit(created.id) },
      { label: "되돌리기", onClick: undo },
    ],
  } : { onUndo: undo });
}

function openCompletionEdit(eventId) {
  const completion = state.events.find((event) => event.id === eventId && event.eventType === "completed");
  if (!completion) return;
  ui.modal = "complete";
  ui.modalData = { taskId: completion.taskId, eventId };
  ui.completionMember = completion.memberId;
  renderModal();
}

function updateCompletionEvent(eventId, memberId, note) {
  const completion = state.events.find((event) => event.id === eventId && event.eventType === "completed");
  if (!completion) return closeModal();
  completion.memberId = ["wife", "husband", "together"].includes(memberId) ? memberId : state.currentMember;
  completion.note = note;
  closeModal(false);
  saveState("완료자와 메모를 바꿨어요.");
}

function triggerBottle() {
  if (conditionalIsOpen("bottle-sterilize")) return;
  state.events.push({
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taskId: "bottle-sterilize",
    eventType: "triggered",
    memberId: state.currentMember,
    createdAt: new Date().toISOString(),
    note: "젖병 사용",
  });
  saveState("젖병과 쪽쪽이·치발기 소독을 오늘 할 일에 넣었어요.");
}

function dismissBottlePrompt() {
  state.household.bottlePromptDismissedOn = operationalDate();
  saveState("오늘은 젖병 소독 할 일을 만들지 않을게요.");
}

function undoEvent(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;
  const task = getTask(event.taskId);
  if (!window.confirm(`‘${task?.title || "집안일"}’ 기록을 취소할까요?`)) return;
  state.events = state.events.filter((item) => item.id !== eventId);
  saveState("완료 기록을 취소했어요.");
}

function saveTaskFromForm(form) {
  const taskId = String(form.get("taskId") || "");
  const recurrence = String(form.get("recurrence"));
  const existingTask = taskId ? getTask(taskId) : null;
  const subtasks = String(form.get("subtasks") || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const weekdays = form.getAll("weekdays").map(Number).filter((day) => day >= 0 && day <= 6);
  const pausedUntil = String(form.get("pausedUntil") || "");
  let kind = existingTask?.kind || "action";
  if (subtasks.length && !["group", "check-group"].includes(kind)) kind = kind === "check" ? "check-group" : "group";
  if (!subtasks.length && ["group", "check-group"].includes(kind)) kind = kind === "check-group" ? "check" : "action";
  const values = {
    title: String(form.get("title") || "").trim(),
    description: String(form.get("description") || "").trim(),
    recurrence,
    estimate: Math.max(1, Number(form.get("estimate") || 10)),
    intervalDays: recurrence === "weekly" ? 7 : recurrence === "biweekly" ? 14 : recurrence === "interval" ? Math.max(2, Math.min(365, Number(form.get("intervalDays") || 7))) : undefined,
    minDays: recurrence === "window" ? 2 : undefined,
    maxDays: recurrence === "window" ? 3 : undefined,
    weekdays: recurrence === "weekdays" ? (weekdays.length ? weekdays : [new Date().getDay()]) : undefined,
    subtasks,
    kind,
    pausedUntil: /^\d{4}-\d{2}-\d{2}$/.test(pausedUntil) && pausedUntil > operationalDate() ? pausedUntil : "",
  };
  if (!values.title) return;

  if (taskId) {
    const customIndex = state.customTasks.findIndex((task) => task.id === taskId);
    if (customIndex >= 0) state.customTasks[customIndex] = { ...state.customTasks[customIndex], ...values };
    else state.taskOverrides[taskId] = { ...(state.taskOverrides[taskId] || {}), ...values };
  } else {
    const id = `custom-${Date.now()}`;
    state.customTasks.push({ id, category: "living", icon: "sparkle", active: true, ...values });
    state.events.push({ id: `baseline-${id}`, taskId: id, eventType: "baseline", memberId: null, createdAt: new Date().toISOString(), note: "" });
  }
  closeModal(false);
  saveState(taskId ? "집안일 정보를 수정했어요." : "새 집안일을 추가했어요.");
}

function resetAll() {
  if (!window.confirm("완료 기록, 장보기 목록과 설정을 모두 처음 상태로 되돌릴까요?")) return;
  const currentMember = state.currentMember;
  state = makeInitialState();
  state.currentMember = currentMember;
  ui.page = "today";
  saveState("처음 상태로 되돌렸어요.");
}

function exportBackup() {
  const payload = {
    type: "doran-household-backup",
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `도란도란-백업-${localDateKey(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("백업 파일을 내려받았어요.");
}

async function importBackup(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const incoming = parsed?.type === "doran-household-backup" ? parsed.state : parsed;
    if (!incoming?.household || !Array.isArray(incoming.events)) throw new Error("invalid_backup");
    if (!window.confirm("이 백업으로 현재 공동 기록을 바꿀까요?\n현재 상태는 오늘 자동 백업에 남아 있어요.")) return;
    const currentMember = state.currentMember;
    const clientId = state.clientId;
    state = normalizeState(incoming, { currentMember, clientId, updatedAt: Date.now() });
    state.notificationSummary = buildNotificationSummary();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(PENDING_REPLACE_KEY, JSON.stringify(state));
    render();
    const replaced = await flushPendingReplacement();
    toast(replaced ? "백업을 불러와 두 기기에 반영했어요." : "백업을 불러왔어요. 인터넷이 연결되면 함께 반영할게요.");
  } catch (error) {
    toast("도란도란에서 만든 올바른 백업 파일인지 확인해 주세요.");
  }
}

async function flushPendingReplacement() {
  if (!USE_REMOTE_SERVER || !auth.authenticated || !navigator.onLine) return false;
  const pending = localStorage.getItem(PENDING_REPLACE_KEY);
  if (!pending) return true;
  try {
    const response = await fetch("/api/state/replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: pending,
    });
    if (!response.ok) return false;
    const result = await response.json();
    localStorage.removeItem(PENDING_REPLACE_KEY);
    if (result?.state) applyRemoteState(result.state, false);
    return true;
  } catch {
    return false;
  }
}

async function logout() {
  if (!window.confirm("이 기기에서 로그아웃할까요? 집안일 기록은 그대로 남아 있어요.")) return;
  try {
    await fetch("/api/logout", { method: "POST" });
  } finally {
    localStorage.setItem(DEVICE_LOGGED_OUT_KEY, "1");
    if (remoteStream) remoteStream.close();
    remoteStream = null;
    auth = { ready: true, authenticated: false, error: "" };
    ui.page = "today";
    render();
  }
}

function closeModal(shouldRender = true) {
  ui.modal = null;
  ui.modalData = null;
  document.getElementById("modal-root").innerHTML = "";
  if (shouldRender) render();
}

function toast(message, options = {}) {
  const root = document.getElementById("toast-root");
  const actions = Array.isArray(options.actions)
    ? options.actions.filter((action) => action && typeof action.onClick === "function")
    : typeof options.onUndo === "function" ? [{ label: options.actionLabel || "되돌리기", onClick: options.onUndo }] : [];
  if (actions.length) root.querySelectorAll(".toast.has-action").forEach((toastNode) => toastNode.remove());
  const node = document.createElement("div");
  node.className = `toast${actions.length ? " has-action" : ""}`;
  const text = document.createElement("span");
  text.textContent = message;
  node.appendChild(text);
  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label || "확인";
    button.addEventListener("click", () => {
      node.remove();
      action.onClick();
    }, { once: true });
    node.appendChild(button);
  }
  root.appendChild(node);
  window.setTimeout(() => node.remove(), actions.length ? 10000 : 3100);
}

const requestedPage = new URLSearchParams(window.location.search).get("page");
if (["today", "all", "shopping", "finance", "history", "settings"].includes(requestedPage)) ui.page = requestedPage;

window.addEventListener("online", async () => {
  connectionAvailable = true;
  render();
  toast("인터넷이 다시 연결됐어요. 변경사항을 맞추고 있어요.");
  await initializeSession();
  await flushPendingReplacement();
  pushRemoteState();
});

window.addEventListener("offline", () => {
  connectionAvailable = false;
  syncInfo.status = "offline";
  render();
  toast("오프라인이에요. 체크한 내용은 이 기기에 안전하게 저장할게요.");
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (auth.authenticated) render();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  localStorage.setItem(INSTALL_HINT_DISMISSED_KEY, "1");
  if (auth.authenticated) render();
  toast("도란도란을 홈 화면에 설치했어요.");
});

registerAppWorker();
initializeSession();
window.setInterval(refreshNotificationSummary, 15 * 60 * 1000);
window.setInterval(() => {
  if (USE_REMOTE_SERVER && auth.authenticated && !connectionAvailable) initializeSession();
}, 15 * 1000);

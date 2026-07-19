const STORAGE_KEY = "doran-chores-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

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
    id: "laundry-batches",
    title: "쌓인 빨래 처리",
    category: "laundry",
    icon: "washer",
    kind: "check-group",
    recurrence: "window",
    minDays: 2,
    maxDays: 3,
    estimate: 35,
    description: "부름이 손수건과 옷은 각각 세탁망에 넣어 돌려요.",
    subtasks: ["수건", "흰옷", "부름이 손수건", "부름이 옷"],
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
  { id: "work-clothes", title: "작업복·검정옷 세탁", category: "laundry", icon: "shirt", kind: "check", recurrence: "weekly", intervalDays: 7, estimate: 25, description: "빨래가 충분히 모였는지 먼저 확인해요." },
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
  "laundry-batches": 0,
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
let ui = {
  page: "today",
  filter: "all",
  modal: null,
  modalData: null,
  completionMember: state.currentMember,
  openMenu: null,
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
    version: 3,
    clientId: `client-${Math.random().toString(36).slice(2)}`,
    updatedAt: now,
    currentMember: "wife",
    household: {
      wifeName: "엄마",
      husbandName: "아빠",
      dayStart: 4,
      showStats: true,
      morningAlert: "09:00",
      eveningAlert: "20:30",
      workSchedule: {
        wife: { nightDays: [2, 3], start: "23:00", end: "08:00" },
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
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return makeInitialState();
    const parsed = JSON.parse(saved);
    return normalizeState(parsed, { clientId: `client-${Math.random().toString(36).slice(2)}` });
  } catch (error) {
    console.warn("저장된 데이터를 불러오지 못했습니다.", error);
    return makeInitialState();
  }
}

function normalizeState(input = {}, overrides = {}) {
  const base = makeInitialState();
  const household = input.household || {};
  const workSchedule = household.workSchedule || {};
  const isLegacy = Number(input.version || 1) < 2;
  return {
    ...base,
    ...input,
    ...overrides,
    version: 3,
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
    shoppingItems: Array.isArray(input.shoppingItems) ? input.shoppingItems : [],
  };
}

function saveState(message) {
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (channel) channel.postMessage({ source: state.clientId, state });
  pushRemoteState();
  render();
  if (message) toast(message);
}

async function pushRemoteState() {
  if (!USE_REMOTE_SERVER || !auth.authenticated) return;
  try {
    const response = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (response.status === 401) showLoginAgain();
  } catch (error) {
    console.info("공동 서버가 없어 이 기기에만 저장합니다.");
  }
}

async function initRemoteSync() {
  if (!USE_REMOTE_SERVER || !auth.authenticated) return;
  try {
    const response = await fetch("/api/state");
    if (response.status === 401) return showLoginAgain();
    if (!response.ok) return;
    const remote = await response.json();
    if (remote?.state && (!HAD_SAVED_STATE || remote.state.updatedAt > state.updatedAt)) {
      applyRemoteState(remote.state, false);
    } else if (!remote?.state) {
      pushRemoteState();
    }

    if (remoteStream) remoteStream.close();
    remoteStream = new EventSource("/api/events");
    remoteStream.addEventListener("state", (event) => {
      const incoming = JSON.parse(event.data);
      if (incoming.clientId === state.clientId || incoming.updatedAt <= state.updatedAt) return;
      applyRemoteState(incoming, true);
    });
  } catch (error) {
    console.info("공동 서버 연결 없이 로컬 모드로 시작합니다.");
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
    render();
    if (response.ok) initRemoteSync();
  } catch {
    auth = { ready: true, authenticated: false, error: "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." };
    render();
  }
}

function applyRemoteState(incoming, announce) {
  const currentMember = state.currentMember;
  const clientId = state.clientId;
  state = normalizeState(incoming, { currentMember, clientId });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
  if (announce) toast("상대방의 변경사항이 바로 반영됐어요.");
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

  const interval = task.intervalDays || 7;
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
    const previousDay = (day + 6) % 7;
    const finishingPreviousShift = nightDays.includes(previousDay) && currentMinutes < end;
    const startedTonight = nightDays.includes(day) && currentMinutes >= start;
    if (finishingPreviousShift) return { working: true, dayOff: false, tone: "busy", label: `근무 중 · ${clockLabel(schedule.end)} 퇴근` };
    if (startedTonight) return { working: true, dayOff: false, tone: "busy", label: `근무 중 · 내일 ${clockLabel(schedule.end)} 퇴근` };
    if (nightDays.includes(day)) return { working: false, dayOff: false, tone: "soon", label: `오늘 ${clockLabel(schedule.start)} 출근` };
    return { working: false, dayOff: true, tone: "free", label: "오늘 야간근무 없음" };
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

function taskTimingHint(task) {
  const wife = memberScheduleStatus("wife");
  const husband = memberScheduleStatus("husband");
  const isHeavy = Number(task.estimate || 0) >= 25 || ["group", "check-group"].includes(task.kind);

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

function renderBottomNav() {
  const count = dueTasks().length;
  const items = [
    ["today", "오늘"],
    ["all", "집안일"],
    ["shopping", "장보기"],
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
  if (ui.page === "history") return renderHistory();
  if (ui.page === "settings") return renderSettings();
  return renderToday();
}

function renderShopping() {
  const items = [...state.shoppingItems].sort((a, b) => Number(a.checked) - Number(b.checked) || new Date(a.createdAt) - new Date(b.createdAt));
  const remaining = items.filter((item) => !item.checked).length;
  const bought = items.length - remaining;
  return `
    <div class="inner-page shopping-page">
      <header class="inner-header">
        <div><p class="eyebrow">잊지 않고 함께</p><h1>장보기 목록</h1><p>${remaining ? `살 것 ${remaining}개가 남아 있어요.` : items.length ? "모두 장바구니에 담았어요." : "필요한 것을 함께 적어두세요."}</p></div>
        ${bought ? `<button class="btn" data-action="shopping-clear-bought">산 품목 정리</button>` : ""}
      </header>
      <section class="shopping-panel">
        <form id="shopping-form" class="shopping-form">
          <label class="shopping-name"><span class="sr-only">살 품목</span><input class="form-control" name="name" maxlength="60" placeholder="무엇을 살까요?" autocomplete="off" required></label>
          <label><span class="sr-only">수량 또는 메모</span><input class="form-control" name="detail" maxlength="60" placeholder="수량·메모 (선택)" autocomplete="off"></label>
          <button class="btn primary" type="submit">목록에 추가</button>
        </form>
        <div class="shopping-summary"><span><strong>${remaining}</strong>개 남음</span><span>${bought}개 구매</span></div>
        ${items.length ? `<div class="shopping-list">${items.map((item) => `
          <article class="shopping-row ${item.checked ? "checked" : ""}">
            <button class="shopping-check" data-action="shopping-toggle" data-shopping-id="${item.id}" aria-label="${escapeHtml(item.name)} ${item.checked ? "다시 살 것으로 표시" : "구매 완료"}" aria-pressed="${item.checked}">${item.checked ? "✓" : ""}</button>
            <button class="shopping-content" data-action="shopping-toggle" data-shopping-id="${item.id}">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${item.detail ? escapeHtml(item.detail) : `${escapeHtml(nameFor(item.addedBy))}이(가) 추가`}${item.checked && item.checkedBy ? ` · ${escapeHtml(nameFor(item.checkedBy))} 구매` : ""}</span>
            </button>
            <button class="shopping-delete" data-action="shopping-delete" data-shopping-id="${item.id}" aria-label="${escapeHtml(item.name)} 삭제">×</button>
          </article>`).join("")}</div>` : `<div class="shopping-empty"><span>🛒</span><strong>아직 장볼 것이 없어요</strong><p>우유, 기저귀처럼 생각난 순간 바로 적어두세요.</p></div>`}
      </section>
    </div>
  `;
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
        ${renderTaskSection("overdue", "조금 밀린 일", "오늘 하나만 골라도 충분해요", groups.overdue)}
        ${renderTaskSection("due", "오늘 권장", "지금 해두면 다음 며칠이 편해져요", groups.due)}
        ${renderTaskSection("available", "해도 되는 일", "여유가 있을 때 미리 해둘 수 있어요", groups.available)}
        ${renderCompletedSection(completed)}
      </div>
      <aside class="sidebar">
        ${renderScheduleCard()}
        ${renderConditionalCard()}
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
    <article class="task-card ${status.key === "overdue" ? "overdue" : ""} ${ui.openMenu === task.id ? "menu-open" : ""}">
      <div class="task-icon ${task.category}">${ICONS[task.icon] || "·"}</div>
      <div class="task-main">
        <div class="task-kicker"><span class="${statusClass}">${status.label}</span><span>·</span><span>${relativeLastText(task)}</span><span>·</span><span>${task.estimate}분</span></div>
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
        <p class="task-description">${escapeHtml(task.description || "")}</p>
        ${timingHint ? `<span class="timing-hint">◷ ${escapeHtml(timingHint)}</span>` : ""}
        ${claim ? `<span class="claim-label">${claim.memberId === state.currentMember ? "내가 하기로 했어요" : `${escapeHtml(nameFor(claim.memberId))}이(가) 하기로 했어요`}</span>` : ""}
        ${task.subtasks?.length ? `
          <div class="subtasks">
            ${task.subtasks.map((subtask, index) => `<label class="subtask ${progress[index] ? "checked" : ""}"><input type="checkbox" data-subtask="${task.id}" data-index="${index}" ${progress[index] ? "checked" : ""}><span>${escapeHtml(subtask)}</span></label>`).join("")}
          </div>
        ` : ""}
      </div>
      <div class="task-actions">
        <button class="btn ${ownClaim ? "ghost" : ""}" data-action="claim" data-task="${task.id}" ${otherClaim ? "disabled" : ""}>${ownClaim ? "맡기 취소" : otherClaim ? `${escapeHtml(nameFor(claim.memberId))} 맡음` : "내가 할게"}</button>
        ${isCheck ? `<button class="btn" data-action="not-needed" data-task="${task.id}">아직 괜찮음</button>` : ""}
        <button class="btn primary" data-action="complete-open" data-task="${task.id}" ${task.subtasks?.length && !allChecked ? "disabled title=\"세부 항목을 먼저 확인해 주세요\"" : ""}>${task.kind === "timer" ? `${task.timerMinutes}분 완료` : "완료"}</button>
        <div class="more-actions">
          <button class="btn ghost" data-action="menu" data-task="${task.id}" aria-label="더 보기">•••</button>
          ${ui.openMenu === task.id ? `<div class="more-menu"><button data-action="postpone-tomorrow" data-task="${task.id}">내일 하자</button><button data-action="postpone" data-task="${task.id}">오늘만 미루기</button></div>` : ""}
        </div>
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
          <div class="task-main"><h3 class="task-title">${escapeHtml(task.title)}</h3><p class="task-description">${event.eventType === "not_needed" ? "아직 괜찮다고 점검" : `${escapeHtml(nameFor(event.memberId))}${event.memberId === "together" ? " " : "이(가) "}완료`} · ${formatTime(event.createdAt)}</p></div>
          <div class="task-actions"><button class="btn ghost" data-page="history">기록 보기</button></div>
        </article>`;
      }).join("")}</div>` : `<div class="empty-state"><strong>첫 체크를 기다리고 있어요</strong>작은 일 하나를 끝내면 여기에 따뜻하게 기록해둘게요.</div>`}
    </section>
  `;
}

function renderConditionalCard() {
  const task = getTask("bottle-sterilize");
  const open = conditionalIsOpen(task.id);
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
  return `
    <section class="sidebar-card schedule-card">
      <div class="schedule-heading">
        <div><p class="sidebar-label">오늘의 근무 리듬</p><h2 class="sidebar-title">가능한 시간에<br>서로 조금씩</h2></div>
        <span class="schedule-icon">◷</span>
      </div>
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
      <p class="schedule-note">${nextDayOff ? `${escapeHtml(nameFor("husband"))} 다음 휴무 · ${formatHistoryDate(nextDayOff).replace("오늘 · ", "")}` : `${escapeHtml(nameFor("husband"))} 휴무일은 매주 설정에서 눌러주세요.`}</p>
      <button class="btn schedule-link" data-page="settings">근무 일정 바꾸기 →</button>
    </section>
  `;
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
    ["all", "전체"], ["daily", "매일"], ["window", "2~3일"], ["weekly", "매주"], ["biweekly", "2주"], ["monthly", "매월"], ["conditional", "조건부"],
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

function renderHistory() {
  const visibleEvents = state.events
    .filter((event) => ["completed", "not_needed"].includes(event.eventType))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const grouped = visibleEvents.reduce((groups, event) => {
    const key = operationalDate(event.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
    return groups;
  }, {});

  return `
    <div class="inner-page">
      <header class="inner-header"><div><p class="eyebrow">함께 쌓인 수고</p><h1>기록</h1><p>누가 언제 했는지 확인하고, 실수한 완료는 되돌릴 수 있어요.</p></div></header>
      ${Object.keys(grouped).length ? Object.entries(grouped).map(([date, events]) => `
        <section class="history-group">
          <div class="history-date-row"><h2 class="history-date">${formatHistoryDate(date)}</h2><button class="reset-today-btn" data-action="reset-date" data-date="${date}">↶ 이날 체크 초기화</button></div>
          <div class="history-list">${events.map((event) => {
            const task = getTask(event.taskId);
            if (!task) return "";
            return `<article class="history-row">
              <div class="history-check ${event.eventType === "not_needed" ? "not-needed" : ""}">${event.eventType === "not_needed" ? "○" : "✓"}</div>
              <div><h3>${escapeHtml(task.title)}</h3><p>${event.eventType === "not_needed" ? `${escapeHtml(nameFor(event.memberId))}이(가) 점검 · 아직 괜찮음` : `${escapeHtml(nameFor(event.memberId))}${event.memberId === "together" ? " " : "이(가) "}완료`} · ${formatTime(event.createdAt)}${event.note ? ` · ${escapeHtml(event.note)}` : ""}</p></div>
              <div class="history-action"><span class="row-status">${task.estimate}분</span><button class="btn ghost danger" data-action="undo-event" data-event="${event.id}">취소</button></div>
            </article>`;
          }).join("")}</div>
        </section>
      `).join("") : `<div class="empty-state"><strong>아직 기록이 없어요</strong>오늘 화면에서 첫 집안일을 완료해 보세요.</div>`}
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
      </section>
      <section class="settings-section">
        <h2>근무 일정</h2>
        <div class="setting-row">
          <div><h3>${escapeHtml(nameFor("wife"))} 야간근무</h3><p>선택한 요일 밤에 출근해 다음 날 아침 퇴근하는 일정이에요.</p></div>
          <div class="work-schedule-control">
            <div class="weekday-picker">${weekdayNames.map((day, index) => `<button class="weekday-btn ${(wifeSchedule.nightDays || []).map(Number).includes(index) ? "active" : ""}" data-action="toggle-night-day" data-day="${index}">${day}</button>`).join("")}</div>
            <div class="time-pair"><label class="field-label">출근<input type="time" class="form-control" data-work-member="wife" data-work-field="start" value="${wifeSchedule.start}"></label><span>→</span><label class="field-label">퇴근<input type="time" class="form-control" data-work-member="wife" data-work-field="end" value="${wifeSchedule.end}"></label></div>
          </div>
        </div>
        <div class="setting-row">
          <div><h3>${escapeHtml(nameFor("husband"))} 근무시간</h3><p>휴무로 표시하지 않은 날에는 이 근무시간을 기준으로 안내해요.</p></div>
          <div class="time-pair"><label class="field-label">출근<input type="time" class="form-control" data-work-member="husband" data-work-field="start" value="${husbandSchedule.start}"></label><span>→</span><label class="field-label">퇴근<input type="time" class="form-control" data-work-member="husband" data-work-field="end" value="${husbandSchedule.end}"></label></div>
        </div>
        <div class="setting-row offday-setting">
          <div><h3>${escapeHtml(nameFor("husband"))} 변동 휴무</h3><p>앞으로 2주 중 쉬는 날을 눌러주세요. 초록색 날짜가 휴무예요.</p></div>
          <div class="offday-grid">${upcomingDates().map((date) => {
            const key = localDateKey(date);
            const active = (husbandSchedule.daysOff || []).includes(key);
            return `<button class="offday-btn ${active ? "active" : ""}" data-action="toggle-day-off" data-date="${key}"><small>${weekdayNames[date.getDay()]}</small><strong>${date.getMonth() + 1}/${date.getDate()}</strong></button>`;
          }).join("")}</div>
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
      </section>
      <section class="settings-section">
        <h2>표시 방법</h2>
        <div class="setting-row">
          <div><h3>예상 시간 통계</h3><p>경쟁이 아닌 업무 쏠림 확인용으로만 보여줘요.</p></div>
          <label class="toggle" style="justify-self:end"><input type="checkbox" data-setting-toggle="showStats" ${state.household.showStats ? "checked" : ""}><span></span></label>
        </div>
      </section>
      ${USE_REMOTE_SERVER ? `<section class="settings-section">
        <h2>로그인</h2>
        <div class="setting-row">
          <div><h3>이 기기 자동 로그인</h3><p>90일 동안 유지돼요. 휴대폰을 바꾸거나 공용 기기에서 사용했다면 로그아웃해 주세요.</p></div>
          <button class="btn" data-action="logout">이 기기 로그아웃</button>
        </div>
      </section>` : ""}
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
  if (ui.modal === "task") root.innerHTML = renderTaskModal();
  if (ui.modal === "alerts") root.innerHTML = renderAlertsModal();
}

function modalShell(title, subtitle, content) {
  return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><header class="modal-header"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div><button class="modal-close" data-action="modal-close" aria-label="닫기">×</button></header>${content}</section></div>`;
}

function renderCompleteModal() {
  const task = getTask(ui.modalData.taskId);
  if (!task) return "";
  const options = ["wife", "husband", "together"];
  const content = `
    <form id="complete-form">
      <label class="field-label">누가 완료했나요?</label>
      <div class="choice-grid">${options.map((member) => `<label class="choice ${ui.completionMember === member ? "selected" : ""}"><input type="radio" name="member" value="${member}" ${ui.completionMember === member ? "checked" : ""} data-completion-member="${member}"><span>${member === "together" ? "둘이 함께" : escapeHtml(nameFor(member))}</span></label>`).join("")}</div>
      <label class="field-label">짧은 메모 · 선택<textarea class="form-control" name="note" rows="3" placeholder="특별히 남길 내용이 있다면 적어주세요"></textarea></label>
      <div class="modal-actions"><button type="button" class="btn" data-action="modal-close">취소</button><button type="submit" class="btn primary">완료로 기록</button></div>
    </form>`;
  return modalShell(task.title, `${task.estimate}분의 수고를 따뜻하게 기록할게요.`, content);
}

function renderTaskModal() {
  const task = ui.modalData?.taskId ? getTask(ui.modalData.taskId) : null;
  const content = `
    <form id="task-form" class="modal-form">
      <input type="hidden" name="taskId" value="${task?.id || ""}">
      <label class="field-label">집안일 이름<input class="form-control" name="title" required maxlength="40" value="${escapeHtml(task?.title || "")}" placeholder="예: 공기청정기 필터 확인"></label>
      <label class="field-label">간단한 설명<input class="form-control" name="description" maxlength="100" value="${escapeHtml(task?.description || "")}" placeholder="부담 없이 알아볼 수 있게 적어주세요"></label>
      <label class="field-label">반복 주기<select class="form-control" name="recurrence">${["daily", "window", "weekly", "biweekly", "monthly"].map((recurrence) => `<option value="${recurrence}" ${task?.recurrence === recurrence ? "selected" : ""}>${RECURRENCE_LABELS[recurrence]}</option>`).join("")}</select></label>
      <label class="field-label">예상 시간 · 분<input class="form-control" type="number" name="estimate" min="1" max="240" value="${task?.estimate || 10}"></label>
      <div class="modal-actions"><button type="button" class="btn" data-action="modal-close">취소</button><button type="submit" class="btn primary">${task ? "수정 저장" : "집안일 추가"}</button></div>
    </form>`;
  return modalShell(task ? "집안일 수정" : "새 집안일", "실제 생활에 맞게 언제든 바꿀 수 있어요.", content);
}

function renderAlertsModal() {
  const content = `<div><p class="sidebar-text" style="font-size:12px;margin-top:0">알림은 집안일마다 울리지 않아요. 오전 ${state.household.morningAlert}에 오늘 할 일을 한 번 요약하고, 저녁 ${state.household.eveningAlert}에는 밀린 일이 있을 때만 알려드리는 방식으로 준비되어 있어요.</p><p class="sidebar-text" style="font-size:12px">현재 버전은 알림 시각만 저장합니다. 실제 푸시 알림은 서버 연결 후 사용할 수 있어요.</p><div class="modal-actions"><button class="btn primary" data-action="modal-close">확인</button></div></div>`;
  return modalShell("알림은 가볍게", "집안일보다 앱이 더 부담스럽지 않도록", content);
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    ui.page = pageButton.dataset.page;
    ui.openMenu = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
    render();
    return;
  }

  const memberButton = event.target.closest("[data-member]");
  if (memberButton) {
    state.currentMember = memberButton.dataset.member;
    ui.completionMember = state.currentMember;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  if (!actionButton) {
    if (ui.openMenu) { ui.openMenu = null; render(); }
    return;
  }

  const action = actionButton.dataset.action;
  const taskId = actionButton.dataset.task;

  if (action === "claim") return toggleClaim(taskId);
  if (action === "menu") {
    ui.openMenu = ui.openMenu === taskId ? null : taskId;
    render();
    return;
  }
  if (action === "postpone") return postponeTask(taskId);
  if (action === "postpone-tomorrow") return postponeUntilTomorrow(taskId);
  if (action === "not-needed") return markNotNeeded(taskId);
  if (action === "complete-open") {
    ui.modal = "complete";
    ui.modalData = { taskId };
    ui.completionMember = state.currentMember;
    renderModal();
    return;
  }
  if (action === "bottle-trigger") return triggerBottle();
  if (action === "bottle-no") return toast("사용하지 않은 날은 아무 일도 만들지 않아요.");
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
  if (action === "toggle-night-day") return toggleNightDay(Number(actionButton.dataset.day));
  if (action === "toggle-day-off") return toggleDayOff(actionButton.dataset.date);
  if (action === "shopping-toggle") return toggleShoppingItem(actionButton.dataset.shoppingId);
  if (action === "shopping-delete") return deleteShoppingItem(actionButton.dataset.shoppingId);
  if (action === "shopping-clear-bought") return clearBoughtShoppingItems();
  if (action === "reset-today") return resetTodayChecks();
  if (action === "reset-date") return resetDateChecks(actionButton.dataset.date);
  if (action === "logout") return logout();
  if (action === "modal-close") return closeModal();
  if (action === "modal-backdrop" && event.target === actionButton) return closeModal();
  if (action === "reset") return resetAll();
});

document.addEventListener("change", (event) => {
  const target = event.target;
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
      render();
      initRemoteSync();
    } catch {
      auth.error = "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";
      render();
    }
    return;
  }
  if (event.target.id === "complete-form") {
    const form = new FormData(event.target);
    completeTask(ui.modalData.taskId, form.get("member"), String(form.get("note") || "").trim());
  }
  if (event.target.id === "task-form") {
    saveTaskFromForm(new FormData(event.target));
  }
  if (event.target.id === "shopping-form") {
    addShoppingItem(new FormData(event.target));
  }
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
  saveState(`${nameFor(state.currentMember)}이(가) 하기로 했어요.`);
}

function addShoppingItem(form) {
  const name = String(form.get("name") || "").trim();
  const detail = String(form.get("detail") || "").trim();
  if (!name) return;
  state.shoppingItems.push({
    id: `shopping-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.slice(0, 60),
    detail: detail.slice(0, 60),
    checked: false,
    addedBy: state.currentMember,
    checkedBy: null,
    createdAt: new Date().toISOString(),
    checkedAt: null,
  });
  saveState(`${name}을(를) 장보기 목록에 추가했어요.`);
  requestAnimationFrame(() => document.querySelector("#shopping-form input[name='name']")?.focus());
}

function toggleShoppingItem(itemId) {
  const item = state.shoppingItems.find((entry) => entry.id === itemId);
  if (!item) return;
  item.checked = !item.checked;
  item.checkedBy = item.checked ? state.currentMember : null;
  item.checkedAt = item.checked ? new Date().toISOString() : null;
  saveState(item.checked ? `${item.name}, 장바구니에 담았어요.` : `${item.name}을(를) 다시 살 목록으로 옮겼어요.`);
}

function deleteShoppingItem(itemId) {
  const item = state.shoppingItems.find((entry) => entry.id === itemId);
  if (!item) return;
  state.shoppingItems = state.shoppingItems.filter((entry) => entry.id !== itemId);
  saveState(`${item.name}을(를) 목록에서 지웠어요.`);
}

function clearBoughtShoppingItems() {
  const bought = state.shoppingItems.filter((item) => item.checked).length;
  if (!bought) return;
  state.shoppingItems = state.shoppingItems.filter((item) => !item.checked);
  saveState(`구매한 품목 ${bought}개를 정리했어요.`);
}

function toggleNightDay(day) {
  const current = new Set((state.household.workSchedule.wife.nightDays || []).map(Number));
  if (current.has(day)) current.delete(day);
  else current.add(day);
  state.household.workSchedule.wife.nightDays = [...current].sort((a, b) => a - b);
  saveState(`${nameFor("wife")} 야간근무 요일을 바꿨어요.`);
}

function toggleDayOff(date) {
  const current = new Set(state.household.workSchedule.husband.daysOff || []);
  const wasDayOff = current.has(date);
  if (wasDayOff) current.delete(date);
  else current.add(date);
  state.household.workSchedule.husband.daysOff = [...current].sort();
  saveState(wasDayOff ? `${nameFor("husband")} 근무일로 바꿨어요.` : `${nameFor("husband")} 휴무일로 표시했어요.`);
}

function resetTodayChecks() {
  if (!hasTodayCheckState()) return;
  resetDateChecks(operationalDate());
}

function resetDateChecks(date) {
  const isToday = date === operationalDate();
  const completedCount = state.events.filter((event) => ["completed", "not_needed"].includes(event.eventType) && operationalDate(event.createdAt) === date).length;
  const message = completedCount
    ? `${isToday ? "오늘" : formatHistoryDate(date)} 체크한 ${completedCount}개 기록을 되돌릴까요?\n집안일 목록과 근무일정은 그대로 유지됩니다.`
    : "오늘의 미루기와 세부 체크를 되돌릴까요?\n집안일 목록과 근무일정은 그대로 유지됩니다.";
  if (!window.confirm(message)) return;

  state.events = state.events.filter((event) => !(["completed", "not_needed"].includes(event.eventType) && operationalDate(event.createdAt) === date));
  if (isToday) {
    state.postponed = Object.fromEntries(Object.entries(state.postponed).filter(([, value]) => value !== date && value?.hiddenOn !== date));
    state.subtaskProgress = {};
  }
  saveState(`${isToday ? "오늘" : "선택한 날"} 체크만 초기화했어요. 집안일과 설정은 그대로예요.`);
}

function postponeTask(taskId) {
  state.postponed[taskId] = operationalDate();
  ui.openMenu = null;
  saveState("오늘 화면에서만 숨겼어요. 주기는 그대로예요.");
}

function postponeUntilTomorrow(taskId) {
  const today = operationalDate();
  state.postponed[taskId] = { hiddenOn: today, until: dateKeyPlusDays(today, 1) };
  ui.openMenu = null;
  saveState("내일 할 일로 미뤘어요. 내일 목록에 다시 나타나요.");
}

function markNotNeeded(taskId) {
  state.events.push({
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taskId,
    eventType: "not_needed",
    memberId: state.currentMember,
    createdAt: new Date().toISOString(),
    note: "",
  });
  delete state.claims[taskId];
  delete state.subtaskProgress[taskId];
  delete state.postponed[taskId];
  saveState("아직 괜찮다고 기록했어요. 다음 점검일부터 다시 계산할게요.");
}

function completeTask(taskId, memberId, note) {
  state.events.push({
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taskId,
    eventType: "completed",
    memberId: memberId || state.currentMember,
    createdAt: new Date().toISOString(),
    note,
  });
  delete state.claims[taskId];
  delete state.subtaskProgress[taskId];
  delete state.postponed[taskId];
  closeModal(false);
  saveState(memberId === "together" ? "함께 완료했어요. 두 분 모두 수고했어요!" : `${nameFor(memberId)}의 완료로 기록했어요.`);
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
  const values = {
    title: String(form.get("title") || "").trim(),
    description: String(form.get("description") || "").trim(),
    recurrence,
    estimate: Math.max(1, Number(form.get("estimate") || 10)),
    intervalDays: recurrence === "weekly" ? 7 : recurrence === "biweekly" ? 14 : undefined,
    minDays: recurrence === "window" ? 2 : undefined,
    maxDays: recurrence === "window" ? 3 : undefined,
  };
  if (!values.title) return;

  if (taskId) {
    const customIndex = state.customTasks.findIndex((task) => task.id === taskId);
    if (customIndex >= 0) state.customTasks[customIndex] = { ...state.customTasks[customIndex], ...values };
    else state.taskOverrides[taskId] = { ...(state.taskOverrides[taskId] || {}), ...values };
  } else {
    const id = `custom-${Date.now()}`;
    state.customTasks.push({ id, category: "living", icon: "sparkle", kind: "action", active: true, ...values });
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

async function logout() {
  if (!window.confirm("이 기기에서 로그아웃할까요? 집안일 기록은 그대로 남아 있어요.")) return;
  try {
    await fetch("/api/logout", { method: "POST" });
  } finally {
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

function toast(message) {
  const root = document.getElementById("toast-root");
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  root.appendChild(node);
  window.setTimeout(() => node.remove(), 3100);
}

initializeSession();

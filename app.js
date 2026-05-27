// ===== Storage helpers =====
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== Image fetch (Unsplash via backend) =====
// In-session cache so we don't refetch the same query across re-renders.
const imageUrlCache = new Map();
// When the server returns 503 once, stop hitting /api/image for the rest of the session.
let imageApiDisabled = false;

async function fetchMenuImage(query) {
  if (!query || imageApiDisabled) return null;
  if (imageUrlCache.has(query)) return imageUrlCache.get(query);
  try {
    const res = await fetch(`/api/image?q=${encodeURIComponent(query)}`);
    if (res.status === 503) {
      imageApiDisabled = true;
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    const url = data.url || null;
    imageUrlCache.set(query, url);
    return url;
  } catch {
    return null;
  }
}

function applyMenuPhoto(rootEl, menu) {
  const query = menu.imageQuery || menu.name;
  if (!query) return;
  const photoEl = rootEl.querySelector('.menu-photo');
  if (!photoEl) return;
  fetchMenuImage(query).then(url => {
    if (!url || !photoEl.isConnected) return;
    const img = new Image();
    img.onload = () => {
      if (!photoEl.isConnected) return;
      photoEl.style.backgroundImage = `url("${url}")`;
      photoEl.classList.add('has-image');
    };
    img.src = url;
  });
}

// ===== State =====
const state = {
  mode: '요리', // '요리' or '배달'
  meal: '점심',
  mood: new Set(),
  cuisine: '상관없음',
  time: '상관없음',
  ingredients: '',
  exclude: '',
  model: 'claude-haiku-4-5-20251001',
  allergies: new Set(loadJSON('jjc_allergies', [])),
  diet: new Set(loadJSON('jjc_diet', [])),
  customAvoid: localStorage.getItem('jjc_custom_avoid') || '',
  favorites: loadJSON('jjc_favorites', []),
  recent: loadJSON('jjc_recent', []),
  dislikes: loadJSON('jjc_dislikes', []),
  shopping: loadJSON('jjc_shopping', []),
  theme: localStorage.getItem('jjc_theme') || 'auto', // 'auto' | 'light' | 'dark'
  lastRecommendations: null,
  lastUserPrompt: null,
};

// ===== Theme =====
const mqlDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('jjc_theme', theme);
  const isDark = theme === 'dark' || (theme === 'auto' && mqlDark.matches);
  document.body.classList.toggle('dark', isDark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content', isDark ? '#1c1714' : '#ff6b35'
  );
  // Sync seg buttons
  document.querySelectorAll('.seg-control[data-filter="theme"] .seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.value === theme);
  });
}

mqlDark.addEventListener?.('change', () => {
  if (state.theme === 'auto') applyTheme('auto');
});

// ===== Library: favorites / recent helpers =====
function isFavorite(menuName) {
  return state.favorites.some(f => f.name === menuName);
}

function toggleFavorite(menu) {
  const idx = state.favorites.findIndex(f => f.name === menu.name);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
  } else {
    state.favorites.unshift({
      name: menu.name,
      emoji: menu.emoji,
      description: menu.description,
      tags: menu.tags || [],
      mode: state.mode,
      imageQuery: menu.imageQuery,
      addedAt: Date.now(),
    });
  }
  saveJSON('jjc_favorites', state.favorites);
  refreshFavButtons(menu.name);
}

function addRecent(menu) {
  // Dedupe and push to top, cap at 20
  state.recent = state.recent.filter(r => r.name !== menu.name);
  state.recent.unshift({
    name: menu.name,
    emoji: menu.emoji,
    description: menu.description,
    tags: menu.tags || [],
    mode: state.mode,
    imageQuery: menu.imageQuery,
    viewedAt: Date.now(),
  });
  if (state.recent.length > 20) state.recent.length = 20;
  saveJSON('jjc_recent', state.recent);
}

function refreshFavButtons(menuName) {
  document.querySelectorAll(`.fav-btn[data-menu="${CSS.escape(menuName)}"]`).forEach(btn => {
    const fav = isFavorite(menuName);
    btn.classList.toggle('active', fav);
    btn.textContent = fav ? '★' : '☆';
    btn.setAttribute('aria-label', fav ? '즐겨찾기 해제' : '즐겨찾기 추가');
  });
}

// ===== Dislikes (negative feedback for personalization) =====
const DISLIKES_MAX = 40;

function isDisliked(menuName) {
  return state.dislikes.some(d => d.name === menuName);
}

function toggleDislike(menu) {
  const idx = state.dislikes.findIndex(d => d.name === menu.name);
  if (idx >= 0) {
    state.dislikes.splice(idx, 1);
  } else {
    state.dislikes.unshift({ name: menu.name, dislikedAt: Date.now() });
    if (state.dislikes.length > DISLIKES_MAX) state.dislikes.length = DISLIKES_MAX;
    // If disliked, drop from favorites (mutually exclusive)
    const favIdx = state.favorites.findIndex(f => f.name === menu.name);
    if (favIdx >= 0) {
      state.favorites.splice(favIdx, 1);
      saveJSON('jjc_favorites', state.favorites);
      refreshFavButtons(menu.name);
    }
  }
  saveJSON('jjc_dislikes', state.dislikes);
  refreshDislikeButtons(menu.name);
}

function refreshDislikeButtons(menuName) {
  document.querySelectorAll(`.dislike-btn[data-menu="${CSS.escape(menuName)}"]`).forEach(btn => {
    const disliked = isDisliked(menuName);
    btn.classList.toggle('active', disliked);
    btn.setAttribute('aria-label', disliked ? '별로였어요 취소' : '별로였어요');
  });
}

// ===== DOM Refs =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const views = {
  picker: $('#picker-view'),
  result: $('#result-view'),
  recipe: $('#recipe-view'),
};

const settingsModal = $('#settings-modal');
const recommendBtn = $('#recommend-btn');

// ===== View Switching =====
function showView(name) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
  window.scrollTo(0, 0);
}

// ===== Settings Modal =====
function openSettings() {
  $('#custom-avoid').value = state.customAvoid;
  // Sync allergy/diet chips with state
  settingsModal.querySelectorAll('[data-filter="allergies"] .chip').forEach(c => {
    c.classList.toggle('active', state.allergies.has(c.dataset.value));
  });
  settingsModal.querySelectorAll('[data-filter="diet"] .chip').forEach(c => {
    c.classList.toggle('active', state.diet.has(c.dataset.value));
  });
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

$('#settings-btn').addEventListener('click', openSettings);
$('#close-settings').addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) closeSettings();
});

$('#save-settings').addEventListener('click', () => {
  const customAvoid = $('#custom-avoid').value.trim();
  state.customAvoid = customAvoid;
  localStorage.setItem('jjc_custom_avoid', customAvoid);
  saveJSON('jjc_allergies', [...state.allergies]);
  saveJSON('jjc_diet', [...state.diet]);
  closeSettings();
  toast('저장 완료', 'success', 1500);
});

// ===== Mode Tabs (배달 / 요리) =====
function applyMode(mode) {
  state.mode = mode;
  document.body.classList.toggle('mode-delivery', mode === '배달');
  $$('.mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  // Update CTA label
  const btnText = recommendBtn.querySelector('.btn-text');
  if (btnText && !recommendBtn.disabled) {
    btnText.textContent = mode === '배달' ? '배달 메뉴 추천받기' : '요리 메뉴 추천받기';
  }
}

$$('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => applyMode(tab.dataset.mode));
});

// ===== Theme segmented control =====
document.querySelectorAll('.seg-control[data-filter="theme"] .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.value));
});

// ===== Meal Tabs =====
$$('.meal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.meal-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.meal = tab.dataset.meal;
  });
});

// ===== Chips =====
$$('.chip-row').forEach(row => {
  const filter = row.dataset.filter;
  const single = row.classList.contains('single');

  row.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const value = chip.dataset.value;

    if (single) {
      row.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[filter] = value;
    } else {
      chip.classList.toggle('active');
      if (chip.classList.contains('active')) state[filter].add(value);
      else state[filter].delete(value);
    }
  });
});

// ===== Inputs =====
$('#ingredients').addEventListener('input', (e) => {
  state.ingredients = e.target.value.trim();
});

$('#exclude').addEventListener('input', (e) => {
  state.exclude = e.target.value.trim();
});

// ===== Navigation buttons =====
let detailOrigin = 'result'; // 'result' | 'library'

$('#back-to-picker').addEventListener('click', () => showView('picker'));
$('#back-to-result').addEventListener('click', () => {
  showView(detailOrigin === 'library' ? 'picker' : 'result');
});

function updateBackLabel() {
  const btn = $('#back-to-result');
  btn.textContent = detailOrigin === 'library' ? '← 처음으로' : '← 추천 목록';
}

// ===== Claude API (via backend proxy) =====
const CHAT_ENDPOINT = '/api/chat';

async function callClaude(systemPrompt, userContent, maxTokens = 1500, onChunk = null) {
  const useStream = typeof onChunk === 'function';

  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: state.model,
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userContent }],
      stream: useStream,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    let errMsg = errBody;
    try {
      const parsed = JSON.parse(errBody);
      errMsg = parsed.error?.message || errBody;
    } catch {}
    throw new Error(`API_ERROR:${res.status}:${errMsg}`);
  }

  if (!useStream) {
    const data = await res.json();
    return data.content[0].text;
  }

  // Stream parsing (SSE)
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data) continue;
      try {
        const event = JSON.parse(data);
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          const piece = event.delta.text;
          fullText += piece;
          onChunk(fullText, piece);
        }
      } catch { /* skip malformed SSE chunk */ }
    }
  }
  return fullText;
}

// ===== Prompt Builders =====
function buildRestrictionLines() {
  const lines = [];
  if (state.allergies.size) lines.push(`알레르기(절대 포함 금지): ${[...state.allergies].join(', ')}`);
  if (state.diet.size) lines.push(`식이제한: ${[...state.diet].join(', ')}`);
  if (state.customAvoid) lines.push(`그 외 회피: ${state.customAvoid}`);
  return lines;
}

function buildRecommendationPrompt(excludeNames = []) {
  const moods = [...state.mood];
  const parts = [
    `식사 형태: ${state.mode === '배달' ? '배달 주문' : '직접 요리'}`,
    `식사 시간: ${state.meal}`,
    `음식 종류: ${state.cuisine}`,
  ];
  if (state.mode === '요리') {
    parts.push(`조리 시간: ${state.time}`);
    if (state.ingredients) parts.push(`보유 재료: ${state.ingredients}`);
  }
  if (moods.length) parts.push(`기분/스타일: ${moods.join(', ')}`);
  if (state.exclude) parts.push(`피하고 싶은 것: ${state.exclude}`);
  parts.push(...buildRestrictionLines());

  // === Personalization signals ===
  // Recently viewed (last 7 days, max 8) — avoid repetition
  const RECENT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recentNames = state.recent
    .filter(r => now - (r.viewedAt || 0) < RECENT_LOOKBACK_MS)
    .slice(0, 8)
    .map(r => r.name);
  if (recentNames.length) {
    parts.push(`최근 본 메뉴(반복 피하기): ${recentNames.join(', ')}`);
  }
  // Favorites — taste signal (top 5)
  const favoriteNames = state.favorites.slice(0, 5).map(f => f.name);
  if (favoriteNames.length) {
    parts.push(`즐겨찾기(취향 참고): ${favoriteNames.join(', ')}`);
  }
  // Dislikes — hard avoid
  const dislikedNames = state.dislikes.map(d => d.name);
  if (dislikedNames.length) {
    parts.push(`별로였다고 한 메뉴(추천 금지): ${dislikedNames.join(', ')}`);
  }

  if (excludeNames.length) {
    parts.push(`이미 이번 세션에서 본 메뉴(제외할 것): ${excludeNames.join(', ')}`);
  }

  return parts.join('\n');
}

const RECOMMENDATION_SYSTEM = `당신은 한국에서 매일 끼니를 고민하는 사람에게 메뉴를 추천하는 친근한 음식 큐레이터입니다.

사용자의 조건을 받아서 서로 다른 매력을 가진 메뉴 3가지를 추천합니다.

규칙:
- 한국인 입맛에 맞는, 실제로 자주 먹는 현실적인 메뉴를 추천하세요.
- 너무 비슷한 메뉴 3개를 추천하지 말고, 결이 다른 옵션을 섞으세요.
- "최근 본 메뉴"가 주어지면 그 메뉴들과 결이 다른 옵션을 우선 추천하세요 (똑같은 거 또 추천 금지).
- "즐겨찾기"가 주어지면 그 메뉴들의 결(매콤/담백/고기/면 등)을 참고해서 비슷한 결의 다른 메뉴도 1개 정도 섞으세요.
- "별로였다고 한 메뉴(추천 금지)"가 주어지면 그 메뉴들은 절대 추천하지 말고, 비슷한 메뉴도 가능하면 피하세요.
- 식사 형태가 "배달 주문"이면 한국 배달앱(배민/요기요/쿠팡이츠)에서 흔히 시킬 수 있는 메뉴 위주로 추천하세요 (예: 치킨, 피자, 족발/보쌈, 중식, 분식, 도시락, 돈까스, 회/초밥, 떡볶이 세트 등). 가정에서만 먹는 반찬류는 피하세요.
- 식사 형태가 "직접 요리"면 가정에서 만들 수 있는 메뉴를 추천하고, 보유 재료가 있으면 그 재료를 활용할 수 있는 메뉴를 우선하세요.
- 식사 시간이 "야식"이면 가볍거나 자극적인 야식류를 추천하세요 (예: 라면, 떡볶이, 곱창, 닭발, 족발, 마른안주, 야식 토스트 등). 무거운 정찬은 피하세요.
- 식사 시간이 "디저트"면 디저트/간식류를 추천하세요. 배달이면 케이크, 빙수, 마카롱, 도넛, 와플, 크로플 등. 요리면 홈베이킹 가능한 디저트 (예: 호떡, 떡, 푸딩, 쿠키, 노오븐 케이크, 약과, 단팥죽 등).
- 메뉴 이름은 한국에서 흔히 부르는 이름으로 (예: "김치찌개", "알리오 올리오 파스타", "양념치킨").
- description은 1문장, 왜 이 메뉴를 추천하는지 친근하게.
- emoji는 음식을 잘 표현하는 단일 이모지 1개.
- tags는 ["#매콤", "#10분컷", "#원팬"] 같이 짧은 태그 2~4개.
- imageQuery는 이 음식을 사진 검색하기 위한 **영문 키워드** 1~3단어 (예: "kimchi stew", "tteokbokki", "korean fried chicken", "bingsu"). 한식이면 메뉴의 영문 표기, 양식이면 일반 영어 명칭. Unsplash 같은 사진 검색에 잘 걸리도록 단순하게.

출력은 반드시 다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 절대 포함하지 마세요:

{
  "recommendations": [
    {
      "name": "메뉴 이름",
      "emoji": "🍜",
      "description": "추천 이유 한 줄",
      "tags": ["#태그1", "#태그2"],
      "imageQuery": "kimchi stew"
    }
  ]
}`;

const RECIPE_SYSTEM = `당신은 한국 요리에 능숙한 요리사입니다.
주어진 메뉴 이름과 인분 수에 대해 간단 레시피를 제공합니다.

규칙:
- 재료(ingredients)는 가정에서 흔히 구할 수 있는 것 위주로 6~10개. 분량은 요청된 인분 수에 맞춰 계산.
- 단계(steps)는 간결하고 명확하게 5~8단계.
- 각 단계는 1~2문장, 시간/온도/팁이 있으면 함께.
- tip은 맛을 살리는 작은 비결 1~2개.
- description은 이 요리의 매력을 한 줄로.
- 사용자가 알레르기/식이제한을 알려주면 재료에서 반드시 제외하고, 가능하면 대체 재료를 사용하세요.
- servings 필드는 "1인분", "2인분" 처럼 요청된 인분 수를 반영하세요.

출력은 반드시 다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 절대 포함하지 마세요:

{
  "name": "메뉴 이름",
  "emoji": "🍜",
  "description": "요리 한 줄 소개",
  "servings": "1인분",
  "totalTime": "약 20분",
  "ingredients": ["재료1 분량", "재료2 분량"],
  "steps": ["1단계 설명", "2단계 설명"],
  "tips": ["팁 1", "팁 2"]
}`;

// ===== JSON extraction (defensive) =====
function extractJSON(text) {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // Strip markdown code fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }

  // Find first { ... last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {}
  }

  throw new Error('PARSE_ERROR: 응답을 해석할 수 없어요.');
}

// ===== Recommendation Flow =====
let excludedFromReroll = []; // menus already shown across reroll cycles

async function runRecommendation({ isReroll = false } = {}) {
  if (!isReroll) excludedFromReroll = [];

  setLoading(true, isReroll);
  // Pre-show result view with skeletons for streaming UX
  $('#result-title').textContent =
    `${state.meal} ${state.mode === '배달' ? '배달' : '요리'} 추천`;
  renderSkeletonCards(3);
  showView('result');

  let lastRendered = 0;
  const onChunk = (fullText) => {
    const items = tryExtractRecommendations(fullText);
    if (items.length > lastRendered) {
      renderRecommendations(items, /* partial = */ items.length < 3);
      lastRendered = items.length;
    }
  };

  try {
    const userPrompt = buildRecommendationPrompt(excludedFromReroll);
    const text = await callClaude(RECOMMENDATION_SYSTEM, userPrompt, 1200, onChunk);
    const data = extractJSON(text);

    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      throw new Error('FORMAT_ERROR: 추천 형식이 올바르지 않아요.');
    }

    state.lastRecommendations = data.recommendations;
    data.recommendations.forEach(r => {
      if (r.name && !excludedFromReroll.includes(r.name)) excludedFromReroll.push(r.name);
    });
    if (excludedFromReroll.length > 30) excludedFromReroll = excludedFromReroll.slice(-30);

    renderRecommendations(data.recommendations);
  } catch (err) {
    showView('picker');
    handleError(err);
  } finally {
    setLoading(false, isReroll);
  }
}

// Skeleton cards shown while streaming
function renderSkeletonCards(count = 3) {
  const container = $('#menu-cards');
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'menu-card skeleton-card has-photo';
    sk.innerHTML = `
      <div class="skeleton" style="width:100%;height:160px;border-radius:0"></div>
      <div style="padding:16px 18px;display:flex;flex-direction:column;gap:8px">
        <div class="skeleton" style="height:18px;width:60%"></div>
        <div class="skeleton" style="height:14px;width:90%"></div>
        <div class="skeleton" style="height:12px;width:40%"></div>
      </div>
    `;
    container.appendChild(sk);
  }
}

// Defensive parser: extract complete menu objects from partial JSON stream
function tryExtractRecommendations(partial) {
  const arrIdx = partial.indexOf('"recommendations"');
  if (arrIdx === -1) return [];
  const bracketIdx = partial.indexOf('[', arrIdx);
  if (bracketIdx === -1) return [];

  const items = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let objStart = -1;

  for (let i = bracketIdx + 1; i < partial.length; i++) {
    const ch = partial[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try {
          items.push(JSON.parse(partial.slice(objStart, i + 1)));
        } catch { /* ignore */ }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) {
      break;
    }
  }
  return items;
}

recommendBtn.addEventListener('click', () => runRecommendation({ isReroll: false }));
$('#reroll-btn').addEventListener('click', () => runRecommendation({ isReroll: true }));
$('#roulette-btn').addEventListener('click', spinRoulette);

// ===== Roulette / Decision Mode =====
let rouletteSpinning = false;

function spinRoulette() {
  if (rouletteSpinning) return;
  const cards = Array.from(document.querySelectorAll('#menu-cards .menu-card:not(.skeleton-card)'));
  if (cards.length < 2) {
    toast('룰렛은 메뉴 2개 이상부터 돌릴 수 있어요', 'info', 1800);
    return;
  }

  rouletteSpinning = true;
  const rouletteBtn = $('#roulette-btn');
  const rerollBtn = $('#reroll-btn');
  rouletteBtn.disabled = true;
  rerollBtn.disabled = true;
  cards.forEach(c => c.classList.add('roulette-running'));

  // Land on a random card; decelerate so the ending feels weighted not abrupt.
  const winnerIdx = Math.floor(Math.random() * cards.length);
  const totalSteps = cards.length * 4 + winnerIdx + 1; // enough cycles to feel "spun"
  let step = 0;
  let lastIdx = -1;

  function tick() {
    if (lastIdx >= 0) cards[lastIdx].classList.remove('roulette-highlight');
    const idx = step % cards.length;
    cards[idx].classList.add('roulette-highlight');
    lastIdx = idx;
    step++;

    if (step > totalSteps) {
      finishRoulette(cards, winnerIdx);
      return;
    }
    // Ease-out: interval grows from 80ms to ~450ms
    const progress = step / totalSteps;
    const interval = 80 + Math.pow(progress, 2.2) * 380;
    setTimeout(tick, interval);
  }
  tick();
}

function finishRoulette(cards, winnerIdx) {
  cards.forEach(c => c.classList.remove('roulette-running', 'roulette-highlight'));
  const winner = cards[winnerIdx];
  winner.classList.add('roulette-winner');
  winner.scrollIntoView({ behavior: 'smooth', block: 'center' });

  $('#roulette-btn').disabled = false;
  $('#reroll-btn').disabled = false;
  rouletteSpinning = false;

  // Brief celebration toast → tap card or auto-open after delay
  const menuName = winner.querySelector('h3')?.textContent || '이거';
  toast(`🎉 "${menuName}"으로 결정! 카드를 누르면 바로 시작해요`, 'success', 4000);
}

function setLoading(loading, isReroll = false) {
  const btn = isReroll ? $('#reroll-btn') : recommendBtn;
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  if (loading) {
    text.textContent = 'AI가 고민 중...';
    spinner.classList.remove('hidden');
    btn.disabled = true;
  } else {
    if (isReroll) {
      text.textContent = '🎲 다른 메뉴 추천받기';
    } else {
      text.textContent = state.mode === '배달' ? '배달 메뉴 추천받기' : '요리 메뉴 추천받기';
    }
    spinner.classList.add('hidden');
    btn.disabled = false;
  }
}

function handleError(err) {
  console.error(err);
  toast(humanizeError(err), 'error', 5000);
}

function humanizeError(err) {
  const msg = err.message || String(err);
  if (msg.startsWith('API_ERROR:429')) return 'API 호출 한도를 초과했어요. 잠시 후 다시 시도해주세요.';
  if (msg.startsWith('API_ERROR:502')) return '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.';
  if (msg.startsWith('API_ERROR:')) return msg.replace(/^API_ERROR:\d+:/, 'API 오류: ');
  if (msg.startsWith('PARSE_ERROR') || msg.startsWith('FORMAT_ERROR')) return '응답을 해석하지 못했어요. 다시 시도해주세요.';
  if (msg === 'NO_INGREDIENTS') return '사진에서 재료를 찾지 못했어요.';
  return '문제가 생겼어요. 다시 시도해주세요.';
}

// ===== Render Recommendations =====
function renderRecommendations(items, partial = false) {
  const modeLabel = state.mode === '배달' ? '배달' : '요리';
  $('#result-title').textContent = `${state.meal} ${modeLabel} 추천`;
  const container = $('#menu-cards');
  container.innerHTML = '';

  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'menu-card has-photo';
    card.style.animation = 'fadeIn 0.25s ease';
    const fav = isFavorite(item.name);
    const disliked = isDisliked(item.name);
    card.innerHTML = `
      <div class="menu-photo">
        <span class="menu-photo-emoji">${escapeHtml(item.emoji || '🍽️')}</span>
        <button class="fav-btn ${fav ? 'active' : ''}" data-menu="${escapeHtml(item.name)}"
          aria-label="${fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}">${fav ? '★' : '☆'}</button>
      </div>
      <div class="menu-info">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description || '')}</p>
        <div class="menu-meta">
          ${(item.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="menu-feedback">
          <button class="dislike-btn ${disliked ? 'active' : ''}" data-menu="${escapeHtml(item.name)}"
            aria-label="${disliked ? '별로였어요 취소' : '별로였어요'}">
            <span class="dislike-icon">👎</span>
            <span class="dislike-label">${disliked ? '별로였어요 (취소)' : '이런 거 말고'}</span>
          </button>
        </div>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.dislike-btn')) {
        e.stopPropagation();
        toggleDislike(item);
        toast(isDisliked(item.name) ? '다음엔 이런 거 피할게요' : '취소했어요', 'info', 1800);
        return;
      }
      if (e.target.closest('.fav-btn')) {
        e.stopPropagation();
        toggleFavorite(item);
        return;
      }
      detailOrigin = 'result';
      updateBackLabel();
      addRecent(item);
      if (state.mode === '배달') {
        showDeliveryDetail(item);
      } else {
        loadRecipe(item, idx);
      }
    });
    container.appendChild(card);
    applyMenuPhoto(card, item);
  });

  // Pad with skeletons while still streaming
  if (partial) {
    const remaining = Math.max(0, 3 - items.length);
    for (let i = 0; i < remaining; i++) {
      const sk = document.createElement('div');
      sk.className = 'menu-card skeleton-card has-photo';
      sk.innerHTML = `
        <div class="skeleton" style="width:100%;height:160px;border-radius:0"></div>
        <div style="padding:16px 18px;display:flex;flex-direction:column;gap:8px">
          <div class="skeleton" style="height:18px;width:60%"></div>
          <div class="skeleton" style="height:14px;width:90%"></div>
        </div>
      `;
      container.appendChild(sk);
    }
  }
}

// ===== Delivery Detail (no API call needed) =====
function favButtonHTML(menuName) {
  const fav = isFavorite(menuName);
  return `<button class="fav-btn ${fav ? 'active' : ''}" data-menu="${escapeHtml(menuName)}"
    aria-label="${fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}">${fav ? '★' : '☆'}</button>`;
}

function attachFavButton(rootEl, menu) {
  const btn = rootEl.querySelector(`.fav-btn[data-menu="${CSS.escape(menu.name)}"]`);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(menu);
    });
  }
}

// ===== Nearby restaurants (Kakao Local via backend) =====
// When the server returns 503 once, stop offering the feature for the rest of the session.
let localApiDisabled = false;

async function getCurrentPosition() {
  if (!navigator.geolocation) throw new Error('NO_GEOLOCATION');
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 8000, maximumAge: 60_000, enableHighAccuracy: false }
    );
  });
}

async function findNearbyRestaurants(query) {
  if (localApiDisabled) {
    toast('주변 검색이 아직 설정되지 않았어요', 'info', 2400);
    return;
  }
  const listEl = $('#nearby-list');
  const btnEl = document.querySelector('[data-action="find-nearby"]');
  if (!listEl) return;

  // Loading state
  listEl.innerHTML = `
    <div class="nearby-loading">
      <span class="btn-spinner"></span>
      <span>위치 확인하고 주변 가게 찾는 중...</span>
    </div>
  `;
  if (btnEl) btnEl.disabled = true;

  try {
    const { lat, lng } = await getCurrentPosition();
    const url = `/api/local?q=${encodeURIComponent(query)}&lat=${lat}&lng=${lng}`;
    const res = await fetch(url);
    if (res.status === 503) {
      localApiDisabled = true;
      listEl.innerHTML = `<div class="nearby-empty">주변 검색이 설정되지 않았어요. 위 "네이버 지도에서 검색"을 이용해주세요.</div>`;
      return;
    }
    if (!res.ok) throw new Error('API_ERROR');
    const data = await res.json();
    const places = data.places || [];
    renderNearbyList(listEl, places, query);
  } catch (err) {
    console.error(err);
    if (err.code === 1) {
      // PERMISSION_DENIED
      listEl.innerHTML = `<div class="nearby-empty">위치 권한이 거부됐어요. 브라우저 설정에서 허용 후 다시 시도해주세요.</div>`;
    } else if (err.code === 3 || err.message === 'NO_GEOLOCATION') {
      listEl.innerHTML = `<div class="nearby-empty">위치를 확인할 수 없어요. 네이버 지도 링크를 이용해주세요.</div>`;
    } else {
      listEl.innerHTML = `<div class="nearby-empty">주변 가게를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>`;
    }
  } finally {
    if (btnEl) btnEl.disabled = false;
  }
}

function renderNearbyList(listEl, places, query) {
  if (!places.length) {
    listEl.innerHTML = `<div class="nearby-empty">반경 2km 안에 "${escapeHtml(query)}" 가게가 없어요.</div>`;
    return;
  }
  listEl.innerHTML = places.map(p => {
    const distance = p.distance != null
      ? (p.distance < 1000 ? `${p.distance}m` : `${(p.distance / 1000).toFixed(1)}km`)
      : '';
    const category = p.category ? p.category.split('>').pop().trim() : '';
    return `
      <a class="nearby-item" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">
        <div class="nearby-info">
          <div class="nearby-name">${escapeHtml(p.name)}</div>
          <div class="nearby-meta">
            ${category ? `<span>${escapeHtml(category)}</span>` : ''}
            ${distance ? `<span>· ${distance}</span>` : ''}
          </div>
          <div class="nearby-address">${escapeHtml(p.address || '')}</div>
        </div>
        <span class="nearby-arrow">→</span>
      </a>
    `;
  }).join('');
}

// ===== Share =====
function shareMenuHTML() {
  return `<button class="share-btn" data-action="share" aria-label="공유하기">
    <span>📤</span><span>공유</span>
  </button>`;
}

async function shareMenu(menu, kind /* 'recipe' | 'delivery' */) {
  const emoji = menu.emoji || '🍽️';
  const name = menu.name || '';
  const desc = menu.description || '';
  const verb = kind === 'recipe' ? '오늘 이거 만들어볼까?' : '오늘 이거 어때?';
  const text = `${emoji} ${name}\n${desc ? desc + '\n' : ''}\n${verb} (저점추 추천)`;
  const url = location.origin || location.href;

  // Prefer native share (mobile → KakaoTalk/messages); fall back to clipboard.
  if (navigator.share) {
    try {
      await navigator.share({ title: `${emoji} ${name}`, text, url });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // user dismissed
      // Fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('공유 내용을 복사했어요. 붙여넣기 해주세요', 'success', 2400);
  } catch {
    toast('공유를 지원하지 않는 환경이에요', 'error', 2400);
  }
}

function attachShareButton(rootEl, menu, kind) {
  const btn = rootEl.querySelector('[data-action="share"]');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      shareMenu(menu, kind);
    });
  }
}

function showDeliveryDetail(menu) {
  showView('recipe');
  const content = $('#recipe-content');
  const q = encodeURIComponent(menu.name);
  content.innerHTML = `
    <div class="recipe-hero">
      <span class="recipe-hero-emoji">${escapeHtml(menu.emoji || '🍽️')}</span>
    </div>
    <div class="recipe-header">
      <div>
        <h2>${escapeHtml(menu.name)}</h2>
        <p class="desc">${escapeHtml(menu.description || '')}</p>
        <div class="menu-meta" style="margin-top:8px;">
          ${(menu.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="header-actions-row">
          ${shareMenuHTML()}
        </div>
      </div>
      ${favButtonHTML(menu.name)}
    </div>

    <div class="recipe-section">
      <h3>📍 내 주변에서 찾기</h3>
      <button type="button" class="big-cta" data-action="find-nearby">
        <span class="big-cta-icon">📍</span>
        <div class="big-cta-text">
          <strong>내 위치 기준으로 "${escapeHtml(menu.name)}" 검색</strong>
          <span>위치 권한이 필요해요 · Kakao Local</span>
        </div>
        <span class="big-cta-arrow">→</span>
      </button>
      <div class="nearby-list" id="nearby-list"></div>
    </div>

    <div class="recipe-section">
      <h3>🛵 주문하기</h3>
      <a class="big-cta" href="https://map.naver.com/p/search/${q}" target="_blank" rel="noopener">
        <span class="big-cta-icon">🗺️</span>
        <div class="big-cta-text">
          <strong>"${escapeHtml(menu.name)}" 근처 가게 찾기</strong>
          <span>네이버 지도에서 주변 음식점 검색</span>
        </div>
        <span class="big-cta-arrow">→</span>
      </a>

      <p class="section-sub">또는 배달 앱 바로 열기</p>
      <div class="delivery-apps">
        <button type="button" class="del-app del-baemin" data-app="baemin">
          <span class="del-app-emoji">🛵</span>
          <span class="del-app-name">배달의민족</span>
        </button>
        <button type="button" class="del-app del-yogiyo" data-app="yogiyo">
          <span class="del-app-emoji">🍔</span>
          <span class="del-app-name">요기요</span>
        </button>
        <button type="button" class="del-app del-coupang" data-app="coupang">
          <span class="del-app-emoji">🥡</span>
          <span class="del-app-name">쿠팡이츠</span>
        </button>
      </div>
    </div>

    <div class="recipe-section">
      <h3>🔍 더 알아보기</h3>
      <div class="external-links">
        <a class="ext-link" href="https://search.naver.com/search.naver?query=${encodeURIComponent(menu.name + ' 맛집 후기')}" target="_blank" rel="noopener">
          <span class="ext-icon">🔍</span>
          <span>네이버 검색</span>
        </a>
        <a class="ext-link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(menu.name + ' 먹방')}" target="_blank" rel="noopener">
          <span class="ext-icon">📺</span>
          <span>YouTube</span>
        </a>
      </div>
    </div>
  `;
  attachFavButton(content, menu);
  attachShareButton(content, menu, 'delivery');
  applyHeroPhoto(content, menu);

  // Wire "내 주변에서 찾기"
  const nearbyBtn = content.querySelector('[data-action="find-nearby"]');
  if (nearbyBtn) {
    nearbyBtn.addEventListener('click', () => findNearbyRestaurants(menu.name));
  }

  // Wire delivery app buttons (scheme + web fallback)
  content.querySelectorAll('.del-app[data-app]').forEach(btn => {
    btn.addEventListener('click', () => openDeliveryApp(btn.dataset.app));
  });
}

// Loads photo into a .recipe-hero block. Same lazy/fallback semantics as menu cards.
function applyHeroPhoto(rootEl, menu) {
  const query = menu.imageQuery || menu.name;
  if (!query) return;
  const heroEl = rootEl.querySelector('.recipe-hero');
  if (!heroEl) return;
  fetchMenuImage(query).then(url => {
    if (!url || !heroEl.isConnected) return;
    const img = new Image();
    img.onload = () => {
      if (!heroEl.isConnected) return;
      heroEl.style.backgroundImage = `url("${url}")`;
      heroEl.classList.add('has-image');
    };
    img.src = url;
  });
}

// === Delivery apps: custom scheme + web fallback ===
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const DELIVERY_APPS = {
  baemin:  { scheme: 'baemin://',      web: 'https://www.baemin.com/',       name: '배달의민족' },
  yogiyo:  { scheme: 'yogiyo://',      web: 'https://www.yogiyo.co.kr/',     name: '요기요' },
  coupang: { scheme: 'coupangeats://', web: 'https://www.coupangeats.com/',  name: '쿠팡이츠' },
};

// On mobile, try opening the native app. If it doesn't open within ~1.5s
// (tab stays visible), fall back to the web URL. On desktop, just open web.
function openDeliveryApp(appKey) {
  const app = DELIVERY_APPS[appKey];
  if (!app) return;

  if (!isMobile()) {
    window.open(app.web, '_blank', 'noopener');
    return;
  }

  let pageHidden = false;
  const onVis = () => { if (document.hidden) pageHidden = true; };
  document.addEventListener('visibilitychange', onVis);

  const fallback = setTimeout(() => {
    document.removeEventListener('visibilitychange', onVis);
    if (!pageHidden) {
      window.location.href = app.web;
    }
  }, 1500);

  // Trigger the native app via custom scheme
  window.location.href = app.scheme;

  // Clear fallback if user comes back quickly (i.e. app cancelled / dialog dismissed)
  window.addEventListener('pageshow', function once() {
    clearTimeout(fallback);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pageshow', once);
  });
}

// ===== Recipe Flow =====
let currentRecipeMenu = null;
let currentServings = 1;

async function loadRecipe(menu, idx, servings = 1) {
  currentRecipeMenu = menu;
  currentServings = servings;
  showView('recipe');
  const content = $('#recipe-content');
  content.innerHTML = `
    <div class="recipe-hero">
      <span class="recipe-hero-emoji">${escapeHtml(menu.emoji || '🍽️')}</span>
    </div>
    <div class="recipe-header">
      <div>
        <h2>${escapeHtml(menu.name)}</h2>
        <p class="desc">레시피 생성 중...</p>
      </div>
    </div>
    <div class="skeleton" style="height: 120px; margin-bottom: 16px;"></div>
    <div class="skeleton" style="height: 200px;"></div>
  `;
  applyHeroPhoto(content, menu);

  try {
    const restrictions = buildRestrictionLines();
    const lines = [`메뉴: ${menu.name}`, `인분 수: ${servings}인분`, ...restrictions];
    const userPrompt = lines.join('\n');
    const text = await callClaude(RECIPE_SYSTEM, userPrompt, 1500);
    const recipe = extractJSON(text);
    renderRecipe(recipe, menu);
  } catch (err) {
    content.innerHTML = `
      <div class="recipe-hero">
        <span class="recipe-hero-emoji">${escapeHtml(menu.emoji || '🍽️')}</span>
      </div>
      <div class="recipe-header">
        <div>
          <h2>${escapeHtml(menu.name)}</h2>
        </div>
      </div>
      <div class="error-msg">레시피를 불러오지 못했어요. 외부 링크에서 확인해보세요.</div>
      ${externalLinksHTML(menu.name)}
    `;
  }
}

function renderRecipe(recipe, menu) {
  const content = $('#recipe-content');
  const emoji = recipe.emoji || menu.emoji || '🍽️';
  const name = recipe.name || menu.name;

  content.innerHTML = `
    <div class="recipe-hero">
      <span class="recipe-hero-emoji">${escapeHtml(emoji)}</span>
    </div>
    <div class="recipe-header">
      <div>
        <h2>${escapeHtml(name)}</h2>
        <p class="desc">${escapeHtml(recipe.description || '')}</p>
        <div class="menu-meta" style="margin-top:8px;">
          ${recipe.totalTime ? `<span class="tag">⏱️ ${escapeHtml(recipe.totalTime)}</span>` : ''}
        </div>
        <div class="header-actions-row">
          ${shareMenuHTML()}
        </div>
      </div>
      ${favButtonHTML(name)}
    </div>

    <div class="servings-row">
      <span class="servings-label">👥 인분</span>
      <div class="seg-control" data-filter="servings">
        ${[1,2,3,4].map(n => `
          <button class="seg-btn ${n === currentServings ? 'active' : ''}" data-value="${n}">${n}인분</button>
        `).join('')}
      </div>
    </div>

    <div class="recipe-section">
      <h3>🥕 재료</h3>
      <ul>
        ${(recipe.ingredients || []).map(i => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>
      <button class="add-to-shopping-btn" data-action="add-shopping">
        🛒 장보기 리스트에 추가
      </button>
    </div>

    <div class="recipe-section">
      <h3>👩‍🍳 만드는 법</h3>
      <ol>
        ${(recipe.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ol>
    </div>

    ${recipe.tips && recipe.tips.length ? `
      <div class="recipe-section">
        <h3>💡 팁</h3>
        <ul>
          ${recipe.tips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="recipe-section">
      <h3>🔗 더 자세한 레시피</h3>
      ${externalLinksHTML(name)}
    </div>
  `;
  const menuToSave = {
    name,
    emoji,
    description: recipe.description || menu.description,
    tags: menu.tags || [],
    imageQuery: menu.imageQuery,
  };
  attachFavButton(content, menuToSave);
  attachShareButton(content, menuToSave, 'recipe');
  applyHeroPhoto(content, menuToSave);

  // Wire servings selector
  content.querySelectorAll('[data-filter="servings"] .seg-btn').forEach(b => {
    b.addEventListener('click', () => {
      const n = parseInt(b.dataset.value, 10);
      if (n === currentServings) return;
      loadRecipe(currentRecipeMenu, 0, n);
    });
  });

  // Wire "장보기 리스트에 추가" button
  const shopBtn = content.querySelector('[data-action="add-shopping"]');
  if (shopBtn) {
    shopBtn.addEventListener('click', () => {
      const added = addRecipeToShopping(recipe.ingredients || [], name);
      shopBtn.classList.add('added');
      shopBtn.textContent = `✓ ${added}개 추가됨`;
      setTimeout(() => {
        shopBtn.classList.remove('added');
        shopBtn.textContent = '🛒 장보기 리스트에 추가';
      }, 2000);
    });
  }
}

function addRecipeToShopping(ingredients, sourceName) {
  let added = 0;
  ingredients.forEach(text => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Skip duplicates (same text + source)
    if (state.shopping.some(s => s.text === trimmed && s.source === sourceName)) return;
    state.shopping.push({ text: trimmed, source: sourceName, checked: false, addedAt: Date.now() });
    added++;
  });
  saveJSON('jjc_shopping', state.shopping);
  return added;
}

function externalLinksHTML(query) {
  const q = encodeURIComponent(query + ' 레시피');
  return `
    <div class="external-links">
      <a class="ext-link" href="https://www.10000recipe.com/recipe/list.html?q=${q}" target="_blank" rel="noopener">
        <span class="ext-icon">📖</span>
        <span>만개의레시피</span>
      </a>
      <a class="ext-link" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">
        <span class="ext-icon">📺</span>
        <span>YouTube</span>
      </a>
    </div>
  `;
}

// ===== Toast =====
function toast(message, type = 'info', duration = 3000) {
  const container = $('#toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icon = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  el.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 220);
  }, duration);
}

// ===== Util =====
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== Photo Recognition (Vision) =====
const VISION_SYSTEM = `당신은 냉장고 사진을 보고 식재료를 식별하는 비전 전문가입니다.

규칙:
- 사진에 명확히 보이는 식재료만 추출하세요. 추측하지 마세요.
- 한국어 일반 명칭으로 표기 (예: "양파", "계란", "두부", "김치").
- 같은 재료가 여러 개 보이면 대략의 수량/양을 함께 (예: "계란 약 4알", "양파 2개").
- 정확한 수량이 안 보이면 수량은 생략.
- 정체불명의 용기/포장은 추측해서 추가하지 마세요.
- 양념(소금/후추/간장 등)은 보일 때만.

출력은 반드시 다음 JSON 형식으로만 응답하세요. JSON 외 텍스트 금지:
{
  "ingredients": ["재료1", "재료2 수량", ...]
}`;

async function fileToResizedBase64(file, maxDim = 1280, quality = 0.85) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });

    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.split(',')[1];
    return { base64, dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

let currentPhoto = null;

$('#photo-btn').addEventListener('click', () => $('#photo-input').click());

$('#photo-input').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const { base64, dataUrl } = await fileToResizedBase64(file);
    currentPhoto = base64;

    const preview = $('#photo-preview');
    preview.innerHTML = `
      <img src="${dataUrl}" alt="냉장고 사진" />
      <div class="photo-preview-actions">
        <button type="button" class="btn-cancel-photo" id="cancel-photo">취소</button>
        <button type="button" class="btn-analyze" id="analyze-photo">🔍 재료 인식하기</button>
      </div>
    `;
    preview.classList.remove('hidden');

    $('#cancel-photo').addEventListener('click', clearPhoto);
    $('#analyze-photo').addEventListener('click', analyzePhoto);
  } catch (err) {
    console.error(err);
    toast('사진을 불러오지 못했어요.', 'error');
  } finally {
    e.target.value = ''; // allow re-selecting same file
  }
});

function clearPhoto() {
  currentPhoto = null;
  const preview = $('#photo-preview');
  preview.classList.add('hidden');
  preview.innerHTML = '';
}

async function analyzePhoto() {
  if (!currentPhoto) return;
  const analyzeBtn = $('#analyze-photo');
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'AI가 보는 중...';

  try {
    const content = [
      {
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: currentPhoto },
      },
      {
        type: 'text',
        text: '이 사진에서 보이는 식재료를 모두 추출해줘. JSON으로만 응답.',
      },
    ];
    const text = await callClaude(VISION_SYSTEM, content, 800);
    const parsed = extractJSON(text);
    const items = Array.isArray(parsed) ? parsed : parsed.ingredients;
    if (!Array.isArray(items) || !items.length) {
      throw new Error('NO_INGREDIENTS');
    }

    const textarea = $('#ingredients');
    const existing = textarea.value.trim();
    const merged = existing ? existing + ', ' + items.join(', ') : items.join(', ');
    textarea.value = merged;
    state.ingredients = merged;
    clearPhoto();

    // Brief success flash on textarea
    textarea.style.transition = 'border-color 0.3s';
    textarea.style.borderColor = 'var(--primary)';
    setTimeout(() => { textarea.style.borderColor = ''; }, 1200);
  } catch (err) {
    console.error(err);
    toast(humanizeError(err), 'error');
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '🔍 재료 인식하기';
  }
}

// ===== Library Modal =====
const libraryModal = $('#library-modal');

function openLibrary(tab = 'favorites') {
  renderFavorites();
  renderRecent();
  renderShopping();
  switchLibTab(tab);
  libraryModal.classList.remove('hidden');
}

function closeLibrary() {
  libraryModal.classList.add('hidden');
}

function switchLibTab(name) {
  document.querySelectorAll('.lib-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  document.querySelectorAll('.lib-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.panel === name);
  });
}

$('#library-btn').addEventListener('click', () => openLibrary('favorites'));
$('#close-library').addEventListener('click', closeLibrary);
libraryModal.addEventListener('click', (e) => {
  if (e.target === libraryModal) closeLibrary();
});

document.querySelectorAll('.lib-tab').forEach(tab => {
  tab.addEventListener('click', () => switchLibTab(tab.dataset.tab));
});

// Shopping list controls
$('#shopping-add-btn').addEventListener('click', addShoppingFromInput);
$('#shopping-add-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addShoppingFromInput();
});

function addShoppingFromInput() {
  const input = $('#shopping-add-input');
  const text = input.value.trim();
  if (!text) return;
  state.shopping.push({ text, checked: false, addedAt: Date.now() });
  saveJSON('jjc_shopping', state.shopping);
  input.value = '';
  renderShopping();
}

$('#clear-checked').addEventListener('click', () => {
  state.shopping = state.shopping.filter(s => !s.checked);
  saveJSON('jjc_shopping', state.shopping);
  renderShopping();
});

$('#clear-all-shopping').addEventListener('click', () => {
  if (!state.shopping.length) return;
  if (!confirm('장보기 리스트를 전부 비울까요?')) return;
  state.shopping = [];
  saveJSON('jjc_shopping', state.shopping);
  renderShopping();
});

function renderFavorites() {
  const list = $('#favorites-list');
  const empty = $('#favorites-empty');
  list.innerHTML = '';
  if (!state.favorites.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  state.favorites.forEach(item => {
    list.appendChild(buildLibItem(item, { canRemove: true, removeFrom: 'favorites' }));
  });
}

function renderRecent() {
  const list = $('#recent-list');
  const empty = $('#recent-empty');
  list.innerHTML = '';
  if (!state.recent.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  state.recent.forEach(item => {
    list.appendChild(buildLibItem(item, { canRemove: true, removeFrom: 'recent' }));
  });
}

function buildLibItem(item, opts) {
  const el = document.createElement('div');
  el.className = 'lib-item';
  const modeLabel = item.mode === '배달' ? '🛵 배달' : '🍳 요리';
  el.innerHTML = `
    <div class="lib-thumb">
      <span class="lib-thumb-emoji">${escapeHtml(item.emoji || '🍽️')}</span>
    </div>
    <div class="lib-info">
      <h4>${escapeHtml(item.name)}</h4>
      <div class="meta">${modeLabel} · ${escapeHtml(item.description || '')}</div>
    </div>
    ${opts.canRemove ? `<button class="lib-remove" aria-label="삭제">✕</button>` : ''}
  `;
  // Lazy-load thumbnail
  const thumb = el.querySelector('.lib-thumb');
  const query = item.imageQuery || item.name;
  if (query && thumb) {
    fetchMenuImage(query).then(url => {
      if (!url || !thumb.isConnected) return;
      const img = new Image();
      img.onload = () => {
        if (!thumb.isConnected) return;
        thumb.style.backgroundImage = `url("${url}")`;
        thumb.classList.add('has-image');
      };
      img.src = url;
    });
  }
  el.addEventListener('click', (e) => {
    if (e.target.closest('.lib-remove')) {
      e.stopPropagation();
      if (opts.removeFrom === 'favorites') {
        toggleFavorite(item);
        renderFavorites();
      } else if (opts.removeFrom === 'recent') {
        state.recent = state.recent.filter(r => r.name !== item.name);
        saveJSON('jjc_recent', state.recent);
        renderRecent();
      }
      return;
    }
    // Open detail
    closeLibrary();
    applyMode(item.mode || '요리');
    detailOrigin = 'library';
    updateBackLabel();
    addRecent(item);
    if (item.mode === '배달') {
      showDeliveryDetail(item);
    } else {
      loadRecipe(item, 0);
    }
  });
  return el;
}

function renderShopping() {
  // Placeholder until task 4
  const list = $('#shopping-list');
  const empty = $('#shopping-empty');
  const actions = $('#shopping-actions');
  if (!list) return;
  list.innerHTML = '';
  if (!state.shopping.length) {
    empty.classList.remove('hidden');
    actions.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  actions.classList.remove('hidden');
  state.shopping.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'shopping-item' + (item.checked ? ' checked' : '');
    el.innerHTML = `
      <div class="shop-checkbox">${item.checked ? '✓' : ''}</div>
      <div class="shop-text">
        ${escapeHtml(item.text)}
        ${item.source ? `<div class="shop-source">from ${escapeHtml(item.source)}</div>` : ''}
      </div>
      <button class="shop-delete" aria-label="삭제">✕</button>
    `;
    el.addEventListener('click', (e) => {
      if (e.target.closest('.shop-delete')) {
        e.stopPropagation();
        state.shopping.splice(idx, 1);
        saveJSON('jjc_shopping', state.shopping);
        renderShopping();
        return;
      }
      state.shopping[idx].checked = !state.shopping[idx].checked;
      saveJSON('jjc_shopping', state.shopping);
      renderShopping();
    });
    list.appendChild(el);
  });
}

// ===== PWA Install (홈 화면에 추가) =====
const installCard = $('#install-card');
const installModal = $('#install-modal');
let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function platformKind() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isInstallDismissed() {
  return localStorage.getItem('jjc_install_dismissed') === '1';
}

function maybeShowInstallCard() {
  if (isStandalone()) {
    installCard.classList.add('hidden');
    return;
  }
  if (isInstallDismissed()) return;

  const cta = $('#install-cta');
  const kind = platformKind();

  if (deferredInstallPrompt) {
    cta.textContent = '📥 설치';
    cta.onclick = triggerNativeInstall;
    installCard.classList.remove('hidden');
  } else if (kind === 'ios') {
    cta.textContent = '설치 방법 보기';
    cta.onclick = () => openInstallModal('ios');
    installCard.classList.remove('hidden');
  } else if (kind === 'android') {
    // Android Chrome may fire beforeinstallprompt later; if not, give instructions
    cta.textContent = '설치 방법 보기';
    cta.onclick = () => openInstallModal('android');
    installCard.classList.remove('hidden');
  }
  // desktop without prompt → don't show (uncommon use case)
}

async function triggerNativeInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  if (outcome === 'accepted') {
    installCard.classList.add('hidden');
  }
}

function openInstallModal(kind) {
  ['ios', 'android', 'other'].forEach(k => {
    $('#install-steps-' + k).classList.toggle('hidden', k !== kind);
  });
  installModal.classList.remove('hidden');
}

function closeInstallModal() {
  installModal.classList.add('hidden');
}

$('#close-install-modal').addEventListener('click', closeInstallModal);
installModal.addEventListener('click', (e) => {
  if (e.target === installModal) closeInstallModal();
});

$('#install-dismiss').addEventListener('click', () => {
  localStorage.setItem('jjc_install_dismissed', '1');
  installCard.classList.add('hidden');
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  maybeShowInstallCard();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installCard.classList.add('hidden');
  toast('설치 완료! 홈 화면에서 열어보세요.', 'success', 2500);
});

// ===== Init =====
applyTheme(state.theme);
applyMode(state.mode);
maybeShowInstallCard();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      /* offline support optional */
    });
  });
}

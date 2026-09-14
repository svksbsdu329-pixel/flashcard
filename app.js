const STORAGE_KEY = "cardhanjang-data-v1";

const palette = [
  { color: "#3677b5", soft: "#e5eff8" },
  { color: "#d77a42", soft: "#f9eadf" },
  { color: "#6f9250", soft: "#eaf1e4" },
  { color: "#9267b1", soft: "#eee7f4" },
  { color: "#c95f73", soft: "#f7e4e8" },
  { color: "#348f8b", soft: "#e1f1ef" },
];

const icons = {
  english: "A",
  math: "π",
  science: "⚗",
  history: "文",
  default: "✦",
};

const seedData = {
  subjects: [
    {
      id: "english",
      name: "영어",
      symbol: "A",
      color: "#3677b5",
      soft: "#e5eff8",
      cards: [
        { id: "en1", front: "accomplish", back: "성취하다, 완수하다", hint: "목표나 일을 성공적으로 끝내다", mastery: 2, favorite: true },
        { id: "en2", front: "perseverance", back: "인내, 끈기", hint: "어려움에도 계속하는 태도", mastery: 1, favorite: false },
        { id: "en3", front: "What is the past tense of ‘go’?", back: "went", hint: "불규칙 동사입니다.", mastery: 2, favorite: false },
        { id: "en4", front: "significant", back: "중요한, 상당한", hint: "important와 비슷한 뜻", mastery: 0, favorite: true },
        { id: "en5", front: "environment", back: "환경", hint: "우리를 둘러싼 자연과 조건", mastery: 1, favorite: false },
        { id: "en6", front: "How are you?", back: "어떻게 지내세요?", hint: "안부를 묻는 표현", mastery: 2, favorite: false },
      ],
    },
    {
      id: "math",
      name: "수학",
      symbol: "π",
      color: "#d77a42",
      soft: "#f9eadf",
      cards: [
        { id: "ma1", front: "삼각형의 넓이 공식은?", back: "밑변 × 높이 ÷ 2", hint: "평행사변형 넓이의 절반", mastery: 2, favorite: true },
        { id: "ma2", front: "원의 둘레 공식은?", back: "2πr", hint: "지름 × 원주율", mastery: 1, favorite: false },
        { id: "ma3", front: "피타고라스 정리", back: "a² + b² = c²", hint: "직각삼각형의 세 변 관계", mastery: 0, favorite: false },
        { id: "ma4", front: "이차방정식의 근의 공식", back: "x = (-b ± √(b²-4ac)) / 2a", hint: "ax² + bx + c = 0", mastery: 1, favorite: true },
      ],
    },
    {
      id: "science",
      name: "과학",
      symbol: "⚗",
      color: "#6f9250",
      soft: "#eaf1e4",
      cards: [
        { id: "sc1", front: "물의 화학식은?", back: "H₂O", hint: "수소 2개와 산소 1개", mastery: 2, favorite: false },
        { id: "sc2", front: "광합성에 필요한 세 가지", back: "빛, 물, 이산화탄소", hint: "식물이 양분을 만드는 과정", mastery: 1, favorite: true },
        { id: "sc3", front: "힘의 단위는?", back: "뉴턴(N)", hint: "과학자의 이름에서 유래", mastery: 0, favorite: false },
        { id: "sc4", front: "지구의 자연 위성은?", back: "달", hint: "밤하늘에서 볼 수 있어요", mastery: 2, favorite: false },
        { id: "sc5", front: "세포의 에너지 발전소", back: "미토콘드리아", hint: "ATP를 생성합니다", mastery: 1, favorite: true },
      ],
    },
  ],
  sessions: [
    { subjectId: "english", score: 83, count: 6, date: Date.now() - 3600000 * 5 },
    { subjectId: "math", score: 75, count: 4, date: Date.now() - 86400000 },
    { subjectId: "science", score: 80, count: 5, date: Date.now() - 86400000 * 2 },
  ],
  weekly: [9, 15, 8, 21, 13, 26, 18],
};

let state = loadData();
let currentView = "home";
let currentSubjectId = null;
let currentFilter = "all";
let study = null;

const content = document.getElementById("content");
const modalRoot = document.getElementById("modalRoot");
const sidebarSubjects = document.getElementById("sidebarSubjects");
const searchInput = document.getElementById("globalSearch");

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : structuredClone(seedData);
  } catch {
    return structuredClone(seedData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAllCards() {
  return state.subjects.flatMap((subject) => subject.cards.map((card) => ({ ...card, subject })));
}

function getSubject(id) {
  return state.subjects.find((subject) => subject.id === id);
}

function getMastery(subject) {
  if (!subject.cards.length) return 0;
  return Math.round((subject.cards.filter((card) => card.mastery === 2).length / subject.cards.length) * 100);
}

function renderSidebar() {
  sidebarSubjects.innerHTML = state.subjects.map((subject) => `
    <button class="nav-item ${currentView === "subject" && currentSubjectId === subject.id ? "active" : ""}" data-subject-id="${subject.id}">
      <span class="subject-dot" style="background:${subject.color}"></span>
      ${escapeHtml(subject.name)}
      <span class="nav-count">${subject.cards.length}</span>
    </button>
  `).join("");

  document.querySelectorAll(".main-nav .nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === currentView);
  });
}

function navigate(view, subjectId = null) {
  currentView = view;
  currentSubjectId = subjectId;
  currentFilter = "all";
  searchInput.value = "";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector(".sidebar").classList.remove("open");
}

function render() {
  renderSidebar();
  if (currentView === "home") renderHome();
  else if (currentView === "subject") renderSubject(currentSubjectId);
  else if (currentView === "study") renderStudy();
  else if (currentView === "all-cards") renderCardLibrary("전체 카드", getAllCards());
  else if (currentView === "favorites") renderCardLibrary("즐겨찾기", getAllCards().filter((card) => card.favorite));
  else if (currentView === "search") renderSearch(searchInput.value);
}

function renderHome() {
  const totalCards = getAllCards().length;
  const mastered = getAllCards().filter((card) => card.mastery === 2).length;
  const latestSubject = state.subjects[0];
  const studiedThisWeek = state.weekly.reduce((sum, item) => sum + item, 0);

  content.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">${new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(new Date())}</p>
        <h1>안녕하세요, 김선생님 👋</h1>
        <p class="page-subtitle">학생들과 함께 오늘도 한 장씩 성장해 볼까요?</p>
      </div>
      <button class="secondary-button" data-action="new-card">＋ 새 카드</button>
    </div>

    <section class="hero">
      <div class="hero-copy">
        <div class="hero-label">오늘의 학습</div>
        <h2>${totalCards}장의 카드가<br>복습을 기다리고 있어요.</h2>
        <p>짧게 자주 복습하면 오래 기억할 수 있어요. 학생과 함께 가볍게 시작해 보세요.</p>
        <button class="primary-button" data-action="start-all">
          학습 시작하기
          <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="spark s1"></span><span class="spark s2"></span>
        <div class="float-card card-one"><span>ANSWER</span><strong>성취하다</strong></div>
        <div class="float-card card-two"><span>WORD</span><strong>accomplish</strong></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div><h2>내 과목</h2><p>과목을 선택해 카드를 관리하고 학습하세요.</p></div>
        <button class="text-button" data-view="all-cards">전체 카드 보기 →</button>
      </div>
      <div class="subject-grid">
        ${state.subjects.map(subjectCardTemplate).join("")}
        <button class="subject-card add-subject" data-action="new-subject">
          <span class="add-circle">＋</span><strong>새 과목 만들기</strong>
        </button>
      </div>
    </section>

    <div class="dashboard-lower">
      <section class="panel">
        <div class="section-head"><div><h2>최근 학습 기록</h2><p>최근 완료한 학습 결과예요.</p></div></div>
        <div class="activity-list">
          ${state.sessions.length ? state.sessions.slice(0, 4).map(activityTemplate).join("") : `<div class="empty-state"><p>아직 학습 기록이 없어요.</p></div>`}
        </div>
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>이번 주 학습</h2><p>매일 조금씩 쌓은 기록이에요.</p></div></div>
        <p class="study-total">${studiedThisWeek}<small> 장 학습</small></p>
        <div class="week-chart">
          ${state.weekly.map((value, index) => `<div class="bar-wrap"><div class="bar ${index === 6 ? "today" : ""}" style="height:${Math.max(8, Math.round(value / Math.max(...state.weekly, 1) * 85))}%"></div><span>${["월","화","수","목","금","토","일"][index]}</span></div>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function subjectCardTemplate(subject) {
  const mastery = getMastery(subject);
  return `
    <article class="subject-card" data-subject-id="${subject.id}" style="--card-color:${subject.color};--card-soft:${subject.soft}">
      <div class="subject-icon">${escapeHtml(subject.symbol || icons.default)}</div>
      <h3>${escapeHtml(subject.name)}</h3>
      <div class="subject-meta">카드 ${subject.cards.length}장 · 완벽히 암기 ${subject.cards.filter((card) => card.mastery === 2).length}장</div>
      <div class="subject-progress"><div class="progress-track"><span style="width:${mastery}%"></span></div><small>${mastery}%</small></div>
    </article>
  `;
}

function activityTemplate(session) {
  const subject = getSubject(session.subjectId) || { name: "전체 과목", symbol: "✦", color: "#1f6d50", soft: "#dfeee7" };
  const relative = formatRelative(session.date);
  return `<div class="activity-item">
    <div class="activity-icon" style="background:${subject.soft};color:${subject.color}">${escapeHtml(subject.symbol)}</div>
    <div class="activity-text"><strong>${escapeHtml(subject.name)} 카드 학습</strong><span>${relative} · ${session.count}장</span></div>
    <div class="activity-score">정답 ${session.score}%</div>
  </div>`;
}

function formatRelative(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}분 전`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  return `${Math.floor(diff / 86400000)}일 전`;
}

function renderSubject(id) {
  const subject = getSubject(id);
  if (!subject) return navigate("home");
  const cards = filterSubjectCards(subject.cards);
  content.innerHTML = `
    <section class="subject-header-card" style="--subject-color:${subject.color};--subject-soft:${subject.soft}" data-symbol="${escapeHtml(subject.symbol)}">
      <div class="large-subject-icon">${escapeHtml(subject.symbol)}</div>
      <div><p class="eyebrow">나의 과목</p><h1>${escapeHtml(subject.name)}</h1><p>카드 ${subject.cards.length}장 · 암기율 ${getMastery(subject)}%</p></div>
      <div class="subject-header-actions">
        <button class="secondary-button" data-action="edit-subject" data-id="${subject.id}">과목 설정</button>
        <button class="primary-button dark" data-action="start-subject" data-id="${subject.id}">▶ 학습 시작</button>
      </div>
    </section>

    <div class="list-toolbar">
      <div class="filter-chips">
        ${[["all","전체"],["learning","학습 중"],["mastered","암기 완료"],["favorite","즐겨찾기"]].map(([key,label]) => `<button class="filter-chip ${currentFilter === key ? "active" : ""}" data-filter="${key}">${label}</button>`).join("")}
      </div>
      <div class="toolbar-spacer"></div>
      <button class="primary-button dark" data-action="new-card" data-subject="${subject.id}">＋ 카드 추가</button>
    </div>
    ${cardTableTemplate(cards, subject)}
  `;
}

function filterSubjectCards(cards) {
  if (currentFilter === "learning") return cards.filter((card) => card.mastery < 2);
  if (currentFilter === "mastered") return cards.filter((card) => card.mastery === 2);
  if (currentFilter === "favorite") return cards.filter((card) => card.favorite);
  return cards;
}

function renderCardLibrary(title, cards) {
  content.innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">카드 보관함</p><h1>${title}</h1><p class="page-subtitle">${cards.length}장의 카드를 한곳에서 확인하세요.</p></div>
      <button class="primary-button dark" data-action="new-card">＋ 새 카드</button>
    </div>
    ${libraryTableTemplate(cards)}
  `;
}

function cardTableTemplate(cards, subject) {
  if (!cards.length) return `<div class="card-table empty-state"><div class="empty-state-icon">◫</div><h3>아직 카드가 없어요</h3><p>첫 카드를 추가하고 학습을 시작해 보세요.</p><button class="primary-button dark" data-action="new-card" data-subject="${subject.id}">첫 카드 만들기</button></div>`;
  return `<div class="card-table">
    <div class="card-row header"><div class="card-cell">앞면 · 질문</div><div class="card-cell">뒷면 · 정답</div><div class="card-cell">학습 상태</div><div></div></div>
    ${cards.map((card) => cardRowTemplate(card, subject)).join("")}
  </div>`;
}

function libraryTableTemplate(cards) {
  if (!cards.length) return `<div class="card-table empty-state"><div class="empty-state-icon">☆</div><h3>표시할 카드가 없어요</h3><p>카드의 별표를 눌러 즐겨찾기에 모아 보세요.</p></div>`;
  return `<div class="card-table">
    <div class="card-row header"><div class="card-cell">앞면 · 질문</div><div class="card-cell">뒷면 · 정답</div><div class="card-cell">과목</div><div></div></div>
    ${cards.map(({ subject, ...card }) => cardRowTemplate(card, subject, true)).join("")}
  </div>`;
}

function cardRowTemplate(card, subject, showSubject = false) {
  const labels = ["새 카드", "학습 중", "암기 완료"];
  return `<div class="card-row">
    <div class="card-cell"><strong>${card.favorite ? "★ " : ""}${escapeHtml(card.front)}</strong></div>
    <div class="card-cell"><span>${escapeHtml(card.back)}</span></div>
    <div class="card-cell">${showSubject ? `<span style="color:${subject.color};font-weight:700">${escapeHtml(subject.name)}</span>` : `<span class="mastery-pill mastery-${card.mastery}">${labels[card.mastery]}</span>`}</div>
    <div class="row-actions">
      <button class="row-action" data-action="toggle-favorite" data-subject="${subject.id}" data-id="${card.id}" aria-label="즐겨찾기">${card.favorite ? "★" : "☆"}</button>
      <button class="row-action" data-action="edit-card" data-subject="${subject.id}" data-id="${card.id}" aria-label="수정"><svg viewBox="0 0 24 24"><path d="m4 20 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 7.5l3 3"/></svg></button>
    </div>
  </div>`;
}

function openSubjectModal(subject = null) {
  const selected = subject ? palette.findIndex((item) => item.color === subject.color) : state.subjects.length % palette.length;
  openModal(`
    <form id="subjectForm" class="modal">
      <div class="modal-head"><div><h2>${subject ? "과목 설정" : "새 과목 만들기"}</h2><p>어떤 과목이든 자유롭게 만들 수 있어요.</p></div><button class="close-button" type="button" data-action="close-modal">×</button></div>
      <div class="form-grid">
        <div class="field"><label for="subjectName">과목 이름</label><input id="subjectName" name="name" required maxlength="20" placeholder="예: 한국사" value="${escapeHtml(subject?.name || "")}" /></div>
        <div class="field"><label for="subjectSymbol">대표 글자 또는 기호</label><input id="subjectSymbol" name="symbol" required maxlength="2" placeholder="예: 文" value="${escapeHtml(subject?.symbol || "")}" /></div>
        <div class="field full"><label>과목 색상</label><div class="color-picker">${palette.map((item, index) => `<button type="button" class="color-option ${index === selected ? "selected" : ""}" data-color-index="${index}" style="background:${item.color}" aria-label="색상 ${index + 1}"></button>`).join("")}</div><input type="hidden" name="colorIndex" value="${selected}" /></div>
      </div>
      <div class="modal-actions">
        ${subject ? `<button class="danger-button" type="button" data-action="delete-subject" data-id="${subject.id}">과목 삭제</button>` : ""}
        <div class="toolbar-spacer"></div><button class="secondary-button" type="button" data-action="close-modal">취소</button><button class="primary-button dark" type="submit">${subject ? "저장하기" : "만들기"}</button>
      </div>
      <input type="hidden" name="subjectId" value="${subject?.id || ""}" />
    </form>
  `);
}

function openCardModal(subjectId = null, cardId = null) {
  const subject = getSubject(subjectId) || state.subjects[0];
  if (!subject) return openSubjectModal();
  const card = cardId ? subject.cards.find((item) => item.id === cardId) : null;
  openModal(`
    <form id="cardForm" class="modal wide">
      <div class="modal-head"><div><h2>${card ? "카드 수정" : "새 카드 만들기"}</h2><p>질문과 정답을 입력하면 바로 학습할 수 있어요.</p></div><button class="close-button" type="button" data-action="close-modal">×</button></div>
      <div class="form-grid">
        <div class="field full"><label for="cardSubject">과목</label><select id="cardSubject" name="subjectId">${state.subjects.map((item) => `<option value="${item.id}" ${item.id === subject.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></div>
        <div class="field"><label for="cardFront">앞면 · 질문</label><textarea id="cardFront" name="front" required placeholder="학생에게 보여줄 질문을 입력하세요.">${escapeHtml(card?.front || "")}</textarea></div>
        <div class="field"><label for="cardBack">뒷면 · 정답</label><textarea id="cardBack" name="back" required placeholder="카드를 뒤집었을 때 보여줄 정답을 입력하세요.">${escapeHtml(card?.back || "")}</textarea></div>
        <div class="field full"><label for="cardHint">힌트 <span class="field-note">(선택)</span></label><input id="cardHint" name="hint" maxlength="100" placeholder="정답을 떠올릴 수 있는 짧은 힌트" value="${escapeHtml(card?.hint || "")}" /></div>
      </div>
      <div class="modal-actions">
        ${card ? `<button class="danger-button" type="button" data-action="delete-card" data-subject="${subject.id}" data-id="${card.id}">카드 삭제</button>` : ""}
        <div class="toolbar-spacer"></div><button class="secondary-button" type="button" data-action="close-modal">취소</button><button class="primary-button dark" type="submit">${card ? "저장하기" : "카드 추가"}</button>
      </div>
      <input type="hidden" name="cardId" value="${card?.id || ""}" />
      <input type="hidden" name="originalSubjectId" value="${subject.id}" />
    </form>
  `);
}

function openSettings() {
  openModal(`
    <div class="modal">
      <div class="modal-head"><div><h2>설정 및 백업</h2><p>학습 자료를 안전하게 보관하고 옮길 수 있어요.</p></div><button class="close-button" type="button" data-action="close-modal">×</button></div>
      <div class="settings-list">
        <div class="settings-row"><span class="settings-row-icon">⇩</span><div><strong>자료 내보내기</strong><span>모든 과목과 카드를 JSON 파일로 저장해요.</span></div><button class="secondary-button" data-action="export-data">내보내기</button></div>
        <div class="settings-row"><span class="settings-row-icon">⇧</span><div><strong>자료 가져오기</strong><span>이전에 내보낸 JSON 파일을 불러와요.</span></div><label class="secondary-button" for="importFile">가져오기</label><input class="file-input" id="importFile" type="file" accept="application/json" /></div>
        <div class="settings-row"><span class="settings-row-icon">↻</span><div><strong>예시 자료로 초기화</strong><span>현재 자료를 지우고 처음 상태로 돌아가요.</span></div><button class="danger-button" data-action="reset-data">초기화</button></div>
      </div>
    </div>
  `);
}

function openModal(markup) {
  modalRoot.innerHTML = `<div class="modal-backdrop">${markup}</div>`;
  const firstInput = modalRoot.querySelector("input:not([type=hidden]), textarea, select");
  setTimeout(() => firstInput?.focus(), 50);
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function startStudy(subjectId = null) {
  const source = subjectId ? getSubject(subjectId)?.cards || [] : getAllCards().map(({ subject, ...card }) => ({ ...card, sourceSubjectId: subject.id }));
  if (!source.length) return toast("학습할 카드가 없어요. 먼저 카드를 추가해 주세요.");
  const cards = source.map((card) => ({ ...card, sourceSubjectId: card.sourceSubjectId || subjectId })).sort(() => Math.random() - .5);
  study = { cards, index: 0, known: 0, again: 0, flipped: false, subjectId };
  currentView = "study";
  currentSubjectId = subjectId;
  render();
}

function renderStudy() {
  if (!study) return navigate("home");
  if (study.index >= study.cards.length) return renderStudyComplete();
  const card = study.cards[study.index];
  const subject = getSubject(card.sourceSubjectId);
  const progress = Math.round((study.index / study.cards.length) * 100);
  content.innerHTML = `
    <div class="study-view">
      <div class="study-top">
        <button class="secondary-button" data-action="exit-study">← 나가기</button>
        <div class="progress-track"><span style="width:${progress}%;background:${subject?.color || "#1f6d50"}"></span></div>
        <span class="study-counter">${study.index + 1} / ${study.cards.length}</span>
      </div>
      <div class="study-stage">
        <div class="flashcard-scene" data-action="flip-card" role="button" tabindex="0" aria-label="카드 뒤집기">
          <div class="flashcard ${study.flipped ? "flipped" : ""}">
            <div class="flashcard-face flashcard-front">
              <span class="face-label">${escapeHtml(subject?.name || "전체 과목")} · QUESTION</span>
              <button class="favorite-card ${card.favorite ? "active" : ""}" data-action="study-favorite" aria-label="즐겨찾기">${card.favorite ? "★" : "☆"}</button>
              <div class="card-main-text">${escapeHtml(card.front)}</div>
              ${card.hint ? `<div class="card-hint">힌트 · ${escapeHtml(card.hint)}</div>` : ""}
              <span class="flip-hint">카드를 클릭하거나 Space를 눌러 정답 확인</span>
            </div>
            <div class="flashcard-face flashcard-back">
              <span class="face-label">ANSWER</span>
              <div class="card-main-text">${escapeHtml(card.back)}</div>
              <span class="flip-hint">기억했는지 아래에서 선택해 주세요</span>
            </div>
          </div>
        </div>
        <div class="study-controls">
          <button class="answer-button again" data-action="answer" data-known="false" ${study.flipped ? "" : "disabled"}>다시 볼래요<span>← 방향키</span></button>
          <button class="answer-button know" data-action="answer" data-known="true" ${study.flipped ? "" : "disabled"}>알고 있어요<span>→ 방향키</span></button>
        </div>
        <p class="study-help">카드는 매번 무작위 순서로 출제됩니다.</p>
      </div>
    </div>
  `;
}

function flipCard() {
  if (!study || study.index >= study.cards.length) return;
  study.flipped = !study.flipped;
  const cardEl = document.querySelector(".flashcard");
  cardEl?.classList.toggle("flipped", study.flipped);
  document.querySelectorAll(".answer-button").forEach((button) => { button.disabled = !study.flipped; });
}

function answerCard(known) {
  if (!study?.flipped) return;
  const card = study.cards[study.index];
  const original = getSubject(card.sourceSubjectId)?.cards.find((item) => item.id === card.id);
  if (original) original.mastery = known ? Math.min(2, original.mastery + 1) : Math.max(0, original.mastery - 1);
  known ? study.known++ : study.again++;
  study.index++;
  study.flipped = false;
  saveData();
  renderStudy();
}

function renderStudyComplete() {
  const total = study.cards.length;
  const score = Math.round((study.known / total) * 100);
  content.innerHTML = `<div class="complete-card">
    <div class="complete-icon">✓</div><p class="eyebrow">학습 완료</p><h2>오늘의 카드 학습을 마쳤어요!</h2><p>${total}장의 카드를 끝까지 확인했습니다. 수고하셨어요.</p>
    <div class="result-grid"><div class="result-box"><strong>${total}</strong><span>학습한 카드</span></div><div class="result-box"><strong>${study.known}</strong><span>알고 있어요</span></div><div class="result-box"><strong>${score}%</strong><span>오늘의 정답률</span></div></div>
    <button class="secondary-button" data-action="restart-study">다시 학습하기</button> <button class="primary-button dark" data-action="finish-study">홈으로 돌아가기</button>
  </div>`;
  if (!study.saved) {
    state.sessions.unshift({ subjectId: study.subjectId, score, count: total, date: Date.now() });
    const day = (new Date().getDay() + 6) % 7;
    state.weekly[day] = (state.weekly[day] || 0) + total;
    study.saved = true;
    saveData();
  }
}

function renderSearch(query) {
  const term = query.trim().toLowerCase();
  const results = term ? getAllCards().filter((card) => [card.front, card.back, card.hint, card.subject.name].some((value) => value?.toLowerCase().includes(term))) : [];
  content.innerHTML = `<div class="page-heading"><div><p class="eyebrow">검색 결과</p><h1>“${escapeHtml(query)}” 검색</h1><p class="page-subtitle">${results.length}장의 카드를 찾았어요.</p></div></div>
    <div class="card-table search-results">${results.length ? results.map((card) => `<div class="search-result" data-subject-id="${card.subject.id}"><span class="search-subject">${escapeHtml(card.subject.name)}</span><strong>${escapeHtml(card.front)}</strong><span>${escapeHtml(card.back)}</span></div>`).join("") : `<div class="empty-state"><div class="empty-state-icon">⌕</div><h3>검색 결과가 없어요</h3><p>다른 단어로 검색해 보세요.</p></div>`}</div>`;
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.getElementById("toastRoot").appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-view], [data-subject-id], [data-filter], [data-color-index]");
  if (!target) return;

  if (target.dataset.view) return navigate(target.dataset.view);
  if (target.dataset.filter) { currentFilter = target.dataset.filter; return renderSubject(currentSubjectId); }
  if (target.dataset.colorIndex !== undefined) {
    modalRoot.querySelectorAll(".color-option").forEach((el) => el.classList.remove("selected"));
    target.classList.add("selected");
    modalRoot.querySelector('[name="colorIndex"]').value = target.dataset.colorIndex;
    return;
  }
  if (target.dataset.subjectId && !target.dataset.action) return navigate("subject", target.dataset.subjectId);

  const action = target.dataset.action;
  if (action === "home") return navigate("home");
  if (action === "new-subject") return openSubjectModal();
  if (action === "edit-subject") return openSubjectModal(getSubject(target.dataset.id));
  if (action === "new-card") return openCardModal(target.dataset.subject || currentSubjectId);
  if (action === "edit-card") return openCardModal(target.dataset.subject, target.dataset.id);
  if (action === "close-modal") return closeModal();
  if (action === "open-settings") return openSettings();
  if (action === "start-subject") return startStudy(target.dataset.id);
  if (action === "start-all") return startStudy();
  if (action === "flip-card") return flipCard();
  if (action === "answer") return answerCard(target.dataset.known === "true");
  if (action === "exit-study") return navigate(study?.subjectId ? "subject" : "home", study?.subjectId);
  if (action === "restart-study") return startStudy(study.subjectId);
  if (action === "finish-study") { study = null; return navigate("home"); }
  if (action === "study-favorite") {
    event.stopPropagation();
    const card = study.cards[study.index];
    const original = getSubject(card.sourceSubjectId)?.cards.find((item) => item.id === card.id);
    if (original) { original.favorite = !original.favorite; card.favorite = original.favorite; saveData(); renderStudy(); }
    return;
  }
  if (action === "toggle-favorite") {
    const card = getSubject(target.dataset.subject)?.cards.find((item) => item.id === target.dataset.id);
    if (card) { card.favorite = !card.favorite; saveData(); render(); }
    return;
  }
  if (action === "delete-card") {
    if (!confirm("이 카드를 삭제할까요?")) return;
    const subject = getSubject(target.dataset.subject);
    subject.cards = subject.cards.filter((card) => card.id !== target.dataset.id);
    saveData(); closeModal(); render(); toast("카드를 삭제했어요.");
    return;
  }
  if (action === "delete-subject") {
    if (!confirm("과목과 포함된 모든 카드를 삭제할까요?")) return;
    state.subjects = state.subjects.filter((item) => item.id !== target.dataset.id);
    saveData(); closeModal(); navigate("home"); toast("과목을 삭제했어요.");
    return;
  }
  if (action === "export-data") return exportData();
  if (action === "reset-data") {
    if (!confirm("현재 자료를 지우고 예시 자료로 초기화할까요?")) return;
    state = structuredClone(seedData); saveData(); closeModal(); navigate("home"); toast("예시 자료로 초기화했어요.");
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  if (form.id === "subjectForm") {
    const selected = palette[Number(data.colorIndex)] || palette[0];
    if (data.subjectId) {
      const subject = getSubject(data.subjectId);
      Object.assign(subject, { name: data.name.trim(), symbol: data.symbol.trim(), ...selected });
      toast("과목 설정을 저장했어요.");
    } else {
      state.subjects.push({ id: uid("subject"), name: data.name.trim(), symbol: data.symbol.trim(), ...selected, cards: [] });
      toast("새 과목을 만들었어요.");
    }
    saveData(); closeModal(); render();
  }
  if (form.id === "cardForm") {
    const originalSubject = getSubject(data.originalSubjectId);
    const destination = getSubject(data.subjectId);
    if (data.cardId) {
      const existing = originalSubject.cards.find((card) => card.id === data.cardId);
      const updated = { ...existing, front: data.front.trim(), back: data.back.trim(), hint: data.hint.trim() };
      if (originalSubject.id !== destination.id) {
        originalSubject.cards = originalSubject.cards.filter((card) => card.id !== data.cardId);
        destination.cards.push(updated);
      } else Object.assign(existing, updated);
      toast("카드를 수정했어요.");
    } else {
      destination.cards.unshift({ id: uid("card"), front: data.front.trim(), back: data.back.trim(), hint: data.hint.trim(), mastery: 0, favorite: false });
      toast("새 카드를 추가했어요.");
    }
    saveData(); closeModal(); render();
  }
});

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `카드한장-백업-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast("백업 파일을 저장했어요.");
}

document.addEventListener("change", (event) => {
  if (event.target.id !== "importFile") return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported.subjects)) throw new Error();
      state = imported;
      state.sessions ||= [];
      state.weekly ||= [0,0,0,0,0,0,0];
      saveData(); closeModal(); navigate("home"); toast("자료를 성공적으로 불러왔어요.");
    } catch { toast("올바른 카드한장 백업 파일이 아니에요."); }
  };
  reader.readAsText(event.target.files[0]);
});

searchInput.addEventListener("input", (event) => {
  if (!event.target.value.trim()) return navigate("home");
  currentView = "search";
  renderSidebar();
  renderSearch(event.target.value);
});

document.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault(); searchInput.focus();
  }
  if (event.key === "Escape" && modalRoot.innerHTML) closeModal();
  if (currentView === "study" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
    if (event.code === "Space") { event.preventDefault(); flipCard(); }
    if (study?.flipped && event.key === "ArrowLeft") answerCard(false);
    if (study?.flipped && event.key === "ArrowRight") answerCard(true);
  }
});

document.getElementById("menuButton").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
modalRoot.addEventListener("click", (event) => { if (event.target.classList.contains("modal-backdrop")) closeModal(); });

render();

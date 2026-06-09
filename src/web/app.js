const DATA_REFRESH_MS = 15000;
const IMPORTED_DATA_KEY = "resume-dashboard-imported-data";
const THEME_MODE_KEY = "resume-dashboard-theme-mode";
const SHORTCUTS_KEY = "resume-dashboard-shortcuts";
const LEGACY_CUSTOM_SHORTCUT_KEY = "resume-dashboard-custom-shortcut";
const DATABASE_ONBOARDING_KEY = "resume-dashboard-database-onboarding-seen";
const DEFAULT_DATABASE_FILE = "resume-dashboard.sqlite3";
const SERVICE_SESSION_KEY = "offer-dashboard-session-id";
const SERVICE_HEARTBEAT_MS = 10000;
const PERSONAL_INFO_KEY = "offer-dashboard-personal-info";
const RESUME_DB_NAME = "offer-dashboard-resumes";
const RESUME_DB_VERSION = 1;
const RESUME_STORE_NAME = "resumes";

const HEADER = {
  company: "公司名称",
  domain: "领域",
  companyType: "企业性质",
  position: "方向 / 岗位",
  city: "城市",
  roleType: "岗位性质",
  stage: "阶段",
  deadline: "投递截止时间",
  link: "投递链接",
  presentation: "宣讲会地点",
  presentationAt: "宣讲会时间",
  presentationApplied: "宣讲会投递",
  appliedFlag: "是否投递",
  appliedAt: "投递时间",
  writtenTestAt: "笔试时间",
  writtenTestResult: "笔试结果",
  feedback: "投递反馈",
  interview1At: "一面时间",
  interview1Result: "一面结果",
  interview2At: "二面时间",
  interview2Result: "二面结果",
  interview3At: "三面时间",
  interview3Result: "三面结果"
};

const THEME_MODES = ["auto", "light", "dark"];
const THEME_LABELS = {
  auto: "自动",
  light: "白天",
  dark: "夜晚"
};
const THEME_TOGGLE_ICONS = {
  auto: `
    <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.75v2.5M12 18.75v2.5M4.75 12h2.5M16.75 12h2.5M5.93 5.93l1.77 1.77M16.3 16.3l1.77 1.77M5.93 18.07 7.7 16.3M16.3 7.7l1.77-1.77M12 8.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5Z" />
      <path d="M20.25 12a8.25 8.25 0 0 0-8.25-8.25" />
    </svg>
  `,
  light: `
    <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.75v2.5M12 18.75v2.5M4.75 12h2.5M16.75 12h2.5M5.93 5.93l1.77 1.77M16.3 16.3l1.77 1.77M5.93 18.07 7.7 16.3M16.3 7.7l1.77-1.77M12 7.25a4.75 4.75 0 1 0 0 9.5a4.75 4.75 0 0 0 0-9.5Z" />
    </svg>
  `,
  dark: `
    <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.53 3.3a.75.75 0 0 0-.97.88a7.5 7.5 0 1 1-9.38 9.38a.75.75 0 0 0-.88.97A9 9 0 1 0 14.53 3.3Z" />
    </svg>
  `
};

const COMPANY_TYPE_OPTIONS = [
  "",
  "国企",
  "央企",
  "私企",
  "外企",
  "合资",
  "事业单位",
  "高校",
  "科研院所",
  "政府/公务员",
  "其他"
];

const RECORD_SORT_OPTIONS = [
  { value: "created", label: "按照添加时间排列" },
  { value: "deadline", label: "按照截止时间排列" },
  { value: "node", label: "按照节点时间排列" }
];

const COMMON_LINK_SHORTCUTS = {
  boss: {
    label: "BOSS直聘",
    url: "https://www.zhipin.com/hangzhou/?seoRefer=index"
  },
  zhilian: {
    label: "智联招聘",
    url: "https://www.zhaopin.com/"
  },
  wonderCv: {
    label: "超级简历",
    url: "https://www.wondercv.com/jianlimoban/"
  },
  aiRelay: {
    label: "AI中转订阅",
    url: "https://cdk.aixhan.com/?aff=af_40c9715138ab"
  }
};

const PINNED_COMMON_LINKS = [
  COMMON_LINK_SHORTCUTS.wonderCv,
  COMMON_LINK_SHORTCUTS.aiRelay
];

const BUILTIN_TOOL_ACTIONS = [
  { action: "info", label: "信息管理" },
  { action: "resume", label: "简历管理" }
];

const SHORTCUT_GROUPS = {
  recruitment: {
    title: "常用链接",
    kicker: "Common Links",
    maxItems: 4,
    defaults: [
      COMMON_LINK_SHORTCUTS.boss,
      COMMON_LINK_SHORTCUTS.zhilian,
      COMMON_LINK_SHORTCUTS.wonderCv,
      COMMON_LINK_SHORTCUTS.aiRelay
    ]
  },
  tools: {
    title: "常用工具",
    kicker: "Common Tools",
    maxItems: 4,
    defaults: []
  }
};

const VIEWS = ["overview", "records", "guide"];

const STAGE_OPTIONS = [
  { value: "未投递", group: "planned", tagClass: "stage-planned" },
  { value: "已投递", group: "applied", tagClass: "stage-applied" },
  { value: "等待笔试", group: "written", tagClass: "stage-written" },
  { value: "等待一面", group: "interview", tagClass: "stage-interview-1" },
  { value: "等待二面", group: "interview", tagClass: "stage-interview-2" },
  { value: "等待三面", group: "interview", tagClass: "stage-interview-3" },
  { value: "已录取", group: "offer", tagClass: "stage-offer" },
  { value: "已淘汰", group: "rejected", tagClass: "stage-rejected" }
];

const STAGE_GROUP_LABELS = {
  planned: "未投递",
  applied: "已投递",
  written: "等待笔试",
  interview: "面试中",
  offer: "已录取",
  rejected: "已淘汰",
  unknown: "其他"
};

const FIELD_ALIASES = {
  company: ["企业名称", "公司名称", "公司", "企业", "organization", "company"],
  domain: ["企业领域", "领域", "行业", "赛道", "方向", "domain", "industry", "track"],
  companyType: ["企业性质", "公司性质", "单位性质", "ownership", "company type"],
  position: ["方向 / 岗位", "意向岗位", "岗位", "职位", "岗位名称", "position", "role", "job", "title"],
  city: ["岗位城市", "城市", "工作城市", "办公城市", "work city", "job city", "city"],
  roleType: ["岗位性质", "职位性质", "job type", "role type"],
  stage: ["阶段", "状态", "进度", "当前阶段", "stage", "status"],
  deadline: ["投递截止时间", "截止时间", "截止", "deadline", "ddl"],
  link: ["投递链接", "链接", "网址", "url", "link"],
  presentation: ["宣讲会地点", "校内宣讲会", "宣讲会", "talk"],
  presentationAt: ["宣讲会时间", "talk time"],
  presentationApplied: ["宣讲会投递", "宣讲会是否投递", "talk applied"],
  appliedFlag: ["是否投递", "是否已投递", "applied"],
  appliedAt: ["投递时间", "申请时间", "投递日期", "applied at", "apply date"],
  writtenTestAt: ["笔试时间", "笔试", "测评时间", "written test time", "written test"],
  writtenTestResult: ["笔试结果", "笔试反馈", "测评结果", "written test result", "assessment result"],
  feedback: ["投递反馈", "反馈", "流程反馈", "feedback"],
  interview1At: ["一面时间", "第一面时间"],
  interview1Result: ["一面结果", "第一面结果"],
  interview2At: ["二面时间", "第二面时间"],
  interview2Result: ["二面结果", "第二面结果"],
  interview3At: ["三面时间", "第三面时间", "终面时间", "HR面时间"],
  interview3Result: ["三面结果", "第三面结果", "终面结果", "HR面结果"]
};

const EDITOR_FIELDS = [
  { key: HEADER.company, label: "公司名称", type: "text", colSpan: 6 },
  { key: HEADER.domain, label: "领域", type: "text", colSpan: 3 },
  { key: HEADER.companyType, label: "企业性质", type: "select", options: COMPANY_TYPE_OPTIONS, colSpan: 3 },
  { key: HEADER.position, label: "方向 / 岗位", type: "text", colSpan: 6 },
  { key: HEADER.city, label: "城市", type: "text", colSpan: 3 },
  { key: HEADER.roleType, label: "岗位性质", type: "select", options: ["", "实习", "秋招"], colSpan: 3 },
  { key: "__stage", label: "阶段", type: "select", options: ["", ...STAGE_OPTIONS.map((item) => item.value)], colSpan: 4 },
  { key: HEADER.appliedAt, label: "投递时间", type: "date", processStageLocked: true, colSpan: 4 },
  { key: HEADER.deadline, label: "投递截止时间", type: "date", colSpan: 4 },
  { key: "__hasPresentation", label: "校内宣讲会", type: "checkbox", inToggleRow: true },
  { key: "__hasWrittenTest", label: "笔试", type: "checkbox", inToggleRow: true, processStageLocked: true },
  { key: "__hasInterview1", label: "一面", type: "checkbox", inToggleRow: true, processStageLocked: true },
  { key: "__hasInterview2", label: "二面", type: "checkbox", inToggleRow: true, processStageLocked: true },
  { key: "__hasInterview3", label: "三面", type: "checkbox", inToggleRow: true, processStageLocked: true },
  { key: HEADER.link, label: "投递链接", type: "url", colSpan: 12 },
  { key: HEADER.presentation, label: "宣讲会地点", type: "text", colSpan: 6, toggleKey: "__hasPresentation", hideWhenInactive: true },
  { key: HEADER.presentationAt, label: "宣讲会时间", type: "date", colSpan: 6, toggleKey: "__hasPresentation", hideWhenInactive: true },
  { key: HEADER.writtenTestAt, label: "笔试时间", type: "date", colSpan: 6, toggleKey: "__hasWrittenTest", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.writtenTestResult, label: "笔试结果", type: "text", colSpan: 6, toggleKey: "__hasWrittenTest", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.interview1At, label: "一面时间", type: "date", colSpan: 6, toggleKey: "__hasInterview1", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.interview1Result, label: "一面结果", type: "text", colSpan: 6, toggleKey: "__hasInterview1", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.interview2At, label: "二面时间", type: "date", colSpan: 6, toggleKey: "__hasInterview2", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.interview2Result, label: "二面结果", type: "text", colSpan: 6, toggleKey: "__hasInterview2", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.interview3At, label: "三面时间", type: "date", colSpan: 6, toggleKey: "__hasInterview3", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.interview3Result, label: "三面结果", type: "text", colSpan: 6, toggleKey: "__hasInterview3", processStageLocked: true, hideWhenInactive: true },
  { key: HEADER.feedback, label: "备注 / 反馈", type: "textarea", colSpan: 12 }
];

const EDITOR_TOGGLE_FIELDS = [
  "__hasPresentation",
  "__hasWrittenTest",
  "__hasInterview1",
  "__hasInterview2",
  "__hasInterview3"
];

const EDITOR_SUGGESTION_FIELDS = new Set([
  HEADER.company,
  HEADER.domain,
  HEADER.position
]);
const EDITOR_SUGGESTION_LIMIT = 8;

const TABLE_COLUMN_WIDTHS = {
  company: "15%",
  position: "15%",
  deadline: "8%",
  roleType: "8%",
  stage: "8%",
  nodeDate: "13%",
  city: "5%",
  notes: "22%",
  actions: "6%"
};

const els = {
  body: document.body,
  topNavLinks: [...document.querySelectorAll("[data-view-link]")],
  overviewView: document.querySelector("#overviewView"),
  recordsView: document.querySelector("#recordsView"),
  guideView: document.querySelector("#guideView"),
  addRecordCard: document.querySelector(".add-record-card"),
  statsGrid: document.querySelector("#statsGrid") || document.querySelector("#statsOverview"),
  sourceCardButton: document.querySelector("#sourceCardButton"),
  sourceLabel: document.querySelector("#sourceLabel"),
  syncedAtLabel: document.querySelector("#syncedAtLabel"),
  refreshStateLabel: document.querySelector("#refreshStateLabel"),
  stageBreakdown: document.querySelector("#stageBreakdown"),
  todoList: document.querySelector("#todoList"),
  recentUpdates: document.querySelector("#recentUpdates"),
  domainBreakdown: document.querySelector("#domainBreakdown"),
  companyTypeBreakdown: document.querySelector("#companyTypeBreakdown"),
  cityBreakdown: document.querySelector("#cityBreakdown"),
  searchInput: document.querySelector("#searchInput"),
  stageFilter: document.querySelector("#stageFilter"),
  domainFilter: document.querySelector("#domainFilter"),
  companyTypeFilter: document.querySelector("#companyTypeFilter"),
  cityFilter: document.querySelector("#cityFilter"),
  roleTypeFilter: document.querySelector("#roleTypeFilter"),
  tableSummary: document.querySelector("#tableSummary"),
  tableHead: document.querySelector("#tableHead"),
  tableBody: document.querySelector("#tableBody"),
  emptyState: document.querySelector("#emptyState"),
  addRecordButton: document.querySelector("#addRecordButton"),
  themeToggle: document.querySelector("#themeToggle"),
  utilityOverlay: document.querySelector("#utilityOverlay"),
  detailModal: document.querySelector("#detailModal"),
  detailKicker: document.querySelector("#detailKicker"),
  detailTitle: document.querySelector("#detailTitle"),
  detailSubtitle: document.querySelector("#detailSubtitle"),
  detailContent: document.querySelector("#detailContent"),
  closeDetailModalButton: document.querySelector("#closeDetailModalButton"),
  detailEditButton: null,
  detailCopyButton: null,
  recruitmentShortcutGrid: document.querySelector("#recruitmentShortcutGrid"),
  toolShortcutGrid: document.querySelector("#toolShortcutGrid"),
  shortcutModal: document.querySelector("#shortcutModal"),
  shortcutModalTitle: document.querySelector("#shortcutModalTitle"),
  shortcutModalHint: document.querySelector("#shortcutModalHint"),
  closeShortcutModalButton: document.querySelector("#closeShortcutModalButton"),
  shortcutModalForm: document.querySelector("#shortcutModalForm"),
  shortcutModalName: document.querySelector("#shortcutModalName"),
  shortcutModalUrl: document.querySelector("#shortcutModalUrl"),
  infoManagerModal: document.querySelector("#infoManagerModal"),
  closeInfoManagerButton: document.querySelector("#closeInfoManagerButton"),
  infoManagerForm: document.querySelector("#infoManagerForm"),
  profileNameInput: document.querySelector("#profileNameInput"),
  profilePhoneInput: document.querySelector("#profilePhoneInput"),
  profileEmailInput: document.querySelector("#profileEmailInput"),
  profileSchoolInput: document.querySelector("#profileSchoolInput"),
  profileMajorInput: document.querySelector("#profileMajorInput"),
  profileNoteInput: document.querySelector("#profileNoteInput"),
  infoManagerStatus: document.querySelector("#infoManagerStatus"),
  resumeManagerModal: document.querySelector("#resumeManagerModal"),
  closeResumeManagerButton: document.querySelector("#closeResumeManagerButton"),
  resumeManagerForm: document.querySelector("#resumeManagerForm"),
  resumeNameInput: document.querySelector("#resumeNameInput"),
  resumeFileInput: document.querySelector("#resumeFileInput"),
  resumeManagerStatus: document.querySelector("#resumeManagerStatus"),
  resumeList: document.querySelector("#resumeList"),
  databaseModal: document.querySelector("#databaseModal"),
  closeDatabaseModalButton: document.querySelector("#closeDatabaseModalButton"),
  databaseSwitchTab: document.querySelector("#databaseSwitchTab"),
  databaseCreateTab: document.querySelector("#databaseCreateTab"),
  databaseSwitchPanel: document.querySelector("#databaseSwitchPanel"),
  databaseCreatePanel: document.querySelector("#databaseCreatePanel"),
  databaseList: document.querySelector("#databaseList"),
  databaseNameInput: document.querySelector("#databaseNameInput"),
  databaseImportInput: document.querySelector("#databaseImportInput"),
  databaseImportGuideButton: document.querySelector("#databaseImportGuideButton"),
  importDatabaseButton: document.querySelector("#importDatabaseButton"),
  createDatabaseButton: document.querySelector("#createDatabaseButton"),
  databaseStatus: document.querySelector("#databaseStatus"),
  statCardTemplate: document.querySelector("#statCardTemplate"),
  editorOverlay: document.querySelector("#editorOverlay"),
  editorPanel: document.querySelector("#editorPanel"),
  editorTitle: document.querySelector("#editorTitle"),
  editorHint: document.querySelector("#editorHint"),
  editorStatus: document.querySelector("#editorStatus"),
  editorForm: document.querySelector("#editorForm"),
  editorFields: document.querySelector("#editorFields"),
  closeEditorButton: document.querySelector("#closeEditorButton"),
  saveEditorButton: document.querySelector("#saveEditorButton")
};

let state = {
  payload: { meta: {}, rows: [] },
  normalizedRows: [],
  hasCheckedDatabaseOnboarding: false,
  filters: {
    search: "",
    stage: "all",
    domain: "all",
    companyType: "all",
    city: "all",
    roleType: "all",
    recordSort: "created"
  },
  view: "overview",
  themeMode: "auto",
  activeUtilityModal: "",
  serviceSessionId: "",
  serviceHeartbeatTimer: 0,
  shortcuts: {
    recruitment: [],
    tools: []
  },
  shortcutEditor: {
    group: "recruitment",
    index: -1
  },
  database: {
    mode: "switch",
    databases: [],
    currentDbFile: "",
    status: "请选择要使用的数据库。",
    isBusy: false
  },
  detail: {
    mode: "row",
    title: "",
    kicker: "Details",
    subtitle: "",
    rowId: "",
    itemKey: "",
    rows: []
  },
  editor: {
    isOpen: false,
    mode: "edit",
    rowId: "",
    rowNumber: "",
    sheetName: "",
    stageHeader: "",
    draft: createEmptyDraft(),
    dirty: false,
    isSaving: false,
    status: "",
    statusTone: "idle"
  }
};

init();

function init() {
  setupBannerBrand();
  setupDetailHeaderActions();
  setupRecordsViewChrome();
  state.view = resolveViewFromHash(window.location.hash);
  state.themeMode = loadThemeMode();
  state.shortcuts = loadShortcuts();
  state.serviceSessionId = getOrCreateServiceSessionId();
  applyTheme();
  wireEvents();
  renderCurrentView();
  renderThemeToggle();
  renderShortcuts();
  renderDatabaseModal();
  renderDetailModal();
  renderEditorState();
  startServiceSession();
  void hydrateShortcutsFromServer();
  void loadAndRender({ checkDatabaseOnboarding: true });
  window.setInterval(() => {
    if (!state.editor.isSaving) {
      void loadAndRender();
    }
  }, DATA_REFRESH_MS);
}

function setupBannerBrand() {
  document.title = "Offer 看板";

  const banner = document.querySelector(".global-banner");
  const copy = banner?.querySelector(".banner-copy");
  const eyebrow = copy?.querySelector(".eyebrow");
  const title = copy?.querySelector("h2");
  if (!banner || !copy || !eyebrow || !title) return;

  eyebrow.textContent = "Offer Dashboard";
  title.textContent = "Offer 看板";

  let brand = banner.querySelector(".banner-brand");
  if (!brand) {
    brand = document.createElement("div");
    brand.className = "banner-brand";
    banner.insertBefore(brand, banner.firstElementChild || null);
  }

  let logo = brand.querySelector(".banner-logo");
  if (!logo) {
    logo = document.createElement("img");
    logo.className = "banner-logo";
    logo.src = "./assets/logo-square.png";
    logo.alt = "Offer Dashboard logo";
    brand.appendChild(logo);
  }

  if (copy.parentElement !== brand) {
    brand.appendChild(copy);
  }
}

function setupRecordsViewChrome() {
  const recordsTitle = document.querySelector(".records-title");
  if (recordsTitle && !document.querySelector("#recordSortField")) {
    const field = document.createElement("label");
    field.className = "toolbar-field records-sort-field";
    field.id = "recordSortField";
    field.innerHTML = `
      <span>排序方式</span>
      <select id="recordSortSelect"></select>
    `;
    recordsTitle.appendChild(field);
  }

  const recentUpdatesPanelNote = document.querySelector("#recentUpdates")?.previousElementSibling?.querySelector(".panel-note");
  if (recentUpdatesPanelNote) {
    recentUpdatesPanelNote.textContent = "按最近更新时间排序。";
  }

  const distributionPanelNote = document.querySelector("#domainBreakdown")
    ?.closest(".panel")
    ?.querySelector(".panel-note");
  if (distributionPanelNote) {
    distributionPanelNote.textContent = "投递岗位结构分析";
  }
}

function wireEvents() {
  els.addRecordButton.addEventListener("click", () => openEditorForNewRecord());
  els.themeToggle.addEventListener("click", () => {
    cycleThemeMode();
  });
  els.sourceCardButton.addEventListener("click", () => {
    void openDatabaseModal();
  });
  els.recruitmentShortcutGrid.addEventListener("click", (event) => {
    handleShortcutGridClick("recruitment", event);
  });
  els.toolShortcutGrid.addEventListener("click", (event) => {
    handleShortcutGridClick("tools", event);
  });
  els.utilityOverlay.addEventListener("click", () => {
    closeUtilityModal();
  });
  els.closeDetailModalButton.addEventListener("click", () => {
    closeUtilityModal();
  });
  els.closeShortcutModalButton.addEventListener("click", () => {
    closeUtilityModal();
  });
  els.shortcutModalForm.addEventListener("submit", handleShortcutSubmit);
  els.closeInfoManagerButton.addEventListener("click", () => {
    closeUtilityModal();
  });
  els.infoManagerForm.addEventListener("submit", handleInfoManagerSubmit);
  els.closeResumeManagerButton.addEventListener("click", () => {
    closeUtilityModal();
  });
  els.resumeManagerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleResumeManagerSubmit();
  });
  els.resumeList.addEventListener("click", (event) => {
    void handleResumeListClick(event);
  });
  els.closeDatabaseModalButton.addEventListener("click", () => {
    closeUtilityModal();
  });
  els.databaseSwitchTab.addEventListener("click", () => {
    setDatabaseMode("switch");
  });
  els.databaseCreateTab.addEventListener("click", () => {
    setDatabaseMode("create");
  });
  els.databaseCreatePanel.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleCreateDatabase();
  });
  els.importDatabaseButton?.addEventListener("click", () => {
    void handleImportDatabase();
  });
  els.databaseImportGuideButton?.addEventListener("click", () => {
    closeUtilityModal();
    window.location.hash = "guide";
    window.setTimeout(() => {
      document.querySelector("#importFormatGuide")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 80);
  });

  const recordSortSelect = document.querySelector("#recordSortSelect");
  if (recordSortSelect) {
    recordSortSelect.addEventListener("change", (event) => {
      state.filters.recordSort = event.target.value || "created";
      renderTable();
    });
  }

  const filterBindings = [
    ["searchInput", "search"],
    ["stageFilter", "stage"],
    ["domainFilter", "domain"],
    ["companyTypeFilter", "companyType"],
    ["cityFilter", "city"],
    ["roleTypeFilter", "roleType"]
  ];

  for (const [elementKey, filterKey] of filterBindings) {
    els[elementKey].addEventListener("input", (event) => {
      state.filters[filterKey] = event.target.value.trim();
      renderAll();
    });
    els[elementKey].addEventListener("change", (event) => {
      state.filters[filterKey] = event.target.value.trim();
      renderAll();
    });
  }

  els.editorOverlay.addEventListener("click", () => {
    void handleCloseEditor();
  });
  els.closeEditorButton.addEventListener("click", () => {
    void handleCloseEditor();
  });
  els.editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveEditor();
  });
  els.editorFields.addEventListener("click", handleEditorFieldClick);
  els.editorFields.addEventListener("input", handleEditorFieldChange);
  els.editorFields.addEventListener("change", handleEditorFieldChange);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.activeUtilityModal) {
      closeUtilityModal();
      return;
    }
    if (event.key === "Escape" && state.editor.isOpen) {
      void handleCloseEditor();
    }
  });
  window.addEventListener("hashchange", () => {
    const nextView = resolveViewFromHash(window.location.hash);
    if (nextView !== state.view) {
      state.view = nextView;
      renderCurrentView();
    }
  });
}

function resolveViewFromHash(hashValue) {
  const hash = String(hashValue || "").replace(/^#/, "").trim().toLowerCase();
  return VIEWS.includes(hash) ? hash : "overview";
}

function renderCurrentView() {
  els.overviewView.hidden = state.view !== "overview";
  els.recordsView.hidden = state.view !== "records";
  els.guideView.hidden = state.view !== "guide";
  els.addRecordCard.hidden = false;
  els.sourceCardButton.hidden = false;
  els.body.dataset.view = state.view;

  for (const link of els.topNavLinks) {
    const isActive = link.dataset.viewLink === state.view;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function loadThemeMode() {
  const stored = localStorage.getItem(THEME_MODE_KEY);
  if (THEME_MODES.includes(stored)) return stored;
  localStorage.setItem(THEME_MODE_KEY, "auto");
  return "auto";
}

function loadShortcuts() {
  let parsed = null;

  try {
    const raw = localStorage.getItem(SHORTCUTS_KEY);
    parsed = raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to load shortcut groups", error);
  }

  const hasStructuredData = parsed && typeof parsed === "object";
  const shortcuts = migrateShortcutPlacement({
    recruitment: sanitizeShortcutList(
      hasStructuredData ? parsed.recruitment : SHORTCUT_GROUPS.recruitment.defaults,
      SHORTCUT_GROUPS.recruitment.maxItems
    ),
    tools: sanitizeShortcutList(
      hasStructuredData ? parsed.tools : SHORTCUT_GROUPS.tools.defaults,
      SHORTCUT_GROUPS.tools.maxItems
    )
  });

  if (!hasStructuredData) {
    const legacyShortcut = loadLegacyCustomShortcut();
    if (
      legacyShortcut &&
      shortcuts.recruitment.length < SHORTCUT_GROUPS.recruitment.maxItems &&
      !shortcuts.recruitment.some((item) => item.label === legacyShortcut.label && item.url === legacyShortcut.url)
    ) {
      shortcuts.recruitment.push(legacyShortcut);
    }
    persistShortcuts(shortcuts);
  }

  return shortcuts;
}

function loadLegacyCustomShortcut() {
  try {
    const raw = localStorage.getItem(LEGACY_CUSTOM_SHORTCUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const label = String(parsed.label || "").trim();
    const url = normalizeShortcutUrl(parsed.url || "");
    return label && url ? { label, url } : null;
  } catch (error) {
    console.warn("Failed to load legacy shortcut", error);
    return null;
  }
}

function sanitizeShortcutList(items, maxItems) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      label: String(item?.label || "").trim(),
      url: normalizeShortcutUrl(item?.url || "")
    }))
    .filter((item) => item.label && item.url)
    .slice(0, maxItems);
}

function persistShortcuts(shortcuts = state.shortcuts) {
  localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
}

async function hydrateShortcutsFromServer() {
  try {
    const response = await fetch("./api/shortcuts", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "读取快捷按钮失败");

    const remoteShortcuts = sanitizeShortcutGroups(result.shortcuts);
    const localShortcuts = sanitizeShortcutGroups(state.shortcuts);
    const defaultShortcuts = buildDefaultShortcutGroups();
    if (hasAnyShortcutItems(remoteShortcuts)) {
      if (hasAnyShortcutItems(localShortcuts) && !shortcutGroupsEqual(localShortcuts, defaultShortcuts) && shortcutGroupsEqual(remoteShortcuts, defaultShortcuts)) {
        await saveShortcutsToServer(localShortcuts);
        return;
      }

      state.shortcuts = mergeShortcutGroups(remoteShortcuts);
      persistShortcuts(state.shortcuts);
      renderShortcuts();
      return;
    }

    if (hasAnyShortcutItems(localShortcuts)) {
      await saveShortcutsToServer(localShortcuts);
    }
  } catch (error) {
    console.warn("Failed to hydrate shortcut groups from server", error);
  }
}

async function saveShortcutsToServer(shortcuts = state.shortcuts) {
  const payload = { shortcuts: sanitizeShortcutGroups(shortcuts) };
  const response = await fetch("./api/shortcuts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "保存快捷按钮失败");
  }
  return sanitizeShortcutGroups(result.shortcuts || payload.shortcuts);
}

function sanitizeShortcutGroups(shortcuts) {
  return migrateShortcutPlacement({
    recruitment: sanitizeShortcutList(shortcuts?.recruitment, SHORTCUT_GROUPS.recruitment.maxItems),
    tools: sanitizeShortcutList(shortcuts?.tools, SHORTCUT_GROUPS.tools.maxItems)
  });
}

function buildDefaultShortcutGroups() {
  return migrateShortcutPlacement({
    recruitment: sanitizeShortcutList(SHORTCUT_GROUPS.recruitment.defaults, SHORTCUT_GROUPS.recruitment.maxItems),
    tools: sanitizeShortcutList(SHORTCUT_GROUPS.tools.defaults, SHORTCUT_GROUPS.tools.maxItems)
  });
}

function mergeShortcutGroups(shortcuts) {
  return migrateShortcutPlacement({
    recruitment: shortcuts.recruitment.length ? shortcuts.recruitment : SHORTCUT_GROUPS.recruitment.defaults,
    tools: shortcuts.tools.length ? shortcuts.tools : SHORTCUT_GROUPS.tools.defaults
  });
}

function migrateShortcutPlacement(shortcuts) {
  const migrationUrlKeys = new Set(PINNED_COMMON_LINKS.map((item) => shortcutUrlKey(item.url)));
  const recruitment = uniqueShortcutItems(shortcuts?.recruitment || []);
  const tools = uniqueShortcutItems(shortcuts?.tools || []);
  const movedLinks = [];
  const remainingTools = [];

  for (const item of tools) {
    if (migrationUrlKeys.has(shortcutUrlKey(item.url))) {
      movedLinks.push(item);
    } else {
      remainingTools.push(item);
    }
  }

  const nextRecruitment = [...recruitment];
  for (const defaultLink of PINNED_COMMON_LINKS) {
    if (nextRecruitment.length >= SHORTCUT_GROUPS.recruitment.maxItems) break;
    const defaultUrlKey = shortcutUrlKey(defaultLink.url);
    if (nextRecruitment.some((item) => shortcutUrlKey(item.url) === defaultUrlKey)) continue;
    const migrated = movedLinks.find((item) => shortcutUrlKey(item.url) === defaultUrlKey);
    if (migrated) nextRecruitment.push(migrated);
  }

  return {
    recruitment: nextRecruitment.slice(0, SHORTCUT_GROUPS.recruitment.maxItems),
    tools: remainingTools.slice(0, SHORTCUT_GROUPS.tools.maxItems)
  };
}

function uniqueShortcutItems(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const urlKey = shortcutUrlKey(item.url);
    const labelKey = String(item.label || "").trim().toLowerCase();
    const key = `${labelKey}|${urlKey}`;
    if (!item.label || !urlKey || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function shortcutUrlKey(value) {
  return String(normalizeShortcutUrl(value) || value || "").trim().replace(/\/$/, "").toLowerCase();
}

function hasAnyShortcutItems(shortcuts) {
  return Boolean(shortcuts?.recruitment?.length || shortcuts?.tools?.length);
}

function shortcutGroupsEqual(left, right) {
  return JSON.stringify(sanitizeShortcutGroups(left)) === JSON.stringify(sanitizeShortcutGroups(right));
}

function handleShortcutGridClick(group, event) {
  if (group === "tools") {
    const toolButton = event.target.closest("[data-tool-action]");
    if (toolButton) {
      if (toolButton.dataset.toolAction === "info") {
        openInfoManagerModal();
      } else if (toolButton.dataset.toolAction === "resume") {
        void openResumeManagerModal();
      }
      return;
    }
  }

  const actionButton = event.target.closest("[data-shortcut-action]");
  if (actionButton) {
    if (actionButton.dataset.shortcutAction === "add") {
      openShortcutModal(group);
      return;
    }

    const index = Number(actionButton.dataset.index);
    if (Number.isNaN(index)) return;

    if (actionButton.dataset.shortcutAction === "edit") {
      openShortcutModal(group, index);
    } else if (actionButton.dataset.shortcutAction === "delete") {
      deleteShortcut(group, index);
    }
    return;
  }

  const link = event.target.closest("[data-shortcut-link]");
  if (link instanceof HTMLAnchorElement) {
    return;
  }
}

async function handleShortcutSubmit(event) {
  event.preventDefault();

  const group = state.shortcutEditor.group;
  const config = SHORTCUT_GROUPS[group];
  if (!config) return;

  const label = String(els.shortcutModalName.value || "").trim();
  const rawUrl = String(els.shortcutModalUrl.value || "").trim();
  if (!label || !rawUrl) {
    window.alert("请同时填写按钮名称和链接。");
    return;
  }

  const normalizedUrl = normalizeShortcutUrl(rawUrl);
  if (!normalizedUrl) {
    window.alert("链接格式无效，请输入 http 或 https 地址。");
    return;
  }

  const nextItems = [...state.shortcuts[group]];
  const nextItem = { label, url: normalizedUrl };

  if (state.shortcutEditor.index >= 0 && nextItems[state.shortcutEditor.index]) {
    nextItems[state.shortcutEditor.index] = nextItem;
  } else {
    if (nextItems.length >= config.maxItems) {
      window.alert(`${config.title}最多保留 ${config.maxItems} 个可编辑按钮。`);
      return;
    }
    nextItems.push(nextItem);
  }

  state.shortcuts[group] = nextItems;
  persistShortcuts();
  try {
    await saveShortcutsToServer();
  } catch (error) {
    console.error(error);
    window.alert(`快捷按钮已保存在当前浏览器，但写入项目文件失败：${error.message}`);
  }
  renderShortcuts();
  closeUtilityModal();
}

function normalizeShortcutUrl(value) {
  let text = String(value || "").trim();
  if (!text) return "";
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(text)) {
    text = `https://${text}`;
  }

  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch (error) {
    return "";
  }
}

function renderShortcuts() {
  renderShortcutGroup("recruitment", els.recruitmentShortcutGrid);
  renderShortcutGroup("tools", els.toolShortcutGrid);
}

function renderShortcutGroup(group, container) {
  const config = SHORTCUT_GROUPS[group];
  const items = state.shortcuts[group] || [];
  container.innerHTML = "";

  if (group === "tools") {
    for (const item of BUILTIN_TOOL_ACTIONS) {
      const node = document.createElement("button");
      node.className = "shortcut-link shortcut-tile-link shortcut-tool-button";
      node.type = "button";
      node.dataset.toolAction = item.action;
      node.innerHTML = `<span>${escapeHtml(item.label)}</span>`;
      container.appendChild(node);
    }
  }

  items.forEach((item, index) => {
    const node = document.createElement("article");
    node.className = "shortcut-tile";
    node.innerHTML = `
      <div class="shortcut-tile-actions">
        <button
          class="shortcut-icon-button"
          type="button"
          data-shortcut-action="edit"
          data-index="${index}"
          aria-label="编辑 ${escapeAttribute(item.label)}"
          title="编辑"
        >
          &#9998;
        </button>
        <button
          class="shortcut-icon-button shortcut-icon-button-danger"
          type="button"
          data-shortcut-action="delete"
          data-index="${index}"
          aria-label="删除 ${escapeAttribute(item.label)}"
          title="删除"
        >
          &times;
        </button>
      </div>
      <a
        class="shortcut-link shortcut-tile-link"
        href="${escapeAttribute(item.url)}"
        target="_blank"
        rel="noreferrer"
        data-shortcut-link="true"
      >
        <span>${escapeHtml(item.label)}</span>
      </a>
    `;
    container.appendChild(node);
  });

  for (let slot = items.length; slot < config.maxItems; slot += 1) {
    const addNode = document.createElement("button");
    addNode.className = "shortcut-add shortcut-add-tile";
    addNode.type = "button";
    addNode.setAttribute("data-shortcut-action", "add");
    addNode.setAttribute("aria-label", `添加${config.title}按钮`);
    addNode.setAttribute("data-slot-index", String(slot));
    addNode.textContent = "+";
    container.appendChild(addNode);
  }
}

function openShortcutModal(group, index = -1) {
  const config = SHORTCUT_GROUPS[group];
  const current = index >= 0 ? state.shortcuts[group]?.[index] : null;

  state.shortcutEditor = { group, index };
  els.shortcutModalTitle.textContent = index >= 0 ? `编辑${config.title}按钮` : `添加${config.title}按钮`;
  els.shortcutModalHint.textContent = `${config.title}最多保留 ${config.maxItems} 个可编辑按钮。`;
  els.shortcutModalName.value = current?.label || "";
  els.shortcutModalUrl.value = current?.url || "";
  openUtilityModal("shortcut");
  window.setTimeout(() => {
    els.shortcutModalName.focus();
  }, 0);
}

async function deleteShortcut(group, index) {
  const items = state.shortcuts[group] || [];
  const target = items[index];
  if (!target) return;

  const confirmed = window.confirm(`确定删除按钮“${target.label}”吗？`);
  if (!confirmed) return;

  state.shortcuts[group] = items.filter((_, itemIndex) => itemIndex !== index);
  persistShortcuts();
  try {
    await saveShortcutsToServer();
  } catch (error) {
    console.error(error);
    window.alert(`快捷按钮已从当前浏览器移除，但项目文件同步失败：${error.message}`);
  }
  renderShortcuts();
}

function getOrCreateServiceSessionId() {
  try {
    const existing = sessionStorage.getItem(SERVICE_SESSION_KEY);
    if (existing) return existing;
    const nextId = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SERVICE_SESSION_KEY, nextId);
    return nextId;
  } catch {
    return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function startServiceSession() {
  void sendServiceSessionHeartbeat();

  if (state.serviceHeartbeatTimer) {
    window.clearInterval(state.serviceHeartbeatTimer);
  }

  state.serviceHeartbeatTimer = window.setInterval(() => {
    void sendServiceSessionHeartbeat();
  }, SERVICE_HEARTBEAT_MS);

  window.addEventListener("pagehide", releaseServiceSession, { passive: true });
  window.addEventListener("beforeunload", releaseServiceSession, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void sendServiceSessionHeartbeat();
    }
  });
}

async function sendServiceSessionHeartbeat() {
  if (!state.serviceSessionId) return;
  try {
    await fetch("./api/session/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: state.serviceSessionId }),
      keepalive: true
    });
  } catch {
    // Ignore transient heartbeat failures; the next interval will retry.
  }
}

function releaseServiceSession() {
  if (!state.serviceSessionId) return;

  if (state.serviceHeartbeatTimer) {
    window.clearInterval(state.serviceHeartbeatTimer);
    state.serviceHeartbeatTimer = 0;
  }

  const payload = JSON.stringify({ sessionId: state.serviceSessionId });
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("./api/session/release", blob);
    return;
  }

  void fetch("./api/session/release", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

function openUtilityModal(kind) {
  state.activeUtilityModal = kind;
  els.utilityOverlay.hidden = false;
  els.detailModal.hidden = kind !== "detail";
  els.shortcutModal.hidden = kind !== "shortcut";
  els.infoManagerModal.hidden = kind !== "info";
  els.resumeManagerModal.hidden = kind !== "resume";
  els.databaseModal.hidden = kind !== "database";
}

function closeUtilityModal() {
  state.activeUtilityModal = "";
  els.utilityOverlay.hidden = true;
  els.detailModal.hidden = true;
  els.shortcutModal.hidden = true;
  els.infoManagerModal.hidden = true;
  els.resumeManagerModal.hidden = true;
  els.databaseModal.hidden = true;
}

function openInfoManagerModal() {
  const profile = loadPersonalInfo();
  els.profileNameInput.value = profile.name || "";
  els.profilePhoneInput.value = profile.phone || "";
  els.profileEmailInput.value = profile.email || "";
  els.profileSchoolInput.value = profile.school || "";
  els.profileMajorInput.value = profile.major || "";
  els.profileNoteInput.value = profile.note || "";
  setInfoManagerStatus("");
  openUtilityModal("info");
  window.setTimeout(() => {
    els.profileNameInput.focus();
  }, 0);
}

function loadPersonalInfo() {
  try {
    const raw = localStorage.getItem(PERSONAL_INFO_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("Failed to load personal info", error);
    return {};
  }
}

function handleInfoManagerSubmit(event) {
  event.preventDefault();
  const profile = {
    name: String(els.profileNameInput.value || "").trim(),
    phone: String(els.profilePhoneInput.value || "").trim(),
    email: String(els.profileEmailInput.value || "").trim(),
    school: String(els.profileSchoolInput.value || "").trim(),
    major: String(els.profileMajorInput.value || "").trim(),
    note: String(els.profileNoteInput.value || "").trim(),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(profile));
  setInfoManagerStatus("个人信息已保存。", "success");
}

function setInfoManagerStatus(message, tone = "idle") {
  els.infoManagerStatus.hidden = !message;
  els.infoManagerStatus.textContent = message || "";
  els.infoManagerStatus.dataset.tone = tone;
}

async function openResumeManagerModal() {
  els.resumeNameInput.value = "";
  els.resumeFileInput.value = "";
  setResumeManagerStatus("");
  openUtilityModal("resume");
  await renderResumeList();
}

async function handleResumeManagerSubmit() {
  const file = els.resumeFileInput.files?.[0] || null;
  const label = String(els.resumeNameInput.value || "").trim();

  if (!file) {
    setResumeManagerStatus("请选择 PDF 简历附件。", "error");
    return;
  }

  const fileName = String(file.name || "");
  if (file.type !== "application/pdf" && !fileName.toLowerCase().endsWith(".pdf")) {
    setResumeManagerStatus("目前仅支持添加 PDF 简历。", "error");
    return;
  }

  const entry = {
    id: `resume-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: label || fileName.replace(/\.pdf$/i, "") || "未命名简历",
    fileName,
    type: "application/pdf",
    size: file.size,
    addedAt: new Date().toISOString(),
    blob: file
  };

  try {
    await putResumeEntry(entry);
    els.resumeNameInput.value = "";
    els.resumeFileInput.value = "";
    setResumeManagerStatus("简历已保存。", "success");
    await renderResumeList();
  } catch (error) {
    console.error(error);
    setResumeManagerStatus(`保存失败：${error.message}`, "error");
  }
}

async function renderResumeList() {
  els.resumeList.innerHTML = "";
  let entries = [];
  try {
    entries = await getResumeEntries();
  } catch (error) {
    console.error(error);
    setResumeManagerStatus(`读取失败：${error.message}`, "error");
    return;
  }

  if (!entries.length) {
    const empty = document.createElement("article");
    empty.className = "manager-empty";
    empty.textContent = "暂无已保存的简历。";
    els.resumeList.appendChild(empty);
    return;
  }

  for (const entry of entries) {
    const item = document.createElement("article");
    item.className = "manager-item";
    item.innerHTML = `
      <button class="manager-item-main" type="button" data-resume-action="open" data-resume-id="${escapeAttribute(entry.id)}">
        <strong>${escapeHtml(entry.name || "未命名简历")}</strong>
        <span>${escapeHtml(entry.fileName || "PDF 简历")} · ${formatFileSize(entry.size)} · ${formatDateTime(new Date(entry.addedAt))}</span>
      </button>
      <div class="manager-item-actions">
        <button class="button table-action" type="button" data-resume-action="open" data-resume-id="${escapeAttribute(entry.id)}">打开</button>
        <button class="button button-danger table-action" type="button" data-resume-action="delete" data-resume-id="${escapeAttribute(entry.id)}">删除</button>
      </div>
    `;
    els.resumeList.appendChild(item);
  }
}

async function handleResumeListClick(event) {
  const button = event.target.closest("[data-resume-action]");
  if (!button) return;

  const action = button.dataset.resumeAction;
  const id = button.dataset.resumeId || "";
  if (!id) return;

  if (action === "open") {
    await openResumeEntry(id);
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm("确定删除这份简历附件吗？");
    if (!confirmed) return;
    try {
      await deleteResumeEntry(id);
      setResumeManagerStatus("简历已删除。", "success");
      await renderResumeList();
    } catch (error) {
      console.error(error);
      setResumeManagerStatus(`删除失败：${error.message}`, "error");
    }
  }
}

async function openResumeEntry(id) {
  const viewer = window.open("about:blank", "_blank");
  if (viewer) viewer.opener = null;
  try {
    const entry = await getResumeEntry(id);
    if (!entry?.blob) throw new Error("没有找到对应的简历附件。");
    const url = URL.createObjectURL(entry.blob);
    if (viewer) {
      viewer.location.href = url;
    } else {
      window.open(url, "_blank");
    }
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    if (viewer) viewer.close();
    console.error(error);
    setResumeManagerStatus(`打开失败：${error.message}`, "error");
  }
}

function openResumeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(RESUME_DB_NAME, RESUME_DB_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RESUME_STORE_NAME)) {
        db.createObjectStore(RESUME_STORE_NAME, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error || new Error("无法打开简历存储。")));
  });
}

async function withResumeStore(mode, callback) {
  const db = await openResumeDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUME_STORE_NAME, mode);
    const store = transaction.objectStore(RESUME_STORE_NAME);
    let result;
    transaction.addEventListener("complete", () => {
      db.close();
      resolve(result);
    });
    transaction.addEventListener("error", () => {
      db.close();
      reject(transaction.error || new Error("简历存储操作失败。"));
    });
    result = callback(store);
  });
}

function putResumeEntry(entry) {
  return withResumeStore("readwrite", (store) => store.put(entry));
}

function deleteResumeEntry(id) {
  return withResumeStore("readwrite", (store) => store.delete(id));
}

function getResumeEntry(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openResumeDatabase();
      const transaction = db.transaction(RESUME_STORE_NAME, "readonly");
      const store = transaction.objectStore(RESUME_STORE_NAME);
      const request = store.get(id);
      request.addEventListener("success", () => {
        db.close();
        resolve(request.result || null);
      });
      request.addEventListener("error", () => {
        db.close();
        reject(request.error || new Error("读取简历失败。"));
      });
    } catch (error) {
      reject(error);
    }
  });
}

function getResumeEntries() {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openResumeDatabase();
      const transaction = db.transaction(RESUME_STORE_NAME, "readonly");
      const store = transaction.objectStore(RESUME_STORE_NAME);
      const request = store.getAll();
      request.addEventListener("success", () => {
        db.close();
        const entries = Array.isArray(request.result) ? request.result : [];
        entries.sort((left, right) => String(right.addedAt || "").localeCompare(String(left.addedAt || "")));
        resolve(entries);
      });
      request.addEventListener("error", () => {
        db.close();
        reject(request.error || new Error("读取简历列表失败。"));
      });
    } catch (error) {
      reject(error);
    }
  });
}

function setResumeManagerStatus(message, tone = "idle") {
  els.resumeManagerStatus.hidden = !message;
  els.resumeManagerStatus.textContent = message || "";
  els.resumeManagerStatus.dataset.tone = tone;
}

async function openDatabaseModal() {
  openUtilityModal("database");
  await loadDatabases();
}

async function loadDatabases() {
  state.database.isBusy = true;
  state.database.status = "正在读取数据库列表...";
  renderDatabaseModal();

  try {
    const response = await fetch("./api/databases", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "读取数据库失败");
    state.database.databases = Array.isArray(result.databases) ? result.databases : [];
    state.database.currentDbFile = result.currentDbFile || "";
    state.database.status = "请选择要使用的数据库。";
    return true;
  } catch (error) {
    console.error(error);
    state.database.status = `读取失败：${error.message}`;
    return false;
  } finally {
    state.database.isBusy = false;
    renderDatabaseModal();
  }
}

function setDatabaseMode(mode) {
  state.database.mode = mode;
  renderDatabaseModal();
}

function renderDatabaseModal() {
  els.databaseSwitchTab.classList.toggle("is-active", state.database.mode === "switch");
  els.databaseCreateTab.classList.toggle("is-active", state.database.mode === "create");
  els.databaseSwitchPanel.hidden = state.database.mode !== "switch";
  els.databaseCreatePanel.hidden = state.database.mode !== "create";
  els.databaseStatus.hidden = state.database.mode === "create" && state.database.status === "请选择要使用的数据库。";
  els.databaseStatus.textContent = state.database.status;
  if (els.createDatabaseButton) {
    els.createDatabaseButton.disabled = state.database.isBusy;
  }
  if (els.importDatabaseButton) {
    els.importDatabaseButton.disabled = state.database.isBusy;
  }

  els.databaseList.innerHTML = "";
  if (!state.database.databases.length) {
    const empty = document.createElement("article");
    empty.className = "database-item";
    empty.innerHTML = `
      <div class="database-item-title">
        <strong>暂无数据库</strong>
      </div>
      <div class="database-item-meta">
        <div>先在“新建数据库”里创建一个即可开始使用。</div>
      </div>
    `;
    els.databaseList.appendChild(empty);
    return;
  }

  for (const item of state.database.databases) {
    const card = document.createElement("article");
    card.className = `database-item${item.current ? " is-current" : ""}`;
    card.innerHTML = `
      <div class="database-item-title">
        <strong>${escapeHtml(item.databaseName || item.fileName || "未命名数据库")}</strong>
        ${item.current ? '<span class="tag applied">当前</span>' : ""}
      </div>
      <div class="database-item-meta">
        <div>${escapeHtml(item.fileName || "")}</div>
        <div>记录数：${item.recordCount || 0}</div>
      </div>
      <div class="database-item-actions">
        <button class="button table-action" type="button" data-db-action="switch" data-file-name="${escapeAttribute(item.fileName || "")}" ${item.current ? "disabled" : ""}>${item.current ? "当前使用中" : "切换数据库"}</button>
        <button class="button button-danger table-action" type="button" data-db-action="delete" data-file-name="${escapeAttribute(item.fileName || "")}" ${item.current ? "disabled" : ""}>删除数据库</button>
      </div>
    `;
    card.querySelector('[data-db-action="switch"]')?.addEventListener("click", () => {
      void switchDatabase(item.fileName);
    });
    card.querySelector('[data-db-action="delete"]')?.addEventListener("click", () => {
      void deleteDatabase(item.fileName, item.databaseName || item.fileName || "未命名数据库");
    });
    els.databaseList.appendChild(card);
  }
}

function setupDetailHeaderActions() {
  const head = els.closeDetailModalButton?.parentElement;
  if (!head || els.detailEditButton) return;

  const actions = document.createElement("div");
  actions.className = "modal-head-actions";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "button";
  copyButton.textContent = "复制";
  copyButton.hidden = true;
  copyButton.addEventListener("click", () => {
    if (!state.detail.rowId) return;
    closeUtilityModal();
    openEditorForCopiedRow(state.detail.rowId);
  });

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "button button-primary";
  editButton.textContent = "编辑";
  editButton.hidden = true;
  editButton.addEventListener("click", () => {
    if (!state.detail.rowId) return;
    closeUtilityModal();
    openEditorForRow(state.detail.rowId);
  });

  actions.appendChild(copyButton);
  actions.appendChild(editButton);
  actions.appendChild(els.closeDetailModalButton);
  head.appendChild(actions);
  els.detailCopyButton = copyButton;
  els.detailEditButton = editButton;
}

function openRowDetailModal(rowId, sourceLabel = "") {
  const row = state.normalizedRows.find((item) => item.id === rowId);
  if (!row) return;

  state.detail = {
    mode: "row",
    title: row.company || "详细信息",
    kicker: sourceLabel || "Details",
    subtitle: row.position || row.domain || "查看详细内容。",
    rowId,
    itemKey: "",
    rows: [row],
    canEdit: Boolean(state.payload.meta?.editable)
  };
  renderDetailModal();
  openUtilityModal("detail");
}

function openCollectionDetailModal({ title, kicker = "Details", subtitle = "", rows = [], itemKey = "" }) {
  state.detail = {
    mode: "list",
    title,
    kicker,
    subtitle,
    rowId: "",
    itemKey,
    rows,
    canEdit: false
  };
  renderDetailModal();
  openUtilityModal("detail");
}

function renderDetailModal() {
  els.detailKicker.textContent = state.detail.kicker || "Details";
  els.detailTitle.textContent = state.detail.title || "详细信息";
  const canEdit = state.detail.mode === "row" && state.detail.canEdit && state.detail.rowId;
  els.detailSubtitle.textContent = state.detail.mode === "list" ? (state.detail.subtitle || "查看详细内容。") : "";
  els.detailSubtitle.hidden = state.detail.mode === "row";
  if (els.detailEditButton) {
    els.detailEditButton.hidden = !canEdit;
    els.detailEditButton.disabled = !canEdit;
  }
  if (els.detailCopyButton) {
    els.detailCopyButton.hidden = !canEdit;
    els.detailCopyButton.disabled = !canEdit;
  }
  els.detailContent.innerHTML = "";

  if (state.detail.mode === "row") {
    const row = state.detail.rows[0];
    if (!row) return;
    els.detailContent.appendChild(buildReadOnlyDetailNode(row));
    return;
  }

  const list = document.createElement("div");
  list.className = "detail-list";
  if (!state.detail.rows.length) {
    list.innerHTML = `<div class="detail-card"><strong>暂无可展示内容</strong></div>`;
    els.detailContent.appendChild(list);
    return;
  }

  for (const row of state.detail.rows) {
    const card = document.createElement("article");
    card.className = "detail-list-card";
    const secondary = [row.position, row.cityValues.join(" / ")].filter(Boolean).join(" / ");
    card.innerHTML = `
      <div class="detail-list-head">
        <div>
          <h4>${escapeHtml(row.company || "未命名公司")}</h4>
          ${secondary ? `<div class="detail-list-sub">${escapeHtml(secondary)}</div>` : ""}
        </div>
        <span class="tag ${row.stageGroup} ${row.stageTagClass}">${escapeHtml(row.stage || "未分类")}</span>
      </div>
      <div class="detail-list-sub">${escapeHtml(row.notes || row.nextAction || "点击查看详细信息")}</div>
    `;
    card.addEventListener("click", () => {
      openRowDetailModal(row.id, state.detail.title);
    });
    list.appendChild(card);
  }

  els.detailContent.appendChild(list);
}

function buildRowDetailNode(row) {
  const sections = [
    { label: "公司", value: row.company || "-" },
    { label: "方向 / 岗位", value: row.position || "-" },
    { label: "领域", value: row.domainValues.join(" / ") || row.domain || "-" },
    { label: "企业性质", value: row.companyTypeValues.join(" / ") || row.companyType || "-" },
    { label: "城市", value: row.cityValues.join(" / ") || row.city || "-" },
    { label: "岗位性质", value: row.roleType || "-" },
    { label: "阶段", value: row.stage || "-" },
    { label: "投递截止", value: formatDate(row.deadline) },
    { label: "投递时间", value: formatDate(row.appliedAt) },
    { label: "笔试时间", value: formatDate(row.writtenTestAt) },
    { label: "宣讲会地点", value: row.presentation || "-" },
    { label: "宣讲会时间", value: formatDate(row.presentationAt) },
    { label: "一面时间", value: formatDate(row.interview1At) },
    { label: "二面时间", value: formatDate(row.interview2At) },
    { label: "三面时间", value: formatDate(row.interview3At) },
    { label: "投递反馈", value: row.feedbackNote || "-" },
    { label: "下一步", value: row.nextAction || "-" },
    { label: "投递链接", value: row.link || "-" }
  ];

  const wrapper = document.createElement("div");
  wrapper.className = "detail-grid";

  for (const [index, section] of sections.entries()) {
    const node = document.createElement("article");
    node.className = "detail-card";
    let safeValue;
    if (index === 6) {
      safeValue = `<span class="tag ${escapeAttribute(row.stageGroup || "")} ${escapeAttribute(row.stageTagClass || "")}">${escapeHtml(section.value || "-")}</span>`;
    } else if (index === 5) {
      safeValue = renderRoleTypeTag(section.value);
    } else if (row.link && section.value === row.link) {
      safeValue = `<a href="${escapeAttribute(row.link)}" target="_blank" rel="noreferrer">${escapeHtml(row.link)}</a>`;
    } else {
      safeValue = escapeHtml(section.value || "-");
    }
    node.innerHTML = `
      <div class="detail-meta">
        <div class="detail-meta-row">
          <span class="detail-meta-label">${escapeHtml(section.label)}</span>
          <div>${safeValue}</div>
        </div>
      </div>
    `;
    wrapper.appendChild(node);
  }

  return wrapper;
}

function buildReadOnlyDetailNode(row) {
  const draft = createDraftFromRow(row);
  const wrapper = document.createElement("div");
  wrapper.className = "detail-readonly-shell";

  const fields = document.createElement("div");
  fields.className = "editor-fields detail-editor-fields";

  const toggleFields = EDITOR_FIELDS.filter((field) => field.type === "checkbox" && field.inToggleRow);
  const toggleRow = document.createElement("div");
  toggleRow.className = "editor-toggle-row col-12";

  for (const field of toggleFields) {
    const toggle = document.createElement("label");
    toggle.className = "editor-toggle-field is-disabled";

    const copy = document.createElement("span");
    copy.className = "editor-toggle-copy";
    copy.textContent = field.label;

    const control = document.createElement("input");
    control.type = "checkbox";
    control.checked = Boolean(draft[field.key]);
    control.disabled = true;
    control.className = "editor-toggle-checkbox";

    toggle.appendChild(copy);
    toggle.appendChild(control);
    toggleRow.appendChild(toggle);
  }

  let toggleRowInserted = false;
  for (const field of EDITOR_FIELDS) {
    if (field.type === "checkbox") {
      if (!toggleRowInserted && toggleRow.childElementCount) {
        fields.appendChild(toggleRow);
        toggleRowInserted = true;
      }
      continue;
    }

    if (field.hideWhenInactive && field.toggleKey && !draft[field.toggleKey]) continue;

    if (!toggleRowInserted && toggleRow.childElementCount && field.toggleKey) {
      fields.appendChild(toggleRow);
      toggleRowInserted = true;
    }

    const label = document.createElement("label");
    label.className = `editor-field col-${field.colSpan || 6}`;
    label.innerHTML = `<span>${escapeHtml(field.label)}</span>`;

    let control;
    if (field.type === "textarea") {
      control = document.createElement("textarea");
      control.value = draft[field.key] || "";
      control.disabled = true;
      label.appendChild(control);
    } else if (field.type === "select") {
      control = document.createElement("select");
      for (const optionValue of field.options || [""]) {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue || "未选择";
        control.appendChild(option);
      }
      control.value = draft[field.key] || "";
      control.disabled = true;
      label.appendChild(control);
    } else if (field.type === "date") {
      const shell = document.createElement("div");
      shell.className = "editor-date-control is-disabled";

      const display = document.createElement("span");
      display.className = "editor-date-display";
      display.textContent = formatDateControlDisplay(draft[field.key]);
      display.dataset.empty = display.textContent ? "false" : "true";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "editor-date-trigger";
      trigger.disabled = true;
      trigger.setAttribute("aria-label", `${field.label}为只读`);
      trigger.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z"/>
        </svg>
      `;

      shell.appendChild(display);
      shell.appendChild(trigger);
      label.appendChild(shell);
    } else {
      control = document.createElement("input");
      control.type = field.type;
      control.value = draft[field.key] || "";
      control.disabled = true;
      label.appendChild(control);
    }

    fields.appendChild(label);
  }

  if (!toggleRowInserted && toggleRow.childElementCount) {
    fields.appendChild(toggleRow);
  }

  wrapper.appendChild(fields);
  return wrapper;
}

function renderRoleTypeTag(value) {
  const text = String(value || "").trim();
  if (!text || text === "-") return escapeHtml(text || "-");

  const normalized = text.toLowerCase();
  let tagClass = "role-generic";
  if (normalized.includes("实习") || normalized.includes("intern")) {
    tagClass = "role-intern";
  } else if (normalized.includes("秋招") || normalized.includes("校招") || normalized.includes("full-time")) {
    tagClass = "role-campus";
  }

  return `<span class="tag ${tagClass}">${escapeHtml(text)}</span>`;
}

async function switchDatabase(fileName) {
  if (!fileName) return;
  state.database.status = "正在切换数据库...";
  renderDatabaseModal();

  try {
    const response = await fetch("./api/databases/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "切换数据库失败");
    state.database.databases = result.state?.databases || [];
    state.database.currentDbFile = result.state?.currentDbFile || "";
    state.database.status = "已切换数据库。";
    renderDatabaseModal();
    await loadAndRender(true);
    closeUtilityModal();
  } catch (error) {
    console.error(error);
    state.database.status = `切换失败：${error.message}`;
    renderDatabaseModal();
  }
}

async function handleCreateDatabase() {
  const name = String(els.databaseNameInput.value || "").trim();
  if (!name) {
    state.database.status = "请先填写数据库名称。";
    renderDatabaseModal();
    return;
  }

  state.database.isBusy = true;
  state.database.status = "正在新建数据库...";
  renderDatabaseModal();

  try {
    const response = await fetch("./api/databases/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "新建数据库失败");
    state.database.databases = result.state?.databases || [];
    state.database.currentDbFile = result.state?.currentDbFile || "";
    state.database.status = "已新建并切换到新数据库。";
    els.databaseNameInput.value = "";
    setDatabaseMode("switch");
    await loadAndRender(true);
    closeUtilityModal();
  } catch (error) {
    console.error(error);
    state.database.status = `新建失败：${error.message}`;
    renderDatabaseModal();
  } finally {
    state.database.isBusy = false;
    renderDatabaseModal();
  }
}

async function handleImportDatabase() {
  const [file] = els.databaseImportInput?.files || [];
  if (!file) {
    state.database.status = "请先选择要导入的 .xlsx、.csv 或 .tsv 文件。";
    renderDatabaseModal();
    return;
  }

  const databaseName = String(els.databaseNameInput.value || "").trim() || stripFileExtension(file.name);
  if (!databaseName) {
    state.database.status = "请先填写数据库名称，或选择一个带文件名的导入文件。";
    renderDatabaseModal();
    return;
  }

  state.database.isBusy = true;
  state.database.status = "正在解析导入文件...";
  renderDatabaseModal();

  try {
    const rawRows = await parseDatabaseImportFile(file);
    const records = mapImportedRowsForDatabase(rawRows);
    if (!records.length) {
      throw new Error("没有找到可导入的投递记录，请检查第一行表头和数据内容。");
    }

    state.database.status = `正在创建数据库并导入 ${records.length} 条记录...`;
    renderDatabaseModal();

    const createResponse = await fetch("./api/databases/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: databaseName })
    });
    const createResult = await createResponse.json();
    if (!createResponse.ok) throw new Error(createResult.error || "新建数据库失败");

    const importResponse = await fetch("./api/import-rows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceName: file.name, records })
    });
    const importResult = await importResponse.json();
    if (!importResponse.ok) throw new Error(importResult.error || "导入失败");

    state.database.databases = createResult.state?.databases || [];
    state.database.currentDbFile = createResult.state?.currentDbFile || "";
    state.database.status = `已导入 ${importResult.importedCount || records.length} 条记录。`;
    els.databaseNameInput.value = "";
    els.databaseImportInput.value = "";
    updateStateFromPayload(importResult.payload);
    renderAll();
    setDatabaseMode("switch");
    await loadDatabases();
    closeUtilityModal();
    setRefreshState("已导入");
  } catch (error) {
    console.error(error);
    state.database.status = `导入失败：${error.message}`;
    renderDatabaseModal();
  } finally {
    state.database.isBusy = false;
    renderDatabaseModal();
  }
}

function cycleThemeMode() {
  const currentIndex = THEME_MODES.indexOf(state.themeMode);
  state.themeMode = THEME_MODES[(currentIndex + 1) % THEME_MODES.length];
  localStorage.setItem(THEME_MODE_KEY, state.themeMode);
  applyTheme();
  renderThemeToggle();
}

function applyTheme() {
  const resolved = state.themeMode === "auto" ? resolveAutoTheme() : state.themeMode;
  els.body.dataset.theme = resolved;
}

function resolveAutoTheme() {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

function renderThemeToggle() {
  const label = `主题：${THEME_LABELS[state.themeMode]}`;
  els.themeToggle.innerHTML = THEME_TOGGLE_ICONS[state.themeMode];
  els.themeToggle.setAttribute("aria-label", label);
  els.themeToggle.title = label;
}

async function loadAndRender(options = false) {
  const isManual = typeof options === "boolean" ? options : Boolean(options.isManual);
  const checkDatabaseOnboarding = typeof options === "object" && Boolean(options.checkDatabaseOnboarding);

  if (!state.editor.isSaving) {
    setRefreshState(isManual ? "正在刷新" : "同步检查中");
  }

  try {
    if (checkDatabaseOnboarding) {
      await maybePromptDatabaseOnboarding();
    }

    const payload = await loadPayload();
    updateStateFromPayload(payload);
    renderAll();
    setRefreshState("已同步");
  } catch (error) {
    console.error(error);
    const imported = loadImportedData();
    updateStateFromPayload(imported || { meta: { sourceLabel: "未连接数据源" }, rows: [] });
    renderAll();
    setRefreshState("读取失败，已回退到本地导入");
  }
}

async function loadPayload() {
  const endpoints = [
    "./api/data"
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) continue;
      const payload = await response.json();
      if (Array.isArray(payload)) return wrapRows(payload, "直接数组");
      if (payload && Array.isArray(payload.rows)) return payload;
      if (payload && Array.isArray(payload.data)) return wrapRows(payload.data, payload.meta?.sourceLabel || "data");
    } catch (error) {
      console.warn(`Failed to load ${endpoint}`, error);
    }
  }

  const imported = loadImportedData();
  if (imported) return imported;

  return {
    meta: {
      sourceLabel: "尚未连接本地文件",
      sourceType: "empty",
      syncedAt: null,
      editable: false
    },
    rows: []
  };
}

function loadImportedData() {
  try {
    const raw = localStorage.getItem(IMPORTED_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return wrapRows(parsed, "浏览器本地导入");
    if (parsed && Array.isArray(parsed.rows)) return parsed;
  } catch (error) {
    console.warn("Failed to parse imported data", error);
  }
  return null;
}

async function handleFileImport(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const text = await file.text();
  const rows = parseImportedText(text, file.name);
  const payload = {
    meta: {
      sourceLabel: `浏览器本地导入：${file.name}`,
      sourceType: "manual-import",
      syncedAt: new Date().toISOString(),
      recordCount: rows.length,
      editable: false
    },
    rows
  };

  localStorage.setItem(IMPORTED_DATA_KEY, JSON.stringify(payload));
  updateStateFromPayload(payload);
  renderAll();
  setRefreshState("已导入本地文件");
  event.target.value = "";
}

function parseImportedText(text, filename = "") {
  text = String(text || "").replace(/^\uFEFF/, "");
  const lower = filename.toLowerCase();
  if (lower.endsWith(".json")) {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.rows)) return parsed.rows;
    if (Array.isArray(parsed.data)) return parsed.data;
    return [];
  }

  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return parseHtmlTable(text);
  }

  const delimiter = lower.endsWith(".tsv") || (!text.includes(",") && text.includes("\t")) ? "\t" : ",";
  return parseDelimited(text, delimiter);
}

async function parseDatabaseImportFile(file) {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xls")) {
    throw new Error("暂不支持旧版 .xls，请另存为 .xlsx、.csv 或 .tsv 后再导入。");
  }
  if (lower.endsWith(".xlsx")) {
    return parseXlsxRows(await file.arrayBuffer());
  }
  return parseImportedText(await file.text(), file.name);
}

function mapImportedRowsForDatabase(rawRows) {
  const fieldMap = [
    ["company", HEADER.company, "text"],
    ["domain", HEADER.domain, "text"],
    ["companyType", HEADER.companyType, "companyType"],
    ["position", HEADER.position, "text"],
    ["city", HEADER.city, "text"],
    ["roleType", HEADER.roleType, "text"],
    ["stage", HEADER.stage, "stage"],
    ["deadline", HEADER.deadline, "date"],
    ["link", HEADER.link, "text"],
    ["presentation", HEADER.presentation, "text"],
    ["presentationAt", HEADER.presentationAt, "date"],
    ["presentationApplied", HEADER.presentationApplied, "text"],
    ["appliedFlag", HEADER.appliedFlag, "text"],
    ["appliedAt", HEADER.appliedAt, "date"],
    ["writtenTestAt", HEADER.writtenTestAt, "date"],
    ["writtenTestResult", HEADER.writtenTestResult, "text"],
    ["feedback", HEADER.feedback, "text"],
    ["interview1At", HEADER.interview1At, "date"],
    ["interview1Result", HEADER.interview1Result, "text"],
    ["interview2At", HEADER.interview2At, "date"],
    ["interview2Result", HEADER.interview2Result, "text"],
    ["interview3At", HEADER.interview3At, "date"],
    ["interview3Result", HEADER.interview3Result, "text"]
  ];

  return (rawRows || [])
    .map((row) => {
      const record = {};
      for (const [aliasKey, headerLabel, type] of fieldMap) {
        const rawValue = pickField(row, FIELD_ALIASES[aliasKey] || [headerLabel]);
        record[headerLabel] = normalizeImportValue(rawValue, type);
      }
      return record;
    })
    .filter((record) => Object.values(record).some((value) => String(value || "").trim()));
}

function normalizeImportValue(value, type) {
  if (type === "date") return formatImportDateValue(value);
  if (type === "companyType") return normalizeCompanyTypeValue(value);
  if (type === "stage") return normalizeStageOption(value) || stringify(value);
  return stringify(value);
}

function formatImportDateValue(value) {
  const text = stringify(value);
  if (!text) return "";
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text);
    if (serial > 20000 && serial < 80000) {
      const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return formatDateInputValue(date);
    }
  }
  return formatDateInputValue(text) || text;
}

function stripFileExtension(name) {
  return String(name || "").replace(/\.[^.]+$/, "").trim();
}

async function parseXlsxRows(arrayBuffer) {
  const entries = await unzipXlsxEntries(arrayBuffer);
  const worksheetPath = [...entries.keys()]
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }))[0];
  if (!worksheetPath) throw new Error("Excel 文件中没有找到工作表。");

  const sharedStrings = parseXlsxSharedStrings(entries.get("xl/sharedStrings.xml") || "");
  return parseXlsxWorksheet(entries.get(worksheetPath), sharedStrings);
}

async function unzipXlsxEntries(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  let eocdOffset = -1;
  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) {
      eocdOffset = index;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error("Excel 文件结构不完整。");

  const entryCount = view.getUint16(eocdOffset + 10, true);
  let directoryOffset = view.getUint32(eocdOffset + 16, true);
  const entries = new Map();
  const decoder = new TextDecoder("utf-8");

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(directoryOffset, true) !== 0x02014b50) break;
    const compression = view.getUint16(directoryOffset + 10, true);
    const compressedSize = view.getUint32(directoryOffset + 20, true);
    const nameLength = view.getUint16(directoryOffset + 28, true);
    const extraLength = view.getUint16(directoryOffset + 30, true);
    const commentLength = view.getUint16(directoryOffset + 32, true);
    const localOffset = view.getUint32(directoryOffset + 42, true);
    const name = decoder.decode(bytes.slice(directoryOffset + 46, directoryOffset + 46 + nameLength)).replace(/\\/g, "/");

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataOffset, dataOffset + compressedSize);
    const contentBytes = compression === 0 ? compressed : await inflateZipEntry(compressed, compression);
    if (name.endsWith(".xml")) entries.set(name, decoder.decode(contentBytes));

    directoryOffset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

async function inflateZipEntry(bytes, compression) {
  if (compression !== 8) throw new Error("Excel 文件包含暂不支持的压缩格式。");
  if (typeof DecompressionStream !== "function") {
    throw new Error("当前浏览器不支持 Excel 解压，请改用 CSV 导入。");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function parseXlsxSharedStrings(xml) {
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return [...doc.getElementsByTagName("si")].map((node) => [...node.getElementsByTagName("t")].map((item) => item.textContent || "").join(""));
}

function parseXlsxWorksheet(xml, sharedStrings) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const rows = [...doc.getElementsByTagName("row")]
    .map((row) => parseXlsxRow(row, sharedStrings))
    .filter((row) => row.some((value) => stringify(value)));
  if (rows.length <= 1) return [];

  const headers = rows[0].map((value, index) => stringify(value) || `column_${index + 1}`);
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, stringify(cells[index])])));
}

function parseXlsxRow(row, sharedStrings) {
  const values = [];
  for (const cell of row.getElementsByTagName("c")) {
    const ref = cell.getAttribute("r") || "";
    const columnIndex = xlsxColumnIndex(ref.replace(/\d+/g, ""));
    values[columnIndex] = parseXlsxCell(cell, sharedStrings);
  }
  return values;
}

function parseXlsxCell(cell, sharedStrings) {
  const type = cell.getAttribute("t");
  if (type === "inlineStr") return [...cell.getElementsByTagName("t")].map((node) => node.textContent || "").join("");

  const value = cell.getElementsByTagName("v")[0]?.textContent || "";
  if (type === "s") return sharedStrings[Number(value)] || "";
  return value;
}

function xlsxColumnIndex(letters) {
  let index = 0;
  for (const char of String(letters || "A").toUpperCase()) {
    index = index * 26 + char.charCodeAt(0) - 64;
  }
  return Math.max(index - 1, 0);
}

function parseHtmlTable(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return [];
  const rows = [...table.querySelectorAll("tr")]
    .map((row) => [...row.querySelectorAll("th, td")].map((cell) => cell.textContent.trim()))
    .filter((row) => row.some(Boolean));
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((key, index) => [key || `column_${index + 1}`, cells[index] || ""])));
}

function parseDelimited(text, delimiter) {
  const lines = splitCsvLines(text).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0], delimiter);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header || `column_${index + 1}`, values[index] || ""]));
  });
}

function splitCsvLines(text) {
  const lines = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (insideQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      lines.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current) lines.push(current);
  return lines;
}

function parseCsvLine(line, delimiter) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === "\"") {
      if (insideQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function wrapRows(rows, sourceLabel) {
  return {
    meta: {
      sourceLabel,
      sourceType: "wrapped",
      syncedAt: new Date().toISOString(),
      recordCount: rows.length,
      editable: false
    },
    rows
  };
}

function updateStateFromPayload(payload) {
  state.payload = payload || { meta: {}, rows: [] };
  state.normalizedRows = normalizeRows(state.payload.rows || []);

  if (state.editor.isOpen && state.editor.rowId && !state.editor.dirty && !state.editor.isSaving) {
    const currentRow = state.normalizedRows.find((row) => row.id === state.editor.rowId);
    if (currentRow) {
      syncEditorFromRow(currentRow);
    }
  }
}

function normalizeRows(rows) {
  return rows
    .map((row, index) => normalizeRow(row, index))
    .filter((row) => row.company || row.position || row.stage || row.feedbackNote);
}

function normalizeRow(rawRow, index) {
  const raw = Object.fromEntries(
    Object.entries(rawRow || {}).map(([key, value]) => [String(key).trim(), stringify(value)])
  );

  const company = pickField(raw, FIELD_ALIASES.company);
  const domain = pickField(raw, FIELD_ALIASES.domain);
  const companyType = normalizeCompanyTypeValue(pickField(raw, FIELD_ALIASES.companyType));
  const position = pickField(raw, FIELD_ALIASES.position);
  const city = pickField(raw, FIELD_ALIASES.city);
  const roleType = pickField(raw, FIELD_ALIASES.roleType);
  const deadline = parseDate(pickField(raw, FIELD_ALIASES.deadline));
  const link = pickField(raw, FIELD_ALIASES.link);
  const presentation = pickField(raw, FIELD_ALIASES.presentation);
  const presentationAt = parseDate(pickField(raw, FIELD_ALIASES.presentationAt));
  const presentationApplied = pickField(raw, FIELD_ALIASES.presentationApplied);
  const appliedFlag = pickField(raw, FIELD_ALIASES.appliedFlag);
  const appliedAt = parseDate(pickField(raw, FIELD_ALIASES.appliedAt));
  const writtenTestAt = parseDate(pickField(raw, FIELD_ALIASES.writtenTestAt));
  const writtenTestResult = pickField(raw, FIELD_ALIASES.writtenTestResult);
  const interview1At = parseDate(pickField(raw, FIELD_ALIASES.interview1At));
  const interview1Result = pickField(raw, FIELD_ALIASES.interview1Result);
  const interview2At = parseDate(pickField(raw, FIELD_ALIASES.interview2At));
  const interview2Result = pickField(raw, FIELD_ALIASES.interview2Result);
  const interview3At = parseDate(pickField(raw, FIELD_ALIASES.interview3At));
  const interview3Result = pickField(raw, FIELD_ALIASES.interview3Result);
  const feedbackRaw = pickField(raw, FIELD_ALIASES.feedback);
  const createdAt = parseDate(raw.created_at || raw.createdAt || raw.__createdAt || "");
  const updatedAt = parseDate(raw.updated_at || raw.updatedAt || raw.__updatedAt || raw.modified_at || raw.modifiedAt || "");
  const stageHeader = findExplicitStageHeader(raw);
  const stageFeedback = splitStoredStage(feedbackRaw);
  const explicitStage = stageHeader ? raw[stageHeader] : stageFeedback.stage;
  const feedbackNote = stageHeader ? feedbackRaw : stageFeedback.note;
  const stage = deriveStage({
    explicitStage,
    feedbackRaw,
    appliedFlag,
    appliedAt,
    writtenTestAt,
    writtenTestResult,
    interview1At,
    interview1Result,
    interview2At,
    interview2Result,
    interview3At,
    interview3Result
  });

  const notes = buildNotes({
    feedbackNote,
    presentation,
    presentationAt,
    link
  });

  const rowNumber = raw.__rowNumber || "";
  const sheetName = raw.__sheetName || state.payload.meta?.sheetName || "";
  const id = makeRowId(sheetName, rowNumber, index);

  return {
    id,
    raw,
    rowNumber,
    sheetName,
    stageHeader,
    company,
    companyKey: normalizeCompanyKey(company),
    domain,
    domainValues: splitMultiValue(domain),
    companyType,
    companyTypeValues: normalizeCompanyTypeValues(splitMultiValue(companyType)),
    position,
    city,
    cityValues: splitMultiValue(city),
    roleType,
    roleTypeValues: splitMultiValue(roleType),
    stage,
    stageGroup: stageToGroup(stage),
    stageTagClass: stageToTagClass(stage),
    deadline,
    link,
    presentation,
    presentationAt,
    presentationApplied,
    appliedFlag,
    appliedAt,
    writtenTestAt,
    writtenTestResult,
    interview1At,
    interview1Result,
    interview2At,
    interview2Result,
    interview3At,
    interview3Result,
    feedbackRaw,
    feedbackNote,
    notes,
    createdAt,
    updatedAt,
    sourceIndex: index,
    nextAction: deriveNextAction({
      stage,
      deadline,
      appliedFlag,
      writtenTestAt,
      interview1At,
      interview2At,
      interview3At,
      presentationAt
    })
  };
}

function normalizeCompanyKey(value) {
  return String(value || "").trim().toLocaleLowerCase("zh-CN");
}

function stringify(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function pickField(row, aliases) {
  const entries = Object.entries(row);

  for (const alias of aliases) {
    const matched = entries.find(([key]) => normalizeKey(key) === normalizeKey(alias));
    if (matched && matched[1]) return matched[1];
  }

  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);
    if (normalizedAlias.length < 3) continue;
    const matched = entries.find(([key]) => normalizeKey(key).includes(normalizedAlias) || normalizedAlias.includes(normalizeKey(key)));
    if (matched && matched[1]) return matched[1];
  }

  return "";
}

function normalizeKey(value) {
  return String(value).toLowerCase().replace(/[\s_\-\/():：\[\]（）【】]/g, "");
}

function normalizeCompanyTypeValue(value) {
  return String(value || "")
    .replace(/民企/g, "私企")
    .trim();
}

function normalizeCompanyTypeValues(values) {
  return [...new Set((values || []).map((value) => normalizeCompanyTypeValue(value)).filter(Boolean))];
}

function findExplicitStageHeader(row) {
  return Object.keys(row).find((key) => /阶段|状态|进度/.test(key) && !/结果|反馈|时间/.test(key)) || "";
}

function splitStoredStage(feedback) {
  const text = String(feedback || "").trim();
  if (!text) return { stage: "", note: "" };

  for (const option of [...STAGE_OPTIONS].sort((left, right) => right.value.length - left.value.length)) {
    if (text === option.value) {
      return { stage: option.value, note: "" };
    }

    const prefixes = [`${option.value}｜`, `${option.value}|`, `${option.value}：`, `${option.value}:`, `${option.value}/`];
    const matchedPrefix = prefixes.find((prefix) => text.startsWith(prefix));
    if (matchedPrefix) {
      return {
        stage: option.value,
        note: text.slice(matchedPrefix.length).trim()
      };
    }
  }

  return { stage: "", note: text };
}

function deriveStage({
  explicitStage,
  feedbackRaw,
  appliedFlag,
  appliedAt,
  writtenTestAt,
  writtenTestResult,
  interview1At,
  interview1Result,
  interview2At,
  interview2Result,
  interview3At,
  interview3Result
}) {
  const explicit = normalizeStageOption(explicitStage);
  if (explicit) return explicit;

  const haystack = `${feedbackRaw} ${writtenTestResult} ${interview1Result} ${interview2Result} ${interview3Result}`.toLowerCase();
  if (/(录取|offer|通过|oc)/.test(haystack)) return "已录取";
  if (/(淘汰|拒绝|未通过|rejected|fail)/.test(haystack)) return "已淘汰";
  if (interview3At && !interview3Result) return "等待三面";
  if (interview2At && !interview2Result) return "等待二面";
  if (interview1At && !interview1Result) return "等待一面";
  if (writtenTestAt) return "等待笔试";
  if (/(笔试|测评|oa|assessment|written)/.test(haystack)) return "等待笔试";
  if (isYes(appliedFlag) || appliedAt) return "已投递";
  return "未投递";
}

function normalizeStageOption(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const matched = STAGE_OPTIONS.find((option) => option.value === text);
  if (matched) return matched.value;
  if (/录取|offer|通过|oc/.test(text)) return "已录取";
  if (/淘汰|拒绝|未通过/.test(text)) return "已淘汰";
  if (/笔试|测评|oa/.test(text)) return "等待笔试";
  if (/三面|终面|hr面/i.test(text)) return "等待三面";
  if (/二面/.test(text)) return "等待二面";
  if (/一面|面试/.test(text)) return "等待一面";
  if (/投递/.test(text)) return "已投递";
  return "";
}

function stageToGroup(stage) {
  return STAGE_OPTIONS.find((option) => option.value === stage)?.group || "unknown";
}

function stageToTagClass(stage) {
  return STAGE_OPTIONS.find((option) => option.value === stage)?.tagClass || "stage-unknown";
}

function splitMultiValue(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  return [...new Set(text
    .split(/[\n,，、\/|；;]+/)
    .map((item) => item.trim())
    .filter(Boolean))];
}

function buildNotes({ feedbackNote, presentation, presentationAt, link }) {
  const parts = [];
  if (feedbackNote) parts.push(feedbackNote);
  if (presentation) parts.push(`宣讲地点：${presentation}`);
  if (presentationAt) parts.push(`宣讲时间：${formatDate(presentationAt)}`);
  if (link) parts.push("已填写投递链接");
  return parts.join(" / ");
}

function deriveNextAction({ stage, deadline, appliedFlag, writtenTestAt, interview1At, interview2At, interview3At, presentationAt }) {
  if (stage === "未投递") {
    return deadline ? `尽快投递，截止 ${formatDate(deadline)}` : "补充岗位信息并决定是否投递";
  }
  if (stage === "等待笔试") {
    return writtenTestAt ? `准备笔试，时间 ${formatDate(writtenTestAt)}` : "准备笔试或测评";
  }
  if (stage === "等待一面" && interview1At) {
    return `准备一面，时间 ${formatDate(interview1At)}`;
  }
  if (stage === "等待二面" && interview2At) {
    return `准备二面，时间 ${formatDate(interview2At)}`;
  }
  if (stage === "等待三面" && interview3At) {
    return `准备三面，时间 ${formatDate(interview3At)}`;
  }
  if (stage === "已录取") {
    return "确认录取结果并推进后续流程";
  }
  if (stage === "已淘汰") {
    return "流程结束，可复盘记录";
  }
  if (presentationAt) {
    return `关注宣讲节点 ${formatDate(presentationAt)}`;
  }
  if (isYes(appliedFlag)) {
    return "等待反馈并继续跟进";
  }
  return "补充下一步安排";
}

function isYes(value) {
  return /^(是|yes|y|true|1)$/i.test(String(value || "").trim());
}

function createEmptyDraft() {
  const draft = {};
  for (const field of EDITOR_FIELDS) {
    draft[field.key] = field.type === "checkbox" ? false : "";
  }
  return draft;
}

function syncEditorFromRow(row) {
  state.editor.rowNumber = row.rowNumber;
  state.editor.sheetName = row.sheetName;
  state.editor.stageHeader = row.stageHeader;
  state.editor.draft = createDraftFromRow(row);
  renderEditorState();
}

function createDraftFromRow(row) {
  const draft = createEmptyDraft();
  for (const field of EDITOR_FIELDS) {
    if (field.key === "__stage") {
      draft[field.key] = row.stage || "";
      continue;
    }

    if (field.type === "checkbox") {
      continue;
    }

    if (field.key === HEADER.feedback) {
      draft[field.key] = row.feedbackNote || "";
      continue;
    }

    const rawValue = row.raw[field.key] || "";
    draft[field.key] = field.type === "date" ? formatDateInputValue(rawValue) : rawValue;
  }

  draft.__hasPresentation = Boolean(draft[HEADER.presentation] || draft[HEADER.presentationAt]);
  draft.__hasWrittenTest = Boolean(draft[HEADER.writtenTestAt] || draft[HEADER.writtenTestResult]);
  draft.__hasInterview1 = Boolean(draft[HEADER.interview1At] || draft[HEADER.interview1Result]);
  draft.__hasInterview2 = Boolean(draft[HEADER.interview2At] || draft[HEADER.interview2Result]);
  draft.__hasInterview3 = Boolean(draft[HEADER.interview3At] || draft[HEADER.interview3Result]);
  applyEditorDependencies(draft);
  return draft;
}

function isPlannedStage(value) {
  return normalizeStageOption(value) === "未投递";
}

function applyEditorDependencies(draft = state.editor.draft) {
  if (isPlannedStage(draft.__stage)) {
    draft[HEADER.appliedAt] = "";
    draft.__hasWrittenTest = false;
    draft.__hasInterview1 = false;
    draft.__hasInterview2 = false;
    draft.__hasInterview3 = false;
  }

  if (!draft.__hasPresentation) {
    draft[HEADER.presentation] = "";
    draft[HEADER.presentationAt] = "";
  }

  if (!draft.__hasWrittenTest) {
    draft[HEADER.writtenTestAt] = "";
    draft[HEADER.writtenTestResult] = "";
  }

  if (!draft.__hasInterview1) {
    draft[HEADER.interview1At] = "";
    draft[HEADER.interview1Result] = "";
  }

  if (!draft.__hasInterview2) {
    draft[HEADER.interview2At] = "";
    draft[HEADER.interview2Result] = "";
  }
  if (!draft.__hasInterview3) {
    draft[HEADER.interview3At] = "";
    draft[HEADER.interview3Result] = "";
  }
  return draft;
}

function isFieldDisabled(field) {
  if (state.editor.isSaving || !state.payload.meta?.editable) return true;
  if (field.processStageLocked && isPlannedStage(state.editor.draft.__stage)) return true;
  if (field.toggleKey && !state.editor.draft[field.toggleKey]) return true;
  return false;
}

function shouldRenderField(field) {
  if (field.type === "checkbox" && field.inToggleRow) return false;
  if (field.hideWhenInactive && field.toggleKey && !state.editor.draft[field.toggleKey]) return false;
  return true;
}

function formatDateControlDisplay(value) {
  const date = parseDate(value);
  return date ? formatDate(date) : "";
}

function makeRowId(sheetName, rowNumber, index) {
  if (rowNumber) {
    return `${sheetName || "sheet"}:${rowNumber}`;
  }
  return `row:${index + 1}`;
}

function renderAll() {
  applyTheme();
  renderMeta();
  renderStats();
  renderStageBreakdown();
  renderTodos();
  renderRecentUpdates();
  renderMiniBreakdown();
  renderFilters();
  renderTable();
}

function renderMeta() {
  const meta = state.payload.meta || {};
  els.sourceLabel.textContent = meta.sourceLabel || "未知";
  els.syncedAtLabel.textContent = formatDateTime(meta.syncedAt ? new Date(meta.syncedAt) : null);
}

function renderStats() {
  const stageCounts = countBy(state.normalizedRows, (row) => row.stage);
  const interviewCount = [...state.normalizedRows].filter((row) => row.stageGroup === "interview" || row.stageGroup === "written").length;
  const activeCount = [...state.normalizedRows].filter((row) => !["offer", "rejected"].includes(row.stageGroup)).length;

  const items = [
    { label: "总记录", value: state.normalizedRows.length, subtext: "当前数据库中已添加的岗位数量" },
    { label: "未投递", value: stageCounts.get("未投递") || 0, subtext: "还未投递简历数量" },
    { label: "已投递", value: stageCounts.get("已投递") || 0, subtext: "已投递但尚未进入后续流程" },
    { label: "面试中", value: interviewCount, subtext: "等待笔试、一面、二面、三面" },
    { label: "已录取", value: stageCounts.get("已录取") || 0, subtext: "恭喜，已获得offer！" },
    { label: "活跃流程", value: activeCount, subtext: "未结束、仍需持续跟进的记录" }
  ];

  els.statsGrid.innerHTML = "";
  for (const item of items) {
    const node = els.statCardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".stat-label").textContent = item.label;
    node.querySelector(".stat-value").textContent = String(item.value);
    node.querySelector(".stat-subtext").textContent = item.subtext;
    els.statsGrid.appendChild(node);
  }
}

function renderStageBreakdown() {
  const counts = countBy(state.normalizedRows, (row) => row.stage || "未投递");
  const total = Math.max(state.normalizedRows.length, 1);
  const stageOrder = [...STAGE_OPTIONS.map((item) => item.value)];
  const extras = [...counts.keys()].filter((stage) => !stageOrder.includes(stage));

  els.stageBreakdown.innerHTML = "";
  for (const stage of [...stageOrder, ...extras]) {
    const count = counts.get(stage) || 0;
    const percent = Math.round((count / total) * 100);
    const node = document.createElement("div");
    node.className = "stage-row is-clickable";
    node.innerHTML = `
      <div class="stage-label-line">
        <span class="stage-label">${escapeHtml(stage)}</span>
        <span class="stage-count">${count} 条 / ${percent}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${percent}%"></div>
      </div>
    `;
    node.addEventListener("click", () => {
      openCollectionDetailModal({
        title: `阶段分布 / ${stage}`,
        kicker: "Pipeline",
        subtitle: `当前共有 ${count} 条记录处于这个阶段。`,
        itemKey: stage,
        rows: state.normalizedRows.filter((row) => row.stage === stage)
      });
    });
    els.stageBreakdown.appendChild(node);
  }
}

function renderTodos() {
  const rows = [...state.normalizedRows]
    .filter((row) => row.nextAction || row.deadline || getUpcomingEventDate(row))
    .sort(sortByUrgency)
    .slice(0, 12);

  els.todoList.innerHTML = "";
  if (!rows.length) {
    els.todoList.innerHTML = `<div class="todo-item"><strong>当前没有明确待办</strong><div class="todo-copy">当你补充截止时间、面试时间或阶段后，这里会自动更新。</div></div>`;
    return;
  }

  for (const row of rows) {
    const node = document.createElement("div");
    node.className = "todo-item is-clickable";
    node.innerHTML = `
      <div class="todo-head">
        <strong>${escapeHtml(row.company || "未命名公司")} / ${escapeHtml(row.position || "岗位待补充")}</strong>
        <span class="tag ${row.stageGroup} ${row.stageTagClass}">${escapeHtml(row.stage)}</span>
      </div>
      <div class="todo-meta">
        ${row.deadline ? `<span class="badge">截止 ${formatDate(row.deadline)}</span>` : ""}
        ${getUpcomingEventDate(row) ? `<span class="badge">节点 ${formatDate(getUpcomingEventDate(row))}</span>` : ""}
        ${row.city ? `<span class="badge">${escapeHtml(row.city)}</span>` : ""}
      </div>
      <div class="todo-copy">${escapeHtml(row.nextAction)}</div>
    `;
    node.addEventListener("click", () => {
      openRowDetailModal(row.id, "最近待办");
    });
    els.todoList.appendChild(node);
  }
}

function renderRecentUpdates() {
  const rows = [...state.normalizedRows]
    .filter((row) => getRecordUpdatedDate(row) || row.feedbackNote)
    .sort((left, right) => sortByDate(getRecordUpdatedDate(right), getRecordUpdatedDate(left)))
    .slice(0, 8);

  els.recentUpdates.innerHTML = "";
  if (!rows.length) {
    els.recentUpdates.innerHTML = `<div class="timeline-item"><strong>暂无更新轨迹</strong><div class="timeline-copy">后续写入投递时间、面试时间或反馈后，这里会自动展示。</div></div>`;
    return;
  }

  for (const row of rows) {
    const node = document.createElement("div");
    node.className = "timeline-item is-clickable";
    node.innerHTML = `
      <div class="timeline-head">
        <strong>${escapeHtml(row.company || "未命名公司")} / ${escapeHtml(row.position || row.domain || "方向待补充")}</strong>
        <span class="badge">${formatDate(getRecordUpdatedDate(row))}</span>
      </div>
      <div class="timeline-meta">
        <span class="tag ${row.stageGroup} ${row.stageTagClass}">${escapeHtml(row.stage)}</span>
        ${row.roleType ? renderRoleTypeTag(row.roleType) : ""}
      </div>
      <div class="timeline-copy">${escapeHtml(row.feedbackNote || "这条记录暂无更多说明。")}</div>
    `;
    node.addEventListener("click", () => {
      openRowDetailModal(row.id, "近期更新");
    });
    els.recentUpdates.appendChild(node);
  }
}

function renderMiniBreakdown() {
  renderTopGroups(els.domainBreakdown, countSplitValues(state.normalizedRows, "domainValues"), "暂无领域数据", {
    clickable: true,
    kicker: "Domain",
    getRows: (label) => state.normalizedRows.filter((row) => row.domainValues.includes(label))
  });
  renderTopGroups(els.companyTypeBreakdown, countSplitValues(state.normalizedRows, "companyTypeValues"), "暂无企业性质数据", {
    clickable: true,
    kicker: "Type",
    getRows: (label) => state.normalizedRows.filter((row) => row.companyTypeValues.includes(label))
  });
  renderTopGroups(els.cityBreakdown, countSplitValues(state.normalizedRows, "cityValues"), "暂无城市数据", {
    clickable: true,
    kicker: "City",
    getRows: (label) => state.normalizedRows.filter((row) => row.cityValues.includes(label))
  });
}

function renderTopGroups(container, map, fallbackText, options = {}) {
  container.innerHTML = "";
  const entries = [...map.entries()].sort((left, right) => right[1] - left[1]).slice(0, 8);
  const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;

  if (!entries.length) {
    container.innerHTML = `<div class="mini-row"><span class="mini-label">${fallbackText}</span></div>`;
    return;
  }

  container.appendChild(buildBreakdownChart(entries, total));
  const list = document.createElement("div");
  list.className = "mini-breakdown-list";

  for (const [label, count] of entries) {
    const percent = Math.round((count / total) * 100);
    const node = document.createElement("div");
    node.className = `mini-row${options.clickable ? " is-clickable" : ""}`;
    node.innerHTML = `
      <div class="mini-line">
        <span class="mini-label">${escapeHtml(label)}</span>
        <span class="mini-value">${count}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${percent}%"></div>
      </div>
    `;
    if (options.clickable && typeof options.getRows === "function") {
      node.addEventListener("click", () => {
        openCollectionDetailModal({
          title: `投递结构 / ${label}`,
          kicker: options.kicker || "Details",
          subtitle: `当前共有 ${count} 条记录属于这个分类。`,
          itemKey: label,
          rows: options.getRows(label)
        });
      });
    }
    list.appendChild(node);
  }
  container.appendChild(list);
}

function buildBreakdownChart(entries, total) {
  const chart = document.createElement("div");
  chart.className = "mini-pie-card";
  const chartId = `pie-${Math.random().toString(36).slice(2, 10)}`;
  const radius = 52;
  const innerRadius = 28;
  const cx = 66;
  const cy = 66;
  let angle = -90;
  const paths = [];
  const legend = [];
  const topThree = entries.slice(0, 3);

  entries.forEach(([label, count], index) => {
    const ratio = count / total;
    const nextAngle = angle + ratio * 360;
    const color = getBreakdownColor(index);
    const percent = Math.round(ratio * 100);
    paths.push(`
      <path
        d="${describeDonutArc(cx, cy, radius, innerRadius, angle, nextAngle)}"
        fill="${color}"
        data-chart-id="${chartId}"
        data-label="${escapeAttribute(label)}"
        data-percent="${percent}%"
      ></path>
    `);
    angle = nextAngle;
  });

  topThree.forEach(([label, count], index) => {
    const ratio = count / total;
    const color = getBreakdownColor(index);
    legend.push(`
      <div class="mini-pie-legend-item">
        <span class="mini-pie-swatch" style="background:${color}"></span>
        <span class="mini-pie-legend-label">${escapeHtml(label)}</span>
        <span class="mini-pie-legend-value">${Math.round(ratio * 100)}%</span>
      </div>
    `);
  });

  while (legend.length < 3) {
    legend.push(`
      <div class="mini-pie-legend-item is-empty" aria-hidden="true">
        <span class="mini-pie-swatch"></span>
        <span class="mini-pie-legend-label">&nbsp;</span>
        <span class="mini-pie-legend-value">&nbsp;</span>
      </div>
    `);
  }

  chart.innerHTML = `
    <div class="mini-pie-wrap">
      <div class="mini-pie-chart-shell">
        <svg class="mini-pie-chart" viewBox="0 0 132 132" aria-label="比例统计图" role="img">
          ${paths.join("")}
        </svg>
        <div class="mini-pie-hole">
          <strong>${entries.length}</strong>
          <span>分类</span>
        </div>
        <div class="mini-pie-tooltip" data-chart-tooltip="${chartId}">悬停查看占比</div>
      </div>
      <div class="mini-pie-legend">${legend.join("")}</div>
    </div>
  `;

  const tooltip = chart.querySelector(`[data-chart-tooltip="${chartId}"]`);
  chart.querySelectorAll(`path[data-chart-id="${chartId}"]`).forEach((segment) => {
    segment.addEventListener("mouseenter", () => {
      if (!tooltip) return;
      tooltip.textContent = `${segment.dataset.label} ${segment.dataset.percent}`;
      tooltip.dataset.active = "true";
    });
    segment.addEventListener("mouseleave", () => {
      if (!tooltip) return;
      tooltip.textContent = "悬停查看占比";
      tooltip.dataset.active = "false";
    });
  });

  return chart;
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function describeDonutArc(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
  if (Math.abs(endAngle - startAngle) >= 359.999) {
    const topOuter = `${cx} ${cy - outerRadius}`;
    const bottomOuter = `${cx} ${cy + outerRadius}`;
    const topInner = `${cx} ${cy - innerRadius}`;
    const bottomInner = `${cx} ${cy + innerRadius}`;

    return [
      `M ${topOuter}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${bottomOuter}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${topOuter}`,
      `L ${topInner}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${bottomInner}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${topInner}`,
      "Z"
    ].join(" ");
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    "Z"
  ].join(" ");
}

function getBreakdownColor(index) {
  const palette = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316"];
  return palette[index % palette.length];
}

function renderFilters() {
  renderSelectOptions(els.stageFilter, buildStageFilterOptions(), state.filters.stage, "全部阶段");
  renderSelectOptions(els.domainFilter, collectDistinctValues(state.normalizedRows, "domainValues"), state.filters.domain, "全部方向");
  renderSelectOptions(els.companyTypeFilter, collectDistinctValues(state.normalizedRows, "companyTypeValues"), state.filters.companyType, "全部性质");
  renderSelectOptions(els.cityFilter, collectDistinctValues(state.normalizedRows, "cityValues"), state.filters.city, "全部城市");
  renderSelectOptions(els.roleTypeFilter, collectDistinctValues(state.normalizedRows, "roleTypeValues"), state.filters.roleType, "全部岗位性质");
  renderRecordSortOptions();
}

function buildStageFilterOptions() {
  const present = new Set(state.normalizedRows.map((row) => row.stage).filter(Boolean));
  const ordered = STAGE_OPTIONS.map((item) => item.value).filter((value) => present.has(value));
  const extras = [...present].filter((value) => !ordered.includes(value)).sort();
  return [...ordered, ...extras];
}

function renderSelectOptions(select, values, currentValue, allLabel) {
  select.innerHTML = `<option value="all">${allLabel}</option>`;
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
  select.value = values.includes(currentValue) ? currentValue : "all";
  state.filters[select.id.replace("Filter", "")] = select.value;
}

function collectDistinctValues(rows, key) {
  return [...new Set(rows.flatMap((row) => row[key] || []))].sort((left, right) => left.localeCompare(right, "zh-CN"));
}

function renderRecordSortOptions() {
  const select = document.querySelector("#recordSortSelect");
  if (!select) return;

  select.innerHTML = "";
  for (const optionValue of RECORD_SORT_OPTIONS) {
    const option = document.createElement("option");
    option.value = optionValue.value;
    option.textContent = optionValue.label;
    select.appendChild(option);
  }
  select.value = RECORD_SORT_OPTIONS.some((item) => item.value === state.filters.recordSort) ? state.filters.recordSort : "created";
  state.filters.recordSort = select.value;
}

function renderTable() {
  const rows = sortRowsForTable(filterRows(state.normalizedRows, state.filters), state.filters.recordSort);
  els.tableSummary.textContent = `当前共 ${state.normalizedRows.length} 条记录`;
  els.emptyState.hidden = rows.length > 0;

  const columns = [
    { key: "company", label: "公司" },
    { key: "position", label: "方向 / 岗位" },
    { key: "deadline", label: "截止投递日期" },
    { key: "roleType", label: "岗位性质" },
    { key: "stage", label: "阶段" },
    { key: "nodeDate", label: "节点日期" },
    { key: "city", label: "城市" },
    { key: "notes", label: "备注 / 反馈" },
    { key: "actions", label: "操作" }
  ];

  const table = els.tableHead.closest("table");
  if (table) {
    table.querySelector("colgroup")?.remove();
    const colgroup = document.createElement("colgroup");
    for (const column of columns) {
      const col = document.createElement("col");
      col.style.width = TABLE_COLUMN_WIDTHS[column.key] || "";
      colgroup.appendChild(col);
    }
    table.insertBefore(colgroup, table.firstChild);
  }

  els.tableHead.innerHTML = `<tr>${columns.map((column) => `<th>${column.label}</th>`).join("")}</tr>`;
  els.tableBody.innerHTML = "";

  for (const [index, row] of rows.entries()) {
    const previousRow = rows[index - 1] || null;
    const nextRow = rows[index + 1] || null;
    const sameCompanyAsPrevious = Boolean(previousRow && row.companyKey && previousRow.companyKey === row.companyKey);
    const sameCompanyAsNext = Boolean(nextRow && row.companyKey && nextRow.companyKey === row.companyKey);
    const tr = document.createElement("tr");
    tr.className = [
      "table-row-clickable",
      sameCompanyAsPrevious || sameCompanyAsNext ? "table-row-company-group" : "",
      sameCompanyAsPrevious ? "table-row-company-continued" : "",
      sameCompanyAsNext ? "table-row-company-start" : ""
    ].filter(Boolean).join(" ");
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.setAttribute("aria-label", `查看 ${row.company || "当前记录"} 详情`);
    if (row.companyKey) {
      tr.dataset.companyKey = row.companyKey;
    }
    tr.addEventListener("click", () => {
      openRowDetailModal(row.id, "投递明细");
    });
    tr.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openRowDetailModal(row.id, "投递明细");
      }
    });

    for (const column of columns) {
      if (column.key === "company" && sameCompanyAsPrevious) {
        const mobileCompanyCell = document.createElement("td");
        mobileCompanyCell.className = "table-company-cell-mobile";
        mobileCompanyCell.setAttribute("data-label", column.label);
        const secondary = [...row.domainValues, ...row.companyTypeValues].join(" / ");
        mobileCompanyCell.innerHTML = `
          <span class="cell-main">${escapeHtml(row.company || "未命名公司")}</span>
          ${secondary ? `<span class="cell-sub">${escapeHtml(secondary)}</span>` : ""}
        `;
        tr.appendChild(mobileCompanyCell);
        continue;
      }

      const td = document.createElement("td");
      td.setAttribute("data-label", column.label);

      if (column.key === "company") {
        const secondary = [...row.domainValues, ...row.companyTypeValues].join(" / ");
        const groupSpan = getCompanyGroupSpan(rows, index);
        if (groupSpan > 1) {
          td.rowSpan = groupSpan;
          td.className = "table-company-cell";
          td.dataset.companyKey = row.companyKey;
        }
        td.innerHTML = `
          <span class="cell-main">${escapeHtml(row.company || "未命名公司")}</span>
          ${secondary ? `<span class="cell-sub">${escapeHtml(secondary)}</span>` : ""}
        `;
      } else if (column.key === "position") {
        td.innerHTML = `
          <span class="cell-main">${escapeHtml(row.position || "岗位待补充")}</span>
          ${row.link ? `<a class="cell-sub" href="${escapeAttribute(row.link)}" target="_blank" rel="noreferrer">打开投递链接</a>` : ""}
        `;
      } else if (column.key === "deadline") {
        td.innerHTML = `
          <span class="cell-main">${formatDate(row.deadline)}</span>
        `;
      } else if (column.key === "roleType") {
        td.innerHTML = renderRoleTypeTag(row.roleType || "-");
      } else if (column.key === "stage") {
        td.innerHTML = `<span class="tag ${row.stageGroup} ${row.stageTagClass}">${escapeHtml(row.stage || "未分类")}</span>`;
      } else if (column.key === "nodeDate") {
        td.innerHTML = `
          <span class="cell-main">${formatDate(getNodeDate(row))}</span>
          ${getRecordUpdatedDate(row) ? `<span class="cell-sub">最近更新：${formatDate(getRecordUpdatedDate(row))}</span>` : ""}
        `;
      } else if (column.key === "city") {
        td.textContent = row.cityValues.join(" / ") || "-";
      } else if (column.key === "notes") {
        td.textContent = row.feedbackNote || "-";
      } else if (column.key === "actions") {
        const disabled = state.payload.meta?.editable ? "" : "disabled";
        td.innerHTML = `
          <div class="table-actions">
            <button class="button button-danger table-action" type="button" data-action="delete" data-row-id="${escapeAttribute(row.id)}" ${disabled}>删除</button>
          </div>
        `;
      } else {
        td.textContent = row[column.key] || "-";
      }

      tr.appendChild(td);
    }
    els.tableBody.appendChild(tr);
  }

  els.tableBody.querySelectorAll("[data-action][data-row-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (button.dataset.action === "delete") {
        void deleteRow(button.dataset.rowId);
      }
    });
  });

  els.tableBody.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  els.tableBody.querySelectorAll(".table-company-cell[data-company-key]").forEach((cell) => {
    cell.addEventListener("mouseenter", () => {
      setCompanyGroupHover(cell.dataset.companyKey, true);
    });
    cell.addEventListener("mouseleave", () => {
      setCompanyGroupHover(cell.dataset.companyKey, false);
    });
  });
}

function getCompanyGroupSpan(rows, startIndex) {
  const row = rows[startIndex];
  if (!row?.companyKey) return 1;

  let span = 1;
  for (let index = startIndex + 1; index < rows.length; index += 1) {
    if (rows[index]?.companyKey !== row.companyKey) break;
    span += 1;
  }
  return span;
}

function setCompanyGroupHover(companyKey, isHovered) {
  if (!companyKey) return;

  els.tableBody.querySelectorAll(`tr[data-company-key="${cssEscape(companyKey)}"]`).forEach((row) => {
    row.classList.toggle("table-row-company-hover", isHovered);
  });
}

function sortRowsForTable(rows, sortMode = "created") {
  const groups = groupRowsByCompany(rows);
  const sortedGroups = [...groups].sort((left, right) => compareCompanyGroups(left, right, sortMode));
  return sortedGroups.flatMap((group) => [...group.rows].sort((left, right) => compareRowsBySortMode(left, right, sortMode)));
}

function groupRowsByCompany(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.companyKey || `__single__:${row.id}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        company: row.company || "",
        rows: []
      });
    }
    groups.get(key).rows.push(row);
  }
  return [...groups.values()];
}

function compareCompanyGroups(leftGroup, rightGroup, sortMode) {
  const leftAnchor = getGroupSortAnchor(leftGroup.rows, sortMode);
  const rightAnchor = getGroupSortAnchor(rightGroup.rows, sortMode);

  if (sortMode === "node") {
    return compareAnchorDates(leftAnchor ? getNodeDate(leftAnchor) : null, rightAnchor ? getNodeDate(rightAnchor) : null, leftAnchor, rightAnchor)
      || leftGroup.company.localeCompare(rightGroup.company, "zh-CN");
  }
  if (sortMode === "deadline") {
    return compareAnchorDates(leftAnchor?.deadline || null, rightAnchor?.deadline || null, leftAnchor, rightAnchor)
      || leftGroup.company.localeCompare(rightGroup.company, "zh-CN");
  }

  return compareRowsBySortMode(leftAnchor, rightAnchor, sortMode) || leftGroup.company.localeCompare(rightGroup.company, "zh-CN");
}

function compareRowsBySortMode(left, right, sortMode = "created") {
  if (sortMode === "deadline") {
    return compareNearestFirst(left.deadline, right.deadline) || compareCreatedDesc(left, right);
  }
  if (sortMode === "node") {
    return compareNearestFirst(getNodeDate(left), getNodeDate(right)) || compareCreatedDesc(left, right);
  }
  return compareCreatedDesc(left, right);
}

function getGroupSortAnchor(rows, sortMode) {
  const orderedRows = [...rows].sort((left, right) => compareRowsBySortMode(left, right, sortMode));
  return orderedRows[0];
}

function compareAnchorDates(leftDate, rightDate, leftRow, rightRow) {
  return compareNearestFirst(leftDate, rightDate) || compareCreatedDesc(leftRow, rightRow);
}

function compareNearestFirst(leftDate, rightDate) {
  if (leftDate && rightDate) return leftDate - rightDate;
  if (leftDate) return -1;
  if (rightDate) return 1;
  return 0;
}

function compareCreatedDesc(left, right) {
  const leftTime = left.createdAt?.getTime?.() || 0;
  const rightTime = right.createdAt?.getTime?.() || 0;
  if (rightTime !== leftTime) return rightTime - leftTime;

  const leftRowNumber = Number(left.rowNumber) || 0;
  const rightRowNumber = Number(right.rowNumber) || 0;
  if (rightRowNumber !== leftRowNumber) return rightRowNumber - leftRowNumber;

  return (right.sourceIndex || 0) - (left.sourceIndex || 0);
}

function filterRows(rows, filters) {
  return rows.filter((row) => {
    const haystack = [
      row.company,
      row.position,
      row.domain,
      row.companyType,
      row.city,
      row.roleType,
      row.stage,
      row.notes,
      row.feedbackRaw
    ].join(" ").toLowerCase();

    const matchesSearch = !filters.search || haystack.includes(filters.search.toLowerCase());
    const matchesStage = filters.stage === "all" || row.stage === filters.stage;
    const matchesDomain = filters.domain === "all" || row.domainValues.includes(filters.domain);
    const matchesCompanyType = filters.companyType === "all" || row.companyTypeValues.includes(filters.companyType);
    const matchesCity = filters.city === "all" || row.cityValues.includes(filters.city);
    const matchesRoleType = filters.roleType === "all" || row.roleTypeValues.includes(filters.roleType);

    return matchesSearch && matchesStage && matchesDomain && matchesCompanyType && matchesCity && matchesRoleType;
  });
}

function countBy(rows, getKey) {
  const map = new Map();
  for (const row of rows) {
    const key = getKey(row);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

function countSplitValues(rows, key) {
  const map = new Map();
  for (const row of rows) {
    for (const value of row[key] || []) {
      map.set(value, (map.get(value) || 0) + 1);
    }
  }
  return map;
}

function sortByUrgency(left, right) {
  const leftEvent = left.deadline || getUpcomingEventDate(left);
  const rightEvent = right.deadline || getUpcomingEventDate(right);
  if (leftEvent && rightEvent) return leftEvent - rightEvent;
  if (leftEvent) return -1;
  if (rightEvent) return 1;
  return sortByDate(getLatestActivityDate(right), getLatestActivityDate(left));
}

function sortByDate(left, right) {
  const leftTime = left ? left.getTime() : 0;
  const rightTime = right ? right.getTime() : 0;
  return leftTime - rightTime;
}

function getUpcomingEventDate(row) {
  return pickNextUpcomingDate(row.writtenTestAt, row.interview1At, row.interview2At, row.interview3At, row.presentationAt);
}

function getNodeDate(row) {
  return pickNextUpcomingDate(row.writtenTestAt, row.interview1At, row.interview2At, row.interview3At, row.presentationAt);
}

function getLatestActivityDate(row) {
  return pickLatestDate(row.updatedAt, row.interview3At, row.interview2At, row.interview1At, row.writtenTestAt, row.appliedAt, row.presentationAt);
}

function getRecordUpdatedDate(row) {
  return row.updatedAt || null;
}

function pickLatestDate(...dates) {
  return [...dates]
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))
    .sort((left, right) => right - left)[0] || null;
}

function pickNextUpcomingDate(...dates) {
  const now = Date.now();
  const future = [...dates]
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()) && date.getTime() >= now)
    .sort((left, right) => left - right);
  return future[0] || null;
}

function parseDate(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const isoDate = new Date(text);
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }
  const normalized = text
    .replace(/\./g, "-")
    .replace(/\//g, "-")
    .replace(/年/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .trim();
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatDateTime(date) {
  if (!date || Number.isNaN(date.getTime?.())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatFileSize(size) {
  const value = Number(size || 0);
  if (!Number.isFinite(value) || value <= 0) return "未知大小";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateInputValue(value) {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function setRefreshState(text) {
  els.refreshStateLabel.textContent = text;
}

function openEditorForRow(rowId) {
  const row = state.normalizedRows.find((item) => item.id === rowId);
  if (!row) return;

  state.editor = {
    ...state.editor,
    isOpen: true,
    mode: "edit",
    rowId: row.id,
    rowNumber: row.rowNumber,
    sheetName: row.sheetName,
    stageHeader: row.stageHeader,
    draft: createDraftFromRow(row),
    dirty: false,
    isSaving: false,
    status: "",
    statusTone: "idle"
  };
  renderEditorState();
}

function openEditorForNewRecord() {
  state.editor = {
    ...state.editor,
    isOpen: true,
    mode: "new",
    rowId: "",
    rowNumber: "",
    sheetName: state.payload.meta?.sheetName || "",
    stageHeader: "",
    draft: createEmptyDraft(),
    dirty: false,
    isSaving: false,
    status: "",
    statusTone: "idle"
  };
  renderEditorState();
}

function openEditorForCopiedRow(rowId) {
  const row = state.normalizedRows.find((item) => item.id === rowId);
  if (!row) return;

  state.editor = {
    ...state.editor,
    isOpen: true,
    mode: "new",
    rowId: "",
    rowNumber: "",
    sheetName: state.payload.meta?.sheetName || row.sheetName || "",
    stageHeader: row.stageHeader || "",
    draft: createDraftFromRow(row),
    dirty: true,
    isSaving: false,
    status: "已复制当前条目，可直接保存为新记录",
    statusTone: "pending"
  };
  renderEditorState();
}

function renderEditorState() {
  els.editorOverlay.hidden = !state.editor.isOpen;
  els.editorPanel.hidden = !state.editor.isOpen;
  els.editorTitle.textContent = state.editor.mode === "new" ? "添加投递信息" : "编辑记录";
  els.editorHint.textContent = "";
  els.editorHint.hidden = true;
  els.editorStatus.textContent = state.editor.status;
  els.editorStatus.dataset.tone = state.editor.statusTone;
  els.editorStatus.hidden = !state.editor.status;
  els.saveEditorButton.disabled = state.editor.isSaving || !state.payload.meta?.editable;

  if (!state.editor.isOpen) {
    els.editorFields.innerHTML = "";
    return;
  }

  els.editorFields.innerHTML = "";
  applyEditorDependencies();

  const toggleFields = EDITOR_FIELDS.filter((field) => field.type === "checkbox" && field.inToggleRow);
  const toggleRow = document.createElement("div");
  toggleRow.className = "editor-toggle-row col-12";

  for (const field of toggleFields) {
    const toggle = document.createElement("label");
    toggle.className = "editor-toggle-field";

    const copy = document.createElement("span");
    copy.className = "editor-toggle-copy";
    copy.textContent = field.label;

    const control = document.createElement("input");
    control.type = "checkbox";
    control.name = field.key;
    control.checked = Boolean(state.editor.draft[field.key]);
    control.disabled = isFieldDisabled(field);
    control.className = "editor-toggle-checkbox";

    toggle.appendChild(copy);
    toggle.appendChild(control);
    toggle.classList.toggle("is-disabled", control.disabled);
    toggleRow.appendChild(toggle);
  }

  let toggleRowInserted = false;
  for (const field of EDITOR_FIELDS) {
    if (field.type === "checkbox") {
      if (!toggleRowInserted && toggleRow.childElementCount) {
        els.editorFields.appendChild(toggleRow);
        toggleRowInserted = true;
      }
      continue;
    }

    if (!shouldRenderField(field)) continue;

    if (!toggleRowInserted && toggleRow.childElementCount && field.toggleKey) {
      els.editorFields.appendChild(toggleRow);
      toggleRowInserted = true;
    }

    if (field.type === "checkbox") {
      continue;
    }

    const label = document.createElement("label");
    label.className = `editor-field col-${field.colSpan || 6}`;
    label.innerHTML = `<span>${escapeHtml(field.label)}</span>`;

    let control;
    if (field.type === "textarea") {
      control = document.createElement("textarea");
    } else if (field.type === "select") {
      control = document.createElement("select");
      for (const optionValue of field.options || [""]) {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue || "未选择";
        control.appendChild(option);
      }
    } else if (field.type === "date") {
      const shell = document.createElement("div");
      shell.className = "editor-date-control";

      const display = document.createElement("span");
      display.className = "editor-date-display";
      display.textContent = formatDateControlDisplay(state.editor.draft[field.key]);
      display.dataset.empty = display.textContent ? "false" : "true";

      control = document.createElement("input");
      control.type = "date";
      control.className = "editor-date-native";
      control.dataset.dateInput = field.key;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "editor-date-trigger";
      trigger.dataset.dateTrigger = field.key;
      trigger.setAttribute("aria-label", `选择${field.label}`);
      trigger.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z"/>
        </svg>
      `;

      shell.appendChild(display);
      shell.appendChild(trigger);
      shell.appendChild(control);
      label.appendChild(shell);
    } else {
      control = document.createElement("input");
      control.type = field.type;
    }

    control.name = field.key;
    control.value = state.editor.draft[field.key] || "";
    control.disabled = isFieldDisabled(field);
    if (field.type !== "date") {
      label.appendChild(control);
      if (EDITOR_SUGGESTION_FIELDS.has(field.key) && control instanceof HTMLInputElement) {
        const suggestionList = document.createElement("div");
        suggestionList.className = "editor-suggestion-list";
        suggestionList.hidden = true;
        label.appendChild(suggestionList);

        control.setAttribute("autocomplete", "off");
        control.addEventListener("input", () => {
          renderEditorSuggestionList(control, suggestionList, field.key);
        });
        control.addEventListener("focus", () => {
          renderEditorSuggestionList(control, suggestionList, field.key);
        });
        control.addEventListener("blur", () => {
          window.setTimeout(() => {
            suggestionList.hidden = true;
          }, 120);
        });
      }
    } else {
      const trigger = label.querySelector(".editor-date-trigger");
      const shell = label.querySelector(".editor-date-control");
      if (trigger instanceof HTMLButtonElement) {
        trigger.disabled = control.disabled;
      }
      shell?.classList.toggle("is-disabled", control.disabled);
    }
    els.editorFields.appendChild(label);
  }

  if (!toggleRowInserted && toggleRow.childElementCount) {
    els.editorFields.appendChild(toggleRow);
  }
}

function renderEditorSuggestionList(input, list, fieldKey) {
  const suggestions = buildEditorSuggestions(fieldKey, input.value);
  if (!suggestions.length) {
    list.hidden = true;
    list.innerHTML = "";
    return;
  }

  list.innerHTML = "";
  for (const value of suggestions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "editor-suggestion-option";
    button.textContent = value;
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      list.hidden = true;
    });
    list.appendChild(button);
  }
  list.hidden = false;
}

function buildEditorSuggestions(fieldKey, query = "") {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!shouldShowEditorSuggestions(normalizedQuery)) return [];

  const values = [];
  for (const row of state.normalizedRows) {
    if (fieldKey === HEADER.company) {
      values.push(row.company);
    } else if (fieldKey === HEADER.domain) {
      values.push(...row.domainValues, row.domain);
    } else if (fieldKey === HEADER.position) {
      values.push(row.position);
    }
  }

  const seen = new Set();
  return values
    .map((value) => String(value || "").trim())
    .filter((value) => {
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .filter((value) => value.toLowerCase().includes(normalizedQuery))
    .sort((left, right) => left.localeCompare(right, "zh-CN"))
    .slice(0, EDITOR_SUGGESTION_LIMIT);
}

function shouldShowEditorSuggestions(query) {
  if (!query) return false;
  if (/[\u3400-\u9fff]/.test(query)) return query.length >= 1;
  return query.length >= 2;
}

async function maybePromptDatabaseOnboarding() {
  if (state.hasCheckedDatabaseOnboarding) return;
  state.hasCheckedDatabaseOnboarding = true;

  try {
    const response = await fetch("./api/databases", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) return;

    const databases = Array.isArray(result.databases) ? result.databases : [];
    const currentDbFile = result.currentDbFile || "";
    const hasCustomDatabase = databases.some((item) => item?.fileName && item.fileName !== DEFAULT_DATABASE_FILE);
    const shouldPrompt = !hasCustomDatabase && (!currentDbFile || currentDbFile === DEFAULT_DATABASE_FILE);
    if (!shouldPrompt) {
      localStorage.setItem(DATABASE_ONBOARDING_KEY, "seen");
      return;
    }

    state.database.databases = databases;
    state.database.currentDbFile = currentDbFile;
    state.database.status = "首次使用请先创建数据库，再开始填写投递信息。";
    setDatabaseMode("create");
    openUtilityModal("database");

    window.setTimeout(() => {
      els.databaseNameInput?.focus();
      els.databaseNameInput?.select?.();
    }, 0);

    localStorage.setItem(DATABASE_ONBOARDING_KEY, "seen");
  } catch (error) {
    console.warn("Failed to prompt database onboarding", error);
  }
}

async function deleteDatabase(fileName, databaseName) {
  if (!fileName) return;
  const confirmed = window.confirm(`确定要删除数据库“${databaseName}”吗？此操作会永久删除对应的数据库文件。`);
  if (!confirmed) return;

  state.database.status = "正在删除数据库...";
  renderDatabaseModal();

  try {
    const response = await fetch("./api/databases/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "删除数据库失败");
    state.database.databases = result.state?.databases || [];
    state.database.currentDbFile = result.state?.currentDbFile || "";
    state.database.status = "已删除数据库。";
    renderDatabaseModal();
  } catch (error) {
    console.error(error);
    state.database.status = `删除失败：${error.message}`;
    renderDatabaseModal();
  }
}

function handleEditorFieldClick(event) {
  const trigger = event.target.closest("[data-date-trigger]");
  if (!trigger) return;
  const shell = trigger.closest(".editor-date-control");
  const nativeInput = shell?.querySelector(".editor-date-native");
  if (!(nativeInput instanceof HTMLInputElement) || nativeInput.disabled) return;
  if (typeof nativeInput.showPicker === "function") {
    nativeInput.showPicker();
  } else {
    nativeInput.click();
  }
}

function handleEditorFieldChange(event) {
  const fieldName = event.target?.name;
  if (!fieldName || !(fieldName in state.editor.draft)) return;
  state.editor.draft[fieldName] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
  applyEditorDependencies();

  if (event.target.classList.contains("editor-date-native")) {
    const shell = event.target.closest(".editor-date-control");
    const display = shell?.querySelector(".editor-date-display");
    if (display instanceof HTMLElement) {
      const text = formatDateControlDisplay(event.target.value);
      display.textContent = text;
      display.dataset.empty = text ? "false" : "true";
    }
  }

  state.editor.dirty = true;
  state.editor.status = "有未保存修改";
  state.editor.statusTone = "pending";
  if (fieldName === "__stage" || EDITOR_TOGGLE_FIELDS.includes(fieldName)) {
    renderEditorState();
  } else {
    renderEditorStatus();
  }
}

function renderEditorStatus() {
  els.editorStatus.textContent = state.editor.status;
  els.editorStatus.dataset.tone = state.editor.statusTone;
  els.editorStatus.hidden = !state.editor.status;
  els.saveEditorButton.disabled = state.editor.isSaving || !state.payload.meta?.editable;
}

async function handleCloseEditor() {
  if (state.editor.dirty) {
    const confirmed = window.confirm("当前有未保存修改，确定关闭吗？");
    if (!confirmed) return;
  }

  state.editor.isOpen = false;
  state.editor.dirty = false;
  state.editor.status = "";
  state.editor.statusTone = "idle";
  renderEditorState();
}

async function saveEditor() {
  if (!state.editor.isOpen || state.editor.isSaving || !state.payload.meta?.editable) return;

  const updates = materializeDraftForSave();
  const hasContent = Object.values(updates).some((value) => String(value || "").trim());
  if (state.editor.mode === "new" && !hasContent) {
    state.editor.status = "请至少填写一个字段";
    state.editor.statusTone = "error";
    renderEditorStatus();
    return;
  }

  state.editor.isSaving = true;
  state.editor.status = "正在保存到数据库...";
  state.editor.statusTone = "pending";
  renderEditorState();

  try {
    const editorMode = state.editor.mode;
    const sourceLabel = state.detail.kicker || "投递明细";
    const response = await fetch("./api/save-row", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rowNumber: state.editor.rowNumber,
        sheetName: state.editor.sheetName,
        updates
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "保存失败");

    state.editor.rowNumber = result.rowNumber || state.editor.rowNumber;
    state.editor.sheetName = result.sheetName || state.editor.sheetName;
    state.editor.rowId = makeRowId(state.editor.sheetName, state.editor.rowNumber, state.normalizedRows.length);
    state.editor.mode = "edit";
    state.editor.isSaving = false;
    state.editor.dirty = false;
    state.editor.isOpen = false;
    state.editor.status = "";
    state.editor.statusTone = "idle";
    updateStateFromPayload(result.payload);
    renderAll();
    renderEditorState();
    if (editorMode === "edit") {
      openRowDetailModal(state.editor.rowId, sourceLabel);
    }
    setRefreshState("已保存");
  } catch (error) {
    console.error(error);
    state.editor.isSaving = false;
    state.editor.status = `保存失败：${error.message}`;
    state.editor.statusTone = "error";
    renderEditorState();
  }
}

function materializeDraftForSave() {
  const draft = state.editor.draft;
  const updates = {};
  applyEditorDependencies(draft);

  for (const field of EDITOR_FIELDS) {
    if (field.key === "__stage" || field.key.startsWith("__")) continue;
    updates[field.key] = normalizeDraftValue(draft[field.key], field.type);
  }

  const stageValue = normalizeStageOption(draft.__stage);
  const feedbackNote = normalizeDraftValue(draft[HEADER.feedback], "textarea");
  const stageHeader = state.editor.stageHeader || HEADER.stage;
  updates[stageHeader] = stageValue;
  updates[HEADER.feedback] = feedbackNote;

  if (stageValue === "未投递") {
    updates[HEADER.appliedFlag] = "否";
  } else if (stageValue) {
    updates[HEADER.appliedFlag] = "是";
  }

  return updates;
}

function normalizeDraftValue(value, type) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (type === "date") return text;
  return text;
}

async function deleteRow(rowId) {
  const row = state.normalizedRows.find((item) => item.id === rowId);
  if (!row || !state.payload.meta?.editable) return;

  if (!row.rowNumber) {
    setRefreshState("删除失败：未找到记录编号");
    return;
  }

  const label = [row.company, row.position].filter(Boolean).join(" / ") || "这条记录";
  const confirmed = window.confirm(`确定要删除“${label}”吗？这会同步删除数据库中的对应记录。`);
  if (!confirmed) return;

  setRefreshState("正在删除记录...");
  try {
    const response = await fetch("./api/delete-row", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rowNumber: row.rowNumber,
        sheetName: row.sheetName
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "删除失败");

    if (state.editor.isOpen && state.editor.rowId === rowId) {
      state.editor.isOpen = false;
      state.editor.dirty = false;
    }

    updateStateFromPayload(result.payload);
    renderAll();
    renderEditorState();
    setRefreshState("已删除并同步到数据库");
  } catch (error) {
    console.error(error);
    setRefreshState(`删除失败：${error.message}`);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function cssEscape(value) {
  if (window.CSS?.escape) return window.CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

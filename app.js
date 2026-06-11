const emotionCopy = {
  steady: {
    label: "平穩",
    title: "先穩住節奏，再回到推論",
    guide: "目前可以請學生把段落中的比喻換成自己的話，接著標出它連到哪個城市問題。",
    steps: ["圈出關鍵名詞與動詞。", "用一句話說明作者想解釋的原因。", "把答案寫成「因為...所以...」。"],
    feedback: "給予短句肯定，再請學生圈出造成降溫的關鍵動詞。"
  },
  confused: {
    label: "困惑",
    title: "拆小問題，先找到斷點",
    guide: "學生可能卡在比喻和因果連結。先不要要求完整答案，改用二選一提示找出哪一句最不懂。",
    steps: ["請學生點選最卡的一句。", "提供一個生活例子對照濕地功能。", "讓學生補上「這句在回答什麼問題」。"],
    feedback: "先回應「你找到卡住處了」，再給一個同義詞或圖像化比喻。"
  },
  anxious: {
    label: "焦慮",
    title: "降低答題壓力，改成口頭整理",
    guide: "此時先移除時間壓力，讓學生用口頭或關鍵詞回應。系統會把任務改成一個可完成的小步驟。",
    steps: ["先做一次 20 秒安靜重讀。", "只回答「濕地像什麼」。", "教師回覆一個可延伸的肯定句。"],
    feedback: "避免立即追問正確答案，先確認學生已經回到文本。"
  },
  tired: {
    label: "疲倦",
    title: "縮短閱讀量，保留一個目標",
    guide: "專注能量偏低時，系統建議暫時只處理一段文字，並用標記取代長句輸出。",
    steps: ["只讀目前反白段落。", "標出一個看得懂的詞。", "選擇一張提示卡後再繼續下一段。"],
    feedback: "把任務切成 3 分鐘內可完成的動作，避免一次交付整篇摘要。"
  }
};

const tagAdvice = {
  "詞彙不熟": "補上核心詞的生活語義，例如把「蒸散」連到植物散熱。",
  "推論斷點": "改用因果句框架，引導學生填入原因與結果。",
  "注意力下滑": "縮短任務區間，只保留目前段落和一個標記動作。",
  "情緒壓力": "先降低正誤判斷，改成口頭重述或關鍵詞回應。",
  "時間估計失準": "把剩餘任務拆成三個可勾選的小步驟。"
};

const students = [
  {
    name: "林予安",
    emotion: "steady",
    focus: 68,
    progress: 25,
    tags: [],
    next: "請學生用一句話重述段落主旨。"
  },
  {
    name: "陳品睿",
    emotion: "confused",
    focus: 52,
    progress: 40,
    tags: ["推論斷點"],
    next: "提供因果句框架，協助補上連接詞。"
  },
  {
    name: "吳采庭",
    emotion: "anxious",
    focus: 46,
    progress: 20,
    tags: ["情緒壓力"],
    next: "先口頭重述，再回到文本圈詞。"
  },
  {
    name: "黃書禾",
    emotion: "steady",
    focus: 76,
    progress: 70,
    tags: ["詞彙不熟"],
    next: "補充詞義後挑戰第二個推論題。"
  },
  {
    name: "許恩齊",
    emotion: "tired",
    focus: 38,
    progress: 35,
    tags: ["注意力下滑"],
    next: "保留一段短任務，完成後再休息。"
  }
];

const state = {
  activeStudent: 0,
  activeSegment: 0,
  completedSegments: new Set(),
  emotion: "steady",
  focus: 68,
  tags: new Set()
};

const segmentCount = 3;
const emotionChoices = document.querySelectorAll("[data-emotion]");
const tagButtons = document.querySelectorAll("[data-tag]");
const readingLines = document.querySelectorAll("[data-segment]");
const focusSlider = document.querySelector("#focusSlider");
const focusValue = document.querySelector("#focusValue");
const progressValue = document.querySelector("#progressValue");
const progressDial = document.querySelector(".progress-dial");
const guideTitle = document.querySelector("#guide-title");
const guideText = document.querySelector("#guideText");
const microSteps = document.querySelector("#microSteps");
const feedbackText = document.querySelector("#feedbackText");
const stateChip = document.querySelector("#stateChip");
const studentList = document.querySelector("#studentList");
const reportStudent = document.querySelector("#reportStudent");
const reportProgress = document.querySelector("#reportProgress");
const reportTags = document.querySelector("#reportTags");
const reportNext = document.querySelector("#reportNext");
const steadyCount = document.querySelector("#steadyCount");
const watchCount = document.querySelector("#watchCount");
const completeSegmentBtn = document.querySelector("#completeSegmentBtn");
const markStuckBtn = document.querySelector("#markStuckBtn");

function getProgress() {
  const base = Math.round((state.completedSegments.size / segmentCount) * 100);
  return Math.max(25, base);
}

function syncPrimaryStudent() {
  const student = students[0];
  student.emotion = state.emotion;
  student.focus = state.focus;
  student.progress = getProgress();
  student.tags = [...state.tags];
  student.next = getNextAction();
}

function getNextAction() {
  if (state.tags.has("推論斷點")) {
    return "用「因為...所以...」重組目前段落。";
  }

  if (state.tags.has("情緒壓力") || state.emotion === "anxious") {
    return "先完成 20 秒重讀，再口頭說出一個關鍵詞。";
  }

  if (state.focus < 45 || state.emotion === "tired") {
    return "縮短到單段任務，完成一個標記即可。";
  }

  if (state.tags.has("詞彙不熟")) {
    return "補上核心詞語義後，再判斷作者的因果關係。";
  }

  return "請學生用一句話重述段落主旨。";
}

function getCombinedFeedback(baseFeedback) {
  const selectedTags = [...state.tags];

  if (selectedTags.length === 0) {
    return baseFeedback;
  }

  const firstTag = selectedTags[0];
  return `${baseFeedback} 目前優先處理「${firstTag}」：${tagAdvice[firstTag]}`;
}

function updateGuide() {
  const copy = emotionCopy[state.emotion];
  const lowFocus = state.focus < 45;
  guideTitle.textContent = lowFocus ? "先縮短任務，再恢復理解" : copy.title;
  guideText.textContent = lowFocus
    ? "專注度偏低，建議把閱讀範圍縮到目前段落，讓學生先完成一個可看見的標記動作。"
    : copy.guide;
  microSteps.replaceChildren();

  const steps = lowFocus
    ? ["只看反白段落。", "選一個看得懂的詞。", "完成後再決定是否往下一段。"]
    : copy.steps;

  steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    microSteps.append(item);
  });

  feedbackText.textContent = getCombinedFeedback(copy.feedback);
  stateChip.textContent = `${copy.label} · ${state.focus}%`;
}

function updateReading() {
  readingLines.forEach((line) => {
    const segment = Number(line.dataset.segment);
    line.classList.toggle("is-active", segment === state.activeSegment);
    line.classList.toggle("is-complete", state.completedSegments.has(segment));
  });

  const progress = getProgress();
  progressValue.textContent = `${progress}%`;
  progressDial.style.setProperty("--progress-angle", `${progress * 3.6}deg`);
}

function renderStudents() {
  syncPrimaryStudent();
  studentList.replaceChildren();

  students.forEach((student, index) => {
    const copy = emotionCopy[student.emotion];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "student-card";
    button.classList.toggle("is-selected", index === state.activeStudent);
    button.dataset.studentIndex = index;

    const tags = student.tags.length ? student.tags.join("、") : "未標記";
    button.innerHTML = `
      <strong>${student.name}</strong>
      <span class="student-meta">
        <span>${copy.label}</span>
        <span>專注 ${student.focus}%</span>
        <span>${tags}</span>
      </span>
      <span class="mini-bar" aria-label="完成度 ${student.progress}%">
        <span style="--bar: ${student.progress}%"></span>
      </span>
    `;

    button.addEventListener("click", () => {
      state.activeStudent = index;
      renderStudents();
      updateReport();
    });

    studentList.append(button);
  });

  const steady = students.filter((student) => student.emotion === "steady" && student.focus >= 55).length;
  steadyCount.textContent = String(steady);
  watchCount.textContent = String(students.length - steady);
}

function updateReport() {
  const student = students[state.activeStudent];
  reportStudent.textContent = student.name;
  reportProgress.textContent = `${student.progress}%`;
  reportTags.textContent = student.tags.length ? student.tags.join("、") : "尚未標記";
  reportNext.textContent = student.next;
}

function renderAll() {
  updateReading();
  updateGuide();
  renderStudents();
  updateReport();
}

emotionChoices.forEach((button) => {
  button.addEventListener("click", () => {
    state.emotion = button.dataset.emotion;
    emotionChoices.forEach((choice) => choice.classList.toggle("is-selected", choice === button));

    if (state.emotion === "confused") {
      state.tags.add("推論斷點");
    }

    if (state.emotion === "anxious") {
      state.tags.add("情緒壓力");
    }

    renderTags();
    renderAll();
  });
});

function renderTags() {
  tagButtons.forEach((button) => {
    button.classList.toggle("is-selected", state.tags.has(button.dataset.tag));
  });
}

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tag = button.dataset.tag;

    if (state.tags.has(tag)) {
      state.tags.delete(tag);
    } else {
      state.tags.add(tag);
    }

    renderTags();
    renderAll();
  });
});

readingLines.forEach((line) => {
  const selectLine = () => {
    state.activeSegment = Number(line.dataset.segment);
    updateReading();
    updateGuide();
  };

  line.addEventListener("click", selectLine);
  line.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLine();
    }
  });
});

focusSlider.addEventListener("input", () => {
  state.focus = Number(focusSlider.value);
  focusValue.textContent = `${state.focus}%`;

  if (state.focus < 45) {
    state.tags.add("注意力下滑");
  } else if (state.focus > 60) {
    state.tags.delete("注意力下滑");
  }

  renderTags();
  renderAll();
});

completeSegmentBtn.addEventListener("click", () => {
  state.completedSegments.add(state.activeSegment);

  if (state.activeSegment < segmentCount - 1) {
    state.activeSegment += 1;
  }

  renderAll();
});

markStuckBtn.addEventListener("click", () => {
  state.tags.add("推論斷點");
  state.emotion = "confused";
  emotionChoices.forEach((choice) => {
    choice.classList.toggle("is-selected", choice.dataset.emotion === "confused");
  });
  renderTags();
  renderAll();
});

renderTags();
renderAll();

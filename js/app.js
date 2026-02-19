/**
 * JSTQB TM試験対策アプリ - メインロジック
 * 4択形式（A, B, C, D）のみ対応
 */

(function () {
  'use strict';

  const OPTION_KEYS = ['A', 'B', 'C', 'D']; // 4択固定

  const STORAGE_KEY_WRONG = 'jstqb-tm-wrong';
  const STORAGE_KEY_FILTER = 'jstqb-tm-filter';
  const STORAGE_KEY_KLEVEL = 'jstqb-tm-klevel';

  let questions = [];
  let filteredQuestions = [];
  let currentIndex = 0;
  let answered = false;
  let sessionCorrect = 0;
  let sessionWrong = 0;

  const elements = {
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    chapterFilter: document.getElementById('chapterFilter'),
    kLevelFilter: document.getElementById('kLevelFilter'),
    randomOrder: document.getElementById('randomOrder'),
    wrongOnly: document.getElementById('wrongOnly'),
    questionSection: document.getElementById('questionSection'),
    completeSection: document.getElementById('completeSection'),
    metaInfo: document.getElementById('metaInfo'),
    questionText: document.getElementById('questionText'),
    options: document.getElementById('options'),
    result: document.getElementById('result'),
    explanation: document.getElementById('explanation'),
    btnNext: document.getElementById('btnNext'),
    completeMessage: document.getElementById('completeMessage'),
    completeStats: document.getElementById('completeStats'),
    btnRestart: document.getElementById('btnRestart'),
    btnRetryWrong: document.getElementById('btnRetryWrong'),
    btnClearWrong: document.getElementById('btnClearWrong')
  };

  function getWrongAnswers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WRONG);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveWrongAnswer(id) {
    const wrong = getWrongAnswers();
    if (!wrong.includes(id)) {
      wrong.push(id);
      localStorage.setItem(STORAGE_KEY_WRONG, JSON.stringify(wrong));
    }
  }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getChapters() {
    return [...new Set(questions.map(q => q.chapter))].sort();
  }

  function getKLevels() {
    return [...new Set(questions.map(q => q.kLevel))].sort();
  }

  function countByFilter(baseQuestions, key, value) {
    return baseQuestions.filter(q => q[key] === value).length;
  }

  function buildFilterOptions(selectEl, key, values, currentValue, baseQuestions, totalCount) {
    selectEl.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = `すべて（${totalCount}問）`;
    selectEl.appendChild(allOpt);

    values.forEach(val => {
      const count = countByFilter(baseQuestions, key, val);
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = `${val}（${count}問）`;
      selectEl.appendChild(opt);
    });

    if (currentValue && values.includes(currentValue)) {
      selectEl.value = currentValue;
    }
  }

  function updateFilterCounts() {
    try {
      const selectedChapter = elements.chapterFilter.value;
      const selectedKLevel = elements.kLevelFilter.value;

      let baseForChapter = [...questions];
      if (selectedKLevel) {
        baseForChapter = baseForChapter.filter(q => q.kLevel === selectedKLevel);
      }
      if (elements.wrongOnly.checked) {
        const wrong = getWrongAnswers();
        baseForChapter = baseForChapter.filter(q => wrong.includes(q.id));
      }
      buildFilterOptions(elements.chapterFilter, 'chapter', getChapters(), selectedChapter, baseForChapter, baseForChapter.length);

      let baseForKLevel = [...questions];
      if (selectedChapter) {
        baseForKLevel = baseForKLevel.filter(q => q.chapter === selectedChapter);
      }
      if (elements.wrongOnly.checked) {
        const wrong = getWrongAnswers();
        baseForKLevel = baseForKLevel.filter(q => wrong.includes(q.id));
      }
      buildFilterOptions(elements.kLevelFilter, 'kLevel', getKLevels(), selectedKLevel, baseForKLevel, baseForKLevel.length);
    } catch (e) {
      console.error('フィルタカウント更新エラー:', e);
    }
  }

  function applyFilters() {
    let result = [...questions];

    const chapter = elements.chapterFilter.value;
    if (chapter) {
      result = result.filter(q => q.chapter === chapter);
    }

    const kLevel = elements.kLevelFilter.value;
    if (kLevel) {
      result = result.filter(q => q.kLevel === kLevel);
    }

    if (elements.wrongOnly.checked) {
      const wrong = getWrongAnswers();
      result = result.filter(q => wrong.includes(q.id));
    }

    if (elements.randomOrder.checked) {
      result = shuffleArray(result);
    }

    filteredQuestions = result;
    updateFilterCounts();
  }

  function updateProgress() {
    const total = filteredQuestions.length;
    const current = currentIndex + 1;
    const percent = total > 0 ? (current / total) * 100 : 0;

    elements.progressBar.style.setProperty('--progress', percent + '%');
    elements.progressText.textContent = `${current} / ${total}`;
  }

  function renderOptions(q) {
    elements.options.innerHTML = '';
    const opts = q.options || {};

    OPTION_KEYS.forEach(key => {
      const text = opts[key];
      if (text == null) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.dataset.answer = key;
      btn.innerHTML = `<span class="option-label">${key}.</span><span>${escapeHtml(text)}</span>`;
      btn.addEventListener('click', () => handleAnswer(key, q, btn));
      elements.options.appendChild(btn);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function handleAnswer(selected, q, clickedBtn) {
    if (answered) return;
    answered = true;

    const correct = selected === q.answer;
    if (correct) {
      sessionCorrect++;
    } else {
      sessionWrong++;
      saveWrongAnswer(q.id);
    }

    OPTION_KEYS.forEach(key => {
      const btn = elements.options.querySelector(`[data-answer="${key}"]`);
      if (!btn) return;
      btn.disabled = true;
      if (key === q.answer) {
        btn.classList.add('correct');
      } else if (key === selected && !correct) {
        btn.classList.add('incorrect');
      }
    });

    elements.result.className = 'result ' + (correct ? 'correct' : 'incorrect');
    elements.result.textContent = correct ? '正解です！' : `不正解です。正解は ${q.answer} です。`;
    elements.result.hidden = false;

    elements.explanation.textContent = q.explanation || '';
    elements.explanation.hidden = !q.explanation;

    elements.btnNext.disabled = false;
  }

  function renderQuestion() {
    if (filteredQuestions.length === 0) {
      elements.questionSection.hidden = true;
      elements.completeSection.hidden = false;
      elements.completeStats.hidden = true;
      elements.btnRetryWrong.hidden = true;
      elements.completeMessage.textContent = questions.length === 0
        ? '問題データを読み込めませんでした。'
        : '表示する問題がありません。フィルタを変更してください。';
      return;
    }

    if (currentIndex >= filteredQuestions.length) {
      elements.questionSection.hidden = true;
      elements.completeSection.hidden = false;
      const total = filteredQuestions.length;
      const wrong = getWrongAnswers();
      const wrongCount = filteredQuestions.filter(q => wrong.includes(q.id)).length;

      elements.completeStats.innerHTML = `正解: ${sessionCorrect}問 / 不正解: ${sessionWrong}問（全${total}問）`;
      elements.completeStats.hidden = false;
      elements.completeMessage.textContent = wrongCount > 0
        ? '「間違えた問題を再挑戦」または「間違えた問題のみ」で苦手を克服しましょう。'
        : '全問正解です！おめでとうございます。';
      elements.btnRetryWrong.hidden = wrongCount === 0;
      return;
    }

    elements.questionSection.hidden = false;
    elements.completeSection.hidden = true;

    const q = filteredQuestions[currentIndex];
    answered = false;

    elements.metaInfo.textContent = `${q.id} | ${q.chapter} | ${q.kLevel} | シラバス: ${q.syllabusRef}`;
    const scenario = (q.scenario || '').trim();
    const question = (q.question || '').trim();
    const combined = scenario
      ? scenario + (scenario.endsWith('。') ? '' : '。') + '\n\n' + 'この状況において、' + question
      : question;
    elements.questionText.textContent = combined;
    elements.result.hidden = true;
    elements.explanation.hidden = true;
    elements.btnNext.disabled = true;

    renderOptions(q);
    updateProgress();
  }

  function nextQuestion() {
    currentIndex++;
    renderQuestion();
  }

  function initFilters() {
    updateFilterCounts();
    try {
      const savedChapter = localStorage.getItem(STORAGE_KEY_FILTER);
      if (savedChapter && getChapters().includes(savedChapter)) {
        elements.chapterFilter.value = savedChapter;
      }
      const savedK = localStorage.getItem(STORAGE_KEY_KLEVEL);
      if (savedK && getKLevels().includes(savedK)) {
        elements.kLevelFilter.value = savedK;
      }
    } catch (e) {
      console.error('フィルタ初期化エラー:', e);
    }
    updateFilterCounts();
  }

  function initEventListeners() {
    elements.chapterFilter.addEventListener('change', () => {
      try {
        localStorage.setItem(STORAGE_KEY_FILTER, elements.chapterFilter.value);
      } catch (e) {}
      startQuiz();
    });

    elements.kLevelFilter.addEventListener('change', () => {
      try {
        localStorage.setItem(STORAGE_KEY_KLEVEL, elements.kLevelFilter.value);
      } catch (e) {}
      startQuiz();
    });

    elements.randomOrder.addEventListener('change', startQuiz);
    elements.wrongOnly.addEventListener('change', startQuiz);

    elements.btnNext.addEventListener('click', nextQuestion);
    elements.btnRestart.addEventListener('click', startQuiz);
    elements.btnRetryWrong.addEventListener('click', retryWrongOnly);
    elements.btnClearWrong.addEventListener('click', clearWrongAnswers);
  }

  function startQuiz() {
    applyFilters();
    currentIndex = 0;
    sessionCorrect = 0;
    sessionWrong = 0;
    renderQuestion();
  }

  function retryWrongOnly() {
    elements.wrongOnly.checked = true;
    startQuiz();
  }

  function clearWrongAnswers() {
    try {
      localStorage.removeItem(STORAGE_KEY_WRONG);
      if (elements.wrongOnly.checked) {
        elements.wrongOnly.checked = false;
      }
      startQuiz();
    } catch (e) {}
  }

  function init() {
    if (typeof QUESTIONS !== 'undefined') {
      questions = QUESTIONS;
    } else {
      questions = [];
    }

    initFilters();
    initEventListeners();
    startQuiz();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

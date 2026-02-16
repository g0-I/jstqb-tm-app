/**
 * JSTQB TM問題集 - Kindle用書籍HTML生成スクリプト
 * 実行: node scripts/generate-book.js
 */
const fs = require('fs');
const path = require('path');

// questions.jsを読み込み（CommonJS形式でエクスポートされている前提）
const questionsPath = path.join(__dirname, '../js/questions.js');
const questionsModule = require('../js/questions.js');
const QUESTIONS = questionsModule;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateToc(questions) {
  const byChapter = {};
  questions.forEach(q => {
    if (!byChapter[q.chapter]) byChapter[q.chapter] = [];
    byChapter[q.chapter].push(q);
  });

  let html = '<nav class="toc"><h2>問題一覧</h2><ul>';
  Object.keys(byChapter).sort().forEach(chapter => {
    html += `<li><strong>${escapeHtml(chapter)}</strong><ul>`;
    byChapter[chapter].forEach(q => {
      html += `<li><a href="#q-${q.id}">${q.id} ${escapeHtml(q.question.substring(0, 40))}...</a></li>`;
    });
    html += '</ul></li>';
  });
  html += '</ul></nav>';
  return html;
}

function generateProblemsSection(questions) {
  const byChapter = {};
  questions.forEach(q => {
    if (!byChapter[q.chapter]) byChapter[q.chapter] = [];
    byChapter[q.chapter].push(q);
  });

  let html = '<main class="problems"><h1>第1部 問題本文</h1>';
  Object.keys(byChapter).sort().forEach(chapter => {
    html += `<section class="chapter"><h2>${escapeHtml(chapter)}</h2>`;
    byChapter[chapter].forEach((q, i) => {
      html += `
<div class="problem" id="q-${q.id}">
  <div class="meta">${q.id} | ${q.kLevel} | シラバス: ${q.syllabusRef}</div>
  <div class="scenario">${escapeHtml(q.scenario)}</div>
  <p class="question">${escapeHtml(q.question)}</p>
  <ul class="options">
    <li>A. ${escapeHtml(q.options.A)}</li>
    <li>B. ${escapeHtml(q.options.B)}</li>
    <li>C. ${escapeHtml(q.options.C)}</li>
    <li>D. ${escapeHtml(q.options.D)}</li>
  </ul>
</div>`;
    });
    html += '</section>';
  });
  html += '</main>';
  return html;
}

function generateAnswersSection(questions) {
  let html = '<main class="answers"><h1>第2部 解答と解説</h1>';
  questions.forEach(q => {
    const exp = (q.explanation || '').replace(/\n/g, '<br>');
    html += `
<div class="answer" id="a-${q.id}">
  <h3>${q.id}</h3>
  <p class="correct-answer"><strong>正解: ${q.answer}</strong></p>
  <div class="explanation">${exp}</div>
</div>`;
  });
  html += '</main>';
  return html;
}

function generateFullHtml() {
  const toc = generateToc(QUESTIONS);
  const problems = generateProblemsSection(QUESTIONS);
  const answers = generateAnswersSection(QUESTIONS);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSTQB Advanced Level テストマネジメント 試験対策問題集</title>
  <style>
    body { font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; line-height: 1.7; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 1.5rem; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.2rem; margin-top: 2rem; }
    h3 { font-size: 1rem; color: #2563eb; }
    .problem { margin: 2rem 0; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
    .scenario { background: #f8fafc; padding: 1rem; border-left: 4px solid #2563eb; margin: 1rem 0; }
    .options { list-style: none; padding-left: 0; }
    .options li { margin: 0.5rem 0; padding: 0.5rem; }
    .meta { font-size: 0.8rem; color: #64748b; }
    .toc { margin: 2rem 0; padding: 1rem; background: #f8fafc; }
    .toc ul { list-style: none; padding-left: 1rem; }
    .answer { margin: 2rem 0; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
    .correct-answer { color: #059669; }
    .explanation { margin-top: 1rem; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <header>
    <h1>JSTQB Advanced Level テストマネジメント 試験対策問題集</h1>
    <p>シラバス Version 3.0 準拠</p>
    <p>全${QUESTIONS.length}問</p>
  </header>

  <section class="intro">
    <h2>はじめに</h2>
    <p>本書は、JSTQB Advanced Level テストマネジメント資格試験の対策を目的とした問題集です。ISTQB®テスト技術者資格制度 Advanced Level シラバス テストマネジメント Version 3.0 に準拠しています。</p>
    <p>各問題は4択形式で、シナリオに基づく実践的な内容となっています。解答と解説は第2部にまとめてあります。</p>
    <p><strong>推奨学習方法</strong></p>
    <ul>
      <li>シラバスを一読する</li>
      <li>シラバスの学習目標と本書の問題を比較する</li>
      <li>間違えた問題はシラバスに戻って復習する</li>
    </ul>
  </section>

  ${toc}

  <div class="page-break"></div>
  ${problems}

  <div class="page-break"></div>
  ${answers}

  <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #64748b;">
    <p>JSTQB® / ISTQB® は International Software Testing Qualifications Board の登録商標です。</p>
    <p>本書はJSTQB®から認定を受けた書籍ではありません。</p>
  </footer>
</body>
</html>`;
}

const html = generateFullHtml();
const outDir = path.join(__dirname, '../book');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'JSTQB-TM-問題集.html'), html, 'utf8');

// questions.json も同期
fs.writeFileSync(path.join(__dirname, '../data/questions.json'), JSON.stringify(QUESTIONS, null, 2), 'utf8');

console.log(`Generated: book/JSTQB-TM-問題集.html (${QUESTIONS.length} questions)`);
console.log('Synced: data/questions.json');

/**
 * data/questions.json の内容を js/questions.js に同期する。
 * file:// で開く場合や JSON 読み込みに失敗した場合のフォールバック用。
 * 実行: node scripts/sync-questions-js.js
 */
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/questions.json');
const jsPath = path.join(__dirname, '../js/questions.js');

const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const content = `/**
 * JSTQB TM試験対策 - 問題データ（4択形式）
 * data/questions.json と同期すること。更新時は node scripts/sync-questions-js.js を実行。
 */
const QUESTIONS = ${JSON.stringify(questions, null, 2)};
`;
fs.writeFileSync(jsPath, content, 'utf8');
console.log(`Synced: js/questions.js (${questions.length} questions)`);

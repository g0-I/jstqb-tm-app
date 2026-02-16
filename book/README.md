# JSTQB TM試験対策問題集 - Kindle販売用

## 概要

本フォルダには、JSTQB Advanced Level テストマネジメント試験対策問題集のKindle等での販売用ドキュメントが含まれます。

## ファイル

- **JSTQB-TM-問題集.html** - メインの問題集（全77問）
  - 第1部: 問題本文（シナリオ・問題・4択選択肢）
  - 第2部: 解答と解説

## Kindle出版の手順

### 1. HTMLから変換

KDP（Kindle Direct Publishing）では以下の形式が利用可能です：

- **DOCX**: HTMLをWordで開き、DOCX形式で保存
- **EPUB**: Calibre等のツールでHTML→EPUB変換
- **PDF**: ブラウザでHTMLを開き、印刷→PDF保存

### 2. 推奨変換方法

```
# CalibreでEPUBに変換（Kindle形式に最適）
1. Calibreをインストール
2. JSTQB-TM-問題集.html を追加
3. 変換 → EPUB形式で出力
4. KDPにEPUBをアップロード
```

### 3. 書籍の再生成

問題を追加・修正した場合は、以下で再生成してください：

```bash
cd /Users/g0/Documents/JSTQB/jstqb-tm-app
node scripts/generate-book.js
```

## 構成

- はじめに
- 問題一覧（目次）
- 第1部 問題本文（章ごと）
- 第2部 解答と解説

## 注意事項

- 本書はJSTQB®から認定を受けた書籍ではありません
- シラバス Version 3.0 に準拠
- 販売前に著作権・商標の確認を行ってください

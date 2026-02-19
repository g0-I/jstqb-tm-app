# GitHub Pages デプロイ手順

## 1. GitHub認証（初回のみ）

ターミナルで以下を実行し、表示されたURLをブラウザで開いて認証を完了してください。

```bash
gh auth login -h github.com -p https -w
```

- 表示されたワンタイムコードをコピー
- ブラウザで https://github.com/login/device を開く
- コードを入力して認証

## 2. デプロイ実行

```bash
cd /Users/g0/Documents/JSTQB/jstqb-tm-app
./scripts/deploy-gh-pages.sh
```

これで以下が自動実行されます：
- GitHubリポジトリ `jstqb-tm-app` の作成
- コードのプッシュ
- GitHub Pagesの有効化

## 3. アクセスURL

数分後、以下のURLでスマートフォンからもアクセスできます：

```
https://<あなたのGitHubユーザー名>.github.io/jstqb-tm-app/
```

## Pagesが有効化されない場合

スクリプトで自動設定できない場合、手動で有効化してください：

1. https://github.com/<ユーザー名>/jstqb-tm-app/settings/pages を開く
2. **Build and deployment** → **Source**: Deploy from a branch
3. **Branch**: main / **(root)**
4. Save

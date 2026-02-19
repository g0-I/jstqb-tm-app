#!/bin/bash
# GitHub Pages デプロイスクリプト
# 事前に gh auth login で認証が必要です

set -e
cd "$(dirname "$0")/.."

echo "=== GitHub Pages デプロイ ==="

# GitHub CLIで認証確認
if ! gh auth status &>/dev/null; then
  echo "エラー: GitHubにログインしていません。"
  echo "以下のコマンドでログインしてください:"
  echo "  gh auth login"
  exit 1
fi

OWNER=$(gh api user -q .login)
REPO_NAME="jstqb-tm-app"

# リモートが未設定の場合、リポジトリを作成
if ! git remote get-url origin &>/dev/null; then
  echo "GitHubリポジトリを作成しています..."
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  echo "リポジトリ作成完了: https://github.com/$OWNER/$REPO_NAME"
else
  echo "変更をプッシュしています..."
  git push -u origin main
fi

# GitHub Pagesを有効化（API経由）
echo "GitHub Pagesを設定しています..."
if gh api "repos/$OWNER/$REPO_NAME/pages" -X POST -f source='{"branch":"main","path":"/"}' 2>/dev/null; then
  echo "Pages設定完了"
else
  echo "※ APIでPagesを有効化できませんでした。"
  echo "  以下のURLから手動で有効化してください:"
  echo "  https://github.com/$OWNER/$REPO_NAME/settings/pages"
  echo "  → Source: Deploy from a branch"
  echo "  → Branch: main / (root)"
fi

echo ""
echo "=== デプロイ完了 ==="
echo "数分後に以下のURLでアクセスできます:"
echo "  https://$OWNER.github.io/$REPO_NAME/"
echo ""

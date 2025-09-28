# Bar Tab Roulette (BTR)

バーやレストランでの支払い担当を決めるルーレットゲーム。栓抜きを回転させて運命の人を決定！

## 技術スタック

- **Framework**: Next.js 15.5.3 with App Router & Turbopack
- **Package Manager**: pnpm 10.12.4 (推奨)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Design**: モバイルファーストレスポンシブ設計

## 開発環境セットアップ

### 必要条件
- Node.js 18+ 
- pnpm 8+ (推奨)

### インストール

```bash
# 依存関係のインストール（推奨）
pnpm install

# または npm の場合
npm install
```

### 開発サーバー起動

```bash
# pnpm（推奨）
pnpm run dev

# その他のパッケージマネージャー
npm run dev
yarn dev
bun dev
```

## 利用可能なスクリプト

```bash
pnpm run dev      # 開発サーバー起動（Turbopack有効）
pnpm run build    # プロダクションビルド
pnpm run start    # プロダクションサーバー起動
pnpm run lint     # ESLint実行
pnpm run clean    # キャッシュクリア
pnpm run check    # lint + build の組み合わせ
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# you payゲーム

### プロジェクトのゴール
*   **基本機能:** 参加者の名前を入力すると、人数に応じたルーレット盤が生成され、スワイプで回転させて誰が当たりかを決める。
*   **技術スタック:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion (アニメーションとジェスチャー用)
*   **デザイン:** スマートフォンファーストで、PCでも見やすいレスポンシブ対応。

---

### 1. プロジェクトのセットアップ

まず、Next.jsプロジェクトを作成し、アニメーション用のライブラリ `framer-motion` をインストールします。

```bash
# Next.jsプロジェクトを作成 (TypeScript, Tailwind CSS, ESLintを選択)
npx create-next-app@latest spin-the-opener

# プロジェクトディレクトリに移動
cd spin-the-opener

# Framer Motionをインストール
npm install framer-motion
```

---

### 2. コンポーネントの設計

アプリケーションをいくつかのコンポーネントに分割して考えます。

*   `app/page.tsx`: アプリケーションのメインページ。状態管理と各コンポーネントの配置を行います。
*   `components/Roulette.tsx`: ルーレット盤とスピナー（回転する矢印）をまとめたコンポーネント。
*   `components/NameForm.tsx`: 参加者の名前を追加・削除するためのフォーム。
*   `components/ResultModal.tsx`: 結果を表示するためのモーダルウィンドウ。

---

### 3. ルーレット盤の実装 (`components/Roulette.tsx`)

ここがこのアプリケーションの心臓部です。

#### 3-1. ルーレット盤の描画 (円グラフ)

CSSの `conic-gradient` を使うと、動的に円グラフを生成するのが非常に簡単です。

#### 3-2. スピナーの回転とジェスチャー

`framer-motion` を使って、スワイプジェスチャーを検知し、リアルな減速アニメーションを実装します。

#### 3-3. 結果の判定

アニメーション完了後に、スピナーの最終的な角度から誰が当たったかを計算します。

**`components/Roulette.tsx` のコード例:**

```tsx
'use client';

import { useState } from 'react';
import { motion, PanInfo, useAnimate } from 'framer-motion';

// 参加者の型定義
interface Participant {
  name: string;
  // オプション機能: 割合
  weight: number; 
}

interface RouletteProps {
  participants: Participant[];
  onSpinEnd: (winner: Participant) => void;
}

// ランダムな色の配列
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];

export const Roulette = ({ participants, onSpinEnd }: RouletteProps) => {
  const [scope, animate] = useAnimate();
  const [isSpinning, setIsSpinning] = useState(false);

  // 1. ルーレット盤の背景を生成 (conic-gradient)
  const totalWeight = participants.reduce((acc, p) => acc + p.weight, 0);
  let cumulativeWeight = 0;
  const gradientParts = participants.map((p, i) => {
    const startAngle = (cumulativeWeight / totalWeight) * 360;
    cumulativeWeight += p.weight;
    const endAngle = (cumulativeWeight / totalWeight) * 360;
    return `${COLORS[i % COLORS.length]} ${startAngle}deg ${endAngle}deg`;
  });
  const conicBackground = `conic-gradient(${gradientParts.join(', ')})`;

  // 2. スワイプで回転させる処理
  const handlePanEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isSpinning || participants.length === 0) return;
    setIsSpinning(true);

    // スワイプの速度に応じて回転量を変える
    const velocity = info.velocity.y;
    const power = Math.abs(velocity) * 0.05 + Math.random() * 2000 + 1000;
    
    const { rotate } = getComputedStyle(scope.current);
    const currentRotation = parseFloat(rotate) || 0;
    const targetRotation = currentRotation + power;

    await animate(
      scope.current,
      { rotate: targetRotation },
      { type: 'tween', ease: 'easeOut', duration: 4 }
    );
    
    // 3. 結果を判定
    const finalRotation = targetRotation % 360;
    const winner = getWinner(finalRotation);
    if (winner) {
      onSpinEnd(winner);
    }
    setIsSpinning(false);
  };

  const getWinner = (rotation: number): Participant | undefined => {
    const pointerAngle = 360 - rotation; // 矢印が上向きなので、盤面の角度は逆になる
    let currentAngle = 0;
    for (const participant of participants) {
      const angle = (participant.weight / totalWeight) * 360;
      if (pointerAngle >= currentAngle && pointerAngle < currentAngle + angle) {
        return participant;
      }
      currentAngle += angle;
    }
    return undefined; // フォールバック
  };

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      {/* ルーレット盤 */}
      <div
        className="w-full h-full rounded-full border-4 border-gray-800 shadow-xl transition-all"
        style={{ background: conicBackground }}
      >
        {/* 参加者の名前を配置 */}
        {participants.map((p, i) => {
          // ...三角関数を使って名前を円周上に配置するロジック...
          return <div key={i} className="absolute ...">{p.name}</div>;
        })}
      </div>
      
      {/* スピナー（栓抜き/矢印） */}
      <motion.div
        ref={scope}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onPanEnd={handlePanEnd}
      >
        <div className="w-4 h-48 bg-gray-700 rounded-t-full shadow-lg" style={{ clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }}>
          {/* 栓抜き風のデザイン */}
          <div className="w-16 h-16 rounded-full bg-gray-100 absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-700"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
```
> **補足:** 名前の配置は、各セクションの中心角度を計算し、`transform`と`rotate`, `translate`を組み合わせることで実現できます。

---

### 4. メインページと状態管理 (`app/page.tsx`)

`useState` を使って、参加者リストや当選者の状態を管理します。

```tsx
'use client';

import { useState } from 'react';
import { Roulette } from '@/components/Roulette';
// NameFormとResultModalをインポート

interface Participant {
  name: string;
  weight: number;
}

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([
    { name: 'Alice', weight: 1 },
    { name: 'Bob', weight: 1 },
    { name: 'Charlie', weight: 1 },
  ]);
  const [winner, setWinner] = useState<Participant | null>(null);

  const handleAddParticipant = (name: string) => {
    if (name.trim()) {
      setParticipants([...participants, { name: name.trim(), weight: 1 }]);
    }
  };

  const handleSpinEnd = (winner: Participant) => {
    // 結果表示のモーダルを開く
    setWinner(winner);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">
        Spin To See Who Pays
      </h1>
      
      <Roulette participants={participants} onSpinEnd={handleSpinEnd} />

      <div className="mt-8">
        {/* <NameForm onAdd={handleAddParticipant} /> */}
        {/* ここに参加者リストやフォームを配置 */}
      </div>

      {winner && (
        // <ResultModal winner={winner} onClose={() => setWinner(null)} />
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-xl">The winner is...</p>
            <p className="text-5xl font-bold my-4 text-red-500">{winner.name}</p>
            <button 
              onClick={() => setWinner(null)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
```

---

### 5. オプション機能の実装案

基本機能が完成したら、以下のオプションを追加していくとさらに面白くなります。

*   **強さ・スピード調整:**
    `handlePanEnd`内の`power`の計算式に、ユーザーが設定した「強さ」の係数を掛け合わせます。UIにスライダーを追加すると良いでしょう。

*   **名前の横に割合を調整可能:**
    `NameForm`コンポーネントに、各参加者の割合（weight）を変更できる`input[type="number"]`を追加します。`participants` stateの型に`weight`プロパティを追加し、ルーレット盤の角度計算に反映させます（コード例には既に追加済み）。

*   **盤面の鏡面化や障害物:**
    *   **鏡面化（滑りやすい）:** `framer-motion`の`animate`関数の`duration`を長くし、`ease`をより緩やかなもの（例: `cubic-bezier(0, .6, .6, 1)`）に変更します。
    *   **摩擦（滑りにくい）:** `duration`を短くし、`ease`を急に止まるもの（例: `easeOut`の指数を高くする）に変更します。
    *   **障害物:** これは高度な実装になります。`GSAP`などのより細かい制御ができるライブラリを使い、特定の角度を通過するたびに回転速度を少し落とすような処理をタイムラインに追加することで表現できます。

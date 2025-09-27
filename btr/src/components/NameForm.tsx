'use client';

import { useState } from 'react';
import { Participant, PARTICIPANT_EMOJIS, PARTICIPANT_COLORS, MIN_PARTICIPANTS, MAX_PARTICIPANTS } from '@/types';

interface NameFormProps {
  participants: Participant[];
  onAddParticipant: (participant: Participant) => void;
  onRemoveParticipant: (id: string) => void;
  onResetAllParticipants: () => void;
  selectedPayer?: Participant | null;
}

export function NameForm({ participants, onAddParticipant, onRemoveParticipant, onResetAllParticipants, selectedPayer }: NameFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    if (participants.length >= MAX_PARTICIPANTS) {
      setError(`参加者は最大${MAX_PARTICIPANTS}人までです`);
      return;
    }

    // Simple color assignment: avoid any duplicate colors
    const getAvailableColor = () => {
      const usedColors = participants.map(p => p.color);
      
      // Find first unused color
      for (const color of PARTICIPANT_COLORS) {
        if (!usedColors.includes(color)) {
          return color;
        }
      }
      
      // Fallback: use modulo (shouldn't happen with 20 colors for max 10 participants)
      return PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length];
    };

    // Create new participant
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: name.trim(),
      emoji: PARTICIPANT_EMOJIS[participants.length % PARTICIPANT_EMOJIS.length],
      color: getAvailableColor(),
      weight: 1,
    };

    onAddParticipant(newParticipant);
    setName('');
    setError('');
  };

  const canStartGame = participants.length >= MIN_PARTICIPANTS;

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    onResetAllParticipants();
    setShowResetConfirm(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Add Participant Form */}
      {participants.length < MAX_PARTICIPANTS && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="参加者の名前を入力"
              className="flex-grow px-4 py-3 bg-amber-50 border-2 border-amber-800 rounded-lg focus:outline-none focus:border-amber-600 text-amber-900 placeholder-amber-700"
              maxLength={20}
            />
            <button
              type="submit"
              className="flex-shrink-0 w-12 h-12 bg-amber-800 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center text-xl"
              title={`参加者を追加 (${participants.length}/${MAX_PARTICIPANTS})`}
            >
              ➕
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </form>
      )}

      {/* Participants List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-100">
            参加者 ({participants.length}/{MAX_PARTICIPANTS})
          </h3>
          {participants.length > 0 && (
            <button
              onClick={handleResetClick}
              className="flex items-center space-x-1 px-2 py-1 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30 rounded transition-colors"
              title="参加者をリセット"
            >
              <span className="text-sm">🔄</span>
              <span className="text-xs">リセット</span>
            </button>
          )}
        </div>
        
        {participants.length === 0 ? (
          <p className="text-amber-300 text-center py-8 bg-amber-900/20 rounded-lg">
            参加者を追加してください
          </p>
        ) : (
          <div className="space-y-1">
            {participants.map((participant) => {
              const isSelectedToPay = selectedPayer?.id === participant.id;
              
              return (
                <div
                  key={participant.id}
                  className="flex items-center justify-between px-2 py-1 rounded-lg transition-all duration-200 border-4 shadow-xl"
                  style={{
                    backgroundColor: isSelectedToPay 
                      ? `${participant.color}80` // 50% opacity for selected payer
                      : `${participant.color}40`, // 25% opacity for normal
                    borderColor: isSelectedToPay 
                      ? '#FFFFFF' // white
                      : `${participant.color}40`, // same transparency as background when not selected
                    boxShadow: isSelectedToPay 
                      ? '0 25px 50px -12px rgba(255, 255, 255, 0.3)' // white shadow
                      : 'none'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">
                      {participant.emoji}
                    </span>
                    <span className={`font-medium transition-colors text-sm ${
                      isSelectedToPay ? 'text-amber-50' : 'text-amber-100'
                    }`}>
                      {participant.name}
                    </span>
                  </div>
                
                  <div className="flex items-center space-x-2">
                    {/* Finger pointer for selected payer */}
                    {isSelectedToPay && (
                      <span className="text-2xl animate-pulse">
                        👈
                      </span>
                    )}
                    <button
                      onClick={() => onRemoveParticipant(participant.id)}
                      className="p-1 bg-transparent hover:bg-red-600/20 rounded transition-colors text-lg"
                      title="参加者を退出させる"
                    >
                      👋
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Game Status */}
      {!canStartGame && participants.length > 0 && (
        <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <p className="text-yellow-200 text-sm text-center">
            ゲームを開始するには、あと{MIN_PARTICIPANTS - participants.length}人の参加者が必要です
          </p>
        </div>
      )}


      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-amber-900 border-2 border-amber-600 p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-amber-100 font-semibold text-lg mb-3">参加者をリセット</h3>
            <p className="text-amber-200 text-sm mb-6">
              本当に参加者リストをすべてクリアしますか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleResetCancel}
                className="flex-1 py-2 px-4 bg-amber-700 text-amber-100 rounded hover:bg-amber-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
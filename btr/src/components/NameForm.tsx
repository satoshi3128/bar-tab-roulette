'use client';

import { useState } from 'react';
import { Participant, PARTICIPANT_EMOJIS, PARTICIPANT_COLORS, MIN_PARTICIPANTS, MAX_PARTICIPANTS } from '@/types';
import { UI_MESSAGES, INPUT_CONSTRAINTS, VISUAL_THEME, LAYOUT } from '@/constants/roulette';

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
      setError(UI_MESSAGES.NAME_REQUIRED_ERROR);
      return;
    }

    if (participants.length >= MAX_PARTICIPANTS) {
      setError(UI_MESSAGES.MAX_PARTICIPANTS_ERROR.replace('{MAX}', MAX_PARTICIPANTS.toString()));
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
              placeholder={UI_MESSAGES.NAME_INPUT_PLACEHOLDER}
              className="flex-grow px-4 py-3 bg-amber-50 border-2 border-amber-800 rounded-lg focus:outline-none focus:border-amber-600 text-amber-900 placeholder-amber-700"
              maxLength={INPUT_CONSTRAINTS.MAX_NAME_LENGTH}
            />
            <button
              type="submit"
              className="flex-shrink-0 w-12 h-12 bg-amber-800 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center text-xl"
              title={UI_MESSAGES.ADD_PARTICIPANT_TOOLTIP.replace('{CURRENT}', participants.length.toString()).replace('{MAX}', MAX_PARTICIPANTS.toString())}
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
            {UI_MESSAGES.PARTICIPANTS_LABEL} ({participants.length}/{MAX_PARTICIPANTS})
          </h3>
          {participants.length > 0 && (
            <button
              onClick={handleResetClick}
              className="flex items-center space-x-1 px-2 py-1 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30 rounded transition-colors"
              title={UI_MESSAGES.RESET_PARTICIPANTS_TOOLTIP}
            >
              <span className="text-sm">🔄</span>
              <span className="text-xs">{UI_MESSAGES.RESET_BUTTON}</span>
            </button>
          )}
        </div>
        
        {participants.length === 0 ? (
          <p className="text-amber-300 text-center py-8 bg-amber-900/20 rounded-lg">
            {UI_MESSAGES.ADD_PARTICIPANTS_PROMPT}
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
                      ? VISUAL_THEME.WHITE_BORDER // white
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
                      title={UI_MESSAGES.REMOVE_PARTICIPANT_TOOLTIP}
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
            {UI_MESSAGES.NEED_MORE_PARTICIPANTS.replace('{COUNT}', (MIN_PARTICIPANTS - participants.length).toString())}
          </p>
        </div>
      )}


      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            backgroundColor: VISUAL_THEME.MODAL_OVERLAY,
            zIndex: LAYOUT.Z_INDEX.MODAL 
          }}
        >
          <div className="bg-amber-900 border-2 border-amber-600 p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-amber-100 font-semibold text-lg mb-3">{UI_MESSAGES.RESET_CONFIRMATION_TITLE}</h3>
            <p className="text-amber-200 text-sm mb-6">
              {UI_MESSAGES.RESET_CONFIRMATION_MESSAGE}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleResetCancel}
                className="flex-1 py-2 px-4 bg-amber-700 text-amber-100 rounded hover:bg-amber-600 transition-colors"
              >
                {UI_MESSAGES.CANCEL_BUTTON}
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                {UI_MESSAGES.CONFIRM_RESET_BUTTON}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Participant } from '@/types';
import { UI_MESSAGES } from '@/constants/roulette';
import { NameForm } from '@/components/NameForm';
import { Roulette } from '@/components/Roulette';
import { ResultModal } from '@/components/ResultModal';

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedPayer, setSelectedPayer] = useState<Participant | null>(null);
  const [modalPayer, setModalPayer] = useState<Participant | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);

  const handleAddParticipant = (participant: Participant) => {
    setParticipants([...participants, participant]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleResetAllParticipants = () => {
    setParticipants([]);
  };

  const handlePayerSelected = (payer: Participant) => {
    setModalPayer(payer);
  };

  const handleCloseModal = () => {
    setModalPayer(null);
  };

  const handleCurrentPayerChange = (payer: Participant | null) => {
    setSelectedPayer(payer);
  };

  const handleHintTextChange = (text: string | null) => {
    setHintText(text);
  };


  return (
    <div className="min-h-screen relative wood-texture">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl">🍺</div>
        <div className="absolute top-20 right-20 text-4xl">🥃</div>
        <div className="absolute bottom-20 left-20 text-5xl">🍷</div>
        <div className="absolute bottom-10 right-10 text-4xl">🍻</div>
      </div>

      <main className="relative z-10 flex flex-col items-center min-h-screen p-4 pt-20 space-y-4">
        {/* Header */}
        <header className="text-center space-y-3 warm-glow">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-100 drop-shadow-lg">
            {UI_MESSAGES.PAGE_TITLE}
          </h1>
          <p className="text-base md:text-lg text-amber-200 max-w-xl mx-auto">
            {UI_MESSAGES.PAGE_SUBTITLE}
          </p>
          
        </header>

        {/* Hint Text Area - Compact */}
        <div className="w-full text-center min-h-[1rem] transition-opacity duration-500">
          {hintText && (
            <p className="text-amber-200 text-sm animate-fade-in">
              {hintText}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto px-4">
          {/* Roulette - Centered Priority */}
          <div className="flex justify-center w-full">
            <Roulette
              participants={participants}
              onPayerSelected={handlePayerSelected}
              onCurrentPayerChange={handleCurrentPayerChange}
              onHintTextChange={handleHintTextChange}
            />
          </div>

          {/* Participant Form */}
          <div className="w-full">
            <NameForm
              participants={participants}
              onAddParticipant={handleAddParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              onResetAllParticipants={handleResetAllParticipants}
              selectedPayer={selectedPayer}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-amber-400 text-sm mt-6">
          <p>{UI_MESSAGES.PAGE_FOOTER}</p>
        </footer>
      </main>

      {/* Result Modal */}
      <ResultModal winner={modalPayer} onClose={handleCloseModal} />
    </div>
  );
}

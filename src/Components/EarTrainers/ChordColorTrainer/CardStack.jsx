import React, { useState } from 'react';
import Button from '@components/SharedComponents/Button';
import { motion } from "motion/react";

const isCorrect = (chordName, currentChord) => {
    if (!currentChord) return false;
    return chordName === `${currentChord.degree}${currentChord.chordType}`;
};

const CardStack = ({
    currentChord,
    disabledChords,
    filteredChords,
    setActiveChord,
    rootNote,
    isAdvance,
    gameState,
    gameStarted
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    if (!gameStarted) return null;
    return (
        <div>
            <div className={`hidden lg:${gameState === 'end' ? 'hidden' : ''} lg:flex items-center justify-center h-64 mb-4 relative`}>
                <div className="flex h-full items-center" style={{ width: `${Math.min(filteredChords.length, 12) * 15}%` }}>
                    {filteredChords.slice(0, 12).map((chord, index) => {
                        // const noteName = Tone.Frequency(rootNote + chord.distance, 'midi').toNote().slice(0, -1);
                        const chordName = `${chord.degree}${chord.chordType}`;
                        const isCorrectAnswer = isCorrect(chordName, currentChord);
                        const isDisabled = disabledChords.some((disabledChord) => chordName === disabledChord);
                        const totalCards = filteredChords.length;

                        const minDistance = 15;
                        const maxDistance = 20;
                        const cardDistance = maxDistance - (maxDistance - minDistance) * (totalCards / 12);
                        const positionRatio = (index - (totalCards - 1) / 2) / (totalCards / 2);

                        const maxRotation = 15;
                        const maxVerticalOffset = 100;
                        const rotation = maxRotation * positionRatio;
                        const verticalOffset = (0.4 + 0.4 * Math.pow(positionRatio, 2)) * maxVerticalOffset;

                        const distance = index - hoveredIndex;
                        const offsetMagnitude = cardDistance * 3 * (totalCards / 12) * Math.exp(-0.1 * Math.pow(Math.abs(distance), 2));
                        const offsetX = Math.sign(distance) * offsetMagnitude;
                        const left = `calc(50% - 3rem + ${(index - totalCards / 2) * cardDistance}%)`;

                        return (
                            <motion.div
                                key={chordName}
                                initial={{ x: offsetX, rotateZ: rotation, y: verticalOffset, scale: 1 }}
                                animate={{ x: offsetX, rotateZ: rotation, y: verticalOffset, scale: 1 }}
                                whileHover={{ scale: 1.3, rotateZ: 0, y: 0, zIndex: 50, transition: { duration: 0.1, ease: 'linear' } }}
                                whileDrag={{ scale: 1.3, zIndex: 50, rotateZ: 0 }}
                                dragSnapToOrigin
                                className={`absolute h-32 w-24 md:h-[14rem] md:w-[10rem] rounded-xl shadow-lg flex flex-col 
                  items-center justify-between py-4 text-2xl md:text-3xl font-bold  transition-colors bg-bg-accent text-text-primary
                  ${isAdvance != 'No' && isCorrectAnswer ? 'bg-gradient-to-b from-green-600 to-green-400' : ''}
                  ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                                style={{
                                    left,
                                    transformOrigin: "bottom center",
                                }}
                                onHoverStart={() => setHoveredIndex(index)}
                                onHoverEnd={() => setHoveredIndex(null)}
                                onClick={() => {
                                    setActiveChord(chordName);
                                }}
                            >
                                <span className="select-none">{chordName}</span>
                                {/* <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                                    {noteName}
                                </div> */}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            <div className={`grid grid-cols-3 gap-4 mb-4 lg:hidden ${gameState === 'end' ? 'hidden' : ''}`}>
                {filteredChords.map((chord) => {
                    // const noteName = Tone.Frequency(rootNote + chord.distance, 'midi').toNote().slice(0, -1);
                    const chordName = `${chord.degree}${chord.chordType}`;
                    const isCorrectAnswer = isCorrect(chordName, currentChord);
                    console.log(currentChord, chordName, isCorrectAnswer);
                    return (
                        <Button
                            key={chordName}
                            variant="primary"
                            onClick={() => setActiveChord(chordName)}
                            className={`h-16 text-2xl relative transition-colors ${isAdvance != 'No' && isCorrectAnswer ? 'bg-green-500' : ''}`}
                            disabled={disabledChords.some(disabledChord => chordName === disabledChord)}
                        >
                            {chordName}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default CardStack;

import { useState } from 'react';

// Define types for modal data and game state
export type InfoModalDataType = {
    show: boolean,
    primaryText: string,
    secondaryText: string,
    tertiaryText?: string,
    quartenaryText?: string,
    onClose?: () => void
}

export type GameStateType = {
    gameId?: string,
    rookRow: number,
    rookCol: number,
    timeLeft: number,
    player1: {
        socketId: string,
        playerName: string,
    },
    player2: {
        socketId: string
        playerName: string
    },
    playerTurn: boolean,
    isGameStarted: boolean,
    isGameOver: boolean,
    winner?: string,
    reason?: string,
}

// Custom hook for managing game state
function useGameState() {
    // State for the "Waiting for Other Player" modal
    const [waitingForOtherPlayerModal, setWaitingForOtherPlayerModal] = useState({
        show: false,
    });

    // State for the generic form modal
    const [formModal, setFormModal] = useState<{
        show: boolean,
        inputText: string
    }>({
        show: false,
        inputText: ""
    });

    // Function to update the "Waiting for Other Player" modal
    const updateWaitingModal = (param: boolean) => {
        setWaitingForOtherPlayerModal({
            show: param
        })
    }

    // Function to update the generic form modal
    const updateFormModal = (modalData: {
        show: boolean,
        inputText: string
    }) => {
        setFormModal(modalData);
    };

    // Return the state and update functions for external use
    return {
        formModal,
        waitingForOtherPlayerModal,
        updateWaitingModal,
        updateFormModal
    };
}

export default useGameState;

import { useState } from 'react';

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
function useGameState() {

    const [waitingForOtherPlayerModal, setWaitingForOtherPlayerModal] = useState({
        show: false,
    });
    const [formModal, setFormModal] = useState<{
        show: boolean,
        inputText: string
    }>({
        show: false,
        inputText: ""
    });

    const updateWaitingModal = (param: boolean) => {
        setWaitingForOtherPlayerModal({
            show: param
        })
    }

    const updateFormModal = (modalData: {
        show: boolean,
        inputText: string
    }) => {
        setFormModal(modalData);
    };

    return {
        formModal,
        waitingForOtherPlayerModal,
        updateWaitingModal,
        updateFormModal
    };
}

export default useGameState;

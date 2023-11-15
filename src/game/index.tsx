import { Game } from "./scene";
import React from 'react';
import Phaser from 'phaser';


export const GameComponent = () => {
    const [game, setGame] = React.useState<Phaser.Game>();

    React.useEffect(() => {
        const _game = new Phaser.Game(
            {
                type: Phaser.AUTO,
                width: 480,
                height: 480,
                parent: "canvas",
                scene: [Game],
             
            }
        );

        setGame(_game);

        return (): void => {
            _game.destroy(true);
            setGame(undefined);
        };
    }, []);

    return (
        <>
            <div id="canvas" />
        </>
    );
};

export default GameComponent;
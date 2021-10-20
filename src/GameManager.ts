import { GameType } from "@games-common/enums/GameType";
import { Config } from "@games-common/games/dominoes/Config";
import { Engine } from "@games-common/games/dominoes/Engine";
import { PlayerDetails } from "@games-common/interfaces/PlayerDetails";
import _ from "lodash";

export class GameManager {
    public static async RunGame(
        gameConfig: any,
        playerDetails: PlayerDetails[],
        broadcast: (type: any, payload: any) => void,
        emitToPlayer: (type: any, payload: any, playerId: string) => void,
        queryPlayer: (type: any, payload: any, playerId: string) => Promise<any>
    ) {
        const gameType = gameConfig.gameType;

        if (gameType === GameType.DOMINOES) {
            const config = gameConfig as Config;
            const engine = new Engine(
                config,
                playerDetails,
                emitToPlayer,
                broadcast,
                queryPlayer
            );
            engine.RunGame();
        }
    }
}
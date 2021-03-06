import * as readline from "readline";
import _ from "lodash";
import { Agent } from "@games-common/games/dominoes/agents/Agent";
import RandomAgent from "@games-common/games/dominoes/agents/RandomAgent";
import GreedyAgent from "@games-common/games/dominoes/agents/GreedyAgent";
import { GameMessageType } from "@games-common/games/dominoes/enums/GameMessageType";
import { GameType } from "@games-common/enums/GameType";
import { MaskedGameState } from "@games-common/games/dominoes/interfaces/GameState";
import { Direction } from "@games-common/games/dominoes/enums/Direction";
import { Engine as DominoesEngine } from "@games-common/games/dominoes/Engine";

// Run the game locally on the command line

const playerMap = {
    Human: null as Agent,
    RandomAgent: RandomAgent,
    GreedyAgent: GreedyAgent
};

const N_Humans = 1;
// const agents = [RandomAgent];
const agents = [GreedyAgent];
// const agents: Agent[] = [];
let players: Agent[] = _.flatten([
    _.range(N_Humans).map((i) => playerMap["Human"]),
    agents
]);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const input = (message: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        rl.question(message, (input: string) => resolve(input));
    });
};

const queryPlayer = async (
    type: any,
    message: string,
    playerId: string,
    options: { domino: number; direction: Direction }[],
    gameState: MaskedGameState
): Promise<any> => {
    // locally, you must respond in the format 'dominoIndex direction', e.g. '3 W'
    // if there is only one possible direction, you can skip specifying the direction
    const player = players[parseInt(playerId)];
    if (player === playerMap["Human"]) {
        return input(message + "\n").then((response) => {
            return {
                domino: parseInt(response.split(" ")[0]),
                direction: response.split(" ")[1]
            };
        });
    } else {
        const defaultResponse = {
            domino: options[0].domino,
            direction: options[0].direction
        };
        console.log("querying agent");
        // console.log("gameState:", JSON.stringify(gameState, null, 4));
        if (options.length === 0) {
            throw new Error(
                "Tried to query an agent when no options were given"
            );
        } else if (options.length === 1) {
            return defaultResponse;
        }

        console.log("going to ask agent");
        try {
            // For now, send a blank game state. We need to add this later
            const response = await player.respond(
                type,
                gameState,
                player,
                options
            );
            console.log("response:", response);
            return {
                domino: options[response].domino,
                direction: options[response].direction
            };
        } catch (err) {
            console.error(err);
            console.warn(
                "Agent returned an invalid response.",
                "gameState:",
                gameState,
                "options:",
                options
            );
            return {
                domino: options[0].domino,
                direction: options[0].direction
            };
        }
    }
};

const emitToPlayer = (type: any, payload: any, playerId: string) => {
    const processedPayload =
        typeof payload === "object" ? JSON.stringify(payload) : payload;

    console.log(
        `whispering ${type} to player ${playerId} with payload: ${processedPayload}`
    );
};

const typesToIgnore: GameMessageType[] = [];

const broadcast = (type: any, payload?: any) => {
    // Add log shouting in here based on parameters
    if (!typesToIgnore.includes(type)) {
        console.log(
            `shouting ${type} with payload: ${
                typeof payload === "object" ? JSON.stringify(payload) : payload
            }`
        );
    }
};

const engine = new DominoesEngine(
    {
        gameType: GameType.DOMINOES,
        nPlayers: players.length
    },
    players.map((player, i) => ({
        id: i.toString(),
        name: i.toString()
    })),
    emitToPlayer,
    broadcast,
    queryPlayer,
    true
);
engine.RunGame().then(() => console.log("game over!"));

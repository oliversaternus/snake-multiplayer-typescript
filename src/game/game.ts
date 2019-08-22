import fs from "fs";
import path from "path";
import { Player } from "./player";
import { Snake } from "./snake";
import { World } from "./world";

export class Game {
    public onUpdate: (state: any) => void;
    public onScore: (scores: any) => void;
    public onHighscore: (highscore: any) => void;
    private players: Player[];
    private highscores: Array<{ name: string, score: number }>;
    private world: World;

    constructor(highscores: Array<{ name: string, score: number }>) {
        this.highscores = highscores;
        this.players = [];
        this.world = new World(70, 70);
        this.world.respawn = this.respawn;
        Player.onScore = this.onPlayerScore;
    }

    public join = (ID: string, name: string, color: string) => {
        if (this.players.find((p) => p.ID === ID)) {
            return;
        }
        const player = new Player(ID, color, name);
        const freeField = this.world.getRandomFreeField();
        const snake = new Snake(ID, color, [freeField], 70, 70);
        snake.score = player.score;
        this.players.push(player);
        this.world.join(snake);
    }

    public respawn = (ID: string) => {
        const index = this.players.findIndex((p) => p.ID === ID);
        const player = this.players[index];
        this.submitHighscore(player.name, player.points);
        player.points = 0;
        this.onScore(this.getScores());
        const freeField = this.world.getRandomFreeField();
        const snake = new Snake(ID, player.color, [freeField], 70, 70);
        snake.score = player.score;
        this.world.join(snake);
    }

    public leave = (ID: string) => {
        const index = this.players.findIndex((p) => p.ID === ID);
        this.world.leave(ID);
        this.submitHighscore(this.players[index].name, this.players[index].points);
        this.players.splice(index, 1);
        this.onScore(this.getScores());
    }

    public state = () => {
        return this.world.filledState();
    }

    public act = (ID: string, direction: "up" | "down" | "left" | "right") => {
        this.world.snakes[ID].act(direction);
    }

    public update = () => {
        this.world.update(this.players.length ? Math.log(this.players.length) + 1 : 0);
        this.onUpdate(this.state());
    }

    public getHighscore = () => {
        return this.highscores;
    }

    public getScores = () => {
        return this.players.map((p) => ({ name: p.name, points: p.points, color: p.color }));
    }

    public getPlayerColor = (ID: string) => {
        const index = this.players.findIndex((p) => p.ID === ID);
        return this.players[index].color;
    }

    public onPlayerScore = () => {
        this.onScore(this.getScores());
    }

    private submitHighscore = (name: string, score: number) => {
        const index = this.highscores.findIndex((s) => s.score < score);
        if (index !== -1) {
            this.highscores[index] = { name, score };
            this.onHighscore(this.highscores);
            this.saveHighscore();
        }
    }

    private saveHighscore = () => {
        try {
            fs.writeFile(path.join(__dirname, "../", "../", "highscores.json"),
                JSON.stringify(this.highscores), () => undefined);
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.log(e);
        }
    }
}

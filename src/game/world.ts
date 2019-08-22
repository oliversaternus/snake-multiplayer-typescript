import { Snake } from "./snake";

export class World {
    public width: number;
    public height: number;
    public snakes: { [key: string]: Snake };
    public filledFields: {
        [key: string]: {
            color: string,
            food: string,
            snake: string,
            x: number,
            y: number
        }
    };
    public respawn: (ID: string) => void;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.snakes = {};
        this.filledFields = {};
    }

    public join = (snake: Snake) => {
        const field = snake.position[0];
        this.snakes[snake.ID] = snake;
        this.filledFields[field[0] + "_" + field[1]] = {
            color: snake.color,
            food: "",
            snake: snake.ID,
            x: field[0],
            y: field[1]
        };
    }

    public leave = (ID: string) => {
        this.snakes[ID].position.forEach((pos) => {
            delete this.filledFields[pos[0] + "_" + pos[1]];
        });
        delete this.snakes[ID];
        if (Object.keys(this.snakes).length === 0) {
            this.filledFields = {};
        }
    }

    public getFreeFields = (): Array<[number, number]> => {
        const result = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (!this.filledFields[j + "_" + i]) {
                    result.push([j, i]);
                }
            }
        }
        return result as Array<[number, number]>;
    }

    public getRandomFreeField = (): [number, number] => {
        const freeFields = this.getFreeFields();
        if (freeFields.length === 0) {
            return undefined;
        }
        return freeFields[Math.floor(Math.random() * freeFields.length)];
    }

    public putFood = () => {
        const freeField = this.getRandomFreeField();
        this.filledFields[freeField[0] + "_" + freeField[1]] = {
            color: "#ffffff",
            food: "default",
            snake: "",
            x: freeField[0],
            y: freeField[1]
        };
    }

    public update = (foodRatio: number) => {
        Object.values(this.snakes).forEach((s) => {
            const nextField: [number, number] = s.next();
            if (this.filledFields[nextField[0] + "_" + nextField[1]] &&
                this.filledFields[nextField[0] + "_" + nextField[1]].food) {
                this.filledFields[nextField[0] + "_" + nextField[1]] = {
                    color: s.color,
                    food: "",
                    snake: s.ID,
                    x: nextField[0],
                    y: nextField[1]
                };
                s.eat();
                s.score(1);
                return;
            }
            if (this.filledFields[nextField[0] + "_" + nextField[1]] &&
                this.filledFields[nextField[0] + "_" + nextField[1]].snake) {
                const winner = this.filledFields[nextField[0] + "_" + nextField[1]].snake;
                if (s.ID !== winner) {
                    this.snakes[winner].score(s.position.length);
                }
                this.leave(s.ID);
                this.respawn(s.ID);
                return;
            }
            const tail = s.position[s.position.length - 1];
            delete this.filledFields[tail[0] + "_" + tail[1]];
            this.filledFields[nextField[0] + "_" + nextField[1]] = {
                color: s.color,
                food: "",
                snake: s.ID,
                x: nextField[0],
                y: nextField[1]
            };
            s.move();
        });
        const randomNumber = Math.random();
        if (randomNumber < 0.02 * foodRatio) {
            this.putFood();
        }
    }

    public filledState = () => {
        return Object.values(this.filledFields).map((item) => {
            return {
                color: item.color,
                x: item.x,
                y: item.y
            };
        });
    }
}

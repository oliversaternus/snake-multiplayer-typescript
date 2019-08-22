export class Snake {
    public ID: string;
    public color: string;
    public position: Array<[number, number]>;
    public length: number;
    public speed: number;
    public direction: "up" | "down" | "left" | "right";
    public maxWidth: number;
    public maxHeight: number;
    public score: (points: number) => void;

    constructor(id: string, color: string, position: Array<[number, number]>, maxWidth: number, maxHeight: number) {
        this.ID = id;
        this.color = color;
        this.position = position;
        this.length = 1;
        this.speed = 1;
        this.direction = "right";
        this.maxHeight = maxHeight;
        this.maxWidth = maxWidth;
    }

    public move = () => {
        this.position = this.position.map((p, i) => {
            if (i === 0) {
                return this.next();
            }
            return this.position[i - 1];
        });

    }

    public eat = () => {
        const tail = this.position[this.position.length - 1];
        this.position = this.position.map((p, i) => {
            if (i === 0) {
                return this.next();
            }
            return this.position[i - 1];
        });
        this.position.push(tail);
    }

    public next = (): [number, number] => {
        const prev: [number, number] = this.position[0];
        let next: [number, number];
        switch (this.direction) {
            case "up":
                next = [prev[0], prev[1] - this.speed];
                break;
            case "down":
                next = [prev[0], prev[1] + this.speed];
                break;
            case "left":
                next = [prev[0] - this.speed, prev[1]];
                break;
            case "right":
                next = [prev[0] + this.speed, prev[1]];
                break;
        }
        if (next[0] >= this.maxHeight) {
            next[0] = 0;
        }
        if (next[1] >= this.maxWidth) {
            next[1] = 0;
        }
        if (next[0] < 0) {
            next[0] = this.maxHeight - 1;
        }
        if (next[1] < 0) {
            next[1] = this.maxWidth - 1;
        }
        return next;
    }

    public act = (direction: "up" | "down" | "left" | "right") => {
        this.direction = direction;
    }
}

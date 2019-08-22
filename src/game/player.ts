export class Player {
    public static onScore: () => void;
    public ID: string;
    public points: number;
    public color: string;
    public name: string;

    constructor(ID: string, color: string, name: string) {
        this.ID = ID;
        this.color = color;
        this.points = 0;
        this.name = name;
    }

    public score = (points: number) => {
        this.points += points;
        Player.onScore();
    }

    public state = () => {
        return {
            ID: this.ID,
            color: this.color,
            points: this.points
        };
    }
}

import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import socketIO from "socket.io";
import { Game } from "./game/game";

const app = express();
const server = new http.Server(app);
const io = socketIO(server);

const highscores: Array<{ name: string, score: number }> =
    JSON.parse(fs.readFileSync(path.join(__dirname, "../", "highscores.json"), "utf-8"));

const onUpdate = (state: any) => {
    io.sockets.emit("state", state);
};

const onHighscore = (highscore: any) => {
    io.sockets.emit("highscore", highscore);
};

const onScore = (scores: any) => {
    io.sockets.emit("score", scores);
};

const game = new Game(highscores);
game.onUpdate = onUpdate;
game.onHighscore = onHighscore;
game.onScore = onScore;

app.set("port", 5000);

app.use("/static", express.static(path.join(__dirname, "../", "/static")));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "../", "/static/index.html"));
});

io.on("connection", (socket) => {

    socket.on("join", (info) => {
        try {
            game.join(socket.client.id, info.name, info.color);
            io.sockets.emit("state", game.state());
            io.sockets.emit("highscore", game.getHighscore());
            io.sockets.emit("score", game.getScores());
            console.log("Client connected: " + socket.client.id);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("action", (action) => {
        try {
            game.act(socket.client.id, action.direction);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("disconnect", () => {
        try {
            game.leave(socket.client.id);
            console.log(socket.client.id + " disconnected");
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("error", (e) => {
        console.log(e);
    });
});
server.listen(3001, () => {
    console.log("Snake listening on port 3001");
});

setInterval(game.update, 1000 / 20);

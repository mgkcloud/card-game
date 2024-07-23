const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const next = require("next");
const dotenv = require("dotenv");

const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config({ path: `${__dirname}/.env.local` });

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    app.enable("trust proxy");
    app.use(
      cors({ origin: ["https://admin.socket.io"], optionsSuccessStatus: 200 }),
    );

    if (process.env.NODE_ENV !== "production") {
      app.use(morgan("combined"));
    }

    let playerCount = {};
    let playersUpdates = {};

    io.on("connect", (socket) => {
      socket.on("join_room", (room) => {
        socket.join(room);
        if (!playerCount[room]) {
          playerCount[room] = 0;
        }

        if (!playersUpdates[room]) {
          playersUpdates[room] = [];
        }

        let playerUpdate = `Player_${++playerCount[room]} joined ${room}`;
        console.log(playerUpdate);

        playersUpdates[room].push(playerUpdate);
        io.to(room).emit("players_update", playersUpdates[room]);
      });

      socket.on("post_card", ({ card, room }) => {
        io.to(room).emit("post_card", card);
      });

      socket.on("leave_room", (room) => {
        if (playerCount[room]) {
          let playerUpdate = `Player_${playerCount[room]} left ${room}`;
          console.log(playerUpdate);

          playersUpdates[room].push(playerUpdate);
          io.to(room).emit("players_update", playersUpdates[room]);

          playerCount[room]--;

          if (playerCount[room] === 0) {
            playersUpdates[room] = [];
          }
          // removes the current connected client from the room
          socket.leave(room);
        }
      });

      socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected.`);
        for (const room in playerCount) {
          if (Object.prototype.hasOwnProperty.call(playerCount, room)) {
            let playerUpdate = `Player_${playerCount[room]} left ${room}`;
            playersUpdates[room].push(playerUpdate);
            io.to(room).emit("players_update", playersUpdates[room]);

            playerCount[room]--;

            if (playerCount[room] === 0) {
              playersUpdates[room] = [];
            }
          }
        }
      });
    });

    // compress response
    app.use(compression());

    // body parser, cookie parser, urlencoding
    app.use(express.json());
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // handle nextJs requests
    app.get("*", (req, res) => handle(req, res));

    // define port
    const PORT = process.env.PORT || 3000;

    // start server
    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`Application running http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("shutting down server on error");
    console.log(err);
    process.exit(1);
  });

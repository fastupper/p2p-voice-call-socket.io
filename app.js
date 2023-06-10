const express = require("express");
const app = express();
const cors = require("cors");
const compression = require("compression");

app.use(cors());
app.use(compression());
app.use(express.static('client/build'));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

const socket_cors = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};
// app.listen(3001, () => console.log(`Server started on port 3001`));

const https_server = require("https").createServer({
  cert: fs.readFileSync('./cert.pem', {encoding: "utf8"}),
  key: fs.readFileSync('./cert.key', {encoding: "utf8"}),
}, app).listen(3000);
const io = require("socket.io")(https_server, socket_cors);

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.emit("getid", socket.id);

  socket.on("caller", (data) => {
    io.to(data.ToCall).emit("caller", {
      signal: data.signalData,
      from: data.from,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("acceptcall", data.signal);
  });
});

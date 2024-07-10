require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");

const User = require("./models/user");
const Message = require("./models/message");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>
  console.log("Server started on port" + PORT)
);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  ws.on("message", async (data) => {
    const { token, message } = JSON.parse(data);
    try {
      const jwt_res = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(jwt_res.id);

      if (user) {
        const newMessage = new Message({ username: user.username, message });
        await newMessage.save();

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                username: user.username,
                message,
                timestamp: newMessage.timestamp,
              })
            );
          }
        });
      }
    } catch (err) {
      ws.send(JSON.stringify({ error: "Invalid token" }));
    }
  });
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).send("User registered");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ token });
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const WebSocket = require("ws");

const User = require("./models/user");
const Message = require("./models/message");

const app = express();

// app.use((req, res, next) => {
//   console.log("Request Headers:", req.headers);
//   console.log("Request Method:", req.method);
//   next();
// });

app.use(express.json());

const allowedOrigins = [
  "https://ominous-chainsaw-wpx5974xwg627pv-3000.app.github.dev",
  "https://ominous-chainsaw-wpx5974xwg627pv-6000.app.github.dev",
  "https://test-chat-app-client.vercel.app",
  "https://test-chat-app-server.vercel.app",
];

const corsOptions = {
  origin: function (origin, func) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      func(null, origin);
    } else {
      func(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Origin",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket connected");

  ws.on("message", async (data) => {
    try {
      const { token, message } = JSON.parse(data);
      const jwt_res = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(jwt_res.id);

      if (user) {
        const newMessage = new Message({
          username: user.username,
          message,
        });
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

  ws.on("close", () => {
    console.log("WebSocket disconnected");
  });
});

app.get("/", async (req, res) => {
  const data = await User.find({});
  console.log(data);
  res.json({ hello: "hello!" });
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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

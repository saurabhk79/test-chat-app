require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const socketIO = require("socket.io");
const cors = require("cors");

const User = require("./models/user");
const Message = require("./models/message");

const app = express();

app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  console.log("Request Method:", req.method);
  next();
});

app.use(express.json());
app.use(cors());
// app.options("*", cors());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const server = http.createServer(app);

// const io = socketIO(server, {
//   cors: {
//     origin: "*",
//   },
// });

// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id);

//   socket.on("message", async (data) => {
//     const { token, message } = data;
//     try {
//       const jwt_res = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(jwt_res.id);

//       if (user) {
//         const newMessage = new Message({
//           username: user.username,
//           message,
//         });
//         await newMessage.save();

//         io.emit("message", {
//           username: user.username,
//           message,
//           timestamp: newMessage.timestamp,
//         });
//       }
//     } catch (err) {
//       socket.emit("error", { message: "Invalid token" });
//     }
//   });
// });

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

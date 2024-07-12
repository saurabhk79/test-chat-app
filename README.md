# test-chat-app

## Project Overview
This project is a simple chat application built with Express.js, WebSocket (`ws`), and MongoDB. Users can register, log in, and send messages in real-time. The application uses JWT for authentication and CORS to handle cross-origin requests.

## Features
- User registration and login
- Real-time messaging with WebSocket
- JWT authentication
- MongoDB for storing user and message data

## Technologies Used
- Node.js
- Express.js
- WebSocket (`ws`)
- MongoDB
- Mongoose
- JWT
- CORS

## Prerequisites
- Node.js installed
- MongoDB URI for connecting to a MongoDB instance

## Run Locally

Clone the project

```bash
  git clone https://github.com/saurabhk79/test-chat-app
```

Go to the project directory

```bash
  cd test-chat-app
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGODB_URI`

`JWT_SECRET`

`PORT`

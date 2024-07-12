let socket;
let token;

function register() {
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  fetch("https://test-chat-app-server.vercel.app/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, email, password }),
  })
    .then((response) => response.text())
    .then((data) => alert(data))
    .catch((error) => console.error("Error:", error));
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  fetch("hhttps://test-chat-app-server.vercel.app/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      token = data.token;
      document.getElementById("auth").style.display = "none";
      document.getElementById("chat").style.display = "block";
      initWebSocket();
    })
    .catch((error) => console.error("Error:", error));
}

function initWebSocket() {
  socket = new WebSocket("wss://https://test-chat-app-server.vercel.app/");

  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.error) {
      console.error("WebSocket error:", data.error);
    } else {
      const { username, message } = data;
      const messages = document.getElementById("messages");
      messages.innerHTML += `<p><strong>${username}</strong> ${message}</p>`;
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };
}

function sendMessage() {
  const message = document.getElementById("message").value;

  document.getElementById("message").value = "";
  if (socket.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify({ token, message }));
  else console.error("WebSocket error.");
}

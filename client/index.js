let socket;
let token;

function register() {
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  console.log("register running!");

  // fetch("https://ominous-chainsaw-wpx5974xwg627pv-6000.app.github.dev/", {

  // })
  //   .then((response) => response.text())
  //   .then((data) => alert(data))
  //   .catch((error) => console.error("Error:", error));

  fetch(
    "https://ominous-chainsaw-wpx5974xwg627pv-6000.app.github.dev/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      credentials: "include", // Include credentials if your API requires authentication
      body: JSON.stringify({
        username: "yourUsername",
        email: "yourEmail",
        password: "yourPassword",
      }),
    }
  )
    .then((response) => response.text())
    .then((data) => alert(data))
    .catch((error) => console.error("Error:", error));
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  fetch("https://ominous-chainsaw-wpx5974xwg627pv-3000.app.github.dev/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  socket = io("https://ominous-chainsaw-wpx5974xwg627pv-3000.app.github.dev");
  socket.on("message", function (data) {
    const { username, message, timestamp } = data;
    const messages = document.getElementById("messages");
    messages.innerHTML += `<p><strong>${username}</strong>: ${message} <em>${new Date(
      timestamp
    ).toLocaleTimeString()}</em></p>`;
  });

  socket.on("error", function (data) {
    console.error("Socket error:", data.message);
  });
}

function sendMessage() {
  const message = document.getElementById("message").value;
  socket.emit("message", { token, message });
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// require("dotenv").config();

export default function Join() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [roomError, setRoomError] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get("username");
    setUsername(usernameParam);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (room.trim() !== "") {
      const serverUrl = "https://yt-party-server.onrender.com";
      // const serverUrl = process.env.SERVER_URL || "http://localhost:8080";
      fetch(`${serverUrl}/check-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          setRoomError(!data.available);
          if (data.available) {
            navigate(`/chat?username=${username}&room=${room}`);
            // window.location.href = `/chat?username=${username}&room=${room}`;
          }
        })
        .catch((error) => {
          setRoomError(false);
        });
    }
  };
  return (
    <div className="join-container">
      <header className="join-header">
        <h1>
          <i className="fas fa-smile"></i> Chatter-HUB
        </h1>
      </header>
      <main className="join-main">
        <form onSubmit={handleFormSubmit}>
          <div className="form-control">
            <label htmlFor="room"></label>
            <input
              type="hidden"
              name="username"
              id="username"
              value={username}
            />
            <input
              type="text"
              name="room"
              id="room"
              placeholder="Enter room name..."
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn">
            Join Chat
          </button>
          <br />
          {roomError && <p id="room-unavail">Room is unavailable</p>}
        </form>
      </main>
    </div>
  );
}

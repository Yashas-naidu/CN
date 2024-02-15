import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const checkRedirect = () => {
    const getQueryParam = (name) => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      return urlParams.get(name);
    };

    const adminLeft = getQueryParam("adminLeft");
    if (adminLeft === "true") {
      alert("Admin has left the room");
      // window.location.href = "/";
      navigate("/");
    }
  };
  window.onload = checkRedirect;
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clickedButtonId = e.nativeEvent.submitter.id;
    const isCreateRoom = clickedButtonId === "create-room-btn";
    const path = isCreateRoom ? "/chat" : "/join";
    const roomCode = isCreateRoom ? uuidv4() : "";
    const url = `${path}?${
      isCreateRoom ? `room=${roomCode}&` : ""
    }username=${username}`;
    navigate(url);
    // window.location.href = url

    if (isCreateRoom) {
      alert("Do not refresh the page, else your queue will get cleared!");
      alert(
        "End the room only using the end room button. Closing the tab or back button won't do"
      );
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  return (
    <div className="join-container">
      <header className="join-header">
        <h1>
          <i className="fas fa-smile"></i> YTParty
        </h1>
      </header>
      <main className="join-main">
        <form onSubmit={handleFormSubmit}>
          <div className="form-control">
            <label htmlFor="username"></label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter Username..."
              value={username}
              onChange={handleUsernameChange}
              autoFocus
              required
            />
          </div>
          <button type="submit" className="btn" id="join-room-btn">
            Join Chat
          </button>
          <button type="submit" className="btn" id="create-room-btn">
            Create Room
          </button>
        </form>
      </main>
    </div>
  );
}

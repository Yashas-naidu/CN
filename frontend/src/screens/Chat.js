import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Qs from "qs";
import socket from "../services/socket";

import SearchHead from "../components/SearchHead";
import Video from "../components/Video";

import { writeText } from "clipboard-polyfill";

let code,roomId;
export default function ChatRoom() {
  const chatFormRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [errorUrl, setErrorUrl] = useState(false);
  const [videoCode, setVideoCode] = useState("");
  const [queue, setQueue] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { username, room } = Qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });

    let prevSocketId;
    prevSocketId = sessionStorage.getItem("socketId");
    // prevSocketId = localStorage.getItem("socketId");
    socket.emit("joinRoom", { username, room, prevSocketId });
    socket.on("roomUsers", handleRoomUsers);
    socket.on("videoCode", handleVideoCode);
    socket.on("message", handleNewMessage);
    socket.on("redirect", handleRedirect);
    socket.on("connect", () => {
      // console.log("socketid: " + socket.id);
      // console.log("prevSocketId: " + prevSocketId);
      sessionStorage.setItem("socketId", socket.id);
      // localStorage.setItem("socketId", socket.id);
    });

    return () => {
      socket.off("roomUsers", handleRoomUsers);
      socket.off("message", handleNewMessage);
    };
  }, []);

  const handleRoomUsers = ({ room, users }) => {
    console.log("handleRoomUsers: " + isAdmin);
    if (code && room === roomId) {
      console.log("handleJOIN: " + code);
      socket.emit("videoCode", code);
    }
    roomId=room;
    setRoomName(room);
    console.log(users);
    // console.log(socket.id);
    // console.log(currentUser);
    // console.log(currentUser && currentUser.isAdmin);
    if (socket && socket.id && users && room && users[0] && users[0].id) {
      if (!isAdmin && socket.id === users[0].id) {
        setIsAdmin(true);
      }
    }
  };

  const handleVideoCode = (message) => {
    code = message;
    setVideoCode(message);
    console.log("videoCode: " + message + "\n" + Date.now());
  };
  const handleNewMessage = (message) => {
    console.log(message);
    outputMessage(message);
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
    console.log("at new msg:" + videoCode);
  };

  const handleRedirect = () => {
    navigate("/?adminLeft=true");
    // window.location.href = "/?adminLeft=true";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let msg = e.target.elements.msg.value;
    msg = msg.trim();

    if (!msg) {
      return false;
    }

    socket.emit("chatMessage", msg);

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  };

  const outputMessage = (message) => {
    const div = document.createElement("div");
    div.classList.add("message");
    const p = document.createElement("p");
    p.classList.add("meta");
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement("p");
    para.classList.add("text");

    if (message && message.text) {
      //eslint-disable-next-line
      const urlRegex =
        /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      const textWithLinks = message.text.replace(urlRegex, (url) => {
        return `<a href="${url}" class="link" target="_blank" data-url="${url}">${url}</a>`;
      });

      para.innerHTML = textWithLinks;
    }

    div.appendChild(para);

    if (chatMessagesRef.current) chatMessagesRef.current.appendChild(div);
    else console.error("chatMessagesRef.current is null or undefined.");
    console.log(isAdmin);
  };

  const handleButton = (button) => {
    code = "";
    let hasError = false;
    console.log(videoUrl);
    if (videoUrl.trim() !== "") {
      try {
        if (videoUrl.includes("youtu.be/"))
          code = videoUrl.split("youtu.be/")[1];
        else if (videoUrl.includes("youtube.com/watch?v="))
          code = videoUrl.split("v=")[1].split("&")[0];
        else hasError = true;
      } catch (error) {
        hasError = true;
      }
    } else hasError = true;

    setErrorUrl(hasError);

    if (!hasError) {
      if (button === "search") {
        setVideoCode(code);
        console.log("@button click:" + code);
        if (isAdmin) socket.emit("videoCode", code);
      } else if (button === "queue") {
        setQueue((prevQueue) => [...prevQueue, code]);
      }
      console.log("button: " + queue);
    }
  };

  const handleNext = () => {
    setQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      if (newQueue.length > 0) {
        setVideoCode(newQueue[0]);
        if (isAdmin) socket.emit("videoCode", newQueue[0]);
      }
      newQueue.shift();
      console.log("newQ: " + newQueue);
      return newQueue;
    });
    console.log("next: " + queue);
  };

  const handleLeave = () => {
    navigate("/");
    // window.location = "/";
    if (isAdmin) {
      console.log("admin clicked");
      socket.emit("endroom");
    }
  };

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleCopyClick = () => {
    writeText(roomId)
      .then(() => {
        console.log("Text copied to clipboard.");
        setTooltipVisible(true);
      })
      .catch((err) => {
        console.error("Could not copy text to clipboard:", err);
      });
    setTimeout(() => {
      setTooltipVisible(false);
    }, 1500);
  };

  return (
    <div className="chatWindow">
      <div className="chat-container">
        <header className="chat-header">
          <div className="tooltip-container">
            <button onClick={handleCopyClick} id="copycode">
              Copy code
            </button>

            {tooltipVisible && <div className="tooltip">Copied!</div>}
          </div>
          <h1>
            <i className="fas fa-smile"></i> Chatter-HUB
          </h1>
          <button id="leave-btn" className="btn" onClick={handleLeave}>
            {isAdmin ? "End" : "Leave"} Room
          </button>
        </header>
        <main className="chat-main">
          <div className="chat-sidebar">
            {isAdmin && (
              <>
                <SearchHead
                  videoUrl={videoUrl}
                  onVideoUrlChange={(url) => setVideoUrl(url)}
                  onHandleButton={(button) => handleButton(button)}
                />
                {queue.length > 0 && (
                  <button id="next-btn" onClick={handleNext}>
                    Next
                  </button>
                )}
              </>
            )}
            {!errorUrl ? (
              <Video videoId={videoCode} />
            ) : (
              <p>{errorUrl ? "Please enter a valid URL" : ""}</p>
            )}
          </div>
          <div ref={chatMessagesRef} className="chat-messages"></div>
        </main>
        <div className="chat-form-container">
          <form ref={chatFormRef} id="chat-form" onSubmit={handleSubmit}>
            <input
              id="msg"
              type="text"
              placeholder="Enter Message"
              autoComplete="off"
              autoFocus
              required
            />
            <button className="btn">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function SearchHead(props) {
  return (
    <>
      <label>
        Video URL:{" "}
        <input
          id="videoinput"
          value={props.videoUrl}
          onChange={(e) => props.onVideoUrlChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") props.onHandleButton("search");
          }}
        />
        <button id="play-btn" onClick={() => props.onHandleButton("search")}>
          Play
        </button>
        <button id="queue-btn" onClick={() => props.onHandleButton("queue")}>
          Add to Queue
        </button>
      </label>
    </>
  );
}

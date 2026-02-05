import React, { useState } from "react";
import axios from "axios";
import "./Styles.css";

function CreatePost(props){
  const [username, setUsername] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !caption.trim()) {
      setMessage("Please fill in username and caption.");
      return;
    }

    try {
      await axios.post(
        "https://insta-vibe-backend-8yxq.onrender.com/upload",
        {
          username: username,
          caption: caption,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage("Post created successfully!");
      props.setRefreshTrigger((prev) => prev + 1);
      setUsername("");
      setCaption("");
    } catch (error) {
      console.error(error);
      setMessage("Error uploading post. Try again in 30 seconds.");
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-input"
        />

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="caption-input"
        />

        <button type="submit" className="upload-button">
          Upload
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default CreatePost;
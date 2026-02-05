import React, { useRef, useState } from "react";
import axios from "axios";
import "./Click.css"

const Click = ({ onClose, onUpload }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [username, setUsername] = useState("");
  const [caption, setCaption] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = cameraStream;
      setStream(cameraStream);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera");
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      alert("Camera not ready");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    setPhotoTaken(true);

    // Stop camera only if stream exists
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim() || !caption.trim()) {
      alert("Please fill in username and caption");
      return;
    }

    try {
      await axios.post(
        "https://insta-vibe-backend-8yxq.onrender.com/upload",
        {
          username: username,
          caption: caption,
          // For now, we're not sending the actual image
          // We'll use a placeholder on the backend
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Post created!");
      setUsername("");
      setCaption("");
      setPhotoTaken(false);
      onUpload(); 
      onClose(); 
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading post. The backend might be sleeping. Try again in 30 seconds.");
    }
  };

  return (
    <div className="create-post-container">
      <h2>Camera Post</h2>

      <video
        ref={videoRef}
        autoPlay
        style={{ width: "100%", display: photoTaken ? "none" : "block" }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: photoTaken ? "block" : "none", width: "100%" }}
      />

      {!photoTaken && (
        <>
          <button className="upload-button" onClick={startCamera}>Start Camera</button>
          <button className="upload-button" onClick={takePhoto}>Take Photo</button>
        </>
      )}

      {photoTaken && (
        <>
          <input
            className="text-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br/>
          <textarea
            className="caption-input"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          /><br/>
          <button className="upload-button" onClick={handleSubmit}>Upload Post</button>
        </>
      )}
    </div>
  );
};

export default Click;
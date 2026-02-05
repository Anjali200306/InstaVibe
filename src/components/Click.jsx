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
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } // Front camera
      });
      videoRef.current.srcObject = cameraStream;
      setStream(cameraStream);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Please allow camera access to take photos");
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!video || !video.videoWidth) {
      alert("Camera is not ready yet. Please wait or click Start Camera again.");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    setPhotoTaken(true);

    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim() || !caption.trim()) {
      alert("Please fill in both username and caption");
      return;
    }

    try {
      console.log("Sending upload request...");
      
      // Send to backend WITHOUT the image (using placeholder)
      const response = await axios.post(
        "https://insta-vibe-backend-8yxq.onrender.com/upload",
        {
          username: username,
          caption: caption
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Upload response:", response.data);
      
      if (response.data.success) {
        alert("Post created successfully! 📸");
        
        // Reset form
        setUsername("");
        setCaption("");
        setPhotoTaken(false);
        
        // Refresh posts and close modal
        if (onUpload) onUpload();
        if (onClose) onClose();
      } else {
        alert("Upload failed: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error details:", error);
      
      // Show user-friendly error message
      if (error.response) {
        // Server responded with error
        if (error.response.status === 500) {
          alert("Server error. The backend might be waking up. Please try again in 30 seconds.");
        } else if (error.response.status === 400) {
          alert("Bad request: " + (error.response.data.error || "Please check your input"));
        }
      } else if (error.request) {
        // Request made but no response
        alert("Network error. Please check your internet connection.");
      } else {
        // Something else
        alert("Error: " + error.message);
      }
    }
  };

  const closeCamera = () => {
    // Clean up camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (onClose) onClose();
  };

  return (
    <div className="create-post-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Camera Post</h2>
        <button 
          onClick={closeCamera}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ 
            width: "100%", 
            maxHeight: "300px",
            display: photoTaken ? "none" : "block",
            backgroundColor: '#000'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{ 
            display: photoTaken ? "block" : "none", 
            width: "100%",
            maxHeight: "300px"
          }}
        />
      </div>

      {!photoTaken ? (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="upload-button" onClick={startCamera}>
            {stream ? "Restart Camera" : "Start Camera"}
          </button>
          <button 
            className="upload-button" 
            onClick={takePhoto}
            disabled={!stream}
            style={{ opacity: stream ? 1 : 0.5 }}
          >
            Take Photo
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '15px' }}>
            <input
              className="text-input"
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <textarea
              className="caption-input"
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ width: '100%', padding: '10px', minHeight: '80px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              className="upload-button" 
              onClick={() => {
                setPhotoTaken(false);
                startCamera();
              }}
              style={{ background: '#666' }}
            >
              Retake
            </button>
            <button 
              className="upload-button" 
              onClick={handleSubmit}
              disabled={!username.trim() || !caption.trim()}
              style={{ 
                opacity: (username.trim() && caption.trim()) ? 1 : 0.5,
                background: 'linear-gradient(45deg, #FF0080, #FF8C00)'
              }}
            >
              Upload Post
            </button>
          </div>
          
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
            Note: For now, a placeholder image will be used. Future updates will include actual photo uploads.
          </p>
        </>
      )}
    </div>
  );
};

export default Click;
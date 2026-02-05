import React, { useRef, useState } from "react";
import axios from "axios";

const API = "https://insta-vibe-backend-8yxq.onrender.com";

const Click = ({ onClose, onUpload }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [username, setUsername] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [stream, setStream] = useState(null);

  // Start camera function
  const startCamera = async () => {
    try {
      setError("");
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      videoRef.current.srcObject = cameraStream;
      setStream(cameraStream);
    } catch (error) {
      console.error("Camera error:", error);
      setError("Please allow camera access to take photos");
    }
  };

  // Take photo function
  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!video || !video.videoWidth) {
      setError("Camera is not ready yet. Please wait or click Start Camera again.");
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

  // Convert canvas to blob (image file)
  const canvasToFile = () => {
    const canvas = canvasRef.current;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(file);
      }, 'image/jpeg', 0.8); // 0.8 quality
    });
  };

  // Handle upload with actual photo
  const handleUpload = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!username.trim()) {
        setError("Please enter a username");
        setLoading(false);
        return;
      }

      if (!caption.trim()) {
        setError("Please enter a caption");
        setLoading(false);
        return;
      }

      // Get the photo from canvas
      const photoFile = await canvasToFile();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("username", username.trim());
      formData.append("caption", caption.trim());

      console.log("Uploading photo...", {
        file: photoFile,
        username: username.trim(),
        caption: caption.trim()
      });

      // Send to backend
      const response = await axios.post(`${API}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Post created successfully with your photo! 📸");
        
        // Reset form
        setUsername("");
        setCaption("");
        setPhotoTaken(false);
        
        // Refresh posts and close modal
        if (onUpload) onUpload();
        if (onClose) onClose();
      } else {
        setError(response.data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 500) {
          setError("Server error. The backend might be waking up. Please try again in 30 seconds.");
        } else if (err.response.status === 400) {
          setError("Bad request: " + (err.response.data.error || "Please check your input"));
        } else {
          setError(err.response.data?.error || "Upload failed");
        }
      } else if (err.request) {
        // Request made but no response
        setError("Network error. Please check your internet connection.");
      } else {
        // Something else
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Close camera and modal
  const closeCamera = () => {
    // Clean up camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (onClose) onClose();
  };

  // Reset to camera view
  const retakePhoto = () => {
    setPhotoTaken(false);
    startCamera();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Create Camera Post</h2>
        <button 
          onClick={closeCamera}
          style={styles.closeButton}
          disabled={loading}
        >
          ✕
        </button>
      </div>

      {/* Camera/Preview Section */}
      <div style={styles.cameraContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            ...styles.cameraElement,
            display: photoTaken ? "none" : "block"
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            ...styles.cameraElement,
            display: photoTaken ? "block" : "none"
          }}
        />
      </div>

      {/* Camera Controls */}
      {!photoTaken ? (
        <div style={styles.cameraControls}>
          <button
            onClick={startCamera}
            style={{
              ...styles.cameraButton,
              backgroundColor: stream ? '#666' : '#0095f6'
            }}
            disabled={loading}
          >
            {stream ? "Restart Camera" : "Start Camera"}
          </button>
          <button
            onClick={takePhoto}
            style={{
              ...styles.cameraButton,
              backgroundColor: '#e1306c',
              opacity: stream ? 1 : 0.5,
              cursor: stream ? 'pointer' : 'not-allowed'
            }}
            disabled={!stream || loading}
          >
            Take Photo
          </button>
        </div>
      ) : (
        /* Form Section */
        <>
          <div style={styles.formGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
            <textarea
              placeholder="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={styles.textarea}
              disabled={loading}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.formControls}>
            <button
              onClick={retakePhoto}
              style={{
                ...styles.button,
                backgroundColor: '#666',
                flex: 1
              }}
              disabled={loading}
            >
              Retake Photo
            </button>
            <button
              onClick={handleUpload}
              style={{
                ...styles.button,
                backgroundColor: loading ? '#ccc' : '#e1306c',
                opacity: loading ? 0.7 : 1,
                flex: 2,
                background: loading ? '#ccc' : 'linear-gradient(45deg, #FF0080, #FF8C00)'
              }}
              disabled={loading || !username.trim() || !caption.trim()}
            >
              {loading ? "Uploading..." : "Upload Post"}
            </button>
          </div>
          
          <p style={styles.note}>
            Your photo will be uploaded directly to the server.
          </p>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    color: "#333",
    fontSize: "24px",
    fontWeight: "600"
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px 10px',
    borderRadius: '50%',
    transition: 'all 0.2s'
  },
  cameraContainer: {
    width: "100%",
    height: "300px",
    marginBottom: "20px",
    backgroundColor: "#000",
    borderRadius: "10px",
    overflow: "hidden",
    position: "relative"
  },
  cameraElement: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  cameraControls: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },
  cameraButton: {
    padding: '12px 25px',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '140px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    transition: 'border 0.2s'
  },
  textarea: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: 'inherit'
  },
  button: {
    padding: "14px 25px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  formControls: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'space-between'
  },
  error: {
    color: "red",
    backgroundColor: "#ffe6e6",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px"
  },
  note: {
    fontSize: '12px',
    color: '#666',
    marginTop: '15px',
    textAlign: 'center',
    fontStyle: 'italic'
  }
};

export default Click;
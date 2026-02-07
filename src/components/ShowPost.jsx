import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Styles.css";

function ShowPost(props){
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Username mapping object
  const usernameMap = {
    "john_doe": "anjali",
    "jane_smith": "shivani", 
    "travel_buddy": "Shruti"
  };

  // Function to map username
  const getDisplayUsername = (originalUsername) => {
    return usernameMap[originalUsername] || originalUsername;
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(()=>{
    fetchFiles();
  },[props.refreshTrigger]);

  const fetchFiles = () => {
    setLoading(true);
    axios
      .get("https://insta-vibe-backend-8yxq.onrender.com/files")
      .then((response) => {
        console.log("API Response:", response); // Debug log
        console.log("Response Data:", response.data); // Debug log
        
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setFiles(response.data);
          setError(null);
        } else {
          console.error("Expected array but got:", response.data);
          setFiles([]);
          setError("Invalid data format received from server");
        }
      })
      .catch((error) => {
        console.error("Error fetching files", error);
        setError("Failed to load posts");
        setFiles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`https://insta-vibe-backend-8yxq.onrender.com/delete/${id}`)
      .then(() => {
        fetchFiles();
      })
      .catch((error) => {
        console.error("Error deleting file", error);
        alert("Failed to delete post");
      });
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleString(); 
  };

  return (
    <div className="show-posts-container">
      <h2>Your Feed</h2>
      
      {loading && <p>Loading posts...</p>}
      
      {error && <p className="error-message">{error}</p>}
      
      {!loading && !error && files.length === 0 && (
        <p>No posts found. Be the first to create a post!</p>
      )}

      <div className="posts-grid">
        {files.map((file) => (
          <div key={file._id} className="post-card">
            <div className="post-image-container">
              <img
                src={file.file_url}
                alt={file.file_name}
                className="post-image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x300?text=Image+Error";
                }}
              />
            </div>
            <div className="post-footer">
              {/* Updated line: Using getDisplayUsername function */}
              <p className="post-username">@{getDisplayUsername(file.username)}</p>
              <p className="post-caption">{file.caption}</p>
              <p className="post-time">{formatTime(file.upload_time)}</p>
              <button
                className="delete-button"
                onClick={() => handleDelete(file._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowPost;
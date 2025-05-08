import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../../utils';
import Sidebar from './TSidebar';
import '../../css/TeacherCss/tProjectStatus.css';
import api from '../../Api/axiosinstance'; // Your axios instance
const TProjectStatus = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [studentUpdates, setStudentUpdates] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [commentText, setCommentText] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userData = localStorage.getItem('loggedInUser');
    if (userData) {
      setLoggedInUser(JSON.parse(userData));
    }
    fetchStudentUpdates();
  }, []);

  const fetchStudentUpdates = async (token) => {
    if (!token) {
      console.error('No token found. Please log in first.');
      return; // Early return if no token is found
    }
  
    try {
      const response = await api.get('/teacher/student-updates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data.success && Array.isArray(response.data.updates)) {
        // If using populate, student name may be inside studentId
        const formattedUpdates = response.data.updates.map(update => ({
          ...update,
          studentName: update.studentId?.name || 'Unknown Student',
        }));
  
        setStudentUpdates(formattedUpdates);
      } else {
        handleError(response.data.message || 'Unexpected response format');
      }
    } catch (error) {
      handleError('Failed to fetch student updates');
      console.error(error);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('User Logged out');
    setTimeout(() => window.location.href = '/login', 1000);
  };

  const handleSelectUpdate = (update) => {
    setSelectedUpdate(update);
    setCommentText('');
  };

  const sendComment = async () => {
    if (!commentText.trim() || !selectedUpdate) {
      return handleError('Please select an update and write a comment');
    }

    try {
      const response = await api.post(
        '/teacher/send-comment',
        {
          updateId: selectedUpdate._id,
          comment: commentText,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.success) {
        handleSuccess('Comment sent successfully!');
        setCommentText('');
        fetchStudentUpdates(); // Refetch the updates to reflect the comment
      } else {
        handleError(response.data.message || 'Failed to send comment');
      }
    } catch (error) {
      handleError('Failed to send comment');
      console.error(error);
    }
  };

  return (
    <div className="teacher-dashboard-container">
      <Sidebar onLogout={handleLogout} />
      <div className="content-area">
        <h1>Welcome, {loggedInUser?.name}</h1>

        <div className="student-updates-section">
          <h2>Student Project Updates</h2>

          <div className="updates-container">
            <div className="updates-list">
              <h3>Updates from Students</h3>
              {studentUpdates.length === 0 ? (
                <p>No updates from students yet.</p>
              ) : (
                <ul className="student-updates">
                  {studentUpdates.map((update) => (
                    <li
                      key={update._id}
                      className={`update-item ${selectedUpdate?._id === update._id ? 'selected' : ''}`}
                      onClick={() => handleSelectUpdate(update)}
                    >
                      <div className="update-header">
                        <strong>{update.studentName}</strong>
                        <span className="timestamp">{new Date(update.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="update-preview">{update.message?.substring(0, 50) || ''}...</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="update-details">
              {selectedUpdate ? (
                <div className="selected-update">
                  <h3>Update from {selectedUpdate.studentName}</h3>
                  <div className="update-metadata">
                    <p><strong>Project:</strong> {selectedUpdate.projectTitle || 'Not specified'}</p>
                    <p><strong>Sent on:</strong> {new Date(selectedUpdate.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="update-message">
                    <p>{selectedUpdate.message}</p>
                  </div>

                  <div className="previous-comments">
                    <h4>Previous Comments</h4>
                    {selectedUpdate?.comments?.length > 0 ? (
                      <ul className="comments-list">
                        {selectedUpdate.comments.map((comment, index) => (
                          <li key={index} className="comment-item">
                            <div className="comment-header">
                              <strong>{comment.sender === 'teacher' ? 'You' : selectedUpdate.studentName}</strong>
                              <span className="timestamp">{new Date(comment.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No previous comments.</p>
                    )}
                  </div>

                  <div className="comment-form">
                    <h4>Add Comment</h4>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your feedback to the student..."
                      rows={4}
                    />
                    <button onClick={sendComment} className="submit-button">Send Comment</button>
                  </div>
                </div>
              ) : (
                <div className="no-update-selected">
                  <p>Select an update from the list to view details and respond.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default TProjectStatus;

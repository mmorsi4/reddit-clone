import React, { useState } from "react";
import "../styles/ShareFeedPopup.css";


const ShareFeedPopup = ({ feed, users, onSend, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const filteredUsers = users.filter(u => u._id !== feed.author?._id);


  const toggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.some(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleSend = () => {
    onSend(selectedUsers);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Share "{feed.name}"</h2>

        <ul className="share-user-list">
          {filteredUsers.map(user => (
            <li key={user._id} onClick={() => toggleUser(user)}>
              <input
                type="checkbox"
                checked={selectedUsers.some(u => u._id === user._id)}
                readOnly
              />
              <img src={user.avatar || "../images/avatar.png"} />
              <span>{user.username}</span>
            </li>
          ))}
        </ul>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button disabled={!selectedUsers.length} onClick={handleSend}>
            Send Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareFeedPopup;

import React from 'react';
import './CantFollowing.css';

function CantFollowing({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="cant-following-modal">
      <div className="modal-content">
        <h2>알림</h2>
        <p>자신을 팔로우할 수 없습니다.</p>
        <button onClick={onClose}>확인</button>
      </div>
    </div>
  );
}

export default CantFollowing;

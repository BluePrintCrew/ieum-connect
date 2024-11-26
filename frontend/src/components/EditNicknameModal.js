import React, { useState } from 'react';
import '../EditNicknameModal.css'; // 모달에 대한 별도의 CSS 파일 생성

const EditNicknameModal = ({ isOpen, onClose, currentNickname, onSave }) => {
  const [nickname, setNickname] = useState(currentNickname || '');

  const handleSave = () => {
    if (nickname.trim() === '') {
      alert('닉네임을 입력해주세요.');
      return;
    }
    onSave(nickname);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>닉네임 수정</h2>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="새 닉네임을 입력하세요"
        />
        <div className="modal-buttons">
          <button onClick={handleSave}>저장</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default EditNicknameModal;

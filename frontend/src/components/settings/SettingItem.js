// SettingItem.js
import React from 'react';
import PropTypes from 'prop-types';
import './css/SettingItem.css'; // 필요한 경우 스타일 파일을 import합니다.

const SettingItem = ({ title, onClick, icon }) => {
  return (
    <div className="setting-item" onClick={onClick}>
      {icon && <div className="setting-icon">{icon}</div>}
      <div className="setting-title">{title}</div>
      <div className="setting-arrow">›</div>
    </div>
  );
};

SettingItem.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.element, // 아이콘으로 React 엘리먼트를 받을 수 있습니다.
};

export default SettingItem;

// Settings.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingItem from './SettingItem';
import './css/Settings.css';  
import {
  FaUser,
  FaLock,
  FaBell,
  FaShieldAlt,
  FaUserFriends,
  FaInfoCircle,
  FaQuestionCircle,
} from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="settings-container">
      {/* 상단 바 */}
      <div className="header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
    {/*   <h1>설정</h1> */}
      </div>

      {/* 설정 목록 */}
      <div className="settings-list">
        <SettingItem
          title="프로필"
          onClick={() => navigate('/components/EditNicknameModal')} // 닉네임 변경 모달 
          icon={<FaUser />}
        />
        <SettingItem
          title="계정"
          onClick={() => navigate('/settings/account')}
          icon={<FaLock />}
        />
        <SettingItem
          title="알림"
          onClick={() => navigate('/settings/notifications')}
          icon={<FaBell />}
        />
        <SettingItem
          title="개인정보"
          onClick={() => navigate('/settings/privacy')}
          icon={<FaShieldAlt />}
        />
        <SettingItem
          title="친구 관리"
          onClick={() => navigate('/settings/friends')}
          icon={<FaUserFriends />}
        />
        <SettingItem
          title="앱 정보"
          onClick={() => navigate('/settings/appinfo')}
          icon={<FaInfoCircle />}
        />
        <SettingItem
          title="고객 지원"
          onClick={() => navigate('/settings/support')}
          icon={<FaQuestionCircle />}
        />
      </div>

      {/* 하단 네비게이션 */}
    </div>
  );
};

export default Settings;

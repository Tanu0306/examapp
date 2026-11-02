import React, { useState } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import './SettingsPage.css';

export const SettingsPage = () => {
  const [profile, setProfile] = useState({
    name: 'Professor',
    email: 'professor@example.com',
    avatar: ''
  });

  const [labConfig, setLabConfig] = useState({
    labName: 'Lab A',
    defaultDuration: 90,
    allowNavigation: false,
    allowScreenCapture: false,
    serverStatus: 'Online',
    lanIp: '192.168.1.100',
    terminalInfo: 'Linux x86_64'
  });

  const [showModal, setShowModal] = useState(false);

  const handleSaveProfile = () => {
    // Mock save – close modal
    setShowModal(false);
  };

  const handleSaveLab = () => {
    // Mock save – show alert
    alert('Lab settings saved (mock)');
  };

  return (
    <div className="settings-page">
      <h2>Teacher Portal Settings</h2>

      {/* Profile Settings */}
      <section className="profile-section">
        <h3>Profile</h3>
        <Input
          label="Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          required
        />
        <Button onClick={() => setShowModal(true)}>Save Profile</Button>
      </section>

      {/* Lab Configuration */}
      <section className="lab-config-section">
        <h3>Lab Configuration</h3>
        <Input
          label="Lab Name"
          value={labConfig.labName}
          onChange={(e) => setLabConfig({ ...labConfig, labName: e.target.value })}
        />
        <Input
          label="Default Duration (min)"
          type="number"
          value={labConfig.defaultDuration}
          onChange={(e) =>
            setLabConfig({ ...labConfig, defaultDuration: Number(e.target.value) })
          }
        />
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={labConfig.allowNavigation}
              onChange={(e) =>
                setLabConfig({ ...labConfig, allowNavigation: e.target.checked })
              }
            />
            Allow Navigation
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={labConfig.allowScreenCapture}
              onChange={(e) =>
                setLabConfig({ ...labConfig, allowScreenCapture: e.target.checked })
              }
            />
            Allow Screen Capture
          </label>
        </div>
        <Input label="Server Status" value={labConfig.serverStatus} readOnly />
        <Input label="LAN IP" value={labConfig.lanIp} readOnly />
        <Input label="Terminal Info" value={labConfig.terminalInfo} readOnly />
        <Button onClick={handleSaveLab}>Save Lab Config</Button>
      </section>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Profile Updated">
          <p>Profile changes have been saved (mock).</p>
          <Button onClick={handleSaveProfile}>Close</Button>
        </Modal>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { FaLock, FaSave, FaShieldAlt, FaMobileAlt, FaKey, FaSignOutAlt } from 'react-icons/fa';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';
import './SecuritySettings.css';

const SecuritySettings = () => {
  const { settings, updateSettings } = useSettings();
  const { user, updatePassword, enableTwoFactor, disableTwoFactor } = useAuth();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipRestriction: false,
    allowedIPs: '',
    receiveLoginAlerts: true,
    showSecurityTips: true
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSessions, setActiveSessions] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordConfirmed, setNewPasswordConfirmed] = useState(false);
  const [terminatingSession, setTerminatingSession] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  
  useEffect(() => {
    if (settings?.security) {
      setFormData(prev => ({
        ...prev,
        ...settings.security
      }));
    }
    
    // Mock active sessions
    setActiveSessions([
      { 
        id: '1', 
        deviceName: 'Chrome on Windows', 
        location: 'New York, USA', 
        browser: 'Chrome', 
        os: 'Windows', 
        deviceType: 'desktop',
        lastActive: 'Just now', 
        current: true 
      },
      { 
        id: '2', 
        deviceName: 'Firefox on MacOS', 
        location: 'San Francisco, USA', 
        browser: 'Firefox', 
        os: 'MacOS', 
        deviceType: 'desktop',
        lastActive: 'Yesterday', 
        current: false 
      },
      { 
        id: '3', 
        deviceName: 'Mobile App', 
        location: 'Boston, USA', 
        browser: 'Safari', 
        os: 'iOS', 
        deviceType: 'mobile',
        lastActive: '3 days ago', 
        current: false 
      }
    ]);
  }, [settings]);
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };
  
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    if (password.length < 8) {
      setPasswordStrength('weak');
      return;
    }
    
    let score = 0;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score === 4) setPasswordStrength('veryStrong');
    else if (score === 3) setPasswordStrength('strong');
    else if (score === 2) setPasswordStrength('medium');
    else setPasswordStrength('weak');
  };
  
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak - Add more characters, numbers, and symbols';
      case 'medium': return 'Medium - Getting better, but could be stronger';
      case 'strong': return 'Strong - Good job!';
      case 'veryStrong': return 'Very Strong - Excellent password!';
      default: return 'Enter a password';
    }
  };
  
  const isPasswordValid = () => {
    return passwordData.newPassword.length >= 8;
  };
  
  const isConfirmPasswordValid = () => {
    return passwordData.newPassword === passwordData.confirmPassword;
  };
  
  const handleNextStep = () => {
    if (isPasswordValid()) {
      setNewPasswordConfirmed(true);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmitPasswordChange = async () => {
    if (!isConfirmPasswordValid()) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setNewPasswordConfirmed(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update password. Please check your current password and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateSettings({
        security: {
          ...formData
        }
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Security settings updated successfully!' 
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update security settings. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleTwoFactor = async () => {
    setLoading(true);
    
    try {
      if (formData.twoFactorEnabled) {
        await disableTwoFactor();
        setFormData(prev => ({ ...prev, twoFactorEnabled: false }));
        setMessage({ type: 'success', text: 'Two-factor authentication disabled.' });
      } else {
        const setupInfo = await enableTwoFactor();
        setFormData(prev => ({ ...prev, twoFactorEnabled: true }));
        setMessage({ 
          type: 'success', 
          text: 'Two-factor authentication enabled. Please save your backup codes in a safe place.' 
        });
        // Here you would typically display the QR code and backup codes to the user
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update two-factor authentication. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTerminateSession = (sessionId) => {
    // In a real app, you would call an API to invalidate the session
    setTerminatingSession(sessionId);
    
    // Simulate API call
    setTimeout(() => {
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      setMessage({ type: 'success', text: 'Session terminated successfully.' });
      setTerminatingSession(null);
    }, 1000);
  };
  
  return (
    <div className="settingsSection">
      <h2 className="sectionTitle"><FaLock /> Security & Privacy</h2>
      <p className="sectionDescription">
        Manage your account security settings, password, and active sessions.
      </p>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settingsGroup">
        <h3 className="subsectionTitle">Change Password</h3>
        <div className="formGroup">
          <label htmlFor="currentPassword">Current Password</label>
          <div className="inputWrapper">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="formInput"
            />
            <button
              type="button"
              className="togglePassword"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="formGroup">
          <label htmlFor="newPassword">New Password</label>
          <div className="inputWrapper">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="formInput"
            />
            <button
              type="button"
              className="togglePassword"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="passwordStrength">
          <div className={`strengthMeter ${passwordStrength}`}>
            <div className="strengthBar"></div>
          </div>
          <p className="strengthText">{getPasswordStrengthText()}</p>
        </div>

        {!newPasswordConfirmed && (
          <button 
            className="actionButton primary" 
            onClick={handleNextStep}
            disabled={!isPasswordValid() || loading}
          >
            {loading ? 'Processing...' : 'Next'}
          </button>
        )}

        {newPasswordConfirmed && (
          <div className="formGroup">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="inputWrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="formInput"
              />
              <button
                type="button"
                className="togglePassword"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button 
              className="actionButton primary" 
              onClick={handleSubmitPasswordChange}
              disabled={!isConfirmPasswordValid() || loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>

      <div className="settingsGroup">
        <h3 className="subsectionTitle">Two-Factor Authentication</h3>
        <div className="twoFactorSection">
          <div className="twoFactorInfo">
            <FaMobileAlt className="twoFactorIcon" />
            <div>
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
              <p className="status">{formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          
          <button 
            className={`actionButton ${formData.twoFactorEnabled ? 'danger' : 'primary'}`}
            onClick={handleToggleTwoFactor}
            disabled={loading}
          >
            {loading ? 'Processing...' : (formData.twoFactorEnabled ? 'Disable' : 'Enable')}
          </button>
        </div>
      </div>

      <div className="settingsGroup">
        <h3 className="subsectionTitle">Security Preferences</h3>
        <form className="securityForm" onSubmit={handleSecuritySubmit}>
          <div className="formGroup">
            <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
            <input
              type="number"
              id="sessionTimeout"
              name="sessionTimeout"
              min="5"
              max="1440"
              value={formData.sessionTimeout}
              onChange={handleChange}
              className="formInput"
            />
          </div>

          <div className="formGroup checkbox">
            <input
              type="checkbox"
              id="receiveLoginAlerts"
              name="receiveLoginAlerts"
              checked={formData.receiveLoginAlerts}
              onChange={handleChange}
              className="checkboxInput"
            />
            <label htmlFor="receiveLoginAlerts">Receive email alerts on new logins</label>
          </div>

          <div className="formGroup checkbox">
            <input
              type="checkbox"
              id="ipRestriction"
              name="ipRestriction"
              checked={formData.ipRestriction}
              onChange={handleChange}
              className="checkboxInput"
            />
            <label htmlFor="ipRestriction">Restrict access by IP address</label>
          </div>

          {formData.ipRestriction && (
            <div className="formGroup">
              <label htmlFor="allowedIPs">Allowed IP Addresses (one per line)</label>
              <textarea
                id="allowedIPs"
                name="allowedIPs"
                value={formData.allowedIPs}
                onChange={handleChange}
                className="formInput textArea"
                rows="3"
                placeholder="192.168.1.1&#10;10.0.0.1"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="actionButton primary"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Security Settings'}
          </button>
        </form>
      </div>

      <div className="settingsGroup">
        <h3 className="subsectionTitle">Active Sessions</h3>
        <div className="activeSessions">
          {activeSessions.map((session) => (
            <div key={session.id} className="sessionItem">
              <div className="sessionInfo">
                <div className="deviceInfo">
                  <span className="deviceIcon">
                    {session.deviceType === 'mobile' ? <FaMobileAlt /> : <FaKey />}
                  </span>
                  <div>
                    <p className="deviceName">{session.deviceName}</p>
                    <p className="deviceMeta">{session.browser} • {session.os}</p>
                  </div>
                </div>
                <div className="sessionMeta">
                  <p className="sessionLocation">{session.location}</p>
                  <p className="sessionTime">Last active: {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button 
                  className="actionButton danger small"
                  onClick={() => handleTerminateSession(session.id)}
                  disabled={terminatingSession === session.id}
                >
                  <FaSignOutAlt /> {terminatingSession === session.id ? 'Terminating...' : 'Terminate'}
                </button>
              )}
              {session.current && (
                <span className="currentSession">Current Session</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 
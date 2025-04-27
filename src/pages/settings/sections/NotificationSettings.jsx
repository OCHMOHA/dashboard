import { useState, useEffect } from 'react';
import { FaBell, FaSave, FaEnvelope, FaDesktop, FaMobile } from 'react-icons/fa';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../context/AuthContext';

const NotificationSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: true,
    
    // Notification types
    newMessages: true,
    taskAssignments: true,
    systemUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    
    // Time preferences
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    if (settings?.notifications) {
      setFormData(prev => ({
        ...prev,
        ...settings.notifications
      }));
    }
  }, [settings]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateSettings({
        notifications: {
          ...formData
        }
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Notification settings updated successfully!' 
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update notification settings. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="settingsSection">
      <h2 className="sectionTitle">Notification Settings</h2>
      <p className="sectionDescription">Manage how and when you receive notifications</p>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="settingsForm">
        <div className="formSection">
          <h3 className="subsectionTitle">Notification Channels</h3>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
              />
              <span className="checkboxText">
                <FaEnvelope className="channelIcon" />
                Email Notifications
              </span>
            </label>
            <p className="fieldDescription">
              Send notifications to {user?.email || 'your email address'}
            </p>
          </div>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="pushNotifications"
                checked={formData.pushNotifications}
                onChange={handleChange}
              />
              <span className="checkboxText">
                <FaMobile className="channelIcon" />
                Push Notifications
              </span>
            </label>
            <p className="fieldDescription">
              Receive notifications on your mobile device
            </p>
          </div>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="desktopNotifications"
                checked={formData.desktopNotifications}
                onChange={handleChange}
              />
              <span className="checkboxText">
                <FaDesktop className="channelIcon" />
                Desktop Notifications
              </span>
            </label>
            <p className="fieldDescription">
              Show notifications in your browser
            </p>
          </div>
          
          <h3 className="subsectionTitle">Notification Types</h3>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="newMessages"
                checked={formData.newMessages}
                onChange={handleChange}
              />
              <span className="checkboxText">New Messages</span>
            </label>
          </div>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="taskAssignments"
                checked={formData.taskAssignments}
                onChange={handleChange}
              />
              <span className="checkboxText">Task Assignments</span>
            </label>
          </div>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="systemUpdates"
                checked={formData.systemUpdates}
                onChange={handleChange}
              />
              <span className="checkboxText">System Updates</span>
            </label>
          </div>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="securityAlerts"
                checked={formData.securityAlerts}
                onChange={handleChange}
              />
              <span className="checkboxText">Security Alerts</span>
            </label>
          </div>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="marketingEmails"
                checked={formData.marketingEmails}
                onChange={handleChange}
              />
              <span className="checkboxText">Marketing Emails</span>
            </label>
          </div>
          
          <h3 className="subsectionTitle">Quiet Hours</h3>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="quietHoursEnabled"
                checked={formData.quietHoursEnabled}
                onChange={handleChange}
              />
              <span className="checkboxText">Enable Quiet Hours</span>
            </label>
            <p className="fieldDescription">
              Pause notifications during specified hours
            </p>
          </div>
          
          {formData.quietHoursEnabled && (
            <div className="timeRangeGroup">
              <div className="formGroup">
                <label htmlFor="quietHoursStart">Start Time</label>
                <input
                  type="time"
                  id="quietHoursStart"
                  name="quietHoursStart"
                  value={formData.quietHoursStart}
                  onChange={handleChange}
                  className="timeInput"
                />
              </div>
              
              <div className="formGroup">
                <label htmlFor="quietHoursEnd">End Time</label>
                <input
                  type="time"
                  id="quietHoursEnd"
                  name="quietHoursEnd"
                  value={formData.quietHoursEnd}
                  onChange={handleChange}
                  className="timeInput"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="formActions">
          <button 
            type="submit" 
            className="saveButton"
            disabled={loading}
          >
            {loading ? 'Saving...' : (
              <>
                <FaSave className="buttonIcon" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings; 
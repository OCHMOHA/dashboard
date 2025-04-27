import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

const ProfileSettings = () => {
  const { currentUser, updateProfile } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatarUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: settings?.profile?.phone || '',
        location: settings?.profile?.location || '',
        bio: settings?.profile?.bio || '',
        avatarUrl: currentUser.photoURL || ''
      });
    }
  }, [currentUser, settings]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // First update profile data
      await updateProfile({
        displayName: formData.displayName,
        photoURL: formData.avatarUrl,
        // Handle avatar upload if needed
      });
      
      // Then update additional profile settings
      await updateSettings({
        profile: {
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio
        }
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="settingsSection">
      <h2 className="sectionTitle">Profile Settings</h2>
      <p className="sectionDescription">Update your personal information and profile settings</p>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="settingsForm">
        <div className="avatarSection">
          <div className="currentAvatar">
            <img 
              src={previewUrl || formData.avatarUrl || "/avatar-placeholder.png"} 
              alt="Profile Avatar" 
            />
          </div>
          <div className="avatarUpload">
            <label htmlFor="avatar" className="uploadButton">
              Change Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hiddenInput"
            />
            <p className="uploadTip">Recommended: Square image, 400x400 pixels or larger</p>
          </div>
        </div>
        
        <div className="formSection">
          <div className="formGroup">
            <label htmlFor="displayName">
              <FaUser className="formIcon" />
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          
          <div className="formGroup">
            <label htmlFor="email">
              <FaEnvelope className="formIcon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              disabled
            />
            <small>Email cannot be changed. Contact support for assistance.</small>
          </div>
          
          <div className="formGroup">
            <label htmlFor="phone">
              <FaPhone className="formIcon" />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </div>
          
          <div className="formGroup">
            <label htmlFor="location">
              <FaMapMarkerAlt className="formIcon" />
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>
          
          <div className="formGroup fullWidth">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself"
              rows={4}
            />
          </div>
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

export default ProfileSettings; 
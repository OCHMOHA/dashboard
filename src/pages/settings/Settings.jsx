import "./settings.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useContext, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/AuthContext";
import { 
  NotificationsActive, 
  NotificationsOff, 
  Security, 
  ColorLens, 
  Language, 
  Backup, 
  CloudSync,
  Info,
  Person
} from "@mui/icons-material";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaBell, FaPalette, FaShieldAlt, FaDatabase, FaLock, FaCog } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProfileSettings from './sections/ProfileSettings';
import NotificationSettings from './sections/NotificationSettings';
import AppearanceSettings from './sections/AppearanceSettings';
import SecuritySettings from './sections/SecuritySettings';
import BackupSettings from './sections/BackupSettings';
import SystemSettings from './sections/SystemSettings';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';

const Settings = () => {
  const { darkMode, dispatch } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const { settings, loading, updateSettings } = useSettings();
  const { currentUser: authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  
  // Get tab from URL if exists, otherwise default to profile
  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab && ['profile', 'appearance', 'notifications', 'security', 'backups', 'system'].includes(tab) 
      ? tab 
      : 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  
  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', activeTab);
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  }, [activeTab, location.pathname, navigate]);
  
  // Update tab if URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.search]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  useEffect(() => {
    document.title = 'Settings | Admin Dashboard';
  }, []);
  
  const handleSave = async () => {
    if (authUser?.uid) {
      try {
        setSaved(false);
        setLoading(true);
        await updateDoc(doc(db, "settings", authUser.uid), settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (error) {
        console.error("Error saving settings:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Special handling for theme changes
    if (name === "theme") {
      dispatch({ type: value === "dark" ? "DARK" : "LIGHT" });
    }
  };
  
  if (loading) {
    return (
      <div className="settingsLoading">
        <LoadingSpinner />
        <p>Loading settings...</p>
      </div>
    );
  }

  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'backups':
        return <BackupSettings />;
      case 'system':
        return <SystemSettings />;
      default:
        return <ProfileSettings />;
    }
  };
  
  return (
    <div className="settings">
      <Breadcrumb title="Settings" />
      <h1 className="settingsTitle">Settings</h1>
      
      <div className="settingsContainer">
        <Sidebar />
        <div className="settingsContent">
          <Navbar />
          
          <div className="settingsSidebar">
            <div className="sidebarUser">
              <div className="userAvatar">
                {authUser?.photoURL ? (
                  <img src={authUser.photoURL} alt="User avatar" />
                ) : (
                  <div className="avatarPlaceholder">
                    {authUser?.displayName?.charAt(0) || authUser?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="userName">
                <h3>{authUser?.displayName || 'User'}</h3>
                <p>{authUser?.email || ''}</p>
              </div>
            </div>
            <div className="settingsTabs">
              <button 
                className={`settingsTab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
                aria-label="Profile settings"
              >
                <FaUser className="icon" /> Profile
              </button>
              <button
                className={`settingsTab ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => handleTabChange('appearance')}
                aria-label="Appearance settings"
              >
                <FaPalette className="icon" /> Appearance
              </button>
              <button
                className={`settingsTab ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => handleTabChange('notifications')}
                aria-label="Notification settings"
              >
                <FaBell className="icon" /> Notifications
              </button>
              <button
                className={`settingsTab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => handleTabChange('security')}
                aria-label="Security settings"
              >
                <FaLock className="icon" /> Security
              </button>
              <button
                className={`settingsTab ${activeTab === 'backups' ? 'active' : ''}`}
                onClick={() => handleTabChange('backups')}
                aria-label="Backup settings"
              >
                <FaDatabase className="icon" /> Backups & Data
              </button>
              <button
                className={`settingsTab ${activeTab === 'system' ? 'active' : ''}`}
                onClick={() => handleTabChange('system')}
                aria-label="System settings"
              >
                <FaCog className="icon" /> System
              </button>
            </div>
          </div>
          
          <div className="settingsMain">
            {renderSettingsContent()}
            
            {saved && <div className="saveMessage success">Settings saved successfully!</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 
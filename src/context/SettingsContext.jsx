import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AuthContext } from './AuthContext';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    profile: {
      displayName: '',
      email: '',
      language: 'en',
      timezone: 'UTC'
    },
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      updates: false,
      newsletter: false
    },
    appearance: {
      mode: 'system', // 'light', 'dark', 'system'
      fontSize: 'medium', // 'small', 'medium', 'large'
      primaryColor: '#6f42c1'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30, // minutes
      passwordResetPeriod: 90 // days
    },
    backups: {
      autoBackup: false,
      backupFrequency: 'weekly', // 'daily', 'weekly', 'monthly'
      backupRetention: 30 // days
    }
  });
  const [loading, setLoading] = useState(true);

  // Load settings from Firestore when user changes
  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const settingsRef = doc(db, 'settings', currentUser.uid);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...settingsSnap.data()
          }));
        } else {
          // Create default settings for new user
          const defaultSettings = {
            ...settings,
            profile: {
              ...settings.profile,
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
            }
          };
          
          await setDoc(settingsRef, defaultSettings);
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [currentUser]);

  // Save settings to Firestore
  const updateSettings = async (newSettings) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Update local state first for immediate UI response
      setSettings(newSettings);
      
      // Update in Firestore
      const settingsRef = doc(db, 'settings', currentUser.uid);
      await updateDoc(settingsRef, newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert to previous settings on error
      const settingsRef = doc(db, 'settings', currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data());
      }
    } finally {
      setLoading(false);
    }
  };

  // Update a specific setting section
  const updateSettingSection = async (section, sectionData) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        ...sectionData
      }
    };
    
    await updateSettings(newSettings);
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        setSettings,
        updateSettings,
        updateSettingSection,
        loading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext); 
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    profile: {
      displayName: "",
      email: "",
      bio: "",
      phoneNumber: "",
    },
    appearance: {
      theme: "light",
      fontSize: "medium",
      colorAccent: "#6439ff",
      compactMode: false,
    },
    notifications: {
      email: true,
      push: true,
      marketing: false,
      updates: true,
      newMessages: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginNotifications: true,
    },
    system: {
      language: "english",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      timezone: "UTC",
      autoUpdate: true,
    }
  });

  useEffect(() => {
    // Simulate loading settings from API/localStorage
    const loadSettings = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from API
        // const response = await fetch('api/settings');
        // const data = await response.json();
        
        // For demo, we'll use mock data with a delay to simulate network request
        setTimeout(() => {
          if (currentUser) {
            const userData = {
              ...settings,
              profile: {
                ...settings.profile,
                displayName: currentUser.displayName || "",
                email: currentUser.email || "",
              }
            };
            setSettings(userData);
          }
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to load settings:", error);
        setLoading(false);
      }
    };

    if (currentUser) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const updateSettings = async (section, data) => {
    try {
      // In a real app, send update to API
      // await fetch('api/settings', { 
      //   method: 'PUT',
      //   body: JSON.stringify({ section, data })
      // });
      
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          ...data
        }
      }));
      
      // Return success
      return { success: true };
    } catch (error) {
      console.error(`Failed to update ${section} settings:`, error);
      return { success: false, error };
    }
  };

  const resetSettings = async (section) => {
    // Default settings for each section
    const defaults = {
      appearance: {
        theme: "light",
        fontSize: "medium",
        colorAccent: "#6439ff",
        compactMode: false,
      },
      notifications: {
        email: true,
        push: true,
        marketing: false,
        updates: true,
        newMessages: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        loginNotifications: true,
      },
      system: {
        language: "english",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        timezone: "UTC",
        autoUpdate: true,
      }
    };

    if (!defaults[section]) {
      return { success: false, error: "Invalid section" };
    }

    try {
      // In a real app, send reset request to API
      // await fetch(`api/settings/${section}/reset`, { method: 'POST' });
      
      setSettings(prev => ({
        ...prev,
        [section]: defaults[section]
      }));
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to reset ${section} settings:`, error);
      return { success: false, error };
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export default SettingsContext; 
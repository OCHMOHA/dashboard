import { useState, useEffect } from 'react';
import { FaSun, FaMoon, FaDesktop, FaSave, FaCheck } from 'react-icons/fa';
import { useSettings } from '../../../context/SettingsContext';

const AppearanceSettings = () => {
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    theme: 'system',
    sidebarCompact: false,
    reducedMotion: false,
    fontSize: 'medium',
    colorAccent: 'blue'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    if (settings?.appearance) {
      setFormData({
        theme: settings.appearance.theme || 'system',
        sidebarCompact: settings.appearance.sidebarCompact || false,
        reducedMotion: settings.appearance.reducedMotion || false,
        fontSize: settings.appearance.fontSize || 'medium',
        colorAccent: settings.appearance.colorAccent || 'blue'
      });
    }
  }, [settings]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleThemeChange = (theme) => {
    setFormData(prev => ({
      ...prev,
      theme
    }));
  };
  
  const handleColorAccentChange = (color) => {
    setFormData(prev => ({
      ...prev,
      colorAccent: color
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateSettings({
        appearance: {
          ...formData
        }
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Appearance settings updated successfully!' 
      });
      
      // Apply theme changes immediately
      document.documentElement.setAttribute('data-theme', formData.theme);
      document.documentElement.setAttribute('data-accent', formData.colorAccent);
      
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update appearance settings. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const colorOptions = [
    { name: 'Blue', value: 'blue' },
    { name: 'Green', value: 'green' },
    { name: 'Purple', value: 'purple' },
    { name: 'Red', value: 'red' },
    { name: 'Orange', value: 'orange' },
    { name: 'Teal', value: 'teal' }
  ];
  
  const fontSizeOptions = [
    { name: 'Small', value: 'small' },
    { name: 'Medium', value: 'medium' },
    { name: 'Large', value: 'large' }
  ];
  
  return (
    <div className="settingsSection">
      <h2 className="sectionTitle">Appearance Settings</h2>
      <p className="sectionDescription">Customize how the dashboard looks and feels</p>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="settingsForm">
        <div className="formSection">
          <h3 className="subsectionTitle">Theme</h3>
          <div className="themeOptions">
            <div 
              className={`themeOption ${formData.theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <div className="themePreview lightTheme">
                <FaSun className="themeIcon" />
              </div>
              <span className="themeName">Light</span>
              {formData.theme === 'light' && <FaCheck className="selectedIcon" />}
            </div>
            
            <div 
              className={`themeOption ${formData.theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <div className="themePreview darkTheme">
                <FaMoon className="themeIcon" />
              </div>
              <span className="themeName">Dark</span>
              {formData.theme === 'dark' && <FaCheck className="selectedIcon" />}
            </div>
            
            <div 
              className={`themeOption ${formData.theme === 'system' ? 'active' : ''}`}
              onClick={() => handleThemeChange('system')}
            >
              <div className="themePreview systemTheme">
                <FaDesktop className="themeIcon" />
              </div>
              <span className="themeName">System</span>
              {formData.theme === 'system' && <FaCheck className="selectedIcon" />}
            </div>
          </div>
          
          <h3 className="subsectionTitle">Accent Color</h3>
          <div className="colorOptions">
            {colorOptions.map(color => (
              <div
                key={color.value}
                className={`colorOption ${formData.colorAccent === color.value ? 'active' : ''}`}
                style={{ backgroundColor: `var(--color-${color.value})` }}
                onClick={() => handleColorAccentChange(color.value)}
              >
                {formData.colorAccent === color.value && <FaCheck className="colorSelectedIcon" />}
              </div>
            ))}
          </div>
          
          <h3 className="subsectionTitle">Font Size</h3>
          <div className="fontSizeOptions">
            {fontSizeOptions.map(size => (
              <label 
                key={size.value} 
                className={`fontSizeOption ${formData.fontSize === size.value ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="fontSize"
                  value={size.value}
                  checked={formData.fontSize === size.value}
                  onChange={handleChange}
                  className="hiddenInput"
                />
                <span className="fontSizeName">{size.name}</span>
              </label>
            ))}
          </div>
          
          <h3 className="subsectionTitle">Layout Options</h3>
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="sidebarCompact"
                checked={formData.sidebarCompact}
                onChange={handleChange}
              />
              <span className="checkboxText">Compact Sidebar</span>
            </label>
            <p className="fieldDescription">Use a more compact sidebar layout to save space</p>
          </div>
          
          <div className="formGroup checkboxGroup">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                name="reducedMotion"
                checked={formData.reducedMotion}
                onChange={handleChange}
              />
              <span className="checkboxText">Reduced Motion</span>
            </label>
            <p className="fieldDescription">Minimize animations throughout the interface</p>
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

export default AppearanceSettings; 
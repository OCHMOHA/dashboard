import { createContext, useReducer, useEffect } from "react";
import DarkModeReducer from "./darkModeReducer";

// Get stored dark mode preference from localStorage, or default to false
const getInitialDarkMode = () => {
  const savedMode = localStorage.getItem("darkMode");
  return savedMode ? JSON.parse(savedMode) : false;
};

const INITIAL_STATE = {
  darkMode: getInitialDarkMode(),
};

export const DarkModeContext = createContext(INITIAL_STATE);

export const DarkModeContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(DarkModeReducer, INITIAL_STATE);

  // Save dark mode state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
  }, [state.darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode: state.darkMode, dispatch }}>
      {children}
    </DarkModeContext.Provider>
  );
};

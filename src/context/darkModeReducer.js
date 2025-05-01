const DarkModeReducer = (state, action) => {
  switch (action.type) {
    case "LIGHT": {
      localStorage.setItem("darkMode", "false");
      return {
        darkMode: false,
      };
    }
    case "DARK": {
      localStorage.setItem("darkMode", "true");
      return {
        darkMode: true,
      };
    }
    case "TOGGLE": {
      const newDarkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
      return {
        darkMode: newDarkMode,
      };
    }
    default:
      return state;
  }
};

export default DarkModeReducer;

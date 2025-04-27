import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CloseIcon from "@mui/icons-material/Close";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { darkMode, dispatch } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Sample data for search - in a real app, you would fetch this from your API or store
  const searchableData = [
    { id: 1, type: "user", name: "John Smith", path: "/users/1" },
    { id: 2, type: "user", name: "Jane Cooper", path: "/users/2" },
    { id: 3, type: "user", name: "Robert Johnson", path: "/users/3" },
    { id: 101, type: "order", name: "Order #101", path: "/orders?id=101" },
    { id: 102, type: "order", name: "Order #102", path: "/orders?id=102" },
    { id: 103, type: "order", name: "Order #103", path: "/orders?id=103" }
  ];

  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE" });
  };

  const getUserDisplayName = () => {
    if (!currentUser) return "Guest";
    
    // If user has displayName property use that
    if (currentUser.displayName) return currentUser.displayName;
    
    // Otherwise use email or username
    return currentUser.email || currentUser.username || "User";
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setShowResults(false);
      return;
    }
    
    // Filter searchable data based on input
    const filteredResults = searchableData.filter(item => 
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(filteredResults);
    setShowResults(true);
  };

  // Handle clicking on a search result
  const handleResultClick = (path) => {
    setSearchTerm("");
    setShowResults(false);
    navigate(path);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get icon for different result types
  const getTypeIcon = (type) => {
    switch(type) {
      case "user":
        return "👤";
      case "order":
        return "🛒";
      default:
        return "🔍";
    }
  };

  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="search" ref={searchRef}>
          <input 
            type="text" 
            placeholder="Search users, orders..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm ? (
            <CloseIcon className="searchIcon clearIcon" onClick={clearSearch} />
          ) : (
            <SearchOutlinedIcon className="searchIcon" />
          )}
          
          {showResults && (
            <div className="searchResults">
              {searchResults.length > 0 ? (
                <>
                  <div className="resultsHeader">
                    <span>Search Results</span>
                  </div>
                  <ul>
                    {searchResults.map((result) => (
                      <li key={`${result.type}-${result.id}`} onClick={() => handleResultClick(result.path)}>
                        <span className="resultIcon">{getTypeIcon(result.type)}</span>
                        <div className="resultContent">
                          <span className="resultName">{result.name}</span>
                          <span className="resultType">{result.type}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="noResults">No results found</div>
              )}
            </div>
          )}
        </div>
        <div className="items">
          <div className="item">
            <LanguageOutlinedIcon className="icon" />
            English
          </div>
          <div className="item darkModeToggle" onClick={toggleDarkMode}>
            {darkMode ? (
              <LightModeOutlinedIcon className="icon" />
            ) : (
              <DarkModeOutlinedIcon className="icon" />
            )}
          </div>
          <div className="item userInfo">
            <PersonOutlineIcon className="icon" />
            <span className="userName">{getUserDisplayName()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

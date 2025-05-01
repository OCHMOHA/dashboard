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
import { ref, get, query as dbQuery, orderByChild, startAt, endAt } from "firebase/database";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, firestore } from "../../firebase";

const Navbar = () => {
  const { darkMode, dispatch } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

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
    
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      performSearch(value);
    }, 300);
    
    return () => clearTimeout(timer);
  };
  
  const performSearch = async (term) => {
    if (term.trim().length < 2) return;
    
    setIsSearching(true);
    const results = [];
    
    try {
      // Search for users in Firestore
      const usersQuery = query(
        collection(firestore, "users"),
        where("firstName", ">=", term),
        where("firstName", "<=", term + '\uf8ff')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        results.push({
          id: doc.id,
          type: "user",
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          path: `/users?id=${doc.id}`
        });
      });
      
      // Also search in users by lastName
      const lastNameQuery = query(
        collection(firestore, "users"),
        where("lastName", ">=", term),
        where("lastName", "<=", term + '\uf8ff')
      );
      
      const lastNameSnapshot = await getDocs(lastNameQuery);
      
      lastNameSnapshot.forEach(doc => {
        // Avoid duplicates
        if (!results.some(r => r.id === doc.id)) {
          const userData = doc.data();
          results.push({
            id: doc.id,
            type: "user",
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            path: `/users?id=${doc.id}`
          });
        }
      });
      
      // Search for orders in Realtime Database
      const ordersRef = ref(db, "orders");
      const ordersSnapshot = await get(ordersRef);
      
      if (ordersSnapshot.exists()) {
        const orders = ordersSnapshot.val();
        
        Object.keys(orders).forEach(key => {
          // Match order ID or client/worker name if available
          if (key.includes(term) || 
              (orders[key].clientName && orders[key].clientName.toLowerCase().includes(term.toLowerCase())) ||
              (orders[key].workerName && orders[key].workerName.toLowerCase().includes(term.toLowerCase()))) {
            
            let displayName = `Order #${key.substring(0, 7)}`;
            if (orders[key].clientName) {
              displayName += ` - ${orders[key].clientName}`;
            }
            
            results.push({
              id: key,
              type: "order",
              name: displayName,
              path: `/orders?id=${key}`
            });
          }
        });
      }
      
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching data:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (path, result) => {
    setSearchTerm("");
    setShowResults(false);
    
    // Store the appropriate ID in localStorage based on result type
    if (result.type === "user") {
      localStorage.setItem('viewUserId', result.id);
      localStorage.setItem('userType', path.includes('worker') ? 'worker' : 'client');
      navigate('/users');
    } else if (result.type === "order") {
      localStorage.setItem('viewOrderId', result.id);
      navigate('/orders');
    } else {
      // Default fallback for other result types
      navigate(path);
    }
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
              {isSearching ? (
                <div className="searching">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="resultsHeader">
                    <span>Search Results</span>
                  </div>
                  <ul>
                    {searchResults.map((result) => (
                      <li key={`${result.type}-${result.id}`} onClick={() => handleResultClick(result.path, result)}>
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

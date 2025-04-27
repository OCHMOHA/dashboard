import "./profile.scss";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaCalendarAlt, 
  FaCog 
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    position: "Software Developer",
    department: "Engineering",
    joinDate: "January 15, 2023",
    bio: "Experienced software developer with a passion for creating efficient and scalable applications. Specialized in React and Node.js development with 5+ years of industry experience.",
    skills: ["React", "JavaScript", "Node.js", "CSS", "HTML", "API Development"],
    recentActivity: [
      { id: 1, action: "Completed order #5478", date: "2 days ago" },
      { id: 2, action: "Updated user profile", date: "1 week ago" },
      { id: 3, action: "Processed refund for order #3982", date: "2 weeks ago" }
    ]
  });

  useEffect(() => {
    // Normally we would fetch this data from an API
    // For now, we'll use the current user data and fill in the rest
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        displayName: currentUser.displayName || "John Doe",
        email: currentUser.email || "johndoe@example.com"
      }));
    }
  }, [currentUser]);

  return (
    <div className="profile">
      <div className="profileContainer">
        <div className="profileHeader">
          <div className="profileAvatar">
            <img 
              src={currentUser?.photoURL || "/avatar-placeholder.png"} 
              alt="Profile Avatar" 
            />
          </div>
          <div className="profileInfo">
            <h1>{profileData.displayName}</h1>
            <p className="position">{profileData.position}</p>
            <p className="department">{profileData.department}</p>
            <Link to="/settings" className="editProfileBtn">
              <FaCog /> Edit Profile
            </Link>
          </div>
        </div>

        <div className="profileContent">
          <div className="leftColumn">
            <div className="infoCard">
              <h3>Personal Information</h3>
              <div className="infoItem">
                <FaUser className="infoIcon" />
                <div className="infoText">
                  <span className="infoLabel">Full Name</span>
                  <span className="infoValue">{profileData.displayName}</span>
                </div>
              </div>
              <div className="infoItem">
                <FaEnvelope className="infoIcon" />
                <div className="infoText">
                  <span className="infoLabel">Email</span>
                  <span className="infoValue">{profileData.email}</span>
                </div>
              </div>
              <div className="infoItem">
                <FaPhone className="infoIcon" />
                <div className="infoText">
                  <span className="infoLabel">Phone</span>
                  <span className="infoValue">{profileData.phone}</span>
                </div>
              </div>
              <div className="infoItem">
                <FaMapMarkerAlt className="infoIcon" />
                <div className="infoText">
                  <span className="infoLabel">Location</span>
                  <span className="infoValue">{profileData.location}</span>
                </div>
              </div>
              <div className="infoItem">
                <FaBriefcase className="infoIcon" />
                <div className="infoText">
                  <span className="infoLabel">Position</span>
                  <span className="infoValue">{profileData.position}</span>
                </div>
              </div>
              <div className="infoItem">
                <FaCalendarAlt className="infoIcon" />
                <div className="infoText">
                  <span className="infoLabel">Joined</span>
                  <span className="infoValue">{profileData.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="infoCard">
              <h3>Bio</h3>
              <p className="bioText">{profileData.bio}</p>
            </div>

            <div className="infoCard">
              <h3>Skills</h3>
              <div className="skillTags">
                {profileData.skills.map((skill, index) => (
                  <span key={index} className="skillTag">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rightColumn">
            <div className="infoCard">
              <h3>Recent Activity</h3>
              <div className="activityList">
                {profileData.recentActivity.map(activity => (
                  <div key={activity.id} className="activityItem">
                    <div className="activityDot"></div>
                    <div className="activityInfo">
                      <span className="activityAction">{activity.action}</span>
                      <span className="activityDate">{activity.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="infoCard statsCard">
              <h3>Performance Stats</h3>
              <div className="statGrid">
                <div className="statItem">
                  <span className="statValue">157</span>
                  <span className="statLabel">Orders Processed</span>
                </div>
                <div className="statItem">
                  <span className="statValue">24</span>
                  <span className="statLabel">Pending Tasks</span>
                </div>
                <div className="statItem">
                  <span className="statValue">98%</span>
                  <span className="statLabel">Completion Rate</span>
                </div>
                <div className="statItem">
                  <span className="statValue">4.9</span>
                  <span className="statLabel">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
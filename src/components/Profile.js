import React, { useState, useEffect } from "react";
// import AnimatedNumber from "./AnimatedNumber"; // ❌ removed because unused
// import { COLORS } from "../constants";          // ❌ removed because unused

const Profile = ({ onOpenHandled }) => {
  // Removed unused states:
  // const [totalPortfolio, setTotalPortfolio] = useState(0);
  // const [totalProfit, setTotalProfit] = useState(0);
  // const [allocation, setAllocation] = useState([]);
  // const [ch24, setCh24] = useState([]);
  // const [ch7, setCh7] = useState([]);
  // const [ch30, setCh30] = useState([]);
  // const [topLosers, setTopLosers] = useState([]);

  useEffect(() => {
    if (onOpenHandled) {
      onOpenHandled();
    }
  }, [onOpenHandled]); // ✅ fixed missing dependency

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <p>Welcome to your dashboard!</p>
      {/* Add actual content here, like portfolio, charts, etc. */}
    </div>
  );
};

export default Profile;

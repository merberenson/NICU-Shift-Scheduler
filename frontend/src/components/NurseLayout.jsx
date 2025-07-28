import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";



const NurseLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/logout');
    };
    const handleWeeklySchedule = () => {
        navigate('/schedule');
    };
    const handlePtoRequest = () => {
        navigate('/pto');
    };
    const handleUpdateAvailability = () => {
        navigate('/availability');
    };
    const handleMain = () => {
        navigate('/');
    };

    
    return (
  <div style={{
    minHeight: "100vh",
    background: "#232323",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <div style={{
      background: "#fff",
      width: "96vw",
      height: "92vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 0 24px #1d1d1d22",
      borderRadius: "0"
    }}>
      {/* Header */}
      <div style={{
        padding: "36px 60px 0 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <span style={{
          fontWeight: 400,
          fontSize: "2.2rem",
          color: "#222",
          letterSpacing: "0.4px"
        }}>
          NICU Schedule
        </span>
        <div style={{ textAlign: "right", color: "#65686e", fontSize: "1.05rem", marginRight: 10 }}>
          Date: {new Date().toLocaleDateString()}<br />
          Time: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      {/* Body Layout */}
      <div style={{
        display: "flex",
        flex: 1,
        height: "100%",
        alignItems: "flex-start"
      }}>
        {/* Sidebar */}
        <div style={{
          width: "305px",
          background: "#002178",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          borderRadius: "0 0 0 34px",
          boxShadow: "6px 0 24px #ececec18"
        }}>
          <button
            onClick={handleMain}
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              color: "#fff",
              border: "none",
              fontWeight: 400,
              fontSize: "1.08rem",
              borderRadius: "33px",
              margin: "8px 0 0 32px",
              padding: "17px 42px",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#e3e4e7";
              e.currentTarget.style.color = "#232323";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#fff";
            }}
          >
            <span style={{ fontSize: "1.38rem", marginRight: 13 }}>📁</span>
            Main
          </button>
          <button
            onClick={handleWeeklySchedule}
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              color: "#d8e4ff",
              border: "none",
              fontWeight: 400,
              fontSize: "1.08rem",
              borderRadius: "33px",
              margin: "8px 0 0 32px",
              padding: "17px 42px",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#e6eefd";
              e.currentTarget.style.color = "#002178";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#d8e4ff";
            }}
          >
            <span style={{ fontSize: "1.38rem", marginRight: 13 }}>🗓️</span>
            Weekly Schedule
          </button>
          <button
            onClick={handleUpdateAvailability}
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              color: "#d8e4ff",
              border: "none",
              fontWeight: 400,
              fontSize: "1.08rem",
              borderRadius: "33px",
              margin: "8px 0 0 32px",
              padding: "17px 42px",
              cursor: "pointer"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#e6eefd";
              e.currentTarget.style.color = "#002178";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#d8e4ff";
            }}
          >
            <span style={{ fontSize: "1.38rem", marginRight: 13 }}>🕒</span>
            Update Availability
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              color: "#f5974b",
              border: "none",
              fontWeight: 400,
              fontSize: "1.12rem",
              borderRadius: "29px",
              margin: "0 0 42px 32px",
              padding: "15px 39px",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#fde3d4";
              e.currentTarget.style.color = "#d94b2a";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#f5974b";
            }}
          >
            <span style={{ fontSize: "1.28rem", marginRight: 13 }}>🔌</span>
            Logout
          </button>
        </div>
        {/* Main Content - top/left aligned */}
          <div style={{
            flex: 1,
            padding: "70px 60px",
            overflowY: "auto"
          }}>
            {children}
          </div>
      </div>
    </div>
  </div>
)};

export default NurseLayout;
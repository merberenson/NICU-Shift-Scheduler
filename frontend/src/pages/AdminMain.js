import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Dummy action handlers for demo
function handleEdit() {
  alert("Edit Admin Info - Not Implemented Yet!");
}

const AdminMain = ({ adminInfo }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/logout');
  };

  const handleSchedule = () => {
    navigate('/teamschedule');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handlePTORequests = () => {
    navigate('/ptorequests');
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
            fontSize: "2.55rem",
            color: "#222",
            letterSpacing: "0.4px"
          }}>
            NICU Schedule Admin Portal
          </span>
          <button
            onClick={handleEdit}
            style={{
              background: "#3BC16C",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "9px 34px",
              fontWeight: 500,
              fontSize: "1.09rem",
              cursor: "pointer",
              boxShadow: "0 1px 7px #1dbd6b33",
              transition: "background 0.16s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "#249b48"}
            onMouseOut={e => e.currentTarget.style.background = "#3BC16C"}
          >
            Edit
          </button>
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
            background: "#929292",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            borderRadius: "0 0 0 34px",
            boxShadow: "6px 0 24px #ececec18"
          }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                color: "#232323",
                border: "none",
                fontWeight: 600,
                fontSize: "1.15rem",
                borderRadius: "36px",
                margin: "42px 0 18px 22px",
                padding: "19px 50px",
                boxShadow: "0 5px 16px #e4e4ed",
                cursor: "pointer"
              }}
              disabled
            >
              <span style={{ fontSize: "1.55rem", marginRight: 15 }}>📁</span>
              Main
            </button>

            <button onClick={handleSchedule} style={sidebarBtnStyle}>🗓️ Schedule</button>
            <button onClick={handleRegister} style={sidebarBtnStyle}>🗓️ Register Nurse</button>
            <button onClick={handlePTORequests} style={sidebarBtnStyle}>📄 PTO Requests</button>

            <div style={{ flex: 1 }} />

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                color: "#eea05b",
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
                e.currentTarget.style.background = "#fae4c2";
                e.currentTarget.style.color = "#f96c27";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#eea05b";
              }}
            >
              <span style={{ fontSize: "1.28rem", marginRight: 13 }}>🟫</span>
              Logout
            </button>
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            padding: "70px 0 0 60px",
            position: "relative"
          }}>
            <div>
              <div style={{
                fontWeight: 400,
                fontSize: "2.2rem",
                marginBottom: 10,
                color: "#232323",
                textAlign: "left"
              }}>
                Admin INFO
              </div>
              <div style={{
                fontSize: "1.48rem",
                color: "#232323",
                lineHeight: 1.34
              }}>
                : Number of Nurses{" "}
                <span style={{ fontWeight: 500 }}>
                  {adminInfo?.nurseCount ?? "--"}
                </span>
              </div>
            </div>

            <div style={{
              position: "absolute",
              right: "32px",
              bottom: "22px",
              color: "#a3a3a3",
              fontSize: "2.1rem",
              opacity: 0.8,
              userSelect: "none"
            }}>
              <span>⌄</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shared sidebar button styling
const sidebarBtnStyle = {
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
};

export default AdminMain;

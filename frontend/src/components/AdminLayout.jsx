import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Dummy action handlers for demo
function handleEdit() {
  alert("Edit Admin Info - Not Implemented Yet!");
}

const AdminLayout = ({ children }) => {
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

    const handleMain = () => {
        navigate('/admin');
    };

    const handleDelete = () => {
        navigate('/delete');
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
            borderRadius: "0 0 0 34px", // Only top left, no bottom
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
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    borderRadius: "36px",
                    margin: "42px 0 18px 22px",
                    padding: "19px 50px",
                    cursor: "pointer"
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
                <span style={{ fontSize: "1.55rem", marginRight: 15 }}>📁</span>
                Main
            </button>
            <button
                onClick={handleSchedule}
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
                <span style={{ fontSize: "1.38rem", marginRight: 13 }}>🗓️</span>
                Schedule
            </button>
            <button
                onClick={handleRegister}
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
                <span style={{ fontSize: "1.38rem", marginRight: 13 }}>🗓️</span>
                Register Nurse
            </button>
            <button
                onClick={handleDelete}
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
                <span style={{ fontSize: "1.38rem", marginRight: 13 }}>🗓️</span>
                Delete Nurse
            </button>
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
    </div>);
};

export default AdminLayout;
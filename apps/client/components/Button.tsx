import React from "react";

const Button = ({ extension, icon: Icon, disabled = false, onClick }) => {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "15px 30px",
        margin: "10px 0px",
        fontSize: "14px",
        backgroundColor: disabled ? "#444" : "#333",
        color: "#fff",
        outline: "1px solid #6b7280",
        borderRadius: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.outline = disabled
          ? "1px soldid #6b7280"
          : "4px solid #6b7280")
      }
      onMouseOut={(e) => (e.currentTarget.style.outline = "1px solid #6b7280")}
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "30px",
        }}
      >
        <Icon />
      </span>
      {extension}
    </button>
  );
};

export default Button;

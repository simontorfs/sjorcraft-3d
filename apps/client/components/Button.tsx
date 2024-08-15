import React from "react";

const ExportButton = ({ extension, icon: Icon }) => {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "15px 30px",
        margin: "10px 0px",
        fontSize: "14px",
        backgroundColor: "#333",
        color: "#fff",
        outline: "1px solid #6b7280",
        borderRadius: "16px",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        position: "relative",
      }}
      onMouseOver={(e) => (e.currentTarget.style.outline = "4px solid #6b7280")}
      onMouseOut={(e) => (e.currentTarget.style.outline = "1px solid #6b7280")}
      onClick={() => {
        console.log(extension);
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

export default ExportButton;

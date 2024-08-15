import React from "react";
import PoleTable from "./PoleTable";
import ExportButton from "./Button";
import ExportIcon from "../assets/icons/export.svg?react";

const EditorSidebar = () => {
  return (
    <div className="editor-sidebar">
      <PoleTable />
      <hr style={{ border: "1px solid #ccc", margin: "20px 0px" }} />
      <ExportButton extension=".sjor" icon={ExportIcon} />
      <ExportButton extension=".dae" icon={ExportIcon} />
      <ExportButton extension=".jpg" icon={ExportIcon} />
    </div>
  );
};

export default EditorSidebar;

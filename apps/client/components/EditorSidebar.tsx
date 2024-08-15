import React from "react";
import PoleTable from "./PoleTable";
import Button from "./Button";
import ExportIcon from "../assets/icons/export.svg?react";

const EditorSidebar = () => {
  return (
    <div className="editor-sidebar">
      <PoleTable />
      <hr style={{ border: "1px solid #ccc", margin: "20px 0px" }} />
      <Button extension=".sjor" icon={ExportIcon} disabled={false} />
      <Button extension=".jpg" icon={ExportIcon} disabled={false} />
      <Button extension=".dae" icon={ExportIcon} disabled={true} />
    </div>
  );
};

export default EditorSidebar;

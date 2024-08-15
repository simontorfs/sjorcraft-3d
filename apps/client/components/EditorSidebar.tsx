import React, { useContext, useRef } from "react";
import PoleTable from "./PoleTable";
import Button from "./Button";
import ExportIcon from "../assets/icons/export.svg?react";
import ImportIcon from "../assets/icons/import.svg?react";
import { RendererContext } from "../contexts/rendererContext";

const EditorSidebar = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;

  const onExportJpg = () => {
    viewer?.imageExporter.exportImage();
  };

  const onExportSjor = () => {
    viewer?.saveTool.exportAll("sjorcraft_export");
  };

  const onExportDae = () => {
    console.log("Exporting to dae");
  };

  const onImportSjor = () => {
    viewer?.saveTool.importAll();
  };

  return (
    <div className="editor-sidebar">
      <PoleTable />
      <hr style={{ border: "1px solid #ccc", margin: "20px 0px" }} />
      <Button extension=".sjor" icon={ExportIcon} onClick={onExportSjor} />
      <Button extension=".jpg" icon={ExportIcon} onClick={onExportJpg} />
      <Button
        extension=".dae"
        icon={ExportIcon}
        disabled={true}
        onClick={onExportDae}
      />
      <hr style={{ border: "1px solid #ccc", margin: "20px 0px" }} />
      <Button extension=".sjor" icon={ImportIcon} onClick={onImportSjor} />
      <input
        type="file"
        id="file"
        accept=".sjor"
        style={{ display: "none" }} // Hide the input element
      />
    </div>
  );
};

export default EditorSidebar;

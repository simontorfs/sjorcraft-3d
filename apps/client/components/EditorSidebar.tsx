import React, { useContext } from "react";
import PoleTable from "./PoleTable";
import Button from "./Button";
import ExportIcon from "../assets/icons/export.svg?react";
import ImportIcon from "../assets/icons/import.svg?react";
import CoffeeIcon from "../assets/icons/coffee.svg?react";
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

  const onExportGLTF = () => {
    viewer?.saveTool.exportGLTF("sjorcraft_export");
  };

  const onImportSjor = () => {
    viewer?.saveTool.importAll();
  };

  const onCoffeeBreak = () => {
    window.open(
      "https://buymeacoffee.com/sjorcraft",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="editor-sidebar">
      <PoleTable />
      <hr style={{ border: "1px solid #ccc", margin: "20px 0px" }} />
      <Button extension=".sjor" icon={ExportIcon} onClick={onExportSjor} />
      <Button extension=".jpg" icon={ExportIcon} onClick={onExportJpg} />
      <Button
        extension=".gltf"
        icon={ExportIcon}
        disabled={false}
        onClick={onExportGLTF}
      />
      <hr style={{ border: "1px solid #ccc", margin: "20px 0px" }} />
      <Button extension=".sjor" icon={ImportIcon} onClick={onImportSjor} />
      <input type="file" id="file" accept=".sjor" style={{ display: "none" }} />
      <hr style={{ border: "1px solid #ccc", margin: "20px 0px" }} />
      <Button
        extension="Coffee break"
        icon={CoffeeIcon}
        onClick={onCoffeeBreak}
      />
    </div>
  );
};

export default EditorSidebar;

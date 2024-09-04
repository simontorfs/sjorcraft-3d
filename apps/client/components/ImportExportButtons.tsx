import React, { useContext } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { RendererContext } from "../contexts/rendererContext";

const ImportExportButtons = () => {
  const [type, setType] = React.useState(".SJOR");
  const [description, setDescription] = React.useState(
    "This filetype can only be used in our platform to share amazing ideas with other people."
  );
  const rendererContext = useContext(RendererContext);

  const viewer = rendererContext.viewer;
  const exportFile = (type: string) => {
    switch (type) {
      case ".SJOR":
        viewer?.saveTool.exportAll("sjorcraft_export");
        break;
      case ".JPG":
        viewer?.imageExporter.exportImage();
        break;
      case ".DAE":
        viewer?.saveTool.exportToDAE("dae_export");
        break;
      case ".STL":
        viewer?.saveTool.exportToSTL();
        break;
      default:
        break;
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setType(event.target.value as string);
    switch (event.target.value) {
      case ".SJOR":
        setDescription(
          "This filetype can only be used in our platform to share amazing ideas with other people."
        );
        break;
      case ".JPG":
        setDescription(
          "This filetype is used to export the current scene as a .jpg image so you can look at your construction even when you are not online."
        );
        break;
      case ".STL":
        setDescription(
          `Export the current scene as an .stl file so you can import it in other 3D modeling software such as Blender, 3DS Max, Maya, etc. An .stl file is a 3D model format that is commonly used for 3D printing.`
        );
      case ".DAE":
        setDescription(
          `Export the current scene as a .dae file so you can import it in other 3D modeling software. Such as Blender, 3DS Max, Maya, etc. 
          `
        );
        break;
      case ".GLTF":
        setDescription(
          `This filetype is used to export the current scene as a .gltf file so you can import it in other 3D modeling software. Such as Blender, 3DS Max, Maya, etc. 
          Coming soon!`
        );
        break;
      default:
        setDescription("");
        break;
    }
  };

  const onImportSjor = () => {
    viewer?.saveTool.importAll();
  };

  return (
    <Box
      sx={{
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1rem",
          width: "100%",
        }}
      >
        <Typography variant="h5" color="primary.contrastText">
          Select export filetype
        </Typography>
        <Select
          labelId="select-export-type"
          id="select-export-type"
          value={type}
          label="ExportType"
          onChange={handleChange}
        >
          <MenuItem value={".SJOR"}>.SJOR</MenuItem>
          <MenuItem value={".JPG"}>.JPG</MenuItem>
          <MenuItem value={".DAE"}>.DAE</MenuItem>
          <MenuItem value={".STL"}>.STL</MenuItem>
          <MenuItem value={".GLTF"}>.GLTF</MenuItem>
        </Select>
        <Typography variant="body1" color="primary.contrastText">
          {description}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<FileDownloadIcon />}
          onClick={() => exportFile(type)}
          disabled={type === ".GLTF"}
        >
          Download {type}
        </Button>
      </Box>
      <Divider
        sx={{
          margin: "1rem 0",
          backgroundColor: "secondary.light",
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1rem",
          width: "100%",
        }}
      >
        <Typography variant="h5" color="primary.contrastText">
          Import .sjor file
        </Typography>
        <Typography variant="body1" color="primary.contrastText">
          This filetype is used to import a scene that was exported from our
          platform.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<FileUploadIcon />}
          onClick={onImportSjor}
        >
          .sjor
        </Button>
        <input
          type="file"
          id="file"
          accept=".sjor"
          style={{ display: "none" }}
        />
      </Box>
    </Box>
  );
};

export default ImportExportButtons;

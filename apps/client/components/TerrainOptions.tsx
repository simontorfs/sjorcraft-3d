import {
  Box,
  Divider,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useContext } from "react";
import { RendererContext } from "../contexts/rendererContext";
import { Color } from "three";

type TerrainOptionsProps = {
  parameterObject: {
    isGrassTexture: boolean;
    toggleFloorTexture: () => void;
    floorColor: string;
    setFloorColor: (color: string) => void;
  };
};
const TerrainOptions = ({ parameterObject }: TerrainOptionsProps) => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  return (
    <Box>
      <Typography variant="h6">Terrain Options</Typography>
      <Divider
        sx={{
          backgroundColor: "primary.contrastText",
          margin: "1rem 0",
        }}
        variant="fullWidth"
      />
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "primary.light",
          color: "primary.contrastText",
        }}
      >
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Default Floor color</TableCell>
              <TableCell>
                <input
                  type="color"
                  value={parameterObject.floorColor}
                  onChange={(event) => {
                    viewer?.floor.onUpdateFromClient(
                      parameterObject.isGrassTexture,
                      new Color(event.target.value)
                    );
                    parameterObject.setFloorColor(event.target.value);
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Use Grasstexture</TableCell>
              <TableCell>
                <Switch
                  aria-label=""
                  color="secondary"
                  onClick={() => {
                    viewer?.floor.onUpdateFromClient(
                      !parameterObject.isGrassTexture
                    );
                    parameterObject.toggleFloorTexture();
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TerrainOptions;

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
import React from "react";

const TerrainOptions = () => {
  const [isGrassTexture, setIsGrassTexture] = React.useState(false);
  const [floorColor, setFloorColor] = React.useState<string>("#2a6e3c");
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
                  value={floorColor}
                  onChange={(event) => setFloorColor(event.target.value)}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Use Grasstexture</TableCell>
              <TableCell>
                <Switch
                  aria-label=""
                  color="secondary"
                  onChange={() => {
                    setIsGrassTexture(!isGrassTexture);
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

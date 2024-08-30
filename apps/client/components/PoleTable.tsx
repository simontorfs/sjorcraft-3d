import React from "react";
import ColorIndicator from "./ColorIndicator";
import { usePoles } from "../src/hooks/usePoles";
import {
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const PoleTable = () => {
  const poles = usePoles();
  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "primary.light",
        color: "primary.contrastText",
        overflowY: "scroll",

        "& th": {
          fontWeight: "bold",
          backgroundColor: "primary.main",
        },

        "& td": {
          fontWeight: "bold",
        },
      }}
    >
      <Table aria-label="Pole Table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Color</TableCell>
            <TableCell align="left">Length</TableCell>
            <TableCell align="left">#</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {poles?.map((pole) => (
            <TableRow key={pole.length}>
              <TableCell>
                <ColorIndicator color={pole.color} />
              </TableCell>
              <TableCell>{`${pole.length} m`}</TableCell>
              <TableCell>{pole.number}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PoleTable;

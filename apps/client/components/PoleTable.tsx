import React from "react";
import ColorIndicator from "./ColorIndicator";
import { usePoles } from "../src/hooks/usePoles";
import {
  Paper,
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
    <TableContainer component={Paper}>
      <Table
        aria-label="Pole Table"
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="center">#</TableCell>
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

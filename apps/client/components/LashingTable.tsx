import React from "react";
import { useLashings } from "../src/hooks/useLashings";
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
  const [lashings, bipodLashings] = useLashings();
  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "primary.light",
        color: "primary.contrastText",
        overflowY: "auto",

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
            <TableCell align="left">Type</TableCell>
            <TableCell align="left">#</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key="lashings">
            <TableCell>{`Square Lashing`}</TableCell>
            <TableCell>{lashings}</TableCell>
          </TableRow>
          <TableRow key="bipodLashings">
            <TableCell>{`Bipod Lashing`}</TableCell>
            <TableCell>{bipodLashings}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PoleTable;

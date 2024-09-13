import { Box, Paper, Typography } from "@mui/material";
import * as React from "react";

export const Faq = () => {
  return (
    <Box
      bgcolor={"Background"}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Typography
        variant="h1"
        sx={{
          color: "Text",
          fontSize: 48,
          mb: 2,
        }}
      >
        Frequently Asked Questions
      </Typography>
      <Typography>Here are some frequently asked questions.</Typography>
    </Box>
  );
};

export default Faq;

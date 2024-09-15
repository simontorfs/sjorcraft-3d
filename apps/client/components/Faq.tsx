import { Box, Paper, Stack, Typography } from "@mui/material";
import * as React from "react";
import FaqQuestion from "./buildingBlocks/FaqQuestion";
import NavigationBar from "./NavigationBar";
import { questions } from "../data/questions";

type FaqProps = {
  parameterObject: {
    isLightMode: boolean;
    toggleLightmode: () => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    floorColor: string;
    setFloorColor: (color: string) => void;
    isGrassTexture: boolean;
    toggleFloorTexture: () => void;
    exportLashings: boolean;
    toggleExportLashings: () => void;
  };
};
export const Faq = ({ parameterObject }: FaqProps) => {
  return (
    <Box>
      <NavigationBar parameterObject={parameterObject} />
      <Box
        bgcolor={"background.default"}
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
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            mb: 2,
          }}
          color={"primary.contrastText"}
        >
          Frequently Asked Questions
        </Typography>
        <Stack
          spacing={0}
          sx={{
            width: { xs: "100%", sm: "80%", md: "60%", lg: "50%" },
          }}
        >
          {questions.map((question, index) => (
            <FaqQuestion
              key={index}
              question={question.question}
              answer={question.answer}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Faq;

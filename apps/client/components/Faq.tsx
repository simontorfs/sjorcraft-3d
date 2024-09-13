import { Box, Paper, Stack, Typography } from "@mui/material";
import * as React from "react";
import FaqQuestion from "./buildingBlocks/FaqQuestion";
import NavigationBar from "./NavigationBar";

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
  const questions: { question: string; answer: string }[] = [
    {
      question: "What is Sjorcraft?",
      answer:
        "Sjorcraft is a web-based 3D editor for creating, sharing and exporting SJORconstructions.",
    },
    {
      question: "Can I export my construction from Sjorcraft?",
      answer:
        "Yes, you can export your construction from Sjorcraft as different files (e.g. .sjor, .jpg, .stl, .dae) different filetypes are on the way. You can find the export button in the top right corner of the editor.",
    },
    {
      question: "Is Sjorcraft free to use?",
      answer:
        'Yes, Sjorcraft is free to use. You can always support us by "buying us a coffee" on our website.',
    },
    {
      question: "Can I cancel drawing a pole?",
      answer:
        "Yes, you can cancel drawing a pole by rightclicking while drawing. This action is possible while using the pole-, bipod- and tripodtool.",
    },
  ];
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
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
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

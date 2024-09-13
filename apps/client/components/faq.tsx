import { Box, Paper, Stack, Typography } from "@mui/material";
import * as React from "react";
import FaqQuestion from "./buildingBlocks/faqQuestion";

export const Faq = () => {
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
      <Stack
        spacing={0}
        sx={{
          width: "80%",
        }}
      >
        {questions.map((q, i) => (
          <FaqQuestion key={i} question={q.question} answer={q.answer} />
        ))}
      </Stack>
    </Box>
  );
};

export default Faq;

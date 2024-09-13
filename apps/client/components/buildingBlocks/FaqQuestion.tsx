import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type FaqQuestionProps = {
  question: string;
  answer: string;
};
const FaqQuestion = ({ question, answer }: FaqQuestionProps) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          variant="body1"
          sx={{
            color: "primary.contrastText",
            fontWeight: "bold",
          }}
        >
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{answer}</AccordionDetails>
    </Accordion>
  );
};

export default FaqQuestion;

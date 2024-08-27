import ArrowIcon from "../assets/icons/arrow.svg?react";
import BipodIcon from "../assets/icons/bipod.svg?react";
import PoleIcon from "../assets/icons/pole.svg?react";
import TripodIcon from "../assets/icons/tripod.svg?react";
import * as React from "react";
import { useContext, useState } from "react";
import { Tool } from "./ToolbarItem";
import { RendererContext } from "../contexts/rendererContext";
import { Box, TextField, Typography } from "@mui/material";
const Toolbar = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  const [selectedTool, setSelectedTool] = useState("selectiontool");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        justifySelf: "center",
        backgroundColor: "rgb(10, 75, 15)",
        color: "white",
        alignItems: "center",
        padding: "0.5rem 2rem",
        fontWeight: "bold",
        fontSize: "x-large",
        height: "3.5rem",
        borderBottom: "0.12rem solid #0b2b26",
      }}
      component="nav"
    >
      <Typography
        variant="h5"
        component="p"
        sx={{
          fontWeight: "bold",
        }}
      >
        SjorCRAFT
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "left",
          gap: "1rem",
          width: "45%",
          padding: "0",
        }}
      >
        <Tool
          style={{ margin: "0 50px 0 0" }}
          active={selectedTool === "selectiontool"}
          disabled={false}
          icon={ArrowIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("selectiontool");
            setSelectedTool("selectiontool");
          }}
        />
        <Tool
          active={selectedTool === "poletool"}
          disabled={false}
          icon={PoleIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("poletool");
            setSelectedTool("poletool");
          }}
        />
        <Tool
          active={selectedTool === "bipodtool"}
          disabled={false}
          icon={BipodIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("bipodtool");
            setSelectedTool("bipodtool");
          }}
        />
        <Tool
          active={selectedTool === "tripodtool"}
          disabled={false}
          icon={TripodIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("tripodtool");
            setSelectedTool("tripodtool");
          }}
        />
      </Box>
      <Box
        component={"div"}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "right",
          justifyItems: "right",
          justifySelf: "center",
          alignContent: "center",
          alignItems: "center",
          gap: "1rem",
          width: "20%",
          height: "100%",
          padding: "0.3rem",
        }}
      >
        <Typography
          variant="h6"
          component="p"
          sx={{
            fontWeight: "bold",
          }}
        >
          Wiki (coming soon)
        </Typography>
      </Box>
    </Box>
  );
};
export default Toolbar;

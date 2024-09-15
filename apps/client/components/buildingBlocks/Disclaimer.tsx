import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import * as React from "react";
type DisclaimerProps = {
  openDisclaimer: boolean;
  toggleDisclaimer: (open: boolean) => void;
};

const Disclaimer = ({ openDisclaimer, toggleDisclaimer }: DisclaimerProps) => {
  const handleClose = () => {
    toggleDisclaimer(false);
  };
  return (
    <React.Fragment>
      <Dialog open={openDisclaimer} onClose={handleClose}>
        <DialogTitle id="own-responsability-title">{"Disclaimer"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="own-responsability-description">
            The SjorCraft platform is a design tool intended to help users
            visualize and conceptualize their constructions.{""}
            <span style={{ fontWeight: "bold" }}>
              We do not assess or guarantee the structural stability,
              feasibility, or safety of any design created using our
              application.
            </span>{" "}
            {""}
            The ability to design a structure on SjorCraft does not imply that
            it can be safely built or will function as intended in real-world
            conditions.
            <Divider sx={{ margin: "1.5rem 0" }} />
            <span style={{ fontWeight: "bold" }}>
              Users are fully responsible for verifying the safety, stability,
              and buildability of their designs through proper testing and
              planning.
            </span>
            The SjorCraft team assumes no liability for any damages, injuries,
            or other consequences resulting from the use of designs created on
            this platform.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            autoFocus
            variant="contained"
            color="success"
          >
            I understand
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Disclaimer;

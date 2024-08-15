import { useCallback, useContext, useEffect, useState } from "react";
import { RendererContext } from "../../contexts/rendererContext";
import { Pole } from "../../../3d/src/pole";

export const usePoles = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  const [poles, setPoles] = useState([]);

  useEffect(() => {
    setPoles(viewer?.poleInventory.getPolesGroupedByLength());
  }, [viewer]);

  const onPolePlace = useCallback(
    ({ value }: { value?: { pole: Pole } }) => {
      setPoles(viewer?.poleInventory.getPolesGroupedByLength());
    },
    [viewer]
  );

  const onPoleMove = useCallback(({ value }: { value?: { pole: Pole } }) => {
    setPoles(viewer?.poleInventory.getPolesGroupedByLength());
  }, []);

  useEffect(() => {
    if (!viewer) return;
    viewer.scene.addEventListener("new_pole_placed", onPolePlace);
    return () => {
      viewer.scene.removeEventListener("new_pole_placed", onPolePlace);
    };
  }, [onPolePlace, viewer]);

  useEffect(() => {
    if (!viewer) return;
    viewer.scene.addEventListener("pole_moved", onPoleMove);
    return () => {
      viewer.scene.removeEventListener("pole_moved", onPoleMove);
    };
  }, [onPoleMove, viewer]);

  return poles;
};

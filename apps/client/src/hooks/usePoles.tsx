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
    ({ pole }: { pole: Pole }) => {
      setPoles(viewer?.poleInventory.getPolesGroupedByLength());
    },
    [viewer]
  );

  const onPoleMove = useCallback(
    ({ pole }: { pole: Pole }) => {
      setPoles(viewer?.poleInventory.getPolesGroupedByLength());
    },
    [viewer]
  );

  const onPoleRemove = useCallback(
    ({ pole }: { pole: Pole }) => {
      setPoles(viewer?.poleInventory.getPolesGroupedByLength());
    },
    [viewer]
  );

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

  useEffect(() => {
    if (!viewer) return;
    viewer.scene.addEventListener("pole_removed", onPoleRemove);
    return () => {
      viewer.scene.removeEventListener("pole_removed", onPoleRemove);
    };
  }, [onPoleMove, viewer]);

  return poles;
};

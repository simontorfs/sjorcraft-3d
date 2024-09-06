import { useCallback, useContext, useEffect, useState } from "react";
import { RendererContext } from "../../contexts/rendererContext";
import { Pole } from "../../../3d/src/pole";
import { Lashing } from "../../../3d/src/lashing";

export const useLashings = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  const [lashings, setLashings] = useState<number>();

  useEffect(() => {
    setLashings(viewer?.inventory.getAmountOfLashings());
  }, [viewer]);

  const onLashingPlaced = useCallback(
    ({ lashing }: { lashing: Lashing }) => {
      setLashings(viewer?.inventory.getAmountOfLashings());
    },
    [viewer]
  );

  const onLashingRemoved = useCallback(
    ({ lashing }: { lashing: Lashing }) => {
      setLashings(viewer?.inventory.getAmountOfLashings());
    },
    [viewer]
  );

  useEffect(() => {
    if (!viewer) return;
    (viewer.scene as any).addEventListener(
      "new_lashing_placed",
      onLashingPlaced
    );
    return () => {
      (viewer.scene as any).removeEventListener(
        "new_lashing_placed",
        onLashingPlaced
      );
    };
  }, [onLashingPlaced, viewer]);

  useEffect(() => {
    if (!viewer) return;
    (viewer.scene as any).addEventListener("lashing_removed", onLashingRemoved);
    return () => {
      (viewer.scene as any).removeEventListener(
        "lashing_removed",
        onLashingRemoved
      );
    };
  }, [onLashingRemoved, viewer]);

  return lashings;
};

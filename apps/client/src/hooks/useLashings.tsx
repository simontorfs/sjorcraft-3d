import { useCallback, useContext, useEffect, useState } from "react";
import { RendererContext } from "../../contexts/rendererContext";
import { Pole } from "../../../3d/src/pole";
import { Lashing } from "../../../3d/src/lashing";
import { BipodLashing } from "../../../3d/src/bipodLashing";

export const useLashings = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  const [lashings, setLashings] = useState<number>();
  const [bipodLashings, setBipodLashings] = useState<number>();

  useEffect(() => {
    setLashings(viewer?.inventory.getAmountOfLashings());
    setBipodLashings(viewer?.inventory.getAmountOfBipodLashings());
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

  const onBipodLashingPlaced = useCallback(
    ({ lashing }: { lashing: BipodLashing }) => {
      setBipodLashings(viewer?.inventory.getAmountOfBipodLashings());
    },
    [viewer]
  );

  const onBipodLashingRemoved = useCallback(
    ({ lashing }: { lashing: BipodLashing }) => {
      setBipodLashings(viewer?.inventory.getAmountOfBipodLashings());
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

  useEffect(() => {
    if (!viewer) return;
    (viewer.scene as any).addEventListener(
      "new_bipod_lashing_placed",
      onBipodLashingPlaced
    );
    return () => {
      (viewer.scene as any).removeEventListener(
        "new_bipod_lashing_placed",
        onBipodLashingPlaced
      );
    };
  }, [onBipodLashingPlaced, viewer]);

  useEffect(() => {
    if (!viewer) return;
    (viewer.scene as any).addEventListener(
      "bipod_lashing_removed",
      onBipodLashingRemoved
    );
    return () => {
      (viewer.scene as any).removeEventListener(
        "bipod_lashing_removed",
        onBipodLashingRemoved
      );
    };
  }, [onBipodLashingRemoved, viewer]);

  return [lashings, bipodLashings];
};

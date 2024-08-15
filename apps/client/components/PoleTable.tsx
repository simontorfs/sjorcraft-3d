import React, { useContext } from "react";
import { RendererContext } from "../contexts/rendererContext";
import ColorIndicator from "./ColorIndicator";

const PoleTable = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext?.viewer;
  const poles = viewer?.detailsTool.getPolesGroupedByLength().reverse();
  return (
    <table className="data-table">
      <tbody>
        {poles?.map((pole) => (
          <tr key={pole.length}>
            <td>
              <ColorIndicator color={pole.color} />
            </td>
            <td>{pole.length}</td>
            <td>{pole.number}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PoleTable;

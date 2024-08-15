import React, { useContext } from "react";
import { RendererContext } from "../contexts/rendererContext";

const PoleTable = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext?.viewer;
  const poles = viewer?.detailsTool.getPolesGroupedByLength();

  return (
    <table className="data-table">
      <tbody>
        {poles?.map((pole) => (
          <tr key={pole.length}>
            <td>{pole.color}</td>
            <td>{pole.length}</td>
            <td>{pole.number}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PoleTable;

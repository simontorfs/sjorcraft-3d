import React from "react";
import ColorIndicator from "./ColorIndicator";
import { usePoles } from "../src/hooks/usePoles";

const PoleTable = () => {
  const poles = usePoles();
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th>#</th>
        </tr>
      </thead>
      <tbody>
        {poles?.map((pole) => (
          <tr key={pole.length}>
            <td>
              <ColorIndicator color={pole.color} />
            </td>
            <td>{`${pole.length} m`}</td>
            <td>{pole.number}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PoleTable;

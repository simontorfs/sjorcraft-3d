import { createContext } from "react";
import { Viewer } from "../../3d/src/viewer";

export type RendererContextType = { viewer?: Viewer };
export const RendererContext = createContext<RendererContextType>({});

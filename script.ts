import { Viewer } from "./src/viewer";

const body = document.querySelector("body");
if (body) {
  const viewer = new Viewer(body);
}

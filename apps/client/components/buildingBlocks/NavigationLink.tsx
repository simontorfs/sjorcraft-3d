import * as React from "react";
import { Link } from "react-router-dom";

const NavigationLink = ({ name, link }: { name: string; link: string }) => (
  <Link
    to={link}
    style={{
      textDecoration: "none",
      color: "inherit",
    }}
  >
    {name}
  </Link>
);

export default NavigationLink;

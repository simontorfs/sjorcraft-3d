import { useEffect, useState } from "react";

// Values taken from responsive design in Tailwind CSS.
// https://tailwindcss.com/docs/responsive-design

enum DeviceSize {
  sm = 640,
  md = 768,
  lg = 1024,
  xl = 1280,
  xl2 = 1536,
}

export const useDeviceSize = () => {
  useEffect(() => {
    const handleResize = () => {
      setDeviceSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [deviceSize, setDeviceSize] = useState(window.innerWidth);

  const xsDevice = deviceSize < DeviceSize.sm;
  const smDevice = deviceSize < DeviceSize.md;
  const mdDevice = deviceSize < DeviceSize.lg;
  const lgDevice = deviceSize < DeviceSize.xl;
  const xlDevice = deviceSize < DeviceSize.xl2;

  return { xsDevice, smDevice, mdDevice, lgDevice, xlDevice };
};

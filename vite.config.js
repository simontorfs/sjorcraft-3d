export default {
  root: "./",
  publicDir: "resources",
  base: "./",
  server: {
    host: true, // Open to local network and display URL
    open: "http://localhost:5173/#debug",
  },
  build: {
    outDir: "./dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
  plugins: [],
};

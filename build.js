require("esbuild").build({
  entryPoints: ["src/index.ts"],
  outfile: "out.js",
  platform: "node",
  bundle: true,
  // watch: {
  //   onRebuild(error, result) {
  //     if (error) console.error("watch build failed:", error);
  //     else {
  //       console.log("watch build succeeded:", result);
  //       // HERE: somehow restart the server from here, e.g., by sending a signal that you trap and react to inside the server.
  //     }
  //   },
  // },
});
// .then((result) => {
//   console.log("watching...");
// });

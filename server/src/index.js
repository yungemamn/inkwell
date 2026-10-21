// server/src/index.js
//
// Entry point. As of Lecture 13 this file only starts the process:
// the app itself is built in app.js, so tests can import it without
// opening a port.

import "dotenv/config";
import { app } from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Inkwell API listening on port ${PORT}`);
});

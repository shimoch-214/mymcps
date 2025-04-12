import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

const main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Server started !!");
};

main().catch((err) => {
  console.error("Fatal error in main(): ", err);
  process.exit(1);
});

import { createServer } from "http";
import app from "../index";

export default function handler(req: any, res: any) {
  const server = createServer(app);
  server.emit("request", req, res);
}

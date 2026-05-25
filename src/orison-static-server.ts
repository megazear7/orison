import express from "express";

import { OrisonProject, type OrisonOptions } from "./project";

export class OrisonStaticServer {
  private readonly app = express();

  private readonly project: OrisonProject;

  constructor(options: OrisonOptions = {}) {
    this.project = new OrisonProject(options);
    this.app.use(
      express.static(this.project.outputRoot, { extensions: ["html"] }),
    );
  }

  async start() {
    return new Promise<void>((resolve) => {
      this.app.listen(this.project.port, () => resolve());
    });
  }
}

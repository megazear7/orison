import express from "express";

import { OrisonProject, type OrisonOptions } from "./project";

export class OrisonServer {
  readonly app = express();

  private readonly project: OrisonProject;

  constructor(options: OrisonOptions = {}) {
    this.project = new OrisonProject(options);
    this.app.use(
      express.static(this.project.staticRoot, { extensions: ["html"] }),
    );
    this.app.use(async (request, response) => {
      const rendered = await this.project.renderRequest(request.path);
      if (!rendered) {
        response.status(404).send("Not found");
        return;
      }

      response
        .status(rendered.statusCode)
        .type(rendered.contentType)
        .send(rendered.content);
    });
  }

  async start() {
    return new Promise<void>((resolve) => {
      this.app.listen(this.project.port, () => resolve());
    });
  }
}

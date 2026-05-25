import { OrisonProject, type OrisonOptions } from "./project";

export class OrisonGenerator {
  private readonly project: OrisonProject;

  constructor(options: OrisonOptions = {}) {
    this.project = new OrisonProject(options);
  }

  async build() {
    return this.project.build();
  }
}

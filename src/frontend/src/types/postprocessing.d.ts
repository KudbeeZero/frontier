declare module "postprocessing" {
  export class ChromaticAberrationEffect {
    constructor(options?: Record<string, unknown>);
  }
  export class VignetteEffect {
    constructor(options?: Record<string, unknown>);
  }
}

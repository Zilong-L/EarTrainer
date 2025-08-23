
declare module 'uplot' {
  class uPlot {
    constructor(opts: any, data: any[][], target: HTMLElement);
    setSize(size: { width: number; height: number }): void;
    destroy(): void;
  }

  export = uPlot;
}

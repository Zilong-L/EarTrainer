declare module '@components/ValueAdjuster' {
  const Component: (props: {
    title?: string;
    value: number;
    setValue: (v: number) => void;
    min: number;
    max: number;
    step?: number;
    displayFunction?: (v: number) => string | number;
  }) => JSX.Element;
  export default Component;
}

declare module '@components/slider/HorizontalSlider' {
  const Component: (props: {
    height?: number;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    mapFunction?: (v: number) => string | number;
    setState?: (v: number) => void;
  }) => JSX.Element;
  export default Component;
}

declare module '*.jsx' {
  const Component: any;
  export default Component;
}

declare module './ThresholdSlider' {
  const Component: (props: {
    threshold: number;
    setThreshold: (v: number) => void;
    currentRMS: number;
  }) => JSX.Element;
  export default Component;
}

declare module 'uplot' {
  class uPlot {
    constructor(opts: any, data: any[][], target: HTMLElement);
    setSize(size: { width: number; height: number }): void;
    destroy(): void;
  }

  export = uPlot;
}

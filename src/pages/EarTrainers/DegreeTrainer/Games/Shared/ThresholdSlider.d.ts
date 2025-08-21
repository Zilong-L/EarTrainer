declare module './ThresholdSlider' {
  const Component: (props: {
    threshold: number;
    setThreshold: (v: number) => void;
    currentRMS: number;
  }) => JSX.Element;
  export default Component;
}

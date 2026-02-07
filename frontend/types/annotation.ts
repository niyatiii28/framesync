export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  tool: "pen" | "eraser";
  size: number;
  points: Point[];
};

export type FrameAnnotation = {
  time: number;
  strokes: Stroke[];
};

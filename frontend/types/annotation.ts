export type Point = {
  x: number;
  y: number;
};

export type StrokeTool = "pen" | "eraser" | "rect" | "arrow";

export type Stroke = {
  tool: StrokeTool;
  size: number;
  color: string;
  opacity: number;
  points: Point[];
};

export type FrameAnnotation = {
  time: number;
  strokes: Stroke[];
};

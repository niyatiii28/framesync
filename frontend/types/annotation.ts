/* =======================
   SHARED ANNOTATION TYPES
   (Frontend + Backend later)
======================= */

export type Point = {
  x: number;
  y: number;
};

export type StrokeTool = "pen" | "eraser";

export type Stroke = {
  tool: StrokeTool;
  size: number;

  /* NEW — styling */
  color: string;
  opacity: number;

  points: Point[];
};

export type FrameAnnotation = {
  time: number;
  strokes: Stroke[];
};

import {useRef} from "react";
import Image from "next/image";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  return (
    <div>
      <h2>FrameSync Home Page</h2>
      <div style={{position : "relative", width : 600}}>
        <video
          ref={videoRef} 
          src="/random.mp4" 
          controls
          width={600}>
        </video>
        <canvas
          ref = {canvasRef}
          width={600}
          height={338}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            border: "1px solid red",
          }}></canvas>
      </div>
    </div>
  );
}

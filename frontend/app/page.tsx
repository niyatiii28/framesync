import {useRef, useEffect} from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if(!video || !canvas) return;

    const handleLoadedMetaData = () => {
      const rect = video.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetaData);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetaData)
    };
  }, []);
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

"use client";

import VideoCanvas from "@/components/VideoCanvas";

export default function Home() {
  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>

      {/* Header */}
      <div style={{height: 48, background: "#000000", color: "white", padding: 10}}>
        Framesync
      </div>

      {/* Main content */}
      <div style={{flex: 1, display: "flex"}}>

        {/* Left palette */}
        <div style={{
          width: 80, 
          background: "#232323", 
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
        >
          <button>✏️</button>
          <button>🎨</button>
          <button>🖊️</button>
          <button>🖌️</button>
        </div>

        {/* Centre video area */}
        <div style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
          <VideoCanvas />
        </div>

        {/* Right comments */}
        <div style={{width: 300, background: "#1e1d1d", padding: 8}}>
          Comments
        </div>
      </div>
      
      {/* Bottom controls */}
      <div style={{height: 80, background: "#2b2a2a", padding: 8}}>
        Timeline / Controls
      </div>
    </div>

  );
}

import React from "react";
import "@videojs/react/video/skin.css";
import { createPlayer, videoFeatures } from "@videojs/react";
import { VideoSkin, Video } from "@videojs/react/video";

const Player = createPlayer({ features: videoFeatures });

interface MyPlayerProps {
  src: string;
  poster?: string;
}

export const MyPlayer: React.FC<MyPlayerProps> = ({ src, poster }) => {
  const isHLS = src?.includes(".m3u8");
  const videoType = isHLS ? "application/x-mpegURL" : "video/mp4";

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
      <Player.Provider>
        <VideoSkin>
          <Video poster={poster} playsInline controls autoPlay={false}>
            <source src={src} type={videoType} />
          </Video>
        </VideoSkin>
      </Player.Provider>
    </div>
  );
};

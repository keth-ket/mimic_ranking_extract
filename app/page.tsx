/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client"
import { VideoToFrames, VideoToFramesMethod } from "@/lib/VideoToFrame";
import { useState, ChangeEvent } from "react";
import { Circles } from "react-loader-spinner";

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState("IDLE");

  const onInput = async (event: ChangeEvent<HTMLInputElement>) => {
    setImages([]);
    setStatus("LOADING");

    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    const frames = await VideoToFrames.getFrames(
      fileUrl,
      30,
      VideoToFramesMethod.totalFrames
    );

    setStatus("IDLE");
    setImages(frames);
  };

  const now = new Date().toDateString();

  return (
    <div className="container">
      <h1>Get frames from video 🎞</h1>
      <p>Upload a video, then click the images you want to download!</p>
      <label>
        {status === "IDLE" ? (
          "Choose file"
        ) : (
          <Circles color="#00BFFF" height={100} width={100} />
        )}
        <input
          type="file"
          className="hidden"
          accept="video/*"
          onChange={onInput}
        />
      </label>

      {images?.length > 0 && (
        <div className="output">
          {images.map((imageUrl, index) => (
            <a
              key={imageUrl}
              href={imageUrl}
            >
              <img src={imageUrl} alt="" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

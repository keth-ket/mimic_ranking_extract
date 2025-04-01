/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { VideoToFrames, VideoToFramesMethod } from "@/lib/VideoToFrame";
import { useState, ChangeEvent, useRef } from "react";
import { Upload, Code } from "lucide-react";
import { Circles } from "react-loader-spinner";
import Tesseract from "tesseract.js";

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractingText, setExtractingText] = useState(false);

  const [members, setMembers] = useState<string[]>([]);
  const [attacked, setAttacked] = useState<string[]>([]);
  const [score, setScore] = useState<string[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  

  const triggerVideoInput = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const triggerTextInput = () => {
    if (textInputRef.current) {
      textInputRef.current.click();
    }
  };
  

  const handleVideoFile = async (event: ChangeEvent<HTMLInputElement>) => {
    setImages([]);
    setTexts([]);
    setLoading(true);

    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    setVideoUrl(fileUrl); // Set video URL for display
    const frames = await VideoToFrames.getFrames(
      fileUrl,
      25,
      VideoToFramesMethod.totalFrames
    );
    setLoading(false);
    setImages(frames);
  };

  const handleTextFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first file
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const text = e.target.result as string;
        const textLines = text.split("\n").map(line => line.trim()).filter(line => line !== ""); 
        setMembers(textLines); // Store each line separately
      }
    };
    reader.readAsText(file);
  };

  const extractTextFromImages = async () => {
    setExtractingText(true);
    setTexts([]);
    const extractedTexts: string[] = [];

    for (const image of images) {
      await Tesseract.recognize(image, "eng", {
      })
      .then(({ data: { text } }) => {
        const lines = text.split("\n").map(line => line.trim()).filter(line => line !== ""); // Split and clean up
        extractedTexts.push(...lines); // Add each line separately
      })
        .catch((err) => {
          console.error("Error extracting text:", err);
        });
    }

    console.log(extractedTexts)
    setTexts(extractedTexts);
    setExtractingText(false);
  };

  return (
    <div className="flex w-full flex-col bg-accent h-fit p-10 items-center gap-6">
      <p className="font-bold text-2xl">
        Welcome to Ket&apos;s Mimic Rank Extraction Program!
      </p>
      {videoUrl && (
        <div>
          <video
            className="max-h-150 w-auto"
            ref={videoRef}
            src={videoUrl}
            controls
          />
        </div>
      )}
      <Button
        className="flex items-center justify-center bg-card-foreground"
        onClick={triggerVideoInput}
        disabled={loading}
      >
        Choose video to upload
        <Upload />
      </Button>

      {loading && (
        <div className="flex flex-col justify-center items-center">
        <Circles color="text-card-foreground" />
        <p>Please wait for program to done reading video</p>
        </div>
      )}
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleVideoFile}
      />

      {members.length > 0 && (
        <div className="border-black border rounded-lg p-2">
          Members:
          <ul>
            {members.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        className="flex items-center justify-center bg-card-foreground"
        onClick={triggerTextInput}
      >
        Choose member file to upload
        <Upload />
      </Button>

      <input 
        type="file"
        ref={textInputRef}
        className="hidden"
        accept=".txt"
        onChange={handleTextFile}
      />
      {images?.length > 0 && (
        <div className="flex flex-col items-center gap-6 mt-10">
          <Button onClick={extractTextFromImages} disabled={extractingText || (members.length <= 0)}>
            {extractingText ? "Extracting Text..." : "Extract Text from Video"}
            <Code/>
          </Button>
          {extractingText && <Circles color="text-card-foreground" />}
          <pre>{texts.join("\n")}</pre>
        </div>
      )}
    </div>
  );
}

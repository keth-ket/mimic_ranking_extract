"use client";
import { Button } from "@/components/ui/button";
import { VideoToFrames, VideoToFramesMethod } from "@/lib/VideoToFrame";
import { useState, ChangeEvent, useRef } from "react";
import { Upload, Code } from "lucide-react";
import { Circles } from "react-loader-spinner";
import Tesseract from "tesseract.js";

type NameMap = Record<string, number[]>; // Define name_map type

const nameExist = (name: string, nameMap: NameMap): [boolean, string] => {
  if (name.includes("NN3")) {
    return [true, "MNN3"];
  } else if (name.includes("aXe")) {
    return [true, "FaXe"];
  } else if (name === "Rusrks" || name === "Ruerks") {
    return [true, "RUBIKS"];
  }

  for (const member in nameMap) {
    if (name.toLowerCase().includes(member.toLowerCase())) {
      return [true, member];
    }
  }
  return [false, ""];
};

const processData = (textData: string[], nameMap: NameMap) => {
  for (let i = 0; i < textData.length; i++) {
    const name = textData[i].trim();

    if (i + 1 >= textData.length) continue;
    const valueStr = textData[i + 1].trim();

    const cleanedValue = valueStr.split(" ").pop()?.replace(",", "").replace("M", "") ?? "";

    if (/^\d+$/.test(cleanedValue)) {
      const value = parseInt(cleanedValue, 10);
      const [exists, matchedName] = nameExist(name, nameMap);
      if (exists) {
        if (!nameMap[matchedName]) nameMap[matchedName] = [];
        nameMap[matchedName].push(value);
      }
    }
  }
};

const mostRepeatedNumber = (nameMap: NameMap): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const name in nameMap) {
    if (nameMap[name].length > 0) {
      const countMap = nameMap[name].reduce((acc, num) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const mostCommon = Object.entries(countMap).reduce((a, b) => (b[1] > a[1] ? b : a));
      result[name] = parseInt(mostCommon[0], 10);
    }
  }

  return Object.fromEntries(
    Object.entries(result).sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
  );
};

const formatAttackResults = (finalResult: Record<string, number>): [string, string] => {
  let membersAttacked = "";
  let scoreResult = "";
  let index = 0;

  for (const [name, score] of Object.entries(finalResult)) {
    membersAttacked += name + "\n";
    scoreResult += score.toString() + "\n";
    index++;
  }

  const total = `Total members attacked: ${index}\n`;
  membersAttacked += total;

  return [membersAttacked, scoreResult];
};

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractingText, setExtractingText] = useState(false);

  const [members, setMembers] = useState<NameMap>({});
  const [attacked, setAttacked] = useState("");
  const [score, setScore] = useState("");
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
        const textLines = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");

        // Convert textLines array into name_map format
        const newNameMap: NameMap = {};
        textLines.forEach((line) => {
          newNameMap[line] = []; // Initialize each name with an empty array
        });

        setMembers(newNameMap);
      }
    };
    reader.readAsText(file);
  };

  const extractTextFromImages = async () => {
    setExtractingText(true);
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

    processData(extractedTexts, members);
    const final_result = mostRepeatedNumber(members);
    const [membersAttacked, scoreResult] = formatAttackResults(final_result);
    setAttacked(membersAttacked);
    setScore(scoreResult);
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
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleVideoFile}
      />

      {Object.keys(members).length > 0 && (
        <div className="border border-black rounded-lg p-2">
          <h3>Members uploaded sucessfully!</h3>
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

      {loading && (
        <div className="flex flex-col justify-center items-center">
        <Circles color="text-card-foreground" />
        <p>Please wait for program to done reading video</p>
        </div>
      )}

      {images?.length > 0 && (
        <div className="flex flex-col items-center gap-6 mt-10">
          <Button onClick={extractTextFromImages} disabled={extractingText || (Object.keys(members).length <= 0)}>
            {extractingText ? "Extracting Text..." : "Extract Text from Video"}
            <Code/>
          </Button>
          {extractingText && <Circles color="text-card-foreground" />}
          <div className="flex flex-row gap-4">
            {attacked != "" && <pre className="border border-black rounded-lg p-2">{attacked}</pre>}
            {score != "" && <pre className="border border-black rounded-lg p-2">{score}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}

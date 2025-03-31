/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // For Next.js App Router (if using Pages Router, remove this)

import { useState } from "react";
import Tesseract from "tesseract.js";
import Image from "next/image";
import { Console } from "console";

const OCR = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;
    setText("Processing...");

    try {
      const { data } = await Tesseract.recognize(image, "eng");
      setText(data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      setText("Error extracting text.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-100 rounded-xl shadow-lg">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="p-2 border rounded-md"
      />

      {image && (
        <div className="relative w-80 h-60">
          <Image
            src={image}
            alt="Uploaded preview"
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
      )}

      <button
        onClick={extractText}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
      >
        Extract Text
      </button>
      <p className="p-3 bg-white rounded-md border whitespace-pre-wrap">
        {text || "Extracted text will appear here..."}
      </p>
    </div>
  );
};

export default OCR;

"use client";

import { useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChatScreen } from "@/components/ChatScreen";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
    const [file, setFile] = useState<string | null>(null);
    const t = useTranslations("HomePage");

    const onDrop = (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
        setFile(URL.createObjectURL(selectedFile));
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col justify-center items-center p-6">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {t("title")}
                    </h1>
                    <p className="text-gray-300 text-lg max-w-md mx-auto">
                        {t("description")}
                    </p>
                </div>

                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                        <div
                            {...getRootProps()}
                            className={`cursor-pointer flex flex-col items-center p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
                                isDragActive
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-600 hover:bg-gray-700/50"
                            }`}
                        >
                            <UploadCloud className="h-14 w-14 text-gray-400 mb-4" />
                            <p className="text-gray-300 font-medium text-center">
                                {isDragActive
                                ? "Drop your image here!"
                                : t("upload_prompt")}
                            </p>
                            <input {...getInputProps()} />
                        </div>
                        {file && (
                            <div className="relative mt-6 animate-fade-in">
                                <Image
                                    src={file}
                                    alt="Uploaded Preview"
                                    className="w-full h-48 object-cover rounded-xl border border-gray-700 shadow-md"
                                    width={400}
                                    height={192}
                                />
                                <Button
                                    onClick={() => setFile(null)}
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 rounded-full bg-red-500 hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <ChatScreen />
        </div>
    );
}
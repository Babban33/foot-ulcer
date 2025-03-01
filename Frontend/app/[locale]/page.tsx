"use client";

import { useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChatScreen } from "@/components/ChatScreen";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useParams, useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function UploadPage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [prediction, setPrediction] = useState<number | null>(null);
    const t = useTranslations("HomePage");
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const onDrop = (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            handlePrediction(selectedFile);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
    });

    const handlePrediction = async (imageFile: File)=>{
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        try{
            const response = await axios.post("http://localhost:8000/predict", formData,{
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            if(response.data.success){
                setPrediction(response.data.prediction);
            } else{
                console.error("Prediction failed", response.data.error);
            }
        } catch (error){
            console.error("Error Uploading file", error);
        } finally{
            setIsLoading(false);
        }
    }
    const reset = ()=>{
        setFile(null);
        setPreview(null);
        setPrediction(null);
    }

    const switchLanguage = (newLocale: string) => {
        router.push(`/${newLocale}`);
    };

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
                        {preview && (
                            <div className="relative mt-6 animate-fade-in">
                                <Image
                                    src={preview}
                                    alt="Uploaded Preview"
                                    className="w-full h-48 object-cover rounded-xl border border-gray-700 shadow-md"
                                    width={400}
                                    height={192}
                                />
                                <Button
                                    onClick={reset}
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 rounded-full bg-red-500 hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-xl">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                )}
                            </div>
                        )}
                        {prediction !== null && !isLoading && (
                            <p className="mt-4 text-center text-lg font-medium text-white">
                                Prediction: {prediction === 1 ? "Normal (Healthy Skin)" : "Ulcer is present"}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <div className="flex justify-center mt-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-gray-800/50 hover:text-white border-gray-700 text-white hover:bg-gray-700/50 hover:border-blue-500 transition-all duration-300 shadow-md"
                            >
                                {locale === "en" ? "English" : locale === "hi" ? "Hindi" : "Marathi"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-sm border-gray-700 text-white shadow-xl rounded-xl w-56">
                            <DropdownMenuLabel className="text-gray-300 font-medium">
                                Select Language
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem
                                onClick={() => switchLanguage("en")}
                                className="text-white cursor-pointer hover:bg-blue-500/20 hover:text-white focus:bg-blue-500/20 focus:text-white transition-all duration-200"
                            >
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => switchLanguage("hi")}
                                className="text-white cursor-pointer hover:bg-blue-500/20 hover:text-white focus:bg-blue-500/20 focus:text-white transition-all duration-200"
                            >
                                Hindi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => switchLanguage("mr")}
                                className="text-white cursor-pointer hover:bg-blue-500/20 hover:text-white focus:bg-blue-500/20 focus:text-white transition-all duration-200"
                            >
                                Marathi
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <ChatScreen />
        </div>
    );
}
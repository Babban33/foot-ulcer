"use client";

import * as React from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, Paperclip, X } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import ReactMarkdown, { Components } from "react-markdown";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
    imageUrl?: string;
}

const languages = ["English", "Hindi", "Marathi"];

export function ChatScreen() {
    const [messages, setMessages] = React.useState<Message[]>([{
        id: "1",
        content: "Hello! Ask me anything about foot ulcers.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);
    const [input, setInput] = React.useState("");
    const [isTyping, setIsTyping] = React.useState(false);
    const [selectedLanguage, setSelectedLanguage] = React.useState("English");
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim() && !imageFile) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const formData = new FormData();
            formData.append("question", input);
            formData.append("language", selectedLanguage);

            if (imageFile) {
                formData.append("file", imageFile);
                formData.append("is_image_check", "true");
            } else {
                formData.append("is_image_check", "false");
            }

            const response = await axios.post("http://127.0.0.1:8000/chat", formData);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response.data.message,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };

            setMessages((prev) => [...prev, botMessage]);
            setImageFile(null);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: axios.isAxiosError(error) && error.response?.data?.detail || "Sorry, something went wrong. Please try again.",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const markdownComponents: Components = {
        p: ({ ...props }) => <p className="mb-2" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
        li: ({ ...props }) => <li className="mb-1" {...props} />,
        strong: ({ ...props }) => <strong className="font-bold" {...props} />,
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="fixed bottom-6 right-6 rounded-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 hover:scale-105">
                    <MessageCircle className="size-6" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white p-0 rounded-xl">
                <div className="flex flex-col h-[600px]">
                    <DialogTitle className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                        <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500">
                            <AvatarFallback className="bg-transparent text-white">SA</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="flex flex-row gap-4 justify-start items-center">
                                <h2 className="text-xl font-semibold tracking-tight">Stack AI</h2>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="bg-gray-800/50 hover:text-white border-gray-700 text-white hover:bg-gray-700/50 hover:border-blue-500 transition-all duration-300 shadow-md"
                                        >
                                            {selectedLanguage}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-sm border-gray-700 text-white shadow-xl rounded-xl w-56">
                                        <DropdownMenuLabel className="text-gray-300 font-medium">
                                            Select Language
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-gray-700" />
                                        {languages.map((lang) => (
                                            <DropdownMenuItem
                                                key={lang}
                                                className="text-white cursor-pointer hover:bg-blue-500/20 hover:text-white focus:bg-blue-500/20 focus:text-white transition-all duration-200"
                                                onClick={() => setSelectedLanguage(lang)}
                                            >
                                                {lang}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </span>
                            <p className="text-sm text-gray-400">Your intelligent healthcare assistant</p>
                        </div>
                    </DialogTitle>

                    <ScrollArea ref={scrollRef} className="flex-1 px-4">
                        <div className="space-y-4 my-2">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-xl p-4 shadow-sm ${
                                            message.isUser ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white" : "bg-gray-800/70 text-gray-200"
                                        }`}
                                    >
                                        {message.imageUrl && (
                                            <img src={message.imageUrl} alt="uploaded" className="mb-2 rounded-md max-h-40 object-contain" />
                                        )}
                                        {message.isUser ? (
                                            <p className="text-sm">{message.content}</p>
                                        ) : (
                                            <ReactMarkdown components={markdownComponents}>
                                                {message.content}
                                            </ReactMarkdown>
                                        )}
                                        <span className="text-xs text-gray-400 mt-1 block opacity-75">
                                            {message.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800/70 rounded-xl p-4 max-w-[75%]">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <Paperclip className="text-white" />
                                </label>
                                {imageFile && (
                                    <div className="absolute -top-2 -right-2">
                                        <button
                                            onClick={() => setImageFile(null)}
                                            className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about foot ulcers..."
                                className="bg-gray-800/70 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 rounded-xl flex-1"
                                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                disabled={isTyping}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isTyping}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                            >
                                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// "use client";

// import * as React from "react";
// import axios from "axios";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { MessageCircle, Send, Loader2 } from "lucide-react";
// import { DialogTitle } from "@radix-ui/react-dialog";
// import ReactMarkdown, { Components } from "react-markdown";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

// interface Message {
//     id: string;
//     content: string;
//     isUser: boolean;
//     timestamp: string;
// }

// const languages = [ "English", "Hindi", "Marathi"];

// export function ChatScreen() {
//     const [messages, setMessages] = React.useState<Message[]>([
//         {
//             id: "1",
//             content: "Hello! Ask me anything about foot ulcers.",
//             isUser: false,
//             timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//         },
//     ]);
//     const [input, setInput] = React.useState("");
//     const [isTyping, setIsTyping] = React.useState(false);
//     const [selectedLanguage, setSelectedLanguage] = React.useState("English");
//     const scrollRef = React.useRef<HTMLDivElement>(null);

//     const handleSend = async () => {
//         if (!input.trim()) return;

//         const userMessage: Message = {
//             id: Date.now().toString(),
//             content: input,
//             isUser: true,
//             timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//         };

//         setMessages((prev) => [...prev, userMessage]);
//         setInput("");
//         setIsTyping(true);

//         try {
//             const response = await axios.post("http://127.0.0.1:8000/chat", {
//                 question: userMessage.content,
//                 language: selectedLanguage,
//             });

//             const botMessage: Message = {
//                 id: (Date.now() + 1).toString(),
//                 content: response.data.message,
//                 isUser: false,
//                 timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//             };

//             setMessages((prev) => [...prev, botMessage]);
//         } catch (error) {
//             const errorMessage: Message = {
//                 id: (Date.now() + 1).toString(),
//                 content: axios.isAxiosError(error) && error.response?.data?.detail || "Sorry, something went wrong. Please try again.",
//                 isUser: false,
//                 timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//             };
//             setMessages((prev) => [...prev, errorMessage]);
//         } finally {
//             setIsTyping(false);
//         }
//     };

//     React.useEffect(() => {
//         if (scrollRef.current) {
//             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//         }
//     }, [messages]);

//     const markdownComponents: Components = {
//         p: ({ ...props }) => <p className="mb-2" {...props} />,
//         ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
//         li: ({ ...props }) => <li className="mb-1" {...props} />,
//         strong: ({ ...props }) => <strong className="font-bold" {...props} />,
//     };

//     return (
//         <Dialog>
//             <DialogTrigger asChild>
//                 <button className="fixed bottom-6 right-6 rounded-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 hover:scale-105">
//                     <MessageCircle className="size-6" />
//                 </button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[650px] bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white p-0 rounded-xl">
//                 <div className="flex flex-col h-[600px]">
//                     <DialogTitle className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
//                         <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500">
//                             <AvatarFallback className="bg-transparent text-white">SA</AvatarFallback>
//                         </Avatar>
//                         <div>
//                             <span className="flex flex-row gap-4 justify-start items-center">
//                                 <h2 className="text-xl font-semibold tracking-tight">Stack AI</h2>
//                                 <DropdownMenu>
//                                     <DropdownMenuTrigger asChild>
//                                         <Button
//                                             variant="outline"
//                                             className="bg-gray-800/50 hover:text-white border-gray-700 text-white hover:bg-gray-700/50 hover:border-blue-500 transition-all duration-300 shadow-md"
//                                         >
//                                             {selectedLanguage}
//                                         </Button>
//                                     </DropdownMenuTrigger>
//                                     <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-sm border-gray-700 text-white shadow-xl rounded-xl w-56">
//                                         <DropdownMenuLabel className="text-gray-300 font-medium">
//                                             Select Language
//                                         </DropdownMenuLabel>
//                                         <DropdownMenuSeparator className="bg-gray-700" />
//                                         {languages.map((lang) => (
//                                             <DropdownMenuItem
//                                                 key={lang}
//                                                 className="text-white cursor-pointer hover:bg-blue-500/20 hover:text-white focus:bg-blue-500/20 focus:text-white transition-all duration-200"
//                                                 onClick={() => setSelectedLanguage(lang)}
//                                             >
//                                                 {lang}
//                                             </DropdownMenuItem>
//                                         ))}
//                                     </DropdownMenuContent>
//                                 </DropdownMenu>
//                             </span>
//                             <p className="text-sm text-gray-400">Your intelligent healthcare assistant</p>
//                         </div>

//                     </DialogTitle>

//                     <ScrollArea ref={scrollRef} className="flex-1 px-4">
//                         <div className="space-y-4 my-2">
//                             {messages.map((message) => (
//                                 <div
//                                     key={message.id}
//                                     className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
//                                 >
//                                     <div
//                                         className={`max-w-[75%] rounded-xl p-4 shadow-sm ${
//                                             message.isUser
//                                                 ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
//                                                 : "bg-gray-800/70 text-gray-200"
//                                         }`}
//                                     >
//                                         {message.isUser ? (
//                                             <p className="text-sm">{message.content}</p>
//                                         ) : (
//                                             <ReactMarkdown components={markdownComponents}>
//                                                 {message.content}
//                                             </ReactMarkdown>
//                                         )}
//                                         <span className="text-xs text-gray-400 mt-1 block opacity-75">
//                                             {message.timestamp}
//                                         </span>
//                                     </div>
//                                 </div>
//                             ))}
//                             {isTyping && (
//                                 <div className="flex justify-start">
//                                     <div className="bg-gray-800/70 rounded-xl p-4 max-w-[75%]">
//                                         <div className="flex space-x-2">
//                                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
//                                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
//                                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </ScrollArea>

//                     <div className="p-4 border-t border-gray-800 bg-gray-900/50">
//                         <div className="flex gap-2">
//                             <Input
//                                 value={input}
//                                 onChange={(e) => setInput(e.target.value)}
//                                 placeholder="Ask about foot ulcers..."
//                                 className="bg-gray-800/70 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
//                                 onKeyPress={(e) => e.key === "Enter" && handleSend()}
//                                 disabled={isTyping}
//                             />
//                             <Button
//                                 onClick={handleSend}
//                                 disabled={isTyping}
//                                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
//                             >
//                                 {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }
'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from "@/constants";


enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant',
    content: string
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [message, setMessage] = useState<SavedMessage[]>([])

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript }

                setMessage((prev) => [...prev, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => console.error(error)

        vapi.on('call-start', onCallStart)
        vapi.on('call-end', onCallEnd)
        vapi.on('message', onMessage)
        vapi.on('speech-start', onSpeechStart)
        vapi.on('speech-end', onSpeechEnd)
        vapi.on('error', onError)

        return () => {
            vapi.off('call-start', onCallStart)
            vapi.off('call-end', onCallEnd)
            vapi.off('message', onMessage)
            vapi.off('speech-start', onSpeechStart)
            vapi.off('speech-end', onSpeechEnd)
            vapi.off('error', onError)
        }
    }, [])

    const handleGenerateFeedback = async(message: SavedMessage[]) => {
        const { success, id } = {
            success: true,
            id: 'feedback-id'
        }
        if(success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        }else{
            console.log('Error saving feedback');
            router.push("/");
        }
    }

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if(type === "generate") {
                router.push('/')
            }else {
                handleGenerateFeedback(message)
            }
        } 
    }, [message, callStatus, type, userId])

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING)

        if(type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId
                }
            });
        } else {
            let formattedQuestions = "";

            if(questions){
                formattedQuestions = questions.map((question) => `- ${question}`).join('\n');
            }
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions
                }
            })
        }
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED)

        vapi.stop();
    }

    const latestMessage = message[message.length - 1]?.content;

    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || CallStatus.FINISHED;

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="ai-avatar" width={65} height={54} className="object-cover" />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>
                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="user-avatar" width={540} height={540} className="rounded-full object-cover size-30" />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {callStatus === CallStatus.CONNECTING && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-700 font-medium">Connecting to AI...</p>
                    </div>
                </div>
            )}

            {message.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={latestMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {callStatus !== "ACTIVE" ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span className={cn("absolute animate-ping rounded-full opacity-75", callStatus !== "CONNECTING" && "hidden")}
                        />
                        <span className="relative">
                            {isCallInactiveOrFinished ? "Call" : ". . ."}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    )
}

export default Agent
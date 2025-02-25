'use client'
import {
    StreamCall,
    StreamVideo,
    StreamVideoClient,
    User,
  } from "@stream-io/video-react-sdk";
import { VideoUI } from "./VideoUI";
import { useSession } from "next-auth/react";
import { useState } from "react";

  const { data: session } = useSession();
  const [userId, setUserId] = useState<any>();
  if(session){
    setUserId(session.user.id)
  }

  const apiKey = "emed9s7rdsfj";
  const token = "authentication-token";
  const user: User = { id: userId };
  
  const client = new StreamVideoClient({ apiKey, user, token });
  const call = client.call("default", "my-first-call");
  call.join({ create: true });
  
  export const MyApp = () => {
    return (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <VideoUI />
        </StreamCall>
      </StreamVideo>
    );
  };

  
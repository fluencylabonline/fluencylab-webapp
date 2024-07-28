'use client';
import React, { useEffect, useState } from "react";

export default function CanvaEmbed() {
    const [designURL, setDesignURL] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('slide');
        setDesignURL(url);
    }, []);

    // Function to add ?embed to the URL
    const getEmbedURL = (url: string | null) => {
        if (!url) return '';
        // Check if the URL already contains a query string
        return url.includes('?') ? `${url}&embed` : `${url}?embed`;
    };

    if (!designURL) {
        return <div>Loading...</div>;
    }

    const embedURL = getEmbedURL(designURL);

    return (
        <div className="flex justify-center w-full h-screen max-h-[90vh]">
            <iframe
                className="w-full h-full rounded-md border-none"
                loading="lazy"
                src={embedURL}
                allowFullScreen
                title="Canva Slide"
            />
        </div>
    );
}

'use client';
import React from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

export default function SlideClass(){
    const params = new URLSearchParams(window.location.search);
    const slideURL = params.get('slide');

    if (!slideURL) {
        return <div>Loading...</div>;
    }

    const documents = [
        { uri:'gs://fluencylabweb-pro.appspot.com/s4mq3n6YZlcJkYTJk5IOqmb6dkC3/materiais/slides/samplepptx.pptx' },
    ];

    return (
        <div>
            <p>Slides</p>
            {slideURL}
            <DocViewer
                documents={documents}
                pluginRenderers={DocViewerRenderers}
            />
        </div>
    );
}

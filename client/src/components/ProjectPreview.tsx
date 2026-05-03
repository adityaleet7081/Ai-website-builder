import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets';
import EditorPanel from './EditorPanel';
import LoaderSteps from './LoaderSteps';

interface ProjectPreviewProps {
    project: Project;
    isGenerating: boolean;
    device?: 'phone' | 'tablet' | 'desktop';
    showEditorPanel?: boolean;
}

export interface ProjectPreviewRef { getCode: () => string | undefined }

export interface ElementData {
    tagName: string;
    className: string;
    text: string;
    styles: { padding: string; margin: string; backgroundColor: string; color: string; fontSize: string; };
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({ project, isGenerating, device = 'desktop', showEditorPanel = true }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [selectedElement, setSelectedElement] = useState<ElementData | null>(null)

    const resolutions = { phone: 'w-[412px]', tablet: 'w-[768px]', desktop: 'w-full' }

    useImperativeHandle(ref, () => ({
        getCode: () => {
            const doc = iframeRef.current?.contentDocument;
            if (!doc) return undefined;
            doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el) => {
                el.classList.remove('ai-selected-element'); el.removeAttribute('data-ai-selected');
                (el as HTMLElement).style.outline = '';
            })
            doc.getElementById('ai-preview-style')?.remove();
            doc.getElementById('ai-preview-script')?.remove();
            return doc.documentElement.outerHTML;
        }
    }))

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'ELEMENT_SELECTED') setSelectedElement(event.data.payload);
            else if (event.data.type === 'CLEAR_SELECTION') setSelectedElement(null)
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    const handleUpdate = (updates: unknown) => {
        if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_ELEMENT', payload: updates }, '*')
    }

    const injectPreview = (html: string) => {
        if (!html) return '';
        if (!showEditorPanel) return html;
        // Inject selection styling for the iframe content to match our new theme
        const injectStyle = `<style id="ai-preview-style">.ai-selected-element { outline: 2px solid #06b6d4 !important; outline-offset: -2px !important; box-shadow: inset 0 0 0 2px rgba(6,182,212,0.2) !important; transition: all 0.2s; cursor: crosshair !important; }</style>`;
        
        if (html.includes('</head>')) html = html.replace('</head>', injectStyle + '</head>');
        else html = injectStyle + html;
        
        if (html.includes('</body>')) return html.replace('</body>', iframeScript + '</body>')
        return html + iframeScript;
    }

    return (
        <div className='relative h-full flex-1 rounded-xl overflow-hidden' style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
            {project.current_code ? (
                <>
                    <iframe ref={iframeRef} srcDoc={injectPreview(project.current_code)}
                        className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all duration-300 bg-white`} />
                    {showEditorPanel && selectedElement && (
                        <EditorPanel selectedElement={selectedElement} onUpdate={handleUpdate} onClose={() => {
                            setSelectedElement(null);
                            if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'CLEAR_SELECTION_REQUEST' }, '*')
                        }} />
                    )}
                </>
            ) : isGenerating && <LoaderSteps />}
        </div>
    )
})

export default ProjectPreview
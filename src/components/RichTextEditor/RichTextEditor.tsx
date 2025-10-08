import React, { useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import { Post } from '../../config/apiMethods';
import { displayMessage } from '../../config';

// Register custom video blot for Quill
const BlockEmbed = Quill.import('blots/block/embed');

class VideoBlot extends BlockEmbed {
    static blotName = 'customVideo';
    static tagName = 'video';
    static className = 'ql-video';

    static create(value: string) {
        const node = super.create() as HTMLVideoElement;
        node.setAttribute('src', value);
        node.setAttribute('controls', 'true');
        node.setAttribute('style', 'max-width: 480px; width: 100%; height: auto; max-height: 360px;');
        node.setAttribute('preload', 'metadata');
        // Add source element for better compatibility
        const source = document.createElement('source');
        source.setAttribute('src', value);
        source.setAttribute('type', 'video/mp4');
        node.appendChild(source);
        return node;
    }

    static value(node: HTMLVideoElement) {
        return node.getAttribute('src');
    }
}

// Register the custom video blot
Quill.register(VideoBlot);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    className = '',
    readOnly = false
}) => {
    const quillRef = useRef<ReactQuill>(null);

    // Image upload handler
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                displayMessage('Image size should be less than 5MB', 'error');
                return;
            }

            // Show loading state
            const quill = quillRef.current?.getEditor();
            if (!quill) return;

            const range = quill.getSelection(true);
            quill.insertText(range.index, 'Uploading image...');

            try {
                // Upload to backend
                const formData = new FormData();
                formData.append('file', file);

                const response = await Post('/uploadimage', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Remove loading text
                quill.deleteText(range.index, 'Uploading image...'.length);

                if (response.success && response.file) {
                    // Insert image
                    quill.insertEmbed(range.index, 'image', response.file);
                    quill.setSelection(range.index + 1, 0);
                } else {
                    displayMessage('Failed to upload image', 'error');
                }
            } catch (error) {
                console.error('Image upload error:', error);
                displayMessage('Failed to upload image', 'error');
                // Remove loading text
                quill.deleteText(range.index, 'Uploading image...'.length);
            }
        };
    };

    // Video handler - upload video file
    const videoHandler = () => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        // Upload video file
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'video/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                displayMessage('Video size should be less than 50MB', 'error');
                return;
            }

            const range = quill.getSelection(true);
            quill.insertText(range.index, 'Uploading video... This may take a while.');

            try {
                // Upload to backend
                const formData = new FormData();
                formData.append('file', file);

                const response = await Post('/uploadimage', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Remove loading text
                quill.deleteText(range.index, 'Uploading video... This may take a while.'.length);

                if (response.success && response.file) {
                    // Insert video using custom blot
                    quill.insertEmbed(range.index, 'customVideo', response.file, 'user');

                    // Add a line break after the video
                    quill.insertText(range.index + 1, '\n', 'user');

                    // Move cursor after the video
                    quill.setSelection(range.index + 2, 0);

                    displayMessage('Video uploaded successfully', 'success');
                } else {
                    displayMessage('Failed to upload video', 'error');
                }
            } catch (error) {
                console.error('Video upload error:', error);
                displayMessage('Failed to upload video', 'error');
                // Remove loading text
                quill.deleteText(range.index, 'Uploading video... This may take a while.'.length);
            }
        };
    };

    // Quill modules configuration
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                video: videoHandler
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    // Quill formats configuration
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link', 'image', 'video', 'customVideo'
    ];

    return (
        <div className={`rich-text-editor ${className}`}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                modules={modules}
                formats={formats}
                readOnly={readOnly}
                className="bg-white rounded-lg"
            />
        </div>
    );
};

export default RichTextEditor;

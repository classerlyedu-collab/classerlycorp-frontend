


import { useSearchParams } from 'react-router-dom';
import { ImageLink } from '../../../../config/apiMethods';
const TextEditor = () => {
    const [searchParams] = useSearchParams();
    const content = searchParams.get('content');
    const contentType = searchParams.get('contentType') || 'google_docs';

    // Helper function to detect if content is YouTube embed URL
    const isYouTubeEmbed = (url: string) => {
        return url && url.includes('youtube.com/embed/');
    };

    // Helper function to detect if content is YouTube URL
    const isYouTubeUrl = (url: string) => {
        return url && (url.includes('youtube.com') || url.includes('youtu.be'));
    };

    // Helper function to detect if content is Google Slides URL
    const isGoogleSlidesUrl = (url: string) => {
        return url && url.includes('docs.google.com/presentation');
    };

    // Helper function to detect if content is Google Sheets URL
    const isGoogleSheetsUrl = (url: string) => {
        return url && url.includes('docs.google.com/spreadsheets');
    };

    // Helper function to convert YouTube URL to embed format
    const convertToYouTubeEmbed = (url: string) => {
        if (!isYouTubeUrl(url)) return url;

        let videoId = '';

        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url; // Already in embed format
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }

        return url;
    };

    // Helper function to convert Google Slides URL to embed format
    const convertToGoogleSlidesEmbed = (url: string) => {
        if (!isGoogleSlidesUrl(url)) return url;

        if (url.includes('/presentation/d/')) {
            const presentationId = url.split('/presentation/d/')[1].split('/')[0];
            return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
        }
        return url; // Return as-is if already in embed format
    };

    // Helper function to convert Google Sheets URL to embed format
    const convertToGoogleSheetsEmbed = (url: string) => {
        if (!isGoogleSheetsUrl(url)) return url;

        if (url.includes('/spreadsheets/d/')) {
            const spreadsheetId = url.split('/spreadsheets/d/')[1].split('/')[0];
            return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
        }
        return url; // Return as-is if already in embed format
    };

    const renderContent = () => {
        if (!content) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50" style={{ minHeight: '800px' }}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl text-gray-400">📄</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No content available</h3>
                        <p className="text-gray-500 text-sm">Please select a lesson to view its content.</p>
                    </div>
                </div>
            );
        }

        // Handle YouTube content
        if (contentType === 'youtube' || isYouTubeUrl(content)) {
            const embedUrl = convertToYouTubeEmbed(content);
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-50" style={{ minHeight: '800px' }}>
                    <div className="w-full max-w-4xl aspect-video">
                        <iframe
                            loading="lazy"
                            className="w-full h-full border-0 rounded-lg shadow-lg"
                            src={embedUrl}
                            title="YouTube Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            );
        }

        // Handle Google Slides content
        if (contentType === 'google_slides' || isGoogleSlidesUrl(content)) {
            const embedUrl = convertToGoogleSlidesEmbed(content);
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-50" style={{ minHeight: '800px' }}>
                    <div className="w-full max-w-6xl aspect-video">
                        <iframe
                            loading="lazy"
                            className="w-full h-full border-0 rounded-lg shadow-lg"
                            src={embedUrl}
                            title="Google Slides Presentation"
                            allow="fullscreen"
                        />
                    </div>
                </div>
            );
        }

        // Handle Google Sheets content
        if (contentType === 'google_sheets' || isGoogleSheetsUrl(content)) {
            const embedUrl = convertToGoogleSheetsEmbed(content);
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-50" style={{ minHeight: '800px' }}>
                    <div className="w-full max-w-6xl" style={{ height: '800px' }}>
                        <iframe
                            loading="lazy"
                            className="w-full h-full border-0 rounded-lg shadow-lg"
                            src={embedUrl}
                            title="Google Sheets Spreadsheet"
                            allow="fullscreen"
                        />
                    </div>
                </div>
            );
        }

        // Handle Google Docs and other content
        return (
            <iframe
                loading="lazy"
                className="w-full border-0"
                style={{ height: '100%', minHeight: '800px' }}
                src={content}
                title="Learning Material"
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            />
        );
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Frame Content */}
            <div className="flex-1 bg-gray-50 overflow-hidden" style={{ minHeight: '800px' }}>
                {renderContent()}
            </div>

            {/* Status Bar */}
            <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <span>📖 Learning Material</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>🔍 100%</span>
                    <span>⌨️ Edit enabled</span>
                </div>
            </div>
        </div>
    )
}
export default TextEditor;
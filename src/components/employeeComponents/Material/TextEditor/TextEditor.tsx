


import { useSearchParams } from 'react-router-dom';
import { ImageLink } from '../../../../config/apiMethods';
const TextEditor = () => {
    const [searchParams] = useSearchParams();
    const content = searchParams.get('content');

    return (
        <div className="w-full h-full flex flex-col">
            {/* Frame Content */}
            <div className="flex-1 bg-gray-50 overflow-hidden" style={{ minHeight: '800px' }}>
                {content ? (
                    <iframe
                        loading="lazy"
                        className="w-full border-0"
                        style={{ height: '100%', minHeight: '800px' }}
                        src={`${content}`}
                        title="Learning Material"
                        allow="fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50" style={{ minHeight: '800px' }}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-gray-400">📄</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No content available</h3>
                            <p className="text-gray-500 text-sm">Please select a lesson to view its content.</p>
                        </div>
                    </div>
                )}
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
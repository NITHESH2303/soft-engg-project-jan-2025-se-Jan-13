// VideoViewer.tsx
import { Video } from './WeeklyCourseContent';
import { Clock, X, Edit, Save } from 'lucide-react';
import { useState } from 'react';

interface VideoViewerProps {
  video: Video;
  onClose: () => void;
  isAdmin: boolean;
  onUpdate?: (updatedVideo: Video) => void;
}

export default function VideoViewer({ video, onClose, isAdmin, onUpdate }: VideoViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVideo, setEditedVideo] = useState<Video>({ ...video });

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedVideo);
    }
    setIsEditing(false);
  };

  // Validate YouTube URL and convert to embed format if needed
  const getEmbedUrl = (url: string) => {
    try {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <input
            type="text"
            value={editedVideo.title}
            onChange={(e) => setEditedVideo({ ...editedVideo, title: e.target.value })}
            className="text-2xl font-bold text-indigo-800 border-b border-indigo-300 focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <h2 className="text-2xl font-bold text-indigo-800">{video.title}</h2>
        )}
        <div className="flex gap-2">
          {isAdmin && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              <Edit size={20} />
            </button>
          )}
          {isEditing && (
            <button 
              onClick={handleSave}
              className="text-green-500 hover:text-green-700 transition-colors"
            >
              <Save size={20} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg mb-6 overflow-hidden shadow-md">
        {video.video_link ? (
          <iframe
            width="100%"
            height="100%"
            src={isEditing ? getEmbedUrl(editedVideo.video_link) : getEmbedUrl(video.video_link)}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No video available
          </div>
        )}
      </div>
      
      <div className="flex items-center mb-4 text-indigo-600">
        <Clock size={16} className="mr-2" />
        {isEditing ? (
          <input
            type="text"
            value={editedVideo.duration}
            onChange={(e) => setEditedVideo({ ...editedVideo, duration: e.target.value })}
            className="text-sm font-medium border-b border-indigo-300 focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <p className="text-sm font-medium">Duration: {video.duration || 'Not specified'}</p>
        )}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Transcript</h3>
        {isEditing ? (
          <textarea
            value={editedVideo.transcript}
            onChange={(e) => setEditedVideo({ ...editedVideo, transcript: e.target.value })}
            className="w-full h-40 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">{video.transcript || 'No transcript available'}</p>
        )}
      </div>

      {isEditing && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Video URL</h3>
          <input
            type="text"
            value={editedVideo.video_link}
            onChange={(e) => setEditedVideo({ ...editedVideo, video_link: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
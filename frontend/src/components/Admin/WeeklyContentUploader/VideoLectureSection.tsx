// VideoLectureSection.tsx
import React from 'react';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/feather/plus';
import { VideoLecture } from './WeeklyContentUpload';
import { VideoLectureItem } from './VideoLectureItem';

interface VideoLectureSectionProps {
  videoLectures: VideoLecture[];
  setVideoLectures: React.Dispatch<React.SetStateAction<VideoLecture[]>>;
}

export default function VideoLectureSection({ 
  videoLectures, 
  setVideoLectures 
}: VideoLectureSectionProps) {
  
  const handleAddVideoLecture = () => {
    setVideoLectures([
      ...videoLectures,
      {
        title: '',
        transcript: '',
        duration: '',
        video_link: '',
      },
    ]);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-gray-800">Video Lectures</h3>
        <button
          onClick={handleAddVideoLecture}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <Icon icon={plus} size={16} /> <span className="ml-1">Add</span>
        </button>
      </div>
      
      {videoLectures.map((lecture, index) => (
        <VideoLectureItem 
          key={index}
          index={index}
          lecture={lecture}
          videoLectures={videoLectures}
          setVideoLectures={setVideoLectures}
        />
      ))}
      
      {videoLectures.length === 0 && (
        <p className="text-gray-500 italic">No video lectures added yet.</p>
      )}
    </div>
  );
}

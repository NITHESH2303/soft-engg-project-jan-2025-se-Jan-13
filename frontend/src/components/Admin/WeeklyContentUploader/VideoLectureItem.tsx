import Icon from "react-icons-kit";
import { VideoLecture } from "./WeeklyContentUpload";
import { minus } from 'react-icons-kit/feather/minus';
// VideoLectureItem component - nested inside VideoLectureSection.tsx
interface VideoLectureItemProps {
  index: number;
  lecture: VideoLecture;
  videoLectures: VideoLecture[];
  setVideoLectures: React.Dispatch<React.SetStateAction<VideoLecture[]>>;
}

export function VideoLectureItem({ 
  index, 
  lecture, 
  videoLectures, 
  setVideoLectures 
}: VideoLectureItemProps) {
  
  const updateField = (field: keyof VideoLecture, value: string) => {
    const updatedLectures = [...videoLectures];
    updatedLectures[index] = {
      ...updatedLectures[index],
      [field]: value
    };
    setVideoLectures(updatedLectures);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mt-4">
      <div className="flex justify-between">
        <h4 className="font-medium">Lecture {index + 1}</h4>
        <button
          onClick={() => setVideoLectures(videoLectures.filter((_, i) => i !== index))}
          className="text-red-500 flex items-center"
        >
          <Icon icon={minus} size={16} /> <span className="ml-1">Remove</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <input
          type="text"
          placeholder="Title"
          value={lecture.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Duration (e.g., 45:00)"
          value={lecture.duration}
          onChange={(e) => updateField('duration', e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      
      <input
        type="text"
        placeholder="Video Link (URL)"
        value={lecture.video_link}
        onChange={(e) => updateField('video_link', e.target.value)}
        className="w-full p-2 mt-2 border rounded"
      />
      
      <textarea
        placeholder="Add Transcript"
        value={lecture.transcript}
        onChange={(e) => updateField('transcript', e.target.value)}
        className="w-full p-2 mt-2 border rounded h-32"
      />
    </div>
  );
}

// WeeklyContentUpload.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import WeekSelector from './WeekSelector';
import VideoLectureSection from './VideoLectureSection';
import PracticeAssignmentSection from './PracticeAssignmentSection';
import { GradedAssignmentSection } from './GradedAssignmentSection';


export interface VideoLecture {
  title: string;
  transcript: string;
  duration: string;
  video_link: string;
}

export interface Assignment {
  deadline: string;
  is_coding_assignment: boolean;
  assignment_content: { question: string; type: string }[];
}

export default function WeeklyContentUpload() {
  const { courseId } = useParams<{ courseId: string }>();
  const [weekNo, setWeekNo] = useState<number>(1);
  const [videoLectures, setVideoLectures] = useState<VideoLecture[]>([]);
  const [practiceAssignments, setPracticeAssignments] = useState<Assignment[]>([]);
  const [gradedAssignments, setGradedAssignments] = useState<Assignment[]>([]);

  const handleSubmit = async () => {
    // Prepare payload for API
    const payload = {
      course_id: parseInt(courseId || '0'),
      week_no: weekNo,
      video_lectures: videoLectures.map(lecture => ({
        ...lecture,
        course_id: parseInt(courseId || '0'),
        week_no: weekNo,
      })),
      practice_assignments: practiceAssignments.map(assignment => ({
        ...assignment,
        course_id: parseInt(courseId || '0'),
        week_no: weekNo,
      })),
      graded_assignments: gradedAssignments.map(assignment => ({
        ...assignment,
        course_id: parseInt(courseId || '0'),
        week_no: weekNo,
      })),
    };

    console.log('Submission Payload:', JSON.stringify(payload, null, 2));

    // TODO: Implement actual API call
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/weekwise-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert('Content uploaded successfully!');
        // Reset form or redirect
      } else {
        alert('Failed to upload content');
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      alert('Error uploading content');
    }
  };

  return (
    <div className="p-8 flex-1">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Weekly Content</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Week Selection */}
        <WeekSelector weekNo={weekNo} setWeekNo={setWeekNo} />

        {/* Video Lectures */}
        <VideoLectureSection 
          videoLectures={videoLectures} 
          setVideoLectures={setVideoLectures} 
        />

        {/* Practice Assignments */}
        <PracticeAssignmentSection 
          practiceAssignments={practiceAssignments} 
          setPracticeAssignments={setPracticeAssignments} 
        />

        {/* Graded Assignments */}
        <GradedAssignmentSection 
          gradedAssignments={gradedAssignments} 
          setGradedAssignments={setGradedAssignments} 
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
        >
          Submit Weekly Content
        </button>
      </div>
    </div>
  );
}

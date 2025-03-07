import { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/feather/plus';
import { minus } from 'react-icons-kit/feather/minus';
import { useParams } from 'react-router-dom';
import WeeklyCourseContent from '../pages/WeeklyCourseContent';
import WeeklyContentUpload from '../Admin/WeeklyContentUploader/WeeklyContentUpload';

interface VideoLecture {
  course_id: number;
  week_no: number;
  title: string;
  transcript: string;
  duration: string;
  video_link: string;
}

interface PracticeAssignment {
  course_id: number;
  week_no: number;
  lecture_id: number | null;
  assignment_content: { question: string; type: string }[];
  is_coding_assignment: boolean;
  deadline: string;
}

interface GradedAssignment {
  course_id: number;
  week_no: number;
  assignment_content: { question: string; type: string }[];
  is_coding_assignment: boolean;
  deadline: string;
}

interface WeekwiseContent {
  week_no: number;
  term: string;
  course_id: number;
  upload_date: string;
}

export default function ManageCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const [weekwiseContent, setWeekwiseContent] = useState<WeekwiseContent>({
    week_no: 1,
    term: 'Spring 2025',
    course_id: parseInt(courseId || '0'),
    upload_date: new Date().toISOString().split('T')[0],
  });
  const [videoLectures, setVideoLectures] = useState<VideoLecture[]>([]);
  const [practiceAssignments, setPracticeAssignments] = useState<PracticeAssignment[]>([]);
  const [gradedAssignments, setGradedAssignments] = useState<GradedAssignment[]>([]);

  const handleAddVideoLecture = () => {
    setVideoLectures([
      ...videoLectures,
      {
        course_id: parseInt(courseId || '0'),
        week_no: weekwiseContent.week_no,
        title: '',
        transcript: '',
        duration: '',
        video_link: '',
      },
    ]);
  };

  const handleAddPracticeAssignment = () => {
    setPracticeAssignments([
      ...practiceAssignments,
      {
        course_id: parseInt(courseId || '0'),
        week_no: weekwiseContent.week_no,
        lecture_id: null,
        assignment_content: [],
        is_coding_assignment: false,
        deadline: '',
      },
    ]);
  };

  const handleAddGradedAssignment = () => {
    setGradedAssignments([
      ...gradedAssignments,
      {
        course_id: parseInt(courseId || '0'),
        week_no: weekwiseContent.week_no,
        assignment_content: [],
        is_coding_assignment: false,
        deadline: '',
      },
    ]);
  };

  const handleSubmit = () => {
    const payload = {
      weekwise_content: weekwiseContent,
      video_lectures: videoLectures,
      practice_assignment: practiceAssignments[0] || null,
      graded_assignment: gradedAssignments[0] || null,
    };

    console.log('Submission Payload:', JSON.stringify(payload, null, 2));
  };

  return (
    <>        {/* Display Weekly Content */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Content</h2>
      <WeeklyCourseContent />
      {/* Main Content */}
      <div className="ml-64 p-8 flex-1">
        <WeeklyContentUpload/>
      </div>
    </>
  );
}
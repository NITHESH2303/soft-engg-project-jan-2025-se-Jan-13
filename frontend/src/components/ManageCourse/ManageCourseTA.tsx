import { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/feather/plus';
import { minus } from 'react-icons-kit/feather/minus';
import { useParams } from 'react-router-dom';
import WeeklyCourseContent from '../pages/WeeklyCourseContent';

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
        {/* Upload Weekly Content Section */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Weekly Content</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Weekwise Content */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Weekwise Content</h3>
              <input
                type="number"
                placeholder="Week Number"
                value={weekwiseContent.week_no}
                onChange={(e) =>
                  setWeekwiseContent({ ...weekwiseContent, week_no: parseInt(e.target.value) })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                placeholder="Term"
                value={weekwiseContent.term}
                onChange={(e) =>
                  setWeekwiseContent({ ...weekwiseContent, term: e.target.value })
                }
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="date"
                placeholder="Upload Date"
                value={weekwiseContent.upload_date}
                onChange={(e) =>
                  setWeekwiseContent({ ...weekwiseContent, upload_date: e.target.value })
                }
                className="w-full p-2 mb-2 border rounded"
              />
            </div>

            {/* Video Lectures */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Video Lectures</h3>
              <button
                onClick={handleAddVideoLecture}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Icon icon={plus} size={16} /> Add Video Lecture
              </button>
              {videoLectures.map((lecture, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mt-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={lecture.title}
                    onChange={(e) => {
                      const updatedLectures = [...videoLectures];
                      updatedLectures[index].title = e.target.value;
                      setVideoLectures(updatedLectures);
                    }}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Transcript"
                    value={lecture.transcript}
                    onChange={(e) => {
                      const updatedLectures = [...videoLectures];
                      updatedLectures[index].transcript = e.target.value;
                      setVideoLectures(updatedLectures);
                    }}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={lecture.duration}
                    onChange={(e) => {
                      const updatedLectures = [...videoLectures];
                      updatedLectures[index].duration = e.target.value;
                      setVideoLectures(updatedLectures);
                    }}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Video Link"
                    value={lecture.video_link}
                    onChange={(e) => {
                      const updatedLectures = [...videoLectures];
                      updatedLectures[index].video_link = e.target.value;
                      setVideoLectures(updatedLectures);
                    }}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <button
                    onClick={() => {
                      const updatedLectures = videoLectures.filter((_, i) => i !== index);
                      setVideoLectures(updatedLectures);
                    }}
                    className="text-red-500"
                  >
                    <Icon icon={minus} size={16} /> Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Practice Assignments */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Practice Assignments</h3>
              <button
                onClick={handleAddPracticeAssignment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Icon icon={plus} size={16} /> Add Practice Assignment
              </button>
              {practiceAssignments.map((assignment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mt-4">
                  <input
                    type="date"
                    placeholder="Deadline"
                    value={assignment.deadline}
                    onChange={(e) => {
                      const updatedAssignments = [...practiceAssignments];
                      updatedAssignments[index].deadline = e.target.value;
                      setPracticeAssignments(updatedAssignments);
                    }}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <button
                    onClick={() => {
                      const updatedAssignments = practiceAssignments.filter((_, i) => i !== index);
                      setPracticeAssignments(updatedAssignments);
                    }}
                    className="text-red-500"
                  >
                    <Icon icon={minus} size={16} /> Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Graded Assignments */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Graded Assignments</h3>
              <button
                onClick={handleAddGradedAssignment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Icon icon={plus} size={16} /> Add Graded Assignment
              </button>
              {gradedAssignments.map((assignment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mt-4">
                  <input
                    type="date"
                    placeholder="Deadline"
                    value={assignment.deadline}
                    onChange={(e) => {
                      const updatedAssignments = [...gradedAssignments];
                      updatedAssignments[index].deadline = e.target.value;
                      setGradedAssignments(updatedAssignments);
                    }}
                    className="w-full p-2 mb-2 border rounded"
                  />
                  <button
                    onClick={() => {
                      const updatedAssignments = gradedAssignments.filter((_, i) => i !== index);
                      setGradedAssignments(updatedAssignments);
                    }}
                    className="text-red-500"
                  >
                    <Icon icon={minus} size={16} /> Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Submit
            </button>
          </div>
      </div>
    </>
  );
}
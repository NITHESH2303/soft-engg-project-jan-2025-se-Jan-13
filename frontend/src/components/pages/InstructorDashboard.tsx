import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { book } from 'react-icons-kit/feather/book';
import { clipboard } from 'react-icons-kit/feather/clipboard';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { x } from 'react-icons-kit/feather/x';
import { Link, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import { fetchCourses, fetchPendingAssignments, addCourseContent, updateAssignmentStatus } from '../../services/instructor.ts';

interface Course {
  id: number;
  title: string;
  category: string;
  icon: string;
  description: string;
}

interface PendingAssignment {
  id: number;
  course_title: string;
  assignment_no: number;
  posted_by: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface CourseContent {
  title: string;
  videoUrl: string;
  description: string;
}

export default function InstructorDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [newContent, setNewContent] = useState<CourseContent>({ title: '', videoUrl: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await fetchCourses();
        const assignmentsData = await fetchPendingAssignments();
        setCourses(coursesData);
        setPendingAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddContent = () => {
    setIsAddingContent(true);
  };

  const handleSubmitContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await addCourseContent(newContent);
      setIsAddingContent(false);
      setNewContent({ title: '', videoUrl: '', description: '' });
      // Optionally, refresh the course content here
    } catch (error) {
      console.error('Error adding course content:', error);
    }
  };

  const handleAssignmentAction = async (assignmentId: number, action: 'approve' | 'reject') => {
    try {
      await updateAssignmentStatus(assignmentId, action);
      const updatedAssignments = await fetchPendingAssignments();
      setPendingAssignments(updatedAssignments);
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/instructor_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">Instructor Dashboard</h2>
          <Link 
            to="/profile" 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            to="/instructor-dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-600"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link 
            to="/course-content" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={book} size={20} />
            <span className="font-medium">Course Content</span>
          </Link>
          <Link 
            to="/assignments" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={clipboard} size={20} />
            <span className="font-medium">Assignments</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleAddContent}
            >
              Add Course Content
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsChatOpen(true)}
            >
              <Icon icon={messageCircle} size={24} />
            </button>
          </div>
        </header>


        {/* Courses Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link 
                to={`/course/${course.id}`}
                key={course.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
                    {course.category}
                  </span>
                  <div className="text-4xl mb-4">{course.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <span className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                    Manage Course
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pending Assignments Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pending Assignments</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.course_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.assignment_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.posted_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : assignment.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAssignmentAction(assignment.id, 'approve')}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAssignmentAction(assignment.id, 'reject')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Add Content Modal */}
      {isAddingContent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Course Content</h3>
            <form onSubmit={handleSubmitContent}>
              <input
                type="text"
                placeholder="Content Title"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="url"
                placeholder="Video URL"
                value={newContent.videoUrl}
                onChange={(e) => setNewContent({ ...newContent, videoUrl: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
              />
              <textarea
                placeholder="Content Description"
                value={newContent.description}
                onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
                rows={3}
              />
              <button type="submit" className="mt-4 w-full bg-blue-500 text-white rounded-md px-4 py-2">
                Add Content
              </button>
            </form>
            <button onClick={() => setIsAddingContent(false)} className="mt-2 w-full bg-gray-300 text-gray-800 rounded-md px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chat Overlay */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-right">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Chat Assistant</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon icon={x} size={20} />
            </button>
          </div>
          <div className="h-[calc(100%-64px)]">
            <Chat />
          </div>
        </div>
      )}
    </div>
  );
}
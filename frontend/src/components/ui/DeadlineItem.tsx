import React from 'react';

interface DeadlineItemProps {
  course_title: string;
  assignment_no: number;
  deadline: string;
  submitted: boolean;
}

const DeadlineItem: React.FC<DeadlineItemProps> = ({ course_title, assignment_no, deadline, submitted }) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {deadline}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {course_title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {assignment_no}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          submitted === true
            ? 'bg-green-500 text-green-800'
            : 'bg-red-500 text-red-800'
        }`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

export default DeadlineItem;

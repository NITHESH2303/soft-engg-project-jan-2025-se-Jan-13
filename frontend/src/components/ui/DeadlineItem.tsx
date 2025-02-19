import React from 'react';

interface DeadlineItemProps {
  course_title: string;
  assignment_no: number;
  deadline: string;
  status: 'Pending' | 'Submitted';
}

const DeadlineItem: React.FC<DeadlineItemProps> = ({ course_title, assignment_no, deadline, status }) => {
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
          status === 'Submitted'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

export default DeadlineItem;

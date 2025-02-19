import React, { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { upload } from 'react-icons-kit/feather/upload';
import { fileText } from 'react-icons-kit/feather/fileText';
import { useNavigate } from 'react-router-dom';

interface Agent {
  agent_id: string;
  agent_name: string;
}

const mockAgents: Agent[] = [
  {
    agent_id: "1",
    agent_name: "Course Assistant",
  },
  {
    agent_id: "2",
    agent_name: "Assignment Helper",
  },
];

const AddContent: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [contentType, setContentType] = useState<'file' | 'manual'>('file');
  const [fileType, setFileType] = useState<'text' | 'csv' | 'pdf'>('text');
  const [file, setFile] = useState<File | null>(null);
  const [manualContent, setManualContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulating API call
    const fetchAgents = async () => {
      // In a real scenario, this would be an API call
      setAgents(mockAgents);
    };

    fetchAgents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate file upload or content ingestion
    if (contentType === 'file' && file) {
      console.log(`Uploading ${fileType} file: ${file.name}`);
      // Here you would typically call your API to handle the file upload
    } else if (contentType === 'manual') {
      console.log('Ingesting manual content:', manualContent);
      // Here you would typically call your API to handle the manual content
    }
    // Reset form
    setFile(null);
    setManualContent('');
    navigate('/customize-ai');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Add New Content</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.agent_id} value={agent.agent_id}>
                  {agent.agent_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as 'file' | 'manual')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="file">File Upload</option>
              <option value="manual">Manual Input</option>
            </select>
          </div>

          {contentType === 'file' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">File Type</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as 'text' | 'csv' | 'pdf')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="text">Text File</option>
                  <option value="csv">CSV File</option>
                  <option value="pdf">PDF File</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Upload File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={`.${fileType}`}
                  className="mt-1 block w-full"
                />
              </div>
            </>
          )}

          {contentType === 'manual' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Icon icon={upload} size={20} className="mr-2" />
            Upload Content
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContent;
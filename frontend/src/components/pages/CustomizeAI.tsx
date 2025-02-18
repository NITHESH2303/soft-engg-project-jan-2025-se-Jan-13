import React, { useState, useEffect } from "react";
import { Icon } from "react-icons-kit";
import { home } from "react-icons-kit/feather/home";
import { activity } from "react-icons-kit/feather/activity";
import { settings } from "react-icons-kit/feather/settings";
import { bell } from "react-icons-kit/feather/bell";
import { edit2 } from "react-icons-kit/feather/edit2";
import { save } from "react-icons-kit/feather/save";
import { Link, useNavigate } from "react-router-dom";
import { file } from 'react-icons-kit/feather/file';

interface Agent {
  agent_id: string;
  agent_name: string;
  system_prompt: string;
  vector_index_name: string;
  openai_model: string;
  response_token_limit: number;
  temperature: number;
  top_p: number;
}

const mockAgents: Agent[] = [
  {
    agent_id: "1",
    agent_name: "Course Assistant",
    system_prompt: "You are a helpful course assistant.",
    vector_index_name: "course_content_index",
    openai_model: "gpt-4",
    response_token_limit: 4096,
    temperature: 0.7,
    top_p: 1,
  },
  {
    agent_id: "2",
    agent_name: "Assignment Helper",
    system_prompt: "You are an AI that helps with assignments.",
    vector_index_name: "assignment_index",
    openai_model: "gpt-4",
    response_token_limit: 4096,
    temperature: 0.5,
    top_p: 0.9,
  },
];

export default function CustomizeAI() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulating API call
    const fetchAgents = async () => {
      // In a real scenario, this would be an API call
      setAgents(mockAgents);
    };

    fetchAgents();
  }, []);

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
  };

  const handleSave = () => {
    if (editingAgent) {
      // In a real scenario, this would be an API call to update the agent
      setAgents(
        agents.map((a) =>
          a.agent_id === editingAgent.agent_id ? editingAgent : a
        )
      );
      setEditingAgent(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (editingAgent) {
      setEditingAgent({
        ...editingAgent,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleAddContent = () => {
    navigate('/admin/add-content');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/iitm_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">Course Instructor</h2>
          <Link
            to="/profile"
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link
            to="/performance"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={activity} size={20} />
            <span className="font-medium">Performance</span>
          </Link>
          <Link
            to="/customize-ai"
            className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon icon={settings} size={20} />
            <span className="font-medium">Customize AI agents</span>
          </Link>
          <Link
            to="/content-approval"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={bell} size={20} />
            <span className="font-medium">Course Content Approval (2)</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Customize AI Agents
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vector Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => (
                <tr key={agent.agent_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.agent_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.vector_index_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.openai_model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(agent)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Icon icon={edit2} size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingAgent && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Edit Agent: {editingAgent.agent_name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="agent_name"
                  value={editingAgent.agent_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  System Prompt
                </label>
                <textarea
                  name="system_prompt"
                  value={editingAgent.system_prompt}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vector Index Name
                </label>
                <input
                  type="text"
                  name="vector_index_name"
                  value={editingAgent.vector_index_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OpenAI Model
                </label>
                <input
                  type="text"
                  name="openai_model"
                  value={editingAgent.openai_model}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Response Token Limit
                </label>
                <input
                  type="number"
                  name="response_token_limit"
                  value={editingAgent.response_token_limit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Icon icon={save} size={20} className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleAddContent}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Icon icon={file} size={20} className="mr-2" />
                Add New Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Icon } from "react-icons-kit";
import { home } from "react-icons-kit/feather/home";
import { activity } from "react-icons-kit/feather/activity";
import { settings } from "react-icons-kit/feather/settings";
import { edit2 } from "react-icons-kit/feather/edit2";
import { save } from "react-icons-kit/feather/save";
import { file } from 'react-icons-kit/feather/file';
import { messageCircle } from 'react-icons-kit/feather/messageCircle';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import ChatOverlay from '../ui/ChatOverlay';

interface Agent {
  id: number;
  name: string;
  model_name: string;
  system_prompt: string;
  model_type: string;
  vector_index: string | null;
  response_format: string | null;
  response_token_limit: number;
  temperature: number;
  description: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api/agent';

export default function CustomizeAI() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch agents from API
  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents/?skip=0&limit=100`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Update agent via API
  const updateAgent = async (agent: Agent) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/agents/${agent.id}`, agent, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
  };

  const handleSave = async () => {
    if (editingAgent) {
      try {
        const updatedAgent = await updateAgent(editingAgent);
        setAgents(agents.map((a) => 
          a.id === updatedAgent.id ? updatedAgent : a
        ));
        setEditingAgent(null);
      } catch (error) {
        console.error('Failed to save agent:', error);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  // Function to adjust textarea height
  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
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
          <h2 className="text-xl font-bold">Admin</h2>
          <Link 
            to="/admin/profile" 
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-600"
          >
            <Icon icon={home} size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <Link 
            to="/admin/students" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={activity} size={20} />
            <span className="font-medium">Students</span>
          </Link>
          <Link 
            to="/admin/customize-ai" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Icon icon={settings} size={20} />
            <span className="font-medium">Customize AI agents</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Customize AI Agents</h1>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsChatOpen(true)}
          >
            <Icon icon={messageCircle} size={24} />
          </button>
        </header>

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
                <tr key={agent.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.vector_index || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.model_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(agent)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
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
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 animate-scale-in">
            <h2 className="text-2xl font-semibold mb-4">
              Edit Agent: {editingAgent.name}
            </h2>
            <div className="space-y-4">
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingAgent.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200"
                />
              </div>
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <textarea
                  name="system_prompt"
                  value={editingAgent.system_prompt}
                  onChange={(e) => {
                    handleInputChange(e);
                    adjustHeight(e.target);
                  }}
                  onFocus={(e) => adjustHeight(e.target)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200 min-h-[100px] resize-none"
                />
              </div>
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editingAgent.description}
                  onChange={(e) => {
                    handleInputChange(e);
                    adjustHeight(e.target);
                  }}
                  onFocus={(e) => adjustHeight(e.target)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200 min-h-[100px] resize-none"
                />
              </div>
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vector Index
                </label>
                <input
                  type="text"
                  name="vector_index"
                  value={editingAgent.vector_index || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200"
                />
              </div>
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  name="model_name"
                  value={editingAgent.model_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200"
                />
              </div>
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Token Limit
                </label>
                <input
                  type="number"
                  name="response_token_limit"
                  value={editingAgent.response_token_limit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200"
                />
              </div>
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={editingAgent.temperature}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="1"
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200"
                />
              </div>
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Format
                </label>
                <select
                  name="response_format"
                  value={editingAgent.response_format || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all duration-200"
                >
                  <option value="">None</option>
                  <option value="text">Text</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                           rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                           transform transition-all duration-200 hover:scale-105"
                >
                  <Icon icon={save} size={20} className="mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleAddContent}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                           rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                           transform transition-all duration-200 hover:scale-105"
                >
                  <Icon icon={file} size={20} className="mr-2" />
                  Add New Content
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
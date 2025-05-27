'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchProjects, createProject } from '../../lib/api';
import { ApiError } from '../../lib/api';
import { APP_CONFIG } from '../../lib/config';

interface Project {
  id: string;
  name: string;
  description: string | null;
  company_name: string;
  created_at: string;
  updated_at: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    company_name: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setIsLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      if (err instanceof ApiError) {
        setError(`${err.message} (Status: ${err.statusCode})`);
      } else {
        setError('Failed to connect to API. Make sure the backend is running.');
      }
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await createProject(newProject);
      setProjects([...projects, data]);
      setNewProject({
        name: '',
        description: '',
        company_name: ''
      });
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating project:', err);
      if (err instanceof ApiError) {
        setError(`${err.message} (Status: ${err.statusCode})`);
      } else {
        setError('Failed to create project. Please try again.');
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: value
    });
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">TDD Projects</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={newProject.company_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={newProject.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Project
          </button>
        </form>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Projects</h2>
        {isLoading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found. Create your first project above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.company_name}</p>
                {project.description && <p className="mt-2">{project.description}</p>}
                <div className="mt-4">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

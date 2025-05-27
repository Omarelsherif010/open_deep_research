'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getProject, uploadDocument, getProjectDocuments, deleteDocument } from '../../../lib/api';
import { ApiError, Document } from '../../../lib/api';
import { APP_CONFIG } from '../../../lib/config';

// Define the Project interface
interface Project {
  id: string;
  name: string;
  description: string | null;
  company_name: string;
  created_at: string;
  updated_at: string;
}

// Define the TDD Report interface
interface TDDReport {
  status: 'not_started' | 'in_progress' | 'completed';
  domains_analyzed: string[];
  completion_percentage: number;
}

// Define tab types
type TabType = 'details' | 'tdd' | 'documents' | 'github';

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [report, setReport] = useState<TDDReport>({
    status: 'not_started',
    domains_analyzed: [],
    completion_percentage: 0
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProjectData() {
      try {
        setIsLoading(true);
        
        // Load project details
        const projectData = await getProject(params.id);
        setProject(projectData);
        
        // Load project documents
        const documentsData = await getProjectDocuments(params.id);
        setDocuments(documentsData.documents || []);
        
        // In a real implementation, you would fetch the TDD report status here
        // For now, we'll simulate a report
        setReport({
          status: 'not_started',
          domains_analyzed: [],
          completion_percentage: 0
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        if (err instanceof ApiError) {
          setError(`${err.message} (Status: ${err.statusCode})`);
        } else {
          setError('Failed to load project. Please try again.');
        }
        setIsLoading(false);
      }
    }

    loadProjectData();
  }, [params.id]);

  const startTDDAnalysis = async () => {
    // In a real implementation, this would call an API to start the TDD analysis
    setReport({
      ...report,
      status: 'in_progress',
      completion_percentage: 10
    });
  };

  // Function to handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !project) return;

    const file = files[0];
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // Upload the file
      const result = await uploadDocument(file, params.id);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add the new document to the list
      setDocuments(prev => [...prev, result]);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reset upload state after a short delay to show 100% completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      if (err instanceof ApiError) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError('Failed to upload document. Please try again.');
      }
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Function to handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (!project) return;
    
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(params.id, documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      if (err instanceof ApiError) {
        setError(`Delete failed: ${err.message}`);
      } else {
        setError('Failed to delete document. Please try again.');
      }
    }
  };

  // Function to trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-4">
            <Link href="/projects" className="text-blue-500 hover:underline">Back to Projects</Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Tab content components
  const DetailsTab = () => (
    <div className="mt-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the TDD project.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Project name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project?.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project?.company_name}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project?.description || 'No description provided'}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(project?.created_at).toLocaleString()}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(project?.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
  
  const TDDAnalysisTab = () => (
    <div className="mt-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">TDD Analysis</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Run a technical due diligence analysis on this project.</p>
          </div>
          <div className="mt-5">
            {report.status === 'not_started' ? (
              <button
                onClick={startTDDAnalysis}
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start TDD Analysis
              </button>
            ) : report.status === 'in_progress' ? (
              <div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${report.completion_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{report.completion_percentage}%</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Analysis in progress...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">Analysis completed</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Domains Analyzed:</h4>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {report.domains_analyzed.map((domain, index) => (
                      <li key={index} className="text-sm text-gray-500">{domain}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  const GitHubTab = () => (
    <div className="mt-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">Connect GitHub Repository</h3>
          <p className="mt-1 text-sm text-gray-500">
            Link a GitHub repository to analyze the codebase as part of the TDD process.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Connect GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Document upload UI component
  const DocumentsTab = () => {
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Documents</h2>
          <div>
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.pptx"
            />
            
            {/* Upload button */}
            <button
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
        
        {/* Upload progress bar */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        
        {/* Document list */}
        {documents.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <a 
                          href={`${APP_CONFIG.API_BASE_URL}/uploads/${doc.path.split('/').pop()}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {doc.filename}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.content_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.upload_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload documents to analyze for this project.
            </p>
            <div className="mt-6">
              <button
                onClick={triggerFileUpload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload a document
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Not Found: </strong>
          <span className="block sm:inline">Project not found.</span>
        </div>
        <div className="mt-4">
          <Link href="/projects" className="text-blue-500 hover:text-blue-700">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Link href="/projects" className="text-blue-500 hover:text-blue-700">
          ← Back to Projects
        </Link>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`${activeTab === 'details' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Project Details
          </button>
          <button
            onClick={() => setActiveTab('tdd')}
            className={`${activeTab === 'tdd' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            TDD Analysis
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`${activeTab === 'documents' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`${activeTab === 'github' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            GitHub
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'details' && <DetailsTab />}
      {activeTab === 'tdd' && <TDDAnalysisTab />}
      {activeTab === 'documents' && <DocumentsTab />}
      {activeTab === 'github' && <GitHubTab />}
    </div>
  );
}

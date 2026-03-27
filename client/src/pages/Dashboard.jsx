import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, LayoutTemplate, MoreVertical, Search, LogOut, Loader2, Pencil, Trash } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  
  // Modal Fields
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      localStorage.setItem('vividflow_token', urlToken);
      searchParams.delete('token');
      setSearchParams(searchParams, { replace: true });
    }
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('vividflow_token');
      if (!token) {
        navigate('/');
        return;
      }
      
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to load projects', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('vividflow_token');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('vividflow_token');
      const res = await axios.post('http://localhost:5000/api/projects', 
        { name: projectName, description: projectDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProjects([res.data, ...projects]);
      setIsModalOpen(false);
      setProjectName('');
      setProjectDesc('');
    } catch (error) {
      console.error('Failed to create project', error);
      alert('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const token = localStorage.getItem('vividflow_token');
        await axios.delete(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(projects.filter(p => p._id !== id));
      } catch (error) {
        console.error('Failed to delete project', error);
        alert('Failed to delete project');
      }
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setEditThumbnailUrl(project.thumbnailUrl || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editProjectName.trim()) return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('vividflow_token');
      const res = await axios.patch(`http://localhost:5000/api/projects/${editingProject._id}`, 
        { name: editProjectName, thumbnailUrl: editThumbnailUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(projects.map(p => p._id === editingProject._id ? res.data : p));
      setIsEditModalOpen(false);
      setEditingProject(null);
      setEditProjectName('');
    } catch (error) {
      console.error('Failed to update project', error);
      alert('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('vividflow_token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-sm">
              <LayoutTemplate className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">VividFlow</span>
          </div>
          
            <div className="flex items-center gap-4">
              <Link 
                to="/contact" 
                style={{ fontSize: '14px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', marginRight: '8px' }}
                className="hover:text-indigo-700 transition-colors"
              >
                Contact Us
              </Link>
              <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', backgroundImage: 'linear-gradient(to right, #6d28d9, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>
            Your Projects
          </h1>
          <p style={{ fontSize: '18px', color: '#666', marginTop: '10px', marginBottom: '30px', fontWeight: 'normal' }}>
            VividFloww: Crafting seamless user experiences, one design at a time.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first project to start building.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects found matching your search.</h3>
            <p className="text-slate-500 text-sm mb-6">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Create New Card */}
            <div 
              onClick={() => setIsModalOpen(true)}
              className="group cursor-pointer bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-3xl h-64 flex flex-col items-center justify-center transition-all duration-200"
            >
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:text-purple-600 transition-all duration-200 text-slate-400 mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-600 group-hover:text-purple-700">Create New Project</span>
            </div>

            {/* Project Cards */}
            {filteredProjects.map(project => (
              <div key={project._id} className="bg-white group rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-64 flex flex-col overflow-hidden relative">
                <div className="h-32 bg-slate-100 w-full relative overflow-hidden group-hover:bg-purple-50 transition-colors">
                  <img 
                    src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500'} 
                    alt={project.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Overlay for icon if needed */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-purple-500/10 flex items-center justify-center transition-colors">
                    {/* Icon remains optional overlay */}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(project); }} 
                      className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors bg-white shadow-sm border border-slate-100"
                      title="Edit Project"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id); }} 
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors bg-white shadow-sm border border-slate-100"
                      title="Delete Project"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate pr-6">{project.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description || 'No description provided.'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => navigate(`/editor/${project._id}`)}
                      className="text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 py-1.5 px-3 rounded-lg transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
                  <input
                    id="name"
                    required
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Marketing Site"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">Description (Optional)</label>
                  <textarea
                    id="description"
                    rows="3"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Brief details about this project..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !projectName.trim()}
                  className="px-5 py-2.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 shadow-sm transition-colors active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Rename Project</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
                  <input
                    id="edit-name"
                    required
                    autoFocus
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-thumbnail" className="block text-sm font-medium text-slate-700 mb-1.5">Thumbnail Image URL</label>
                  <input
                    id="edit-thumbnail"
                    value={editThumbnailUrl}
                    onChange={(e) => setEditThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !editProjectName.trim()}
                  className="px-5 py-2.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 shadow-sm transition-colors active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

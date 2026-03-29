import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { Rnd } from 'react-rnd';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { generateAndDownloadHtml } from '../utils/exportCode';
import {
  Type, Image as ImageIcon, Box, LayoutTemplate,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Eye, Save, FileText, Trash2, CheckCircle2, Loader2, MousePointer2, Download, Share, Undo2, Redo2, Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

// Predefined component types
const COMPONENT_TYPES = [
  { id: 'heading', label: 'Heading', icon: Type, defaultContent: 'New Heading', defaultStyles: { fontSize: '32px', color: '#000000', fontWeight: 'bold', padding: '10px' } },
  { id: 'text', label: 'Text Block', icon: FileText, defaultContent: 'Write some text here...', defaultStyles: { fontSize: '16px', color: '#4a5568', padding: '10px' } },
  { id: 'button', label: 'Button', icon: MousePointer2, defaultContent: 'Click Me', defaultStyles: { fontSize: '14px', color: '#ffffff', backgroundColor: '#8b5cf6', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none' } },
  { id: 'image', label: 'Image', icon: ImageIcon, defaultContent: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300', defaultStyles: { width: '300px', height: 'auto', objectFit: 'cover', borderRadius: '4px' } }
];

const ImageWithFallback = ({ src, style, alt, isUploading }) => {
  const [error, setError] = useState(false);

  useEffect(() => setError(false), [src]);

  if (isUploading) {
    return (
      <div style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#8b5cf6' }}>
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Uploading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
        <ImageIcon className="w-8 h-8 opacity-50" />
      </div>
    );
  }

  return <img key={src} src={src} style={style} alt={alt} crossOrigin="anonymous" onError={() => setError(true)} />;
};

// Left Sidebar Draggable Item Component
function DraggableItem({ item }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tool-${item.id}`,
    data: { type: item.id }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing hover:border-purple-400 hover:shadow-sm transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <item.icon className="w-6 h-6 text-slate-600 mb-2" />
      <span className="text-xs font-medium text-slate-700">{item.label}</span>
    </div>
  );
}

function CanvasElement({ el, selectedId, onSelect, onUpdatePosition, onUpdateSize, onDragStart }) {
  const isSelected = selectedId === el.id;
  const [isDragging, setIsDragging] = React.useState(false);

  const innerStyles = { ...el.styles };
  delete innerStyles.position;
  delete innerStyles.left;
  delete innerStyles.top;
  delete innerStyles.zIndex;
  delete innerStyles.width;
  delete innerStyles.height;

  const rndStyle = {
    zIndex: isDragging ? 1000 : (el.styles?.zIndex || 1),
    outline: isSelected ? '2px solid #8b5cf6' : 'none',
    outlineOffset: '2px',
    borderRadius: '2px',
  };

  const handleStyle = {
    width: '10px',
    height: '10px',
    background: 'white',
    border: '2px solid #3b82f6',
    borderRadius: '2px',
    zIndex: 9999,
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  };

  const getWidth = () => {
    const w = el.styles?.width;
    if (!w || w === 'auto') return 200;
    return parseInt(w) || 200;
  };

  const getHeight = () => {
    const h = el.styles?.height;
    if (!h || h === 'auto') return 'auto';
    return parseInt(h) || 'auto';
  };

  const heightVal = getHeight();
  const isAutoHeight = heightVal === 'auto';

  // Build Unsplash image src from keyword or full URL
  const getImageSrc = () => {
    const c = el.content || el.aiKeyword || '';
    if (c.startsWith('http://') || c.startsWith('https://')) return c;
    const keyword = encodeURIComponent(c || 'professional');
    return `https://source.unsplash.com/800x600/?${keyword}`;
  };

  const cornerHandleStyle = {
    width: '12px',
    height: '12px',
    background: '#3b82f6', // Bright Blue
    border: '2px solid white',
    borderRadius: '50%',
    position: 'absolute',
    zIndex: 10
  };

  return (
    <Rnd
      position={{ x: parseInt(el.styles?.left) || 0, y: parseInt(el.styles?.top) || 0 }}
      size={{ width: getWidth(), height: isAutoHeight ? undefined : heightVal }}
      disableDragging={false}
      enableResizing={isSelected ? {
        top: false, right: false, bottom: false, left: false,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      } : false}
      resizeHandleStyles={isSelected ? {
        topLeft: { ...cornerHandleStyle, top: '-6px', left: '-6px' },
        topRight: { ...cornerHandleStyle, top: '-6px', right: '-6px' },
        bottomLeft: { ...cornerHandleStyle, bottom: '-6px', left: '-6px' },
        bottomRight: { ...cornerHandleStyle, bottom: '-6px', right: '-6px' },
      } : {}}
      lockAspectRatio={el.type === 'image'}
      style={rndStyle}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(el.id);
      }}
      onDragStart={() => {
        setIsDragging(true);
        onSelect(el.id);
        if (onDragStart) onDragStart();
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        onUpdatePosition(el.id, d.x, d.y);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdateSize(
          el.id,
          ref.offsetWidth,
          ref.offsetHeight,
          position.x,
          position.y
        );
      }}
    >
      <div style={{ width: '100%', height: '100%', cursor: 'move' }}>
        {el.type === 'heading' && <h2 style={{ ...innerStyles, width: '100%' }}>{el.content}</h2>}
        {el.type === 'text' && <p style={{ ...innerStyles, width: '100%' }}>{el.content}</p>}
        {el.type === 'button' && <button style={{ ...innerStyles, width: '100%' }}>{el.content}</button>}
        {el.type === 'image' && (
          <ImageWithFallback
            src={getImageSrc()}
            style={{ ...innerStyles, width: '100%', height: '100%', objectFit: 'cover' }}
            alt=""
            isUploading={el.isUploading}
          />
        )}
      </div>
    </Rnd>
  );
}

// Center Droppable Canvas Component
function DroppableCanvas({ elements, selectedId, onSelect, onUpdatePosition, onUpdateSize, onDragStart, backgroundColor }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
  const [canvasScale, setCanvasScale] = useState(1);
  const [pinchState, setPinchState] = useState({ initialDist: 0, initialScale: 1 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setPinchState({ initialDist: dist, initialScale: canvasScale });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchState.initialDist > 0) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scale = pinchState.initialScale * (dist / pinchState.initialDist);
      setCanvasScale(Math.min(Math.max(0.4, scale), 3)); // Restrict zoom level
    }
  };

  const handleTouchEnd = () => {
    setPinchState({ initialDist: 0, initialScale: canvasScale });
  };

  // Compute minimum canvas height so all elements are visible
  const minCanvasHeight = React.useMemo(() => {
    if (!elements.length) return 800;
    const maxBottom = Math.max(
      ...elements.map(el => (parseInt(el.styles?.top) || 0) + (parseInt(el.styles?.height) || 100))
    );
    return maxBottom + 500; // 500px breathing room below last element
  }, [elements]);

  return (
    <div
      style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
    >
      <div
        id="droppable-canvas"
        ref={setNodeRef}
        className={`relative border-2 transition-colors duration-200 ${
          isOver ? 'border-purple-400 bg-purple-50/50' : 'border-dashed border-slate-300'
        } m-4 rounded-2xl`}
        style={{ minHeight: `${minCanvasHeight}px`, width: 'calc(100% - 32px)', backgroundColor: backgroundColor || '#f8fafc', transform: `scale(${canvasScale})`, transformOrigin: 'top center' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {elements.length === 0 && !isOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
            <LayoutTemplate className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-medium">Drag and drop components here</p>
          </div>
        )}

        {elements.map(el => (
          <CanvasElement
            key={el.id}
            el={el}
            selectedId={selectedId}
            onSelect={onSelect}
            onUpdatePosition={onUpdatePosition}
            onUpdateSize={onUpdateSize}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}

const THEMES = {
  'Modern Dark': { primary: '#6366f1', background: '#1a1a1a', text: '#ffffff', card: '#2d2d2d' },
  'Professional Blue': { primary: '#2563eb', background: '#f8fafc', text: '#1e293b', card: '#ffffff' },
  'Nature Green': { primary: '#16a34a', background: '#f0fdf4', text: '#14532d', card: '#ffffff' }
};

export default function Editor() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [elements, setElements] = useState([]);
  const [pastElements, setPastElements] = useState([]);
  const [futureElements, setFutureElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'syncing', 'error'
  const [isMobileWindow, setIsMobileWindow] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileWindow(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('Professional Blue');
  const [canvasBg, setCanvasBg] = useState('#f8fafc');

  // Handle element changes
  const updateElements = (newElements, recordHistory = true) => {
    if (recordHistory) {
      setPastElements(prev => [...prev, elements]);
      setFutureElements([]);
    }
    setElements(newElements);
    setHasUnsavedChanges(true);
  };

  const applyTheme = (themeName) => {
    const theme = THEMES[themeName];
    if (!theme) return;
    setCurrentTheme(themeName);
    setCanvasBg(theme.background);
    const newElements = elements.map(el => {
      const newStyles = { ...el.styles };
      if (el.type === 'heading') newStyles.color = theme.text;
      if (el.type === 'text') newStyles.color = theme.text;
      if (el.type === 'button') {
        newStyles.backgroundColor = theme.primary;
        newStyles.color = '#ffffff';
      }
      return { ...el, styles: newStyles };
    });
    updateElements(newElements);
  };

  const handleUndo = useCallback(() => {
    if (pastElements.length === 0) return;
    const previous = pastElements[pastElements.length - 1];
    const newPast = pastElements.slice(0, -1);

    setFutureElements(prev => [elements, ...prev]);
    setPastElements(newPast);
    setElements(previous);
    setHasUnsavedChanges(true); // Treat undo as an unsaved change
  }, [pastElements, elements]);

  const handleRedo = useCallback(() => {
    if (futureElements.length === 0) return;
    const next = futureElements[0];
    const newFuture = futureElements.slice(1);

    setPastElements(prev => [...prev, elements]);
    setFutureElements(newFuture);
    setElements(next);
    setHasUnsavedChanges(true); // Treat redo as an unsaved change
  }, [futureElements, elements]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElementId) return;
    const newElements = elements.filter(el => el.id !== selectedElementId);
    updateElements(newElements);
    setSelectedElementId(null);
  }, [elements, selectedElementId, updateElements]);

  const updateSelectedElement = useCallback((updates) => {
    const newElements = elements.map(el => {
      if (el.id === selectedElementId) {
        if (updates.content && typeof updates.content === 'string' && updates.content.startsWith('http://')) {
          updates.content = updates.content.replace(/^http:\/\//i, 'https://');
        }
        if (updates.linkUrl && typeof updates.linkUrl === 'string' && updates.linkUrl.startsWith('http://')) {
          updates.linkUrl = updates.linkUrl.replace(/^http:\/\//i, 'https://');
        }
        return { ...el, ...updates, styles: { ...el.styles, ...(updates.styles || {}) } };
      }
      return el;
    });
    updateElements(newElements);
  }, [elements, selectedElementId, updateElements]);

  const moveElement = useCallback((dx, dy) => {
    if (!selectedElementId) return;
    const selectedElement = elements.find(el => el.id === selectedElementId);
    if (!selectedElement) return;
    const currentLeft = parseInt(selectedElement.styles.left || '0', 10);
    const currentTop = parseInt(selectedElement.styles.top || '0', 10);
    updateSelectedElement({
      styles: { left: `${currentLeft + dx}px`, top: `${currentTop + dy}px` }
    });
  }, [elements, selectedElementId, updateSelectedElement]);

  const handleUpdatePosition = useCallback((id, newLeft, newTop) => {
    const newElements = elements.map(el => {
      if (el.id === id) {
        return {
          ...el,
          styles: { ...el.styles, left: `${Math.round(newLeft)}px`, top: `${Math.round(newTop)}px` }
        };
      }
      return el;
    });
    updateElements(newElements, false);
  }, [elements, updateElements]);

  const handleUpdateSize = useCallback((id, newWidth, newHeight, newLeft, newTop) => {
    const newElements = elements.map(el => {
      if (el.id === id) {
        return {
          ...el,
          styles: {
            ...el.styles,
            width: `${Math.round(newWidth)}px`,
            height: `${Math.round(newHeight)}px`,
            left: `${Math.round(newLeft)}px`,
            top: `${Math.round(newTop)}px`
          }
        };
      }
      return el;
    });
    updateElements(newElements, false);
  }, [elements, updateElements]);

  const handleCanvasElementDragStart = useCallback(() => {
    setPastElements(prev => [...prev, elements]);
    setFutureElements([]);
  }, [elements]);

  // Load project on mount
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('vividflow_token');
        if (!token) return navigate('/');
        const res = await axios.get(`${API_BASE_URL}/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
        if (res.data.canvasData && Array.isArray(res.data.canvasData.elements)) {
          setElements(res.data.canvasData.elements);
          if (res.data.canvasData.theme) setCurrentTheme(res.data.canvasData.theme);
          if (res.data.canvasData.backgroundColor) setCanvasBg(res.data.canvasData.backgroundColor);
          setPastElements([]);
          setFutureElements([]);
          setHasUnsavedChanges(false);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        navigate('/dashboard');
      }
    };
    fetchProject();
  }, [projectId, navigate]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      } else {
        // Handle element deletion
        if (selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
          deleteSelectedElement();
        }
        
        // Handle element nudging (1px)
        if (selectedElementId) {
          switch (e.key) {
            case 'ArrowUp': e.preventDefault(); moveElement(0, -1); break;
            case 'ArrowDown': e.preventDefault(); moveElement(0, 1); break;
            case 'ArrowLeft': e.preventDefault(); moveElement(-1, 0); break;
            case 'ArrowRight': e.preventDefault(); moveElement(1, 0); break;
            default: break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedElementId, deleteSelectedElement, moveElement]);

  const handleSave = async () => {
    if (!hasUnsavedChanges || saveStatus === 'syncing') return;
    setSaveStatus('syncing');
    try {
      const token = localStorage.getItem('vividflow_token');
      await axios.put(`${API_BASE_URL}/api/projects/${projectId}`,
        { canvasData: { elements: elements, theme: currentTheme, backgroundColor: canvasBg } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && over.id === 'canvas') {
      const type = active.data.current?.type;
      const componentDef = COMPONENT_TYPES.find(c => c.id === type);
      if (componentDef) {
        let initialLeft = 50;
        let initialTop = 50;
        if (active.rect.current.translated && over.rect) {
          initialLeft = Math.max(0, active.rect.current.translated.left - over.rect.left);
          initialTop = Math.max(0, active.rect.current.translated.top - over.rect.top);
        }

        const newElement = {
          id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type,
          content: componentDef.defaultContent,
          styles: { ...componentDef.defaultStyles, position: 'absolute', left: `${Math.round(initialLeft)}px`, top: `${Math.round(initialTop)}px`, zIndex: elements.length + 1 }
        };
        updateElements([...elements, newElement]);
        setSelectedElementId(newElement.id);
      }
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const handleExportCode = () => {
    generateAndDownloadHtml(elements, project?.name);
  };


  const handleCopyLink = () => {
    const url = `${window.location.origin}/site/${projectId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      });
  };

  // Preview Mode
  if (isPreview) {
    return (
      <div className="min-h-screen bg-white relative">
        <button
          onClick={() => setIsPreview(false)}
          className="fixed top-4 left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-full font-medium shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Eye className="w-4 h-4" /> Exit Preview
        </button>
        <div className="max-w-7xl mx-auto p-4 sm:p-8 relative min-h-screen">
          {[...elements].sort((a, b) => parseInt(a.styles?.top || 0) - parseInt(b.styles?.top || 0)).map(el => {
             const innerStyles = { ...el.styles };
             delete innerStyles.position;
             delete innerStyles.left;
             delete innerStyles.top;
             delete innerStyles.zIndex;
             
             const ElementContent = (
               <>
                 {el.type === 'heading' && <h2 style={innerStyles}>{el.content}</h2>}
                 {el.type === 'text' && <p style={innerStyles}>{el.content}</p>}
                 {el.type === 'button' && <button style={innerStyles}>{el.content}</button>}
                 {el.type === 'image' && <ImageWithFallback src={el.content} style={innerStyles} alt="" isUploading={el.isUploading} />}
               </>
             );

             return (
               <div 
                 key={el.id} 
                 style={{ 
                   position: 'absolute', 
                   left: el.styles?.left || '0px', 
                   top: el.styles?.top || '0px', 
                   zIndex: el.styles?.zIndex || 1 
                 }}
               >
                 {el.linkUrl ? (
                   <a href={el.linkUrl} target="_blank" rel="noopener noreferrer">
                     {ElementContent}
                   </a>
                 ) : ElementContent}
               </div>
             );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <span className="font-semibold text-slate-900">{project?.name || 'Loading...'}</span>

          {/* Sync Status */}
          <div className="flex items-center gap-1.5 ml-4 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
            {saveStatus === 'syncing' && <><Loader2 className="w-3 h-3 animate-spin text-blue-500" /><span className="text-slate-600">Saving...</span></>}
            {saveStatus === 'saved' && !hasUnsavedChanges && <><CheckCircle2 className="w-3 h-3 text-emerald-500" /><span className="text-slate-600">Saved</span></>}
            {saveStatus === 'saved' && hasUnsavedChanges && <><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-amber-600">Unsaved changes</span></>}
            {saveStatus === 'error' && <><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-red-600">Error saving</span></>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
            <button
              onClick={handleUndo}
              disabled={pastElements.length === 0}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${pastElements.length === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={futureElements.length === 0}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${futureElements.length === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleExportCode}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Code
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            <Share className="w-4 h-4" /> Publish
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm border ${
              isFullscreen
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" /> {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveStatus === 'syncing'}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${(!hasUnsavedChanges || saveStatus === 'syncing') ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {saveStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Now
          </button>
        </div>
      </header>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">

          {/* Left Sidebar - Components (hidden in full-screen) */}
          {!isFullscreen && (
          <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]" style={{ display: isMobileWindow ? 'none' : 'flex' }}>
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">Draggable Components</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
              {COMPONENT_TYPES.map(type => (
                <DraggableItem key={type.id} item={type} />
              ))}
            </div>

            <div className="p-4 border-t border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase mb-3">Themes</h3>
              <div className="flex gap-3">
                {Object.keys(THEMES).map(themeName => (
                  <button
                    key={themeName}
                    onClick={() => applyTheme(themeName)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${currentTheme === themeName ? 'border-purple-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: THEMES[themeName].primary }}
                    title={themeName}
                  />
                ))}
              </div>
            </div>
          </aside>
          )}

          {/* Center - Canvas + AI Bar */}
          <div className="mobile-canvas-full flex flex-col overflow-hidden" style={{ width: isMobileWindow ? '100vw' : 'auto', flex: 1 }}>

            {/* Droppable Canvas */}
            <DroppableCanvas elements={elements} selectedId={selectedElementId} onSelect={setSelectedElementId} onUpdatePosition={handleUpdatePosition} onUpdateSize={handleUpdateSize} onDragStart={handleCanvasElementDragStart} backgroundColor={canvasBg} />
          </div>

          {/* Right Sidebar - Properties Panel (hidden in full-screen) */}
          {!isFullscreen && (
          <aside className={`w-72 bg-white border-l border-slate-200 shrink-0 flex flex-col z-10 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] mobile-drawer ${selectedElement ? 'active' : ''}`} style={{ display: isMobileWindow ? 'none' : 'flex' }}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">Properties</h3>
              {selectedElement && (
                <button onClick={deleteSelectedElement} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete Element">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {!selectedElement ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                  <MousePointer2 className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-center px-4">Select an element on the canvas to edit its properties.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Content Property */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Content {selectedElement.type === 'image' ? '(URL / Upload)' : ''}</label>
                    {selectedElement.type === 'text' ? (
                      <textarea
                        rows={4}
                        value={selectedElement.content}
                        onChange={(e) => updateSelectedElement({ content: e.target.value })}
                        className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-y"
                      />
                    ) : selectedElement.type === 'image' ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={selectedElement.content}
                          onChange={(e) => updateSelectedElement({ content: e.target.value })}
                          placeholder="Image URL"
                          className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            id="image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              const formData = new FormData();
                              formData.append('image', file);

                              // Mark element as uploading
                              const uploadingId = selectedElement.id;
                              setElements(prev => prev.map(el => el.id === uploadingId ? { ...el, isUploading: true } : el));

                              try {
                                const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });

                                // Ensure HTTPS for Cloudinary URL
                                const secureUrl = res.data.url.replace(/^http:\/\//i, 'https://');

                                // Update elements and persist
                                setElements(prev => {
                                  const updated = prev.map(el => el.id === uploadingId ? { ...el, content: secureUrl, isUploading: false } : el);
                                  setPastElements(past => [...past, prev]);
                                  setFutureElements([]);
                                  setHasUnsavedChanges(true);
                                  return updated;
                                });
                              } catch (err) {
                                console.error('Upload failed:', err);
                                alert('Upload failed. Please try again.');
                                setElements(prev => prev.map(el => el.id === uploadingId ? { ...el, isUploading: false } : el));
                              }
                            }}
                          />
                          <label
                            htmlFor="image-upload"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Choose File or Upload
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={selectedElement.content}
                          onChange={(e) => updateSelectedElement({ content: e.target.value })}
                          className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        />
                        {(selectedElement.type === 'button' || selectedElement.type === 'text') && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Link URL</label>
                            <input
                              type="text"
                              value={selectedElement.linkUrl || ''}
                              onChange={(e) => updateSelectedElement({ linkUrl: e.target.value })}
                              placeholder="https://example.com"
                              className="w-full text-sm p-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Layout & Position */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Layout & Position</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">X (px)</label>
                        <input
                          type="number"
                          value={parseInt(selectedElement.styles.left || '0')}
                          onChange={(e) => updateSelectedElement({ styles: { left: `${e.target.value}px` } })}
                          className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Y (px)</label>
                        <input
                          type="number"
                          value={parseInt(selectedElement.styles.top || '0')}
                          onChange={(e) => updateSelectedElement({ styles: { top: `${e.target.value}px` } })}
                          className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 mt-2">
                      <button onClick={() => moveElement(0, -10)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><ArrowUp className="w-4 h-4 text-slate-600" /></button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveElement(-10, 0)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4 text-slate-600" /></button>
                        <div className="w-10 text-center text-[10px] font-bold text-slate-400">10px</div>
                        <button onClick={() => moveElement(10, 0)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><ArrowRight className="w-4 h-4 text-slate-600" /></button>
                      </div>
                      <button onClick={() => moveElement(0, 10)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><ArrowDown className="w-4 h-4 text-slate-600" /></button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Styles</h4>

                    {selectedElement.styles.color !== undefined && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-700">Text Color</label>
                        <input
                          type="color"
                          value={selectedElement.styles.color}
                          onChange={(e) => updateSelectedElement({ styles: { color: e.target.value } })}
                          className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                        />
                      </div>
                    )}

                    {selectedElement.styles.backgroundColor !== undefined && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-700">Background</label>
                        <input
                          type="color"
                          value={selectedElement.styles.backgroundColor}
                          onChange={(e) => updateSelectedElement({ styles: { backgroundColor: e.target.value } })}
                          className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                        />
                      </div>
                    )}

                    {selectedElement.styles.fontSize !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-slate-700">Font Size</label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{selectedElement.styles.fontSize}</span>
                        </div>
                        <input
                          type="range"
                          min="10" max="72"
                          value={parseInt(selectedElement.styles.fontSize)}
                          onChange={(e) => updateSelectedElement({ styles: { fontSize: `${e.target.value}px` } })}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>
                    )}

                    {selectedElement.styles.borderRadius !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-slate-700">Border Radius</label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{selectedElement.styles.borderRadius}</span>
                        </div>
                        <input
                          type="range"
                          min="0" max="50"
                          value={parseInt(selectedElement.styles.borderRadius)}
                          onChange={(e) => updateSelectedElement({ styles: { borderRadius: `${e.target.value}px` } })}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          </aside>
          )}

        </div>
      </DndContext>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 z-50 font-medium">
          <CheckCircle2 className="w-5 h-5" />
          All changes saved to cloud! ☁️
        </div>
      )}

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPublishModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Your Site is Live!</h2>
            <p className="text-sm text-slate-600 mb-6">Anyone with this link can view your website design.</p>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                readOnly
                value={`${window.location.origin}/site/${projectId}`}
                className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
              >
                {copySuccess || 'Copy Link'}
              </button>
            </div>
            <button
              onClick={() => setShowPublishModal(false)}
              className="mt-6 w-full py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-xl transition-colors active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 3. Bottom Click-To-Add Bar Component */}
      <div className="fixed bottom-0 left-0 w-full h-[80px] bg-white border-t border-slate-200 flex justify-center items-center gap-4 z-[100] md:hidden px-4 overflow-x-auto shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => {
            const newElement = {
              id: `el_${Date.now()}_h`, type: 'heading', content: 'New Heading', styles: { fontSize: '32px', color: '#000000', fontWeight: 'bold', padding: '10px', position: 'absolute', left: '20px', top: '20px', zIndex: elements.length + 1 }
            };
            updateElements([...elements, newElement]);
            setSelectedElementId(newElement.id);
          }}
          className="flex flex-col items-center justify-center p-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl min-w-[100px] flex-shrink-0 hover:bg-slate-100 transition-colors"
        >
          <span className="text-xs font-semibold">Add Heading</span>
        </button>

        <button
          onClick={() => {
            const newElement = {
              id: `el_${Date.now()}_t`, type: 'text', content: 'Write some text here...', styles: { fontSize: '16px', color: '#4a5568', padding: '10px', position: 'absolute', left: '20px', top: '20px', zIndex: elements.length + 1 }
            };
            updateElements([...elements, newElement]);
            setSelectedElementId(newElement.id);
          }}
          className="flex flex-col items-center justify-center p-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl min-w-[100px] flex-shrink-0 hover:bg-slate-100 transition-colors"
        >
          <span className="text-xs font-semibold">Add Text</span>
        </button>

        <button
          onClick={() => {
            const newElement = {
              id: `el_${Date.now()}_i`, type: 'image', content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300', styles: { width: '300px', height: 'auto', objectFit: 'cover', borderRadius: '4px', position: 'absolute', left: '20px', top: '20px', zIndex: elements.length + 1 }
            };
            updateElements([...elements, newElement]);
            setSelectedElementId(newElement.id);
          }}
          className="flex flex-col items-center justify-center p-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl min-w-[100px] flex-shrink-0 hover:bg-slate-100 transition-colors"
        >
          <span className="text-xs font-semibold">Add Image</span>
        </button>
      </div>
    </div>
  );
}


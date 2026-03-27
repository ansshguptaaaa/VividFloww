import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Image as ImageIcon } from 'lucide-react';

const ImageWithFallback = ({ src, style, alt }) => {
  const [error, setError] = useState(false);

  useEffect(() => setError(false), [src]);

  if (error) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
        <ImageIcon className="w-8 h-8 opacity-50" />
      </div>
    );
  }

  return <img key={src} src={src} style={style} alt={alt} crossOrigin="anonymous" onError={() => setError(true)} />;
};

export default function SitePreview() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [elements, setElements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/public/${projectId}`);
        setProject(res.data);
        if (res.data.canvasData && Array.isArray(res.data.canvasData.elements)) {
          setElements(res.data.canvasData.elements);
        }
      } catch (err) {
        setError('Website not found or an error occurred.');
      }
    };
    fetchSite();
  }, [projectId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <p className="text-xl font-medium">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic SEO Title could be added here with react-helmet */}
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
              {el.type === 'image' && <ImageWithFallback src={el.content} style={innerStyles} alt="" />}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Send, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    rating: 5,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Sending data to backend...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/feedback/submit`, formData);
      console.log('Feedback submitted:', response.data);
      setIsSuccess(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '40px 20px',
    fontFamily: '"Inter", sans-serif'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '8px',
    letterSpacing: '-0.025em'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '32px'
  };

  const inputGroupStyle = {
    textAlign: 'left',
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  };

  const starContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#6d28d9',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    opacity: isSubmitting ? 0.7 : 1
  };

  if (isSuccess) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ backgroundColor: '#f0fdf4', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 style={{ color: '#22c55e', width: '32px', height: '32px' }} />
          </div>
          <h2 style={titleStyle}>Thank You!</h2>
          <p style={subtitleStyle}>Your feedback has been received. We appreciate your support in making VividFloww better.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ ...buttonStyle, backgroundColor: '#1e293b', marginTop: '16px' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', marginBottom: '24px', padding: '0' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        <h1 style={titleStyle}>Get in Touch</h1>
        <p style={subtitleStyle}>Have questions or feedback? We'd love to hear from you.</p>

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>How would you rate your experience?</label>
            <div style={starContainerStyle}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  fill={(hoverRating || formData.rating) >= star ? '#f59e0b' : 'none'}
                  color={(hoverRating || formData.rating) >= star ? '#f59e0b' : '#cbd5e1'}
                  style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setFormData({ ...formData, rating: star })}
                />
              ))}
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Name</label>
            <input 
              style={inputStyle} 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your Name" 
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input 
              style={inputStyle} 
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.com" 
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Subject</label>
            <input 
              style={inputStyle} 
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="What's this about?" 
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Message</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us more..." 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={buttonStyle}
          >
            {isSubmitting ? (
              <><Loader2 style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} /> Sending...</>
            ) : (
              <><Send size={18} /> Send Feedback</>
            )}
          </button>
        </form>
      </div>
      
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

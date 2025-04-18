import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';


const ContentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    description: '',
    priority: 3,
    category: null,
    source_platform: '',
    is_favorite: false
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get category list
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Get category failed:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // If in edit mode, automatically load content data
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`/api/contents/${id}/`)
        .then(res => {
          setFormData({
            title: res.data.title || '',
            link: res.data.link || '',
            description: res.data.description || '',
            priority: res.data.priority || 3,
            category: res.data.category || null,
            source_platform: res.data.source_platform || '',
            is_favorite: res.data.is_favorite || false
          });
        })
        .catch(err => {
          alert('Failed to load content data');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);
  
  // Automatically identify the source platform based on the link
  useEffect(() => {
    if (formData.link) {
      try {
        const url = new URL(formData.link);
        let platform = '';
        
        if (url.hostname.includes('instagram.com')) {
          platform = 'Instagram';
        } else if (url.hostname.includes('threads.net')) {
          platform = 'Threads';
        } else if (url.hostname.includes('facebook.com')) {
          platform = 'Facebook';
        } else if (url.hostname.includes('twitter.com') || url.hostname.includes('x.com')) {
          platform = 'Twitter/X';
        } else if (url.hostname.includes('youtube.com')) {
          platform = 'YouTube';
        }
        
        if (platform && !formData.source_platform) {
          setFormData(prev => ({ ...prev, source_platform: platform }));
        }
      } catch (e) { /* invalid url, do nothing */ }
    }
  }, [formData.link, formData.source_platform]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (id) {
        await axios.put(`/api/contents/${id}/`, formData);
      } else {
        await axios.post('/api/contents/', formData);
      }
      navigate('/contents');
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save, please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // One-click access to web page title function
  const fetchPageTitle = async () => {
    if (!formData.link) return;
    
    try {
      setLoading(true);
      const response = await axios.post('/api/fetch-title/', { url: formData.link });
      if (response.data.title) {
        setFormData(prev => ({ ...prev, title: response.data.title }));
      }
    } catch (error) {
      console.error('Failed to get page title:', error);
      alert('Unable to automatically obtain the page title, please enter it manually.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="content-form">
      <h2>{id ? 'Edit Content' : 'Add Content'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="link">Link *</label>
          <div className="input-with-button">
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
            <button 
              type="button" onClick={fetchPageTitle} disabled={!formData.link || loading}
            >
              Get Title
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Note/Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Add note or description..."
          />
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="source_platform">Source platform</label>
            <input
              type="text"
              id="source_platform"
              name="source_platform"
              value={formData.source_platform}
              onChange={handleChange}
              placeholder="Instagram, Threads..."
            />
          </div>
          
          <div className="form-group half">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="1">Lowest</option>
              <option value="2">Low</option>
              <option value="3">Medium</option>
              <option value="4">High</option>
              <option value="5">Highest</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
          >
            <option value="">-- Choose Category --</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input type="checkbox" name="is_favorite" checked={formData.is_favorite} onChange={handleChange} />
            Add to favorite
          </label>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/contents')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-secondary">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;
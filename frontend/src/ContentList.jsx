import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Dock from './blocks/Components/Dock/Dock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';

const ContentList = () => {
    const [day, setDay] = useState(true);
    const [contents, setContents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtered Status
    const [filter, setFilter] = useState({
        searchTerm: '',
        categoryId: '',
        priority: '',
        platform: '',
        favorite: false
    });

    // Sort Status
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    const items = [
        { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
        { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
        { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
        { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
      ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contentsRes, categoriesRes] = await Promise.all([
                    axios.get('/api/contents/'),
                    axios.get('/api/categories/')
                ]);

                if (contentsRes.status !== 200) {
                    throw new Error('Failed to fetch contents');
                }

                if (categoriesRes.status !== 200) {
                    throw new Error('Failed to fetch categories');
                }

                setContents(contentsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally{
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const switchMode = (currentDay) => {
        setDay(!currentDay);
        if (currentDay) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Handling filter changes
    const handleFilterChange = (e) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const target = e.target;
            setFilter(prev => ({ ...prev, [name]: target.checked }));
            } else {
            setFilter(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // Handling Sort Changes
    const handleSortChange = (field) => {
        if (sortBy === field) {
            // Switch direction if already sorted by this field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Otherwise, set a new sort field and default to descending order
            setSortBy(field);
            setSortDirection('desc');
        }
    };
    
    // Handling favorite status switching
    const toggleFavorite = async (id, currentStatus) => {
        try {
            await axios.patch(`/api/contents/${id}/`, {
                is_favorite: !currentStatus
            });
            
            // Update Local Status
            setContents(prev => 
                prev.map(content => 
                content.id === id
                    ? { ...content, is_favorite: !currentStatus }
                    : content
                )
            );
        } catch (error) {
            console.error('Failed to update favorite status:', error);
        }
    };
    
    // Handling Deletion
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            return;
        }
        
        try {
            await axios.delete(`/api/contents/${id}/`);
            setContents(prev => prev.filter(content => content.id !== id));
        } catch (error) {
            console.error('Failed to delete content:', error);
            alert('Deletion failed, please try again later.');
        }
    };
    
    // Filter Content
    const filteredContents = contents.filter(content => {
        // Filter search term
        if (filter.searchTerm && 
            !content.title.toLowerCase().includes(filter.searchTerm.toLowerCase()) &&
            !(content.description?.toLowerCase().includes(filter.searchTerm.toLowerCase()))) {
            return false;
        }
        
        // Filter Category
        if (filter.categoryId && content.category?.id !== parseInt(filter.categoryId)) {
            return false;
        }
        
        // Filter Priority
        if (filter.priority && !isNaN(parseInt(filter.priority)) && content.priority !== parseInt(filter.priority)) {
            return false;
        }
        
        // Filter Platform
        if (filter.platform && content.source_platform !== filter.platform) {
            return false;
        }
        
        // Filter favorite
        if (filter.favorite && !content.is_favorite) {
            return false;
        }
        
        return true;
    });
    
    // Sort Content
    const sortedContents = [...filteredContents].sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
        case 'title':
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            break;
        case 'priority':
            valueA = a.priority;
            valueB = b.priority;
            break;
        case 'created_at':
        default:
            valueA = new Date(a.created_at).getTime();
            valueB = new Date(b.created_at).getTime();
            break;
        }
        
        if (valueA === valueB) return 0;
        
        const direction = sortDirection === 'asc' ? 1 : -1;
        return valueA > valueB ? direction : -direction;
    });
    
    // Get platform list (no duplication)
    const platforms = Array.from(new Set(
        contents
        .map(content => content.source_platform)
        .filter(platform => platform)
    )).sort();
    
    // Show priority
    const getPriorityLabel = (priority) => {
        const labels = ['', 'Lowest', 'Low', 'Medium', 'High', 'Highest'];
        return labels[priority] || 'Unknown';
    };
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    return (
        <>
        <div className="content-list-page">
        <div className="page-header">
            <h1>Notorage</h1>
            <button className={`mode-switch-btn ${day ? 'day' : 'night'}`}
                        onClick={() => switchMode(day)}
                        title={day ? 'Switch to Night Mode' : 'Switch to Day Mode'}>
                <img src={day ? '/img/day.png' : '/img/night.png'} alt="Sun" width={20} height={20}/>
            </button>
            <Link to="/add" className="btn-primary">
            <i className="icon-plus"></i> Add Content
            </Link>
        </div>
        
        <div className="filter-bar">
            <input
                type="text"
                name="searchTerm"
                placeholder="Search..."
                value={filter.searchTerm}
                onChange={handleFilterChange}
                className="search-input"
            />
            
            <select 
                name="categoryId" 
                value={filter.categoryId}
                onChange={handleFilterChange}
                className="filter-select"
            >
                <option value="">All Categories</option>
                {categories.map(category => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            
            <select 
                name="priority" 
                value={filter.priority}
                onChange={handleFilterChange}
                className="filter-select"
            >
                <option value="">All Priorities</option>
                <option value="5">Highest</option>
                <option value="4">High</option>
                <option value="3">Medium</option>
                <option value="2">Low</option>
                <option value="1">Lowest</option>
            </select>
            
            <select 
                name="platform" 
                value={filter.platform}
                onChange={handleFilterChange}
                className="filter-select"
            >
                <option value="">All Platform</option>
                {platforms.map(platform => (
                    <option key={platform} value={platform}>
                        {platform}
                    </option>
                ))} 
            </select>
            
            <label className="filter-checkbox">
                <input
                    type="checkbox"
                    name="favorite"
                    checked={filter.favorite}
                    onChange={handleFilterChange}
                />
                Show only favorites
            </label>
        </div>
        
        <div className="sort-bar">
            <span>Sort:</span>
            <button 
                className={`sort-button ${sortBy === 'created_at' ? 'active' : ''}`}
                onClick={() => handleSortChange('created_at')}
            >
                Date {sortBy === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
                className={`sort-button ${sortBy === 'title' ? 'active' : ''}`}
                onClick={() => handleSortChange('title')}
            >
                Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
                className={`sort-button ${sortBy === 'priority' ? 'active' : ''}`}
                onClick={() => handleSortChange('priority')}
            >
                Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
        </div>
        
        {sortedContents.length === 0 ? (
            <div className="empty-state">
            <p>No matching content was found</p>
            {filter.searchTerm || filter.categoryId || filter.priority || filter.platform || filter.favorite ? (
                <button 
                className="btn-secondary"
                onClick={() => setFilter({
                    searchTerm: '',
                    categoryId: '',
                    priority: '',
                    platform: '',
                    favorite: false
                })}
                >
                    Clear all filters
                </button>
            ) : (
                <Link to="/add" className="btn-primary">Add your first content</Link>
            )}
            </div>
        ) : (
            <div className="content-cards">
            {sortedContents.map(content => (
                <div key={content.id} className="content-card">
                <div className="card-header">
                    {content.source_platform && (
                    <span className="platform-badge">
                        {content.source_platform}
                    </span>
                    )}
                    <span className={`priority-badge priority-${content.priority}`}>
                    {getPriorityLabel(content.priority)}
                    </span>
                </div>
                
                <h3 className="content-title">{content.title}</h3>
                
                {content?.description && (
                    <p className="content-description">{content.description}</p>
                )}
                
                {content?.category && (
                    <div className="content-category">
                    <span className="category-badge">{content?.category?.name}</span>
                    </div>
                )}
                
                <div className="card-actions">
                    <button 
                        className={`btn-icon ${content.is_favorite ? 'favorite' : ''}`}
                        onClick={() => toggleFavorite(content.id, content.is_favorite)}
                        title={content.is_favorite ? 'Remove from favorite' : 'Add to favorite'}
                    >
                        <img src={content.is_favorite ? '/img/heart1.png' : '/img/heart.png'} alt="Heart" width={20} height={20}/>
                    </button>
                    
                    <a 
                        href={content.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-icon"
                        title="Open Link"
                    >
                        <img src="/img/link.png" alt="Open Link" width={20} height={20}/>
                    </a>
                    
                    <Link 
                        to={`/edit/${content.id}`} 
                        className="btn-icon"
                        title="Edit"
                    >
                        <img src='/img/edit.png' alt="Edit" width={20} height={20}/>
                    </Link>
                    
                    <button 
                        className="btn-icon delete"
                        onClick={() => handleDelete(content.id)}
                        title="Delete"
                    >
                        <img src="/img/delete.png" alt="Delete" width={20} height={20}/>
                    </button>
                </div>
                
                <div className="card-footer">
                    <span className="created-date">
                    {new Date(content.created_at).toLocaleDateString()}
                    </span>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
        <Dock 
            items={items}
            panelHeight={68}
            baseItemSize={50}
            magnification={70}
        />
        </>
    );
    };

export default ContentList;
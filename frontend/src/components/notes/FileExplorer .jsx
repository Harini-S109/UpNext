import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFolder, FaFile, FaPlus, FaUpload, FaTrash } from 'react-icons/fa';
import './FileExplorer.css';
import '../../App.css';

const FileExplorer = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ show: false, type: '', id: null });

    const openFile = (filePath) => {
        const formattedPath = filePath.replace(/\\/g, '/');
        window.open(`https://upnext-a70q.onrender.com/${formattedPath}`, '_blank', 'noopener,noreferrer');
    };

    // Fetch folders and files
    useEffect(() => {
        fetchFoldersAndFiles();
    }, [currentFolder]);

    const fetchFoldersAndFiles = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in again.');
            return;
        }
    
        try {
            const foldersResponse = await axios.get(
                `http://localhost:8000/get-folders/${currentFolder || 'root'}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFolders(foldersResponse.data.subfolders);
    
            const filesResponse = await axios.get(
                `http://localhost:8000/get-files/${currentFolder || 'root'}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFiles(filesResponse.data.files);
        } catch (err) {
            console.error('Error fetching data:', err);
            // setError('Error fetching data');
        }
    };
    
    const handleCreateFolder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(
                'http://localhost:8000/create-folder',
                {
                    name: folderName,
                    parentFolder: currentFolder
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setFolderName('');
            setShowCreateModal(false);
            fetchFoldersAndFiles();
        } catch (err) {
            console.error('Failed to create folder:', err);
            setError('Failed to create folder');
        }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folderId', currentFolder || '');

        setLoading(true);
        try {
            await axios.post('http://localhost:8000/upload-files', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSelectedFile(null);
            setShowUploadModal(false);
            fetchFoldersAndFiles();
        } catch (err) {
            console.error('Failed to upload file:', err);
            setError('Failed to upload file');
        }
        setLoading(false);
    };

    const handleDeleteClick = (type, id, e) => {
        if (e) {
            e.stopPropagation(); // Prevent triggering folder navigation or file opening
        }
        setConfirmDelete({ show: true, type, id });
    };

    const handleDelete = async () => {
        const { type, id } = confirmDelete;
        if (!id) {
            console.error('No ID provided for deletion');
            setError('Cannot delete: missing ID');
            return;
        }
        
        setLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            const endpoint = type === 'folder' ? 'delete-folder' : 'delete-file';
            console.log(`Attempting to delete ${type} with ID: ${id}`);
            
            const response = await axios.delete(`http://localhost:8000/${endpoint}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Delete response:', response.data);
            
            // Reset confirmation state
            setConfirmDelete({ show: false, type: '', id: null });
            
            // Show success message
            setError(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
            setTimeout(() => setError(''), 3000);
            
            // Refresh the file/folder list
            fetchFoldersAndFiles();
        } catch (err) {
            console.error(`Failed to delete ${type}:`, err);
            
            // More detailed error message
            let errorMessage = `Failed to delete ${type}: `;
            
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error response data:", err.response.data);
                console.error("Error response status:", err.response.status);
                console.error("Error response headers:", err.response.headers);
                
                errorMessage += err.response.data?.message || `Server responded with status ${err.response.status}`;
            } else if (err.request) {
                // The request was made but no response was received
                console.error("Error request:", err.request);
                errorMessage += "No response received from server. Check if the server is running.";
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", err.message);
                errorMessage += err.message;
            }
            
            setError(errorMessage);
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-explorer">
            {/* Header */}
            <div className="header">
                <h2 className='fw-bold'>My Notes</h2>
                <div className="actions">
                    <button className='btn-custom' onClick={() => setShowCreateModal(true)} style={{ width: '8rem', backgroundColor:"#7161EF" }}>
                        <FaPlus /> New Folder
                    </button>
                    <button className='btn-custom' onClick={() => setShowUploadModal(true)} style={{ width: '8rem', backgroundColor:"#7161EF" }} >
                        <FaUpload /> Upload File
                    </button>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <button onClick={() => setCurrentFolder(null)}>Root</button>
                {currentFolder && (
                    <span>
                        {' > '}
                        <button onClick={() => setCurrentFolder(folderName)}>
                            {folderName}
                        </button>
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="content">
                {folders.map((folder) => (
                    <div key={folder._id} className="item">
                        <div className="item-content" onClick={() => setCurrentFolder(folder._id)}>
                            <FaFolder className="icon" />
                            <span>{folder.name}</span>
                        </div>
                        <button 
                            className="delete-button" 
                            onClick={(e) => handleDeleteClick('folder', folder._id, e)}
                            title="Delete folder"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
                
                {files.map((file) => (
                    <div key={file._id} className="item">
                        <div className="item-content" onClick={() => openFile(file.filePath)}>
                            <FaFile className="icon" />
                            <span>{file.originalName}</span>
                        </div>
                        <button 
                            className="delete-button" 
                            onClick={(e) => handleDeleteClick('file', file._id, e)}
                            title="Delete file"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>

            {/* Create Folder Modal */}
            {showCreateModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Create New Folder</h3>
                        <form onSubmit={handleCreateFolder}>
                            <input
                                type="text"
                                placeholder="Folder Name"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                required
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload File Modal */}
            {showUploadModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Upload File</h3>
                        <form onSubmit={handleFileUpload}>
                            <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                required
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowUploadModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading || !selectedFile}>
                                    {loading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Delete */}
            {confirmDelete.show && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this {confirmDelete.type}?</p>
                        <p className="warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={() => setConfirmDelete({ show: false, type: '', id: null })}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="delete-button-confirm" 
                                onClick={handleDelete} 
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default FileExplorer;
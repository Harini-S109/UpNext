import React, { useState } from 'react';
import axios from 'axios';

const CreateFolder = ({ setCreateFolderModalOpen }) => {
    const [folderName, setFolderName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const checkFolderAlreadyPresent = (name, folders) => {
        const folderPresent = folders.find((folder) => folder.name === name);
        return !!folderPresent;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (folderName.length === 0) {
            setError("Please provide a name");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('https://upnext-a70q.onrender.com/create-folder', 
                {
                    name: folderName,
                    parentFolder: null // for root level folders
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.error === false) {
                setFolderName("");
                setCreateFolderModalOpen(false);
                // You can add a success callback here if needed
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create folder");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column gap-3 justify-content-center">
            <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column gap-2 justify-content-center">
                    <div className="d-flex flex-column justify-content-center text-center gap-3">
                        <div className="d-flex justify-content-between">
                            <label>Create Folder</label>
                            <button
                                type="button"
                                className="bg-primary text-light border-0"
                                onClick={() => setCreateFolderModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                        <input
                            className="px-1"
                            type="text"
                            placeholder="Folder Name"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {error && <p className="text-danger">{error}</p>}
                    <button 
                        type="submit" 
                        className="bg-primary text-light border-0 rounded py-2"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Folder'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateFolder;
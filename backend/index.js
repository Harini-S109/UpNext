require("dotenv").config();



const config = require("./config.json");
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const port = process.env.port || 8000;

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const ChatSession = require('./models/ChatSession.model');
const Task = require("./models/task.model");
const {  File, Folder } = require('./models/filesAndFolder.model');
const Remainder = require('./models/Remainder.model'); // Adjust path based on your project structure
const axios = require('axios'); 


const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require('dotenv');
const { Anthropic } = require('@anthropic-ai/sdk'); 

const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./utilities");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

app.use(
    cors({
        origins: "*",
    })
)

    

app.get("/", (req,res) => {
    res.json({ data: "hello"});
})


//create account
app.post("/create-account", async(req, res) => {
    const {fullName, email, password} = req.body;

    if(!fullName){
        return res
        .status(400)
        .json({error: true, message: "Full name is required"});
    }

    if(!email){
        return res
        .status(400)
        .json({error: true, message: "E-mail is required"});
    }

    if(!password){
        return res
        .status(400)
        .json({error: true, message: "Password is required"});
    }

    const isUser = await(User.findOne({ email: email}));

    if(isUser) {
        return res.json ({
            error: true,
            message: "User already exist",
        })
    }

    const user = new User({
       fullName, 
       email,
       password, 
    })

    await user.save();

    const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
    })

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Succesful",
    })    

})

//login
app.post("/login", async(req, res) => {
    const {email, password} = req.body;

    if(!email){
        return res
        .status(400)
        .json({error: true, message: "E-mail is required"});
    }

    if(!password){
        return res
        .status(400)
        .json({error: true, message: "Password is required"});
    }

    const userInfo = await User.findOne({ email : email});

    if(!userInfo){
        return res.status(400).json({ message: "User not found"})
    }

    if(userInfo.email == email && userInfo.password == password){
        const user = {user: userInfo};
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"36000m",
        })

    return res.json({
        error: false,
        message: "Login successful",
        email,
        accessToken,
    })
    } else {
        return res.status(400).json({
            error: true,
            message: "Invalid credentials",
        })
    }

})

//get user
app.get("/get-user",authenticateToken, async(req, res) => {
    const {user} = req.user;

    const isUser = await User.findOne({_id: user._id});

    if(!isUser){
        return res.sendStatus(401);
    }

    return res.json({
        user: {fullName : isUser.fullName, email : isUser.fullName, "_id": isUser._id, createdOn: isUser.createdOn},
        message: ""
    })

})

//add task
app.post("/add-task", authenticateToken, async (req, res) => {
    const {title, description, tag, status, priority} = req.body;
    const { user } = req.user;

    if(!title){
        return res
        .status(400)
        .json({error: true, message: "Title is required"});
    }

    if(!description){
        return res
        .status(400)
        .json({error: true, message: "Description is required"});
    }

    if(!status){
        return res
        .status(400)
        .json({error: true, message: "Status is required"});
    }

    if(!priority){
        return res
        .status(400)
        .json({error: true, message: "Priority is required"});
    }

    try{
        const task = new Task({
            title,
            description,
            tag: tag ||[],
            status,
            priority,
            userId: user._id,
        })

        await task.save();

        return res.json({
            error: false,
            task,
            message: "Task added successfully"
        })

    } catch(error){
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        })
    }

})

//edit task
app.post("/edit-task/:taskId", authenticateToken, async (req, res) => {
    const { taskId } = req.params; 
    const { title, description, tag, status, priority, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !description && !tag && !status && !priority && typeof isPinned === 'undefined') {
        return res.status(400).json({ message: "No changes provided" });
    }

    try {
        const task = await Task.findOne({ _id: taskId, userId: user._id });

        if (!task) {
            return res.status(404).json({ error: true, message: "Task not found" });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (tag) task.tag = tag;
        if (typeof isPinned !== 'undefined') task.isPinned = isPinned;
        if (status) task.status = status;
        if (priority) task.priority = priority;

        await task.save();

        return res.json({
            error: false,
            message: "Task updated successfully",
            task
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

//get all tasks
app.get("/get-all-tasks", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const tasks = await Task.find({ userId: user._id }).sort({ isPinned: -1 });

        return res.json({
            error: false,
            tasks,
            message: "All tasks retrieved successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

// get all todo tasks
app.get("/get-all-todo-tasks", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const todoTasks = await Task.find({ userId: user._id, status:"TO DO"}).sort({ isPinned: -1 });

        return res.json({
            error: false,
            todoTasks,
            message: "All TO DO tasks retrieved successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

//get all IN PROGRESS tasks
app.get("/get-all-inprogress-tasks", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const todoTasks = await Task.find({ userId: user._id, status:"IN PROGRESS"}).sort({ isPinned: -1 });

        return res.json({
            error: false,
            todoTasks,
            message: "All IN PROGRESS tasks retrieved successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

//get all completed tasks
app.get("/get-all-completed-tasks", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const todoTasks = await Task.find({ userId: user._id, status:"COMPLETED"}).sort({ isPinned: -1 });

        return res.json({
            error: false,
            todoTasks,
            message: "All completed tasks retrieved successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

// delete task
app.delete("/delete-task/:taskId", authenticateToken, async (req, res) => {
    const { taskId } = req.params; 
    const { user } = req.user;

    try {
        const task = await Task.findOne({ _id: taskId, userId: user._id });

        if (!task) {
            return res.status(404).json({ error: true, message: "Task not found" });
        }

        await task.deleteOne();

        return res.json({
            error: false,
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

//update isPinned task
app.put("/update-task-pinned/:taskId", authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const task = await Task.findOne({ _id: taskId, userId: user._id });

        if (!task) {
            return res.status(404).json({ error: true, message: "Task not found" });
        }

        if (typeof isPinned === "boolean") {
            task.isPinned = isPinned;
        } else {
            return res.status(400).json({ error: true, message: "Invalid value for isPinned" });
        }

        await task.save();

        return res.json({
            error: false,
            task, 
            message: "Task updated successfully",
        });

    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

//search tasks
app.get("/search-tasks/", authenticateToken, async (req, res) => {
    const {user} = req.user;
    const {query} = req.query;

    if(!query){
        return res
            .status(400)
            .json({error: true, message: "Search query is required"});
    }

    try {
        const matchingTasks = await Task.find({
            userId: user._id,
            $or: [
                { title: {$regex: new RegExp(query, "i")}},
                {content: { $regex: new RegExp(query, "i")}},
            ]
        })

        return res.json({
            error: false,
            tasks: matchingTasks,
            message: "Tasks matching the search query retrieved successfully",
        })
    }catch(error){
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        })
    }
})

//multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set a temporary destination first
        const tempPath = './uploads/temp';
        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, { recursive: true });
        }
        cb(null, tempPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//create folder
 app.post('/create-folder', authenticateToken, async (req, res) => {
        try {
            const { name, parentFolder } = req.body;
            const { user } = req.user;
    
            if (!name) {
                return res.status(400).json({ error: true, message: "Folder name is required" });
            }
    
            // Construct the folder path
            let path = "/";
            if (parentFolder) {
                const parent = await Folder.findById(parentFolder);
                if (!parent) {
                    return res.status(400).json({ error: true, message: "Invalid parent folder" });
                }
                path = parent.path + "/" + name;
            } else {
                path += name;
            }
    
            // Create the folder
            const newFolder = await Folder.create({
                name,
                path,
                createdBy: user._id,
                parentFolder: parentFolder || null
            });
    
            return res.json({ error: false, folder: newFolder });
        } catch (error) {
            console.error("Error creating folder:", error);
            return res.status(500).json({ error: true, message: error.message });
        }
 });

 //upload files
 app.post('/upload-files', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { title, description, folderId } = req.body;
        const { user } = req.user;

        // Validate folder exists
        const folder = await Folder.findById(folderId);
        if (!folder) {
            // Clean up temporary file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: true, message: "Folder not found" });
        }

        // Create final destination path
        const finalPath = `./uploads${folder.path}`;
        if (!fs.existsSync(finalPath)) {
            fs.mkdirSync(finalPath, { recursive: true });
        }
        const finalFilePath = path.join(finalPath, req.file.filename);
        fs.renameSync(req.file.path, finalFilePath);

        const file = await File.create({
            title: title || req.file.originalname,
            description: description || '',
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: finalFilePath,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            folderId: folderId,
            uploadedBy: user._id // Add the required uploadedBy field
        });

        res.json({
            error: false,
            file,
            message: "File uploaded successfully"
        });
    } catch (error) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: true, message: error.message });
    }
});

// get files
app.get('/get-files/:folderId', authenticateToken, async (req, res) => {
    const { folderId } = req.params;
    const { user } = req.user;
    
    
    try {
      // Validate if the folder exists
      const folder = await Folder.find({folderId,  createdBy: user._id});
      console.log("USer",user)
      if (!folder) {
        return res.status(404).json({ error: true, message: "Folder not found" });
      }
  
      // Fetch all files within the folder
      const files = await File.find({ folderId, userId: req.user.id });
  
      res.json({ error: false, files, message: "Files retrieved successfully" });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  });

  //get sub folders
  app.get('/get-folders/:folderId', authenticateToken, async (req, res) => {
    const { folderId } = req.params;
    const { user } = req.user;

    try {
        let subfolders;

        if (folderId === 'root') {
            // Fetch all top-level folders (root folders)
            subfolders = await Folder.find({ parentFolder: null, createdBy: user._id });
        } else {
            // Validate parent folder ID
            const parentFolder = await Folder.find({folderId,  createdBy: user._id});
            if (!parentFolder) {
                return res.status(404).json({ error: true, message: 'Parent folder not found' });
            }

            // Fetch subfolders within the parent folder
            subfolders = await Folder.find({ parentFolder: folderId });
        }

        res.json({
            error: false,
            subfolders,
            message: 'Subfolders retrieved successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});


  // Delete a folder
  app.delete('/delete-folder/:id', authenticateToken, async (req, res) => {
    try {
        const folderId = req.params.id;
        
        // First check if folder exists and belongs to user
        const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
        
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found or access denied' });
        }
        
        // Function to recursively delete folders and their contents
        const deleteFolderRecursive = async (folderId) => {
            // Delete all files in the folder
            await File.deleteMany({ folder: folderId });
            
            // Get all subfolders
            const subfolders = await Folder.find({ parentFolder: folderId });
            
            // Recursively delete each subfolder
            for (const subfolder of subfolders) {
                await deleteFolderRecursive(subfolder._id);
            }
            
            // Delete the folder itself
            await Folder.findByIdAndDelete(folderId);
        };
        
        await deleteFolderRecursive(folderId);
        
        res.json({ message: 'Folder and its contents deleted successfully' });
    } catch (error) {
        console.error('Folder deletion error:', error);
        res.status(500).json({ message: 'Server error during folder deletion' });
    }
});
  

app.delete('/delete-file/:id', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.id;
        console.log(`Attempting to delete file with ID: ${fileId}`);
        
        // Find the file in the database
        const file = await File.findById(fileId);
        
        if (!file) {
            console.log(`File with ID ${fileId} not found`);
            return res.status(404).json({ message: 'File not found' });
        }
        
        console.log(`File found: ${file.originalName}`);
        
        // Check if user has permission (if you're implementing user-specific files)
        // Remove this check if you're not tracking file ownership by user
        if (file.userId && file.userId.toString() !== req.user.id) {
            console.log(`Permission denied. File belongs to ${file.userId}, request from ${req.user.id}`);
            return res.status(403).json({ message: 'Permission denied' });
        }
        
        // Delete the actual file from the filesystem
        try {
            const filePath = path.join(__dirname, '..', file.filePath);
            console.log(`Attempting to delete file at path: ${filePath}`);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('File deleted from filesystem');
            } else {
                console.log('File not found in filesystem, continuing with database deletion');
            }
        } catch (fsError) {
            console.error('Error deleting file from filesystem:', fsError);
            // Continue with database deletion even if file deletion fails
        }
        
        // Delete the file record from the database
        await File.findByIdAndDelete(fileId);
        console.log('File record deleted from database');
        
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error in delete-file endpoint:', error);
        res.status(500).json({ 
            message: 'Failed to delete file', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


// Replace the existing API routes with these updated ones using "Remainder"

// Get reminders for a user
app.get('/reminders', authenticateToken, async (req, res) => {
    try {
        const reminders = await Remainder.find({ userId: req.user.user?._id }); // Use `Remainder` model
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});


  
  // Create a new reminder
  app.post("/reminders", authenticateToken, async (req, res) => {
    const { title, time } = req.body;
    const userId =  req.user.user?._id;

    if (!title) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }

    if (!userId) {
        return res.status(400).json({ error: true, message: "userId is required" });
    }

    if (!time) {
        return res.status(400).json({ error: true, message: "Time is required" });
    }

    try {
        const remainder = new Remainder({
            title,
            time,
            userId, // ✅ Save only the user ID
            completed: false
        });

        await remainder.save();

        return res.json({
            error: false,
            remainder,
            message: "Remainder added successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
            errorDetails: error.message
        });
    }
});


  
  // Update a reminder
    app.post("/reminders/:id", authenticateToken, async (req, res) => {
        const { id } = req.params;
        const { title, time } = req.body;

        // Ensure at least one field is provided
        if (!title && !time) {
            return res.status(400).json({ message: "No changes provided" });
        }

        try {
            // Find the remainder by ID and user ID
            const remainder = await Remainder.findById(req.params.id);

            if (!remainder) {
                return res.status(404).json({ error: true, message: "Remainder not found" });
            }

            // Update fields if provided
            if (title) remainder.title = title;
            if (time) remainder.time = time;

            await remainder.save(); // Save updated remainder

            return res.json({
                error: false,
                message: "Remainder updated successfully",
                remainder
            });
        } catch (error) {
            console.error("Error updating remainder:", error);
            return res.status(500).json({
                error: true,
                message: "Internal server error"
            });
        }
    });
    

  
  // Delete a reminder
  app.delete('/reminders/:id', authenticateToken, async (req, res) => {
    try {
        const deletedReminder = await Remainder.findByIdAndDelete(req.params.id); // Find & delete by ID

        if (!deletedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

  
app.post("/create-chat-session", authenticateToken, async (req, res) => {
    try {
      const { user } = req.user;
      const { initialMessage } = req.body;
      
      const messages = initialMessage ? [{ role: 'user', content: initialMessage }] : [];
      
      const session = new ChatSession({
        userId: user._id,
        messages: messages
      });
      
      await session.save();
      
      // If there's an initial message, get AI response from Hugging Face
      if (initialMessage) {
        // Using Hugging Face's Inference API (free tier)
        const huggingFaceResponse = await axios({
          method: 'post',
          url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: {
            inputs: `<s>[INST] ${initialMessage} [/INST]`,
            parameters: {
              max_new_tokens: 1024,
              temperature: 0.7,
              top_p: 0.95
            }
          }
        });
        
        // Extract the generated text
        const aiContent = huggingFaceResponse.data[0]?.generated_text || "I couldn't generate a response at this time.";
        
        // Extract just the response part (after the input)
        const responseText = aiContent.split('[/INST]').pop().trim();
        
        session.messages.push({
          role: 'assistant',
          content: responseText
        });
        
        await session.save();
      }
      
      return res.json({ error: false, session });
    } catch (error) {
      console.error("Error creating chat session:", error);
      return res.status(500).json({ error: true, message: "Failed to create chat session" });
    }
  });
  
 
  app.post("/send-message", authenticateToken, async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        const { user } = req.user;
        
        // Validate required fields
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                error: true, 
                message: "Message is required and cannot be empty" 
            });
        }
        
        // Handle missing sessionId by creating a new session
        let session;
        if (!sessionId) {
            session = new ChatSession({
                userId: user._id,
                title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
                messages: []
            });
        } else {
            session = await ChatSession.findOne({ _id: sessionId, userId: user._id });
            if (!session) {
                return res.status(404).json({ 
                    error: true, 
                    message: "Chat session not found or does not belong to current user" 
                });
            }
        }
        
        // Add user message to session
        session.messages.push({
            role: 'user',
            content: message
        });
        
        // Prepare conversation history for Mistral format
        let conversationString = "";
        
        // Handle conversation formatting better to ensure proper pairs
        for (let i = 0; i < session.messages.length; i++) {
            const msg = session.messages[i];
            if (msg.role === 'user') {
                conversationString += `<s>[INST] ${msg.content} [/INST]`;
                
                // If this user message has an assistant response, add it
                if (i + 1 < session.messages.length && session.messages[i + 1].role === 'assistant') {
                    conversationString += ` ${session.messages[i + 1].content} </s>`;
                    i++; // Skip the assistant message in the next iteration
                }
            }
        }
        
        // Get AI response using Hugging Face API
        const huggingFaceResponse = await axios({
            method: 'post',
            url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                inputs: conversationString || `<s>[INST] ${message} [/INST]`, // Fallback if string is empty
                parameters: {
                    max_new_tokens: 1024,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            },
            timeout: 60000 // Increased timeout to 60 seconds for longer responses
        });
        
        // Process AI response with better error handling
        let responseText;
        if (huggingFaceResponse.data && Array.isArray(huggingFaceResponse.data) && huggingFaceResponse.data.length > 0) {
            const aiContent = huggingFaceResponse.data[0]?.generated_text || "";
            // Extract response text more reliably
            if (aiContent.includes('[/INST]')) {
                responseText = aiContent.split('[/INST]').pop().trim();
            } else {
                responseText = aiContent.trim();
            }
        } else {
            responseText = "I couldn't generate a response at this time.";
        }
        
        // Add assistant response to session
        session.messages.push({
            role: 'assistant',
            content: responseText,
            timestamp: new Date()
        });
        
        // Update last activity timestamp
        session.lastActivity = new Date();
        
        await session.save();
        
        return res.json({
            error: false,
            message: "Message sent successfully",
            response: responseText,
            session: {
                _id: session._id,
                title: session.title,
                messageCount: session.messages.length,
                lastActivity: session.lastActivity
            }
        });
    } catch (error) {
        console.error("Error sending message:", error);
        
        // Better categorized error handling
        if (error.response) {
            // API responded with error status
            const status = error.response.status || 500;
            const errorMessage = error.response.data?.error || "External API error";
            return res.status(status).json({ 
                error: true, 
                message: `AI service error: ${errorMessage}`,
                details: error.response.data
            });
        } else if (error.request) {
            // Request made but no response received
            if (error.code === 'ECONNABORTED') {
                return res.status(504).json({ 
                    error: true, 
                    message: "Request to AI service timed out. Please try again later." 
                });
            }
            return res.status(502).json({ 
                error: true, 
                message: "No response from AI service. Please try again later." 
            });
        } else {
            // Error in setting up the request
            return res.status(500).json({ 
                error: true, 
                message: "Internal server error",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
});

app.get("/chat-sessions", authenticateToken, async (req, res) => {
    try {
      const userId = req.user._id;
  
      const sessions = await ChatSession.find({ userId: userId })
              .sort({ createdAt: -1 })
        .select("_id createdAt messages") // Only return necessary fields
        .lean();
  
      res.status(200).json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

app.listen(port);

module.exports = app;
import React, { useState, useEffect } from "react";

// Markdown to HTML conversion function
const markdownToHtml = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')  
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

function CommentWithVotes({ comment, onReplyAdded, depth = 0 }) {
    const [vote, setVote] = useState(comment?.userVote || 0);
    const [voteCount, setVoteCount] = useState(comment?.score || 0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [expanded, setExpanded] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [replies, setReplies] = useState(comment?.replies || []);

    // Maximum depth for nesting (like Reddit)
    const maxDepth = 8;
    const shouldIndent = depth > 0 && depth < maxDepth;

    // Fetch current user info
    useEffect(() => {
        // In CommentWithVotes.js, change fetchCurrentUser:
const fetchCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log("No token found for fetching user");
            return;
        }
        
        // ✅ CORRECT ENDPOINT:
        const res = await fetch('/api/users/me', {
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (res.ok) {
            const userData = await res.json();
            setCurrentUser(userData);
        }
    } catch (error) {
        console.error("Failed to fetch user:", error);
    }
};
        fetchCurrentUser();
    }, []);

    const handleUpvote = async () => {
    console.log("=== DEBUG UPVOTE START ===");
    console.log("Comment ID:", comment._id);
    
    try {
        const newVote = vote === 1 ? 0 : 1;
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert("You need to be logged in to vote!");
            return;
        }
        
        const res = await fetch(`/api/comments/${comment._id}/vote`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ value: newVote })
        });

        console.log("Vote response status:", res.status);
        
        if (res.ok) {
            const data = await res.json();
            console.log("Vote successful, new score:", data.score);
            setVote(newVote);
            setVoteCount(data.score);
        } else {
            const errorText = await res.text();
            console.error("Upvote failed:", errorText);
            alert("Failed to vote: " + errorText);
        }
    } catch (error) {
        console.error("Vote error:", error);
    }
    console.log("=== DEBUG UPVOTE END ===");
};

    const handleDownvote = async () => {
    console.log("=== DEBUG DOWNVOTE START ===");
    console.log("Comment ID:", comment._id);
    console.log("Current vote:", vote);
    console.log("Current vote count:", voteCount);
    
    try {
        const newVote = vote === -1 ? 0 : -1;
        const token = localStorage.getItem('token');
        
        console.log("New vote value:", newVote);
        console.log("Token exists:", !!token);
        
        if (!token) {
            alert("You need to be logged in to vote!");
            return;
        }
        
        console.log("Sending request to:", `/api/comments/${comment._id}/vote`);
        console.log("Request body:", { value: newVote });
        
        const res = await fetch(`/api/comments/${comment._id}/vote`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ value: newVote })
        });

        console.log("Downvote response status:", res.status);
        console.log("Response OK?", res.ok);
        
        const responseText = await res.text();
        console.log("Response text:", responseText);
        
        if (res.ok) {
            const data = JSON.parse(responseText);
            console.log("Downvote successful!");
            console.log("New score from server:", data.score);
            console.log("User vote from server:", data.userVote);
            
            setVote(newVote);
            setVoteCount(data.score);
            
            console.log("State updated - vote:", newVote, "voteCount:", data.score);
        } else {
            console.error("Downvote failed - Full response:", {
                status: res.status,
                statusText: res.statusText,
                body: responseText
            });
            
            // Try to parse error message
            let errorMessage = "Failed to vote";
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            
            alert("Failed to vote: " + errorMessage);
        }
    } catch (error) {
        console.error("Downvote catch error:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
    }
    console.log("=== DEBUG DOWNVOTE END ===");
};

    const handleAddReply = async () => {
    if (replyText.trim() === "") return;
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert("You need to be logged in to reply!");
            return;
        }
        
        // Save reply to database
        const res = await fetch("/api/comments", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                post: comment.post,
                body: replyText,
                parent: comment._id,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to save reply: ${errorText}`);
        }

        const savedReply = await res.json();
        
        // Get user info from localStorage or currentUser state
        const username = localStorage.getItem('username') || "You";
        const avatarUrl = localStorage.getItem('userAvatar') || "/default-avatar.png";
        
        // Add the new reply to our local state with proper author info
        const replyToAdd = {
            ...savedReply,
            author: {
                _id: savedReply.author, // This is the user ID from backend
                username: username,
                avatarUrl: avatarUrl
            },
            userVote: 0,
            score: 0,
            replies: []
        };
        
        setReplies(prevReplies => [...prevReplies, replyToAdd]);
        setReplyText("");
        setShowReplyInput(false);
        setExpanded(true);
        
        if (onReplyAdded) onReplyAdded();
        
    } catch (error) {
        console.error("Error saving reply:", error);
        alert("Failed to post reply: " + error.message);
    }
};
    // Calculate time difference for display
    const getTimeAgo = (timestamp) => {
        if (!timestamp) return "just now";
        
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - commentTime) / 1000);
        
        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <div className={`comment-item ${shouldIndent ? 'comment-indented' : ''}`}>
            {/* LEFT SIDE: Expand/Collapse button and vertical line - REDDIT STYLE */}
            <div className="comment-line-container">
                <button 
                    className="expand-collapse-btn"
                    onClick={() => setExpanded(!expanded)}
                    title={expanded ? "Collapse thread" : "Expand thread"}
                >
                    {expanded ? "−" : "+"}
                </button>
                {replies.length > 0 && expanded && (
                    <div className="comment-vertical-line"></div>
                )}
            </div>

            {/* RIGHT SIDE: Comment content */}
            <div className="comment-content">
                {/* Comment Header with Avatar and Username */}
                <div className="comment-header">
                    <div className="comment-author">
                        <img 
                            src={comment.author?.avatarUrl || "/default-avatar.png"} 
                            alt="avatar" 
                            className="comment-avatar"
                        />
                        <strong className="comment-username">u/{comment.author?.username || "Anonymous"}</strong>
                        <span className="comment-time">• {getTimeAgo(comment.createdAt)}</span>
                    </div>
                </div>

                {/* Comment Text */}
                <div 
                    className="comment-text" 
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(comment.body) }}
                />

                {/* Actions below comment */}
                <div className="comment-actions">
                    <div className="comment-votes-below">
                        <img
                            src={
                                vote === 1
                                    ? "../images/upvote-active.svg"
                                    : "../images/upvote.svg"
                            }
                            alt="upvote"
                            onClick={handleUpvote}
                        />
                        <span className="comment-vote-score">{voteCount}</span>
                        <img
                            src={
                                vote === -1
                                    ? "../images/downvote-active.svg"
                                    : "../images/downvote.svg"
                            }
                            alt="downvote"
                            onClick={handleDownvote}
                        />

                        {/* Reply Icon */}
                        <img
                            src="../images/comment.svg"
                            alt="reply"
                            className="comment-reply-icon"
                            onClick={() => setShowReplyInput((v) => !v)}
                            title="Reply"
                        />

                        {/* Reply count text */}
                        {replies.length > 0 && (
                            <span className="reply-count">
                                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Reply Input */}
                {showReplyInput && (
                    <div className="reply-input-area">
                        <textarea
                            className="reply-textarea"
                            placeholder="What are your thoughts?"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows="3"
                        />
                        <div className="reply-actions">
                            <button 
                                className="reply-cancel-btn"
                                onClick={() => setShowReplyInput(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddReply} 
                                className="reply-submit-btn"
                                disabled={!replyText.trim()}
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && expanded && (
                    <div className="comment-replies">
                        {replies.map((reply) => (
                            <CommentWithVotes
                                key={reply._id}
                                comment={reply}
                                onReplyAdded={onReplyAdded}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CommentWithVotes;
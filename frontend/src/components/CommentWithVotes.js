import React, { useState } from "react";

// Markdown to HTML conversion function
const markdownToHtml = (text) => {
  if (!text) return '';
  
  return text
    // Convert **bold** to <strong>bold</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>italic</em>  
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert ~~strikethrough~~ to <s>strikethrough</s>
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    // Convert `code` to <code>code</code>
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Convert line breaks to <br>
    .replace(/\n/g, '<br>');
};

function CommentWithVotes({ comment, username, text, replies = [], onReplyAdded }) {
    // Use the comment object if provided, otherwise fall back to individual props
    const author = comment?.author || { username: username || "Anonymous", avatar: "/default-avatar.png" };
    const body = comment?.body || text || "";
    const createdAt = comment?.createdAt;
    const initialUpvotes = comment?.upvotes || 0;
    
    const [vote, setVote] = useState(0);
    const [voteCount, setVoteCount] = useState(initialUpvotes);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyList, setReplyList] = useState(comment?.replies || replies || []);
    const [expanded, setExpanded] = useState(true);

    const handleUpvote = () => {
        if (vote === 1) {
            setVote(0);
            setVoteCount((v) => v - 1);
        } else {
            const change = vote === -1 ? 2 : 1;
            setVote(1);
            setVoteCount((v) => v + change);
        }
    };

    const handleDownvote = () => {
        if (vote === -1) {
            setVote(0);
            setVoteCount((v) => v + 1);
        } else {
            const change = vote === 1 ? -2 : -1;
            setVote(-1);
            setVoteCount((v) => v + change);
        }
    };

    const handleAddReply = () => {
        if (replyText.trim() === "") return;
        const newReply = { 
            author: { username: "You", avatar: "/default-avatar.png" },
            body: replyText,
            createdAt: new Date().toISOString(),
            upvotes: 0,
            replies: []
        };
        setReplyList([...replyList, newReply]);
        setReplyText("");
        setShowReplyInput(false);
        
        // Notify parent if needed
        if (onReplyAdded) onReplyAdded();
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
        <div className="comment-item">
            {/* Comment Header with Avatar and Username */}
            <div className="comment-header">
                <div className="comment-author">
                    <img 
                        src={author?.avatar || "/default-avatar.png"} 
                        alt="avatar" 
                        className="comment-avatar"
                    />
                    <strong className="comment-username">u/{author?.username || "Anonymous"}</strong>
                    <span className="comment-time">• {getTimeAgo(createdAt)}</span>
                </div>
            </div>

            {/* Comment Text - NOW WITH HTML RENDERING */}
            <div 
                className="comment-text" 
                dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }}
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
                    />

                    {/* Expand / Collapse Replies */}
                    {replyList.length > 0 && (
                        <div className="expand-toggle-container">
                            <span
                                className="expand-toggle"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? "–" : "+"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Input */}
            {showReplyInput && (
                <div className="reply-input-area">
                    <input
                        type="text"
                        className="reply-input"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button onClick={handleAddReply} className="reply-submit-btn">
                        Reply
                    </button>
                </div>
            )}

            {/* Nested Replies */}
            {replyList.length > 0 && (
                <div
                    className={`comment-replies ${expanded ? 'visible' : 'hidden'}`}
                >
                    {replyList.map((reply, i) => (
                        <CommentWithVotes
                            key={i}
                            comment={reply}
                            onReplyAdded={onReplyAdded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommentWithVotes;
import React, { useState } from "react";

function CommentWithVotes({ username, text, replies = [] }) {
    const [vote, setVote] = useState(0);
    const [voteCount, setVoteCount] = useState(0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyList, setReplyList] = useState(replies);
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
        const newReply = { username: "You", text: replyText, replies: [] };
        setReplyList([...replyList, newReply]);
        setReplyText("");
        setShowReplyInput(false);
    };

    return (
        <div className="comment-item">
            {/*  Username */}
            <div className="comment-header">
                <strong className="comment-username">u/{username}</strong>
            </div>

            {/*  Comment text */}
            <div className="comment-text">{text}</div>

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

                    {/*  Reply Icon */}
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

            {replyList.length > 0 && (
                <div
                    className="comment-replies"
                    style={{ display: expanded ? "block" : "none" }}
                >
                    {replyList.map((reply, i) => (
                        <CommentWithVotes
                            key={i}
                            username={reply.username}
                            text={reply.text}
                            replies={reply.replies}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}

export default CommentWithVotes;

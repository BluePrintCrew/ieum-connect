import React from 'react';

const StoryItem = ({ story, index, onClick }) => {
  return (
    <div key={story.storyId} className="story-item" onClick={onClick}>
      <span className="story-number">{index}.</span>
      <span className="story-name">{story.title}</span>
      <span className="likes">좋아요 {story.likeCount}개</span>
    </div>
  );
};

export default StoryItem;

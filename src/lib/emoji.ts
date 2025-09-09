import React from 'react';

// Utility functions for preserving emoji colors in text content

export const wrapEmojisForPreservation = (text: string): string => {
  // Regex to match emoji characters including variants, modifiers, and zwj sequences
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji}\uFE0F?(?:\u200D\p{Emoji}\uFE0F?)*)/gu;
  
  return text.replace(emojiRegex, '<span class="emoji-native">$1</span>');
};

export const isEmojiOnly = (text: string): boolean => {
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji}\uFE0F?(?:\u200D\p{Emoji}\uFE0F?)*|\s)+$/gu;
  return emojiRegex.test(text);
};

// React component to wrap text with emoji preservation
export const PreserveEmojiText: React.FC<{ 
  children: string; 
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, className = '', as: Component = 'span' }) => {
  const processedText = wrapEmojisForPreservation(children);
  
  return React.createElement(Component, {
    className: `preserve-emoji-colors ${className}`,
    dangerouslySetInnerHTML: { __html: processedText }
  });
};

export default PreserveEmojiText;
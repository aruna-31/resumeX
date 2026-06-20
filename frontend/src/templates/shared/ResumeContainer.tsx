import React from 'react';

interface ResumeContainerProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    margin?: string;
    fontSize?: number;
}

const DEFAULT_MARGIN = '40px';
const DEFAULT_FONT_SIZE = 11;

export const ResumeContainer: React.FC<ResumeContainerProps> = ({
    children,
    style,
    margin = DEFAULT_MARGIN,
    fontSize = DEFAULT_FONT_SIZE,
}) => (
    <div
        className="resume-preview"
        style={{
            width: 794,
            minHeight: 1123,
            padding: margin,
            background: 'white',
            color: 'black',
            fontFamily: '"Times New Roman", Times, serif',
            lineHeight: 1.5,
            fontSize: `${fontSize}pt`,
            boxSizing: 'border-box',
            ...style,
        }}
    >
        {children}
    </div>
);

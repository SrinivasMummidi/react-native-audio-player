import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronIconProps {
    size?: number;
    color?: string;
}

export const ChevronUpIcon: React.FC<ChevronIconProps> = ({
    size = 16,
    color = '#6b7280'
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M18 15L12 9L6 15"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ChevronDownIcon: React.FC<ChevronIconProps> = ({
    size = 16,
    color = '#6b7280'
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M6 9L12 15L18 9"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

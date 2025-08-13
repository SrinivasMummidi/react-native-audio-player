import React, { createContext, useContext, ReactNode } from 'react';
import type { AppEnv } from '../lib/environment';

interface AudioPlayerContextType {
    connectionId: string;
    brandId?: string;
    getAccessToken: () => Promise<string>;
    uniquePin?: string;
    mode?: AppEnv;
    callRecApiKey?: string;
    messageSavedTime?: number;
    audioSrc?: string;
}

interface AudioPlayerProviderProps extends AudioPlayerContextType {
    children: ReactNode;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({
    children,
    connectionId,
    brandId,
    getAccessToken,
    uniquePin,
    mode,
    callRecApiKey,
    messageSavedTime,
    audioSrc,
}) => {
    const value: AudioPlayerContextType = {
        connectionId,
        brandId,
        getAccessToken,
        uniquePin,
        mode,
        callRecApiKey,
        messageSavedTime,
        audioSrc,
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayerContext = (): AudioPlayerContextType => {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error('useAudioPlayerContext must be used within an AudioPlayerProvider');
    }
    return context;
};

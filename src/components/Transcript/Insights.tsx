import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { fetchInsights } from '../../services/fetchInsights';
import { MockResponseData } from '../../types/transcript';
import { useAudioPlayerContext } from '../../context/TranscriptAudioPlayerContext';
import TranscriptView from './TranscriptView';
import CallPanelFooter from '../CallRecording/CallPanelFooter';

function Insights() {
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | null>('summary');
    const [transcriptData, setTranscriptData] = useState<MockResponseData | null>(null);
    const { getAccessToken, connectionId } = useAudioPlayerContext();

    useEffect(() => {
        try {
            fetchInsights({ connectionId, getAccessToken }).then((data) => {
                if (data) {
                    setTranscriptData(data);
                }
            });
        } catch (error) {
            console.error('Error loading transcript data:', error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectionId]);

    return (
        <View style={styles.summaryContainer}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'summary' && styles.activeTabButton
                    ]}
                    onPress={() => {
                        setActiveTab('summary');
                    }}
                >
                    <Text style={[
                        styles.tabButtonText,
                        activeTab === 'summary' && styles.activeTabText
                    ]}>
                        Summary
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'transcript' && styles.activeTabButton
                    ]}
                    onPress={() => {
                        setActiveTab('transcript');
                    }}
                >
                    <Text style={[
                        styles.tabButtonText,
                        activeTab === 'transcript' && styles.activeTabText
                    ]}>
                        Transcript
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'summary' && transcriptData && (
                <>
                    <View style={styles.contentContainer}>
                        <Text style={styles.contentText}>
                            {transcriptData.data.summary.text}
                        </Text>
                    </View>
                    <CallPanelFooter />
                </>
            )}

            {activeTab === 'transcript' && transcriptData && (
                <>
                    <View style={{ ...styles.contentContainer, ...styles.transcriptionContainer }}>
                        <View style={styles.transcriptContainer}>
                            <TranscriptView
                                words={transcriptData.data.transcript.data.words}
                                speakerLabels={transcriptData.data.transcript.speakerLabels}
                            />
                        </View>
                    </View>
                    <CallPanelFooter />
                </>
            )}
        </View>
    )
}

export default Insights;

const styles = StyleSheet.create({
    summaryContainer: {
        marginHorizontal: 4,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
    },
    tabContainer: {
        backgroundColor: '#fafafa',
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        paddingHorizontal: 10,
        flexDirection: 'row',
        gap: 14,
        marginBottom: 6,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderColor: '#d6dce0',
    },
    activeTabButton: {
        borderBottomWidth: 2,
        borderColor: '#333',
    },
    tabButtonText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    contentContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    transcriptionContainer: {
        paddingRight: 0,
        minHeight: 200,
    },
    contentText: {
        fontSize: 12,
        lineHeight: 24,
        color: '#111',
    },
    activeTabText: {
        fontWeight: '600',
    },
    transcriptContainer: {
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
    },
});

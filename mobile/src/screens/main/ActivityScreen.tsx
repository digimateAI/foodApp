import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const ActivityScreen = () => {

    const renderProgressRing = () => (
        <View style={styles.ringContainer}>
            {/* Background Flame (Subtle) */}
            <View style={styles.bgFlame}>
                <Ionicons name="flame" size={120} color="#D4EDDA" style={{ opacity: 0.3 }} />
            </View>

            {/* Ring Simulation using Border Hacks or SVG. 
                For simplicity in pure RN views without extra libs: 
                We can use a View with borderRadius and border colors. 
                However, creating a partial arc is hard with just Views.
                We'll simulate a full ring for now or use a simple overlap trick.
            */}
            <View style={styles.outerRing}>
                <View style={styles.innerRing}>
                    <Ionicons name="flame" size={32} color="#33CC33" />
                    <Text style={styles.ringValue}>450</Text>
                    <Text style={styles.ringTotal}>/ 600 kcal</Text>
                </View>
            </View>
            {/* Hacky partial green stroke */}
            <View style={[styles.outerRing, styles.progressArc]} pointerEvents="none" />

            {/* Daily Goal Bar */}
            <View style={styles.goalBarContainer}>
                <Text style={styles.goalLabel}>Daily Goal</Text>
                <View style={styles.goalTrack}>
                    <View style={[styles.goalFill, { width: '75%' }]} />
                </View>
                <Text style={styles.goalPercent}>75%</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Top Header */}
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Activity</Text>
                <TouchableOpacity style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={20} color="#808080" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 2. Date & Sync Status */}
                <View style={styles.statusSection}>
                    <View>
                        <Text style={styles.dateText}>Today, Oct 24</Text>
                        <Text style={styles.syncText}>Last synced: 10:02 AM</Text>
                    </View>
                    <View style={styles.deviceTag}>
                        <View style={styles.greenDot} />
                        <Text style={styles.deviceName}>Apple Health</Text>
                    </View>
                </View>

                {/* 3. Main Activity Goal Progress Ring */}
                <View style={styles.mainCard}>
                    {renderProgressRing()}
                </View>

                {/* 4. Activity Summary Cards - Top Row */}
                <View style={styles.cardsRow}>
                    {/* Steps Card */}
                    <View style={[styles.infoCard, { marginRight: 8 }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#E6F0FF' }]}>
                                <FontAwesome5 name="shoe-prints" size={14} color="#4A90E2" />
                            </View>
                            <View style={styles.percentTag}>
                                <Text style={styles.percentText}>84%</Text>
                            </View>
                        </View>
                        <Text style={styles.cardValue}>8,432</Text>
                        <Text style={styles.cardLabel}>Steps</Text>
                        <View style={styles.miniTrack}>
                            <View style={[styles.miniFill, { backgroundColor: '#4A90E2', width: '84%' }]} />
                        </View>
                    </View>

                    {/* Exercise Card */}
                    <View style={[styles.infoCard, { marginLeft: 8 }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#FFF5E6' }]}>
                                <MaterialCommunityIcons name="dumbbell" size={18} color="#F5A623" />
                            </View>
                        </View>
                        <Text style={styles.cardValue}>45</Text>
                        <Text style={styles.cardLabel}>min Exercise</Text>
                        <View style={styles.miniTrack}>
                            <View style={[styles.miniFill, { backgroundColor: '#F5A623', width: '60%' }]} />
                        </View>
                    </View>
                </View>

                {/* Sleep Duration Card (Full Width) */}
                <View style={[styles.infoCard, { marginTop: 16 }]}>
                    <View style={styles.sleepRow}>
                        <View style={styles.sleepLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#F3E5F5', marginBottom: 0, marginRight: 12 }]}>
                                <Ionicons name="moon" size={16} color="#9B59B6" />
                            </View>
                            <View>
                                <Text style={styles.cardValue}>7h 20m</Text>
                                <Text style={styles.cardLabel}>Sleep Duration</Text>
                            </View>
                        </View>
                        <View style={styles.sleepRight}>
                            <Text style={styles.goodText}>Good</Text>
                            <Text style={styles.qualityLabel}>Quality</Text>
                        </View>
                    </View>
                </View>

                {/* 5. Manage Connected Devices Button */}
                <TouchableOpacity style={styles.manageButton}>
                    <Ionicons name="link" size={20} color="#808080" style={{ marginRight: 10 }} />
                    <Text style={styles.manageText}>Manage Connected Devices</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9FB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    refreshBtn: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    syncText: {
        fontSize: 12,
        color: '#808080',
        marginTop: 4,
    },
    deviceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F0FF',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    greenDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#70C050',
        marginRight: 6,
    },
    deviceName: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    mainCard: {
        alignItems: 'center',
        marginBottom: 24,
    },
    ringContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bgFlame: {
        position: 'absolute',
        top: 20,
    },
    outerRing: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 15,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressArc: {
        position: 'absolute',
        borderTopColor: '#33CC33',
        borderRightColor: '#33CC33',
        borderBottomColor: 'transparent',
        borderLeftColor: '#33CC33', // 75% roughly
        transform: [{ rotate: '-45deg' }],
        zIndex: 1,
    },
    innerRing: {
        alignItems: 'center',
    },
    ringValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 4,
    },
    ringTotal: {
        fontSize: 14,
        color: '#808080',
    },
    goalBarContainer: {
        position: 'absolute',
        bottom: -30,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    goalLabel: {
        fontSize: 12,
        color: '#333',
        width: 60,
    },
    goalTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginHorizontal: 10,
    },
    goalFill: {
        height: '100%',
        backgroundColor: '#33CC33',
        borderRadius: 3,
    },
    goalPercent: {
        fontSize: 12,
        color: '#33CC33',
        fontWeight: 'bold',
        width: 30,
        textAlign: 'right',
    },
    cardsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
        marginHorizontal: 16, // If singular
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    percentTag: {
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    percentText: {
        fontSize: 10,
        color: '#333',
        fontWeight: 'bold',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    cardLabel: {
        fontSize: 12,
        color: '#808080',
        marginBottom: 8,
    },
    miniTrack: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        width: '100%',
    },
    miniFill: {
        height: '100%',
        borderRadius: 2,
    },
    sleepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sleepLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sleepRight: {
        alignItems: 'flex-end',
    },
    goodText: {
        color: '#33CC33',
        fontWeight: 'bold',
        fontSize: 14,
    },
    qualityLabel: {
        fontSize: 12,
        color: '#808080',
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#B0B0B0',
        borderStyle: 'dashed',
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
    },
    manageText: {
        color: '#808080',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default ActivityScreen;

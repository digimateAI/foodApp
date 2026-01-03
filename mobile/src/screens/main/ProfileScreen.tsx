import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
    const { logout, profile } = useUserStore();
    const [mealReminders, setMealReminders] = useState(false);
    const [dailySummaries, setDailySummaries] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        // Navigation reset is handled by AppNavigator typically watching auth state, 
                        // or we can manually navigate if needed, but 'logout' updates store which updates nav.
                    }
                }
            ]
        );
    };

    const InfoRow = ({ label, value, unit, valueColor, showDivider = true }: any) => (
        <View>
            <TouchableOpacity style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <View style={styles.infoRight}>
                    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
                    {unit && <Text style={styles.infoUnit}>{unit}</Text>}
                    <Ionicons name="chevron-forward" size={18} color="#B0B0B0" style={{ marginLeft: 8 }} />
                </View>
            </TouchableOpacity>
            {showDivider && <View style={styles.divider} />}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Top Navigation Bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 2. User Profile Summary */}
                <View style={styles.userSummary}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' }}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.userName}>{profile.name || 'Jane Doe'}</Text>
                    <Text style={styles.userEmail}>{profile.name ? `${profile.name.toLowerCase().replace(/\s/g, '.')}@foodvision.app` : 'jane.doe@foodvision.app'}</Text>

                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Personal Details Section */}
                <Text style={styles.sectionHeader}>PERSONAL DETAILS</Text>
                <View style={styles.cardGroup}>
                    <InfoRow label="Age" value={profile.age} />
                    <InfoRow label="Gender" value={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} />
                    <InfoRow label="Height" value={profile.height} unit="cm" />
                    <InfoRow label="Weight" value={profile.weight} unit="kg" showDivider={false} />
                </View>

                {/* Goals Group */}
                <Text style={styles.sectionHeader}>GOALS & TARGETS</Text>
                <View style={styles.cardGroup}>
                    <InfoRow label="Current Goal" value={profile.goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} valueColor="#33CC33" />
                    <InfoRow label="Daily Calorie Target" value={`${profile.dailyCalorieTarget} kcal`} showDivider={false} />
                </View>

                {/* 4. Connected Devices Section */}
                <Text style={styles.sectionHeader}>CONNECTED DEVICES</Text>
                <View style={styles.cardGroup}>
                    {/* Apple Health */}
                    <View style={styles.deviceRow}>
                        <View style={styles.rowLeft}>
                            <View style={styles.deviceIconBg}>
                                <MaterialCommunityIcons name="shield-plus" size={20} color="#333" />
                            </View>
                            <Text style={styles.deviceLabel}>Apple Health</Text>
                        </View>
                        <View style={styles.statusTag}>
                            <Text style={styles.statusText}>Connected</Text>
                            <Ionicons name="checkmark" size={12} color="#33CC33" style={{ marginLeft: 4 }} />
                        </View>
                    </View>
                    <View style={styles.divider} />

                    {/* Google Fit */}
                    <View style={styles.deviceRow}>
                        <View style={styles.rowLeft}>
                            <View style={styles.deviceIconBg}>
                                <MaterialCommunityIcons name="google-fit" size={20} color="#333" />
                            </View>
                            <Text style={styles.deviceLabel}>Google Fit</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.connectLink}>Connect</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 5. Notifications Section */}
                <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
                <View style={styles.cardGroup}>
                    {/* Meal Reminders */}
                    <View style={styles.notificationRow}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.notificationLabel}>Meal Reminders</Text>
                            <Text style={styles.notificationDesc}>Get notified when it's time to log</Text>
                        </View>
                        <Switch
                            value={mealReminders}
                            onValueChange={setMealReminders}
                            trackColor={{ false: '#E0E0E0', true: '#33CC33' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                    <View style={styles.divider} />

                    {/* Daily Summaries */}
                    <View style={styles.notificationRow}>
                        <View style={styles.rowLeft}>
                            <Text style={styles.notificationLabel}>Daily Summaries</Text>
                            <Text style={styles.notificationDesc}>Receive a summary of your macros</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Switch
                                value={dailySummaries}
                                onValueChange={setDailySummaries}
                                trackColor={{ false: '#E0E0E0', true: '#33CC33' }}
                                thumbColor={'#FFFFFF'}
                            />
                            {dailySummaries && (
                                <Ionicons name="checkmark" size={14} color="#33CC33" style={{ position: 'absolute', right: 4, zIndex: 10 }} />
                            )}
                        </View>
                    </View>
                </View>

                {/* 6. Log Out Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={24} color="#FF4D4D" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FDF9', // Pale green tint
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    userSummary: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 2,
        borderColor: '#A8E063',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#808080',
        marginTop: 4,
    },
    editButton: {
        backgroundColor: '#D4EDDA',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 15,
    },
    editButtonText: {
        color: '#33CC33',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionHeader: {
        color: '#666666',
        fontWeight: 'bold',
        fontSize: 12,
        marginTop: 30,
        marginBottom: 10,
        marginHorizontal: 16,
        textTransform: 'uppercase',
    },
    cardGroup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoLabel: {
        fontSize: 16,
        color: '#333',
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 16,
        color: '#808080',
        fontWeight: '500',
    },
    infoUnit: {
        fontSize: 14,
        color: '#B0B0B0',
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 16,
    },
    deviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deviceIconBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deviceLabel: {
        fontSize: 16,
        color: '#333',
    },
    statusTag: {
        backgroundColor: '#D4EDDA',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: '#33CC33',
        fontWeight: 'bold',
        fontSize: 12,
    },
    connectLink: {
        color: '#808080',
        fontSize: 14,
    },
    notificationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    notificationLabel: {
        fontSize: 16,
        color: '#333',
    },
    notificationDesc: {
        fontSize: 12,
        color: '#808080',
        marginTop: 2,
    },
    logoutButton: {
        marginTop: 30,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: '#FF4D4D',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});

export default ProfileScreen;

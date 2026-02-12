import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning';
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        title: 'Welcome to FoodVision!',
        message: 'Start tracking your meals today to reach your goals.',
        time: '2h ago',
        read: false,
        type: 'success'
    },
    {
        id: '2',
        title: 'Hydration Check',
        message: 'Don\'t forget to drink water! You have 1000ml left.',
        time: '5h ago',
        read: true,
        type: 'info'
    },
    {
        id: '3',
        title: 'Daily Goal Achieved',
        message: 'Congratulations! You hit your protein target yesterday.',
        time: '1d ago',
        read: true,
        type: 'success'
    }
];

const NotificationsScreen = ({ navigation }: { navigation: any }) => {

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity style={[styles.itemContainer, !item.read && styles.unreadItem]}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={item.type === 'success' ? 'checkmark-circle' : 'information-circle'}
                    size={24}
                    color={item.type === 'success' ? '#33CC33' : '#4A90E2'}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.readIndicator} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={MOCK_NOTIFICATIONS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    unreadItem: {
        backgroundColor: '#F0F9FF',
        borderLeftWidth: 3,
        borderLeftColor: '#4A90E2',
    },
    iconContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 6,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    readIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4A90E2',
        marginLeft: 8,
        marginTop: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        color: '#888',
        fontSize: 16,
    },
});

export default NotificationsScreen;

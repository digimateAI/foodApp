import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';

const PersonalDetailsScreen = ({ navigation }: { navigation: any }) => {
    const { updateProfile } = useUserStore();
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
    const [age, setAge] = useState('25');
    const [height, setHeight] = useState('0');
    const [weight, setWeight] = useState('0');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('lb');

    const isFormValid = name.trim().length > 0 && gender !== null && age.trim().length > 0 && height.trim().length > 0 && weight.trim().length > 0 && parseFloat(height) > 0 && parseFloat(weight) > 0;

    // Helpers to render Gender Cards
    const renderGenderCard = (type: 'male' | 'female' | 'other', label: string, iconName: any) => {
        const isSelected = gender === type;
        return (
            <TouchableOpacity
                style={[
                    styles.genderCard,
                    isSelected && styles.genderCardSelected
                ]}
                onPress={() => setGender(type)}
            >
                <View style={styles.genderIconContainer}>
                    <MaterialCommunityIcons
                        name={iconName}
                        size={32}
                        color={isSelected ? '#28A745' : '#808080'}
                    />
                </View>
                <Text style={[styles.genderLabel, isSelected && styles.genderLabelSelected]}>
                    {label}
                </Text>
                {isSelected && (
                    <View style={styles.selectionIndicator} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Personal Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Progress Indicator */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.stepText}>Step 1 of 2</Text>
                            {/* <Text style={styles.percentText}>50% Completed</Text> */}
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '50%' }]} />
                        </View>
                    </View>

                    {/* Heading */}
                    <View style={styles.headingSection}>
                        <Text style={styles.mainHeading}>Tell us about you</Text>
                        <Text style={styles.descriptionText}>
                            To tailor your nutrition plan effectively, we need to know a bit about your body metrics.
                        </Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>NAME</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor="#ccc"
                            />
                        </View>
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>GENDER</Text>
                        <View style={styles.genderContainer}>
                            {renderGenderCard('female', 'Female', 'gender-female')}
                            {renderGenderCard('male', 'Male', 'gender-male')}
                            {renderGenderCard('other', 'Other', 'gender-transgender')}
                        </View>
                    </View>

                    {/* Age Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>AGE</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                            <Text style={styles.unitLabel}>years</Text>
                        </View>
                    </View>

                    {/* Height Input */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>HEIGHT</Text>
                            {/* Unit Toggle */}
                            <View style={styles.unitToggle}>
                                <TouchableOpacity
                                    style={[styles.toggleSegment, heightUnit === 'ft' && styles.toggleSegmentSelected]}
                                    onPress={() => setHeightUnit('ft')}
                                >
                                    <Text style={[styles.toggleText, heightUnit === 'ft' && styles.toggleTextSelected]}>ft/in</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleSegment, heightUnit === 'cm' && styles.toggleSegmentSelected]}
                                    onPress={() => setHeightUnit('cm')}
                                >
                                    <Text style={[styles.toggleText, heightUnit === 'cm' && styles.toggleTextSelected]}>cm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                            />
                            <Text style={styles.unitLabel}>{heightUnit}</Text>
                        </View>
                    </View>

                    {/* Weight Input */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>WEIGHT</Text>
                            {/* Unit Toggle */}
                            <View style={styles.unitToggle}>
                                <TouchableOpacity
                                    style={[styles.toggleSegment, weightUnit === 'kg' && styles.toggleSegmentSelected]}
                                    onPress={() => setWeightUnit('kg')}
                                >
                                    <Text style={[styles.toggleText, weightUnit === 'kg' && styles.toggleTextSelected]}>kg</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleSegment, weightUnit === 'lb' && styles.toggleSegmentSelectedGreen]}
                                    onPress={() => setWeightUnit('lb')}
                                >
                                    <Text style={[styles.toggleText, weightUnit === 'lb' && styles.toggleTextSelectedWhite]}>lb</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                            />
                            <Text style={styles.unitLabel}>{weightUnit}</Text>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.nextButton, !isFormValid && { backgroundColor: '#CCCCCC', opacity: 0.7 }]}
                        disabled={!isFormValid}
                        onPress={() => {
                            updateProfile({ name, gender: gender || 'female', age, height, weight });
                            navigation.navigate('ActivityGoal');
                        }}
                    >
                        <Text style={styles.nextButtonText}>Next Step</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // lightly off-white
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
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
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    progressSection: {
        marginTop: 10,
        marginBottom: 24,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    stepText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    percentText: {
        fontSize: 14,
        color: '#33CC33',
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#33CC33',
        borderRadius: 3,
    },
    headingSection: {
        marginBottom: 32,
    },
    mainHeading: {
        fontSize: 28,
        fontWeight: '800', // Extra bold
        color: '#1A1A1A',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#56AB2F',
        marginBottom: 12, // Default bottom margin if no header container
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12, // Works in newer RN, otherwise use margins
    },
    genderCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    genderCardSelected: {
        backgroundColor: '#D4EDDA', // Light green
        borderColor: '#33CC33',
    },
    genderIconContainer: {
        marginBottom: 8,
    },
    genderLabel: {
        fontSize: 14,
        color: '#808080',
        fontWeight: '500',
    },
    genderLabelSelected: {
        color: '#28A745',
        fontWeight: '600',
    },
    selectionIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#33CC33',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        height: '100%',
    },
    unitLabel: {
        fontSize: 14,
        color: '#808080',
        fontWeight: '500',
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        padding: 2,
    },
    toggleSegment: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    toggleSegmentSelected: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    toggleSegmentSelectedGreen: {
        backgroundColor: '#33CC33',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#808080',
    },
    toggleTextSelected: {
        color: '#333333',
    },
    toggleTextSelectedWhite: {
        color: '#FFFFFF',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(245, 245, 245, 0.9)', // Slight opacity to fade content behind
    },
    nextButton: {
        backgroundColor: '#33CC33',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default PersonalDetailsScreen;

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useUserStore } from '../../store/useUserStore';

const { width } = Dimensions.get('window');

// For Expo Go on physical device, YOU MUST USE YOUR COMPUTER'S LAN IP.
// 10.0.2.2 only works for Android Emulator.
// localhost only works for iOS Simulator.
// Replace '192.168.1.X' with your actual IP.
const API_URL = 'http://192.168.29.111:3000/meals/analyze';

export default function CameraScreen({ route, navigation }: any) {
    const { mealType } = route.params || {};
    const { logMeal } = useUserStore();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        // Auto-request permission on mount if not determined
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.message}>We need your permission to show the camera</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                        <Text style={styles.permissionText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Text style={styles.closeText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const toggleCameraType = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current && !isAnalyzing) {
            try {
                // Capture the actual image
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.4, // Reduce quality to 0.4 to reduce payload size
                    base64: false
                });

                if (photo) {
                    setIsAnalyzing(true);

                    // Prepare FormData
                    const formData = new FormData();
                    formData.append('image', {
                        uri: photo.uri,
                        type: 'image/jpeg',
                        name: 'food_log.jpg',
                    } as any);

                    // Send to Backend
                    console.log('Uploading to:', API_URL);
                    const response = await axios.post(API_URL, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        timeout: 60000 // Increase to 60 sec timeout
                    });

                    const data = response.data;
                    console.log('AI Analysis:', data);

                    // Parse the response
                    // The backend returns: { items: [...], total_calories, total_protein_g, ... }
                    const mealName = data.items.map((i: any) => i.name).join(', ') || `Logged ${mealType || 'Meal'}`;
                    const calories = data.total_calories || 0;

                    // Log to Store
                    logMeal({
                        id: Math.random().toString(),
                        type: (mealType ? mealType.toLowerCase() : 'snacks') as any,
                        name: mealName,
                        calories: calories,
                        protein: data.total_protein_g || 0,
                        carbs: data.total_carbs_g || 0,
                        fat: data.total_fat_g || 0,
                        timestamp: Date.now(),
                        imageUri: photo.uri
                    });

                    setIsAnalyzing(false);

                    Alert.alert(
                        "Food Analyzed!",
                        `Identified: ${mealName}\nCalories: ${calories} kcal`,
                        [
                            {
                                text: "Add to Diary",
                                onPress: () => {
                                    navigation.navigate('Food');
                                }
                            }
                        ]
                    );
                }
            } catch (error) {
                console.error("Failed to analyze food", error);
                setIsAnalyzing(false);
                let msg = "Failed to create request.";
                if (axios.isAxiosError(error)) {
                    msg = error.message;
                    if (error.response) {
                        msg = `Server Error: ${error.response.status}`;
                    }
                }
                Alert.alert("Analysis Failed", `Could not connect to AI server.\n${msg}`);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <SafeAreaView style={styles.uiContainer}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{mealType ? `Log ${mealType}` : 'Log Meal'}</Text>
                        <TouchableOpacity onPress={toggleCameraType} style={styles.iconButton}>
                            <Ionicons name="camera-reverse" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer / Controls */}
                    <View style={styles.footer}>
                        <View style={styles.spacer} />
                        <TouchableOpacity
                            style={[styles.captureBtnOuter, isAnalyzing && { borderColor: '#ccc' }]}
                            onPress={takePicture}
                            disabled={isAnalyzing}
                        >
                            <View style={[styles.captureBtnInner, isAnalyzing && { backgroundColor: '#ccc' }]} />
                        </TouchableOpacity>
                        <View style={styles.spacer} />
                    </View>

                    {/* Loading Overlay */}
                    {isAnalyzing && (
                        <View style={styles.loadingOverlay}>
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="large" color="#33CC33" />
                                <Text style={styles.loadingText}>Analyzing Food...</Text>
                                <Text style={styles.loadingSubText}>Consulting AI Nutritionist</Text>
                            </View>
                        </View>
                    )}

                </SafeAreaView>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    uiContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 30,
    },
    spacer: {
        width: 50,
    },
    captureBtnOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    captureBtnInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    permissionButton: {
        backgroundColor: '#33CC33',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 10,
    },
    permissionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        padding: 10,
    },
    closeText: {
        color: '#808080',
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingBox: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        width: 200,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingSubText: {
        marginTop: 8,
        fontSize: 12,
        color: '#808080',
    },
});

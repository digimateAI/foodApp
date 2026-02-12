import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions, ActivityIndicator, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../../services/api';
import { useUserStore } from '../../store/useUserStore';
import { db, storage, auth } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// For Expo Go on physical device, YOU MUST USE YOUR COMPUTER'S LAN IP.
// 10.0.2.2 only works for Android Emulator.
// localhost only works for iOS Simulator.
// Replace '192.168.1.X' with your actual IP.
// Client-side logging enabled via Firebase SDK

export default function CameraScreen({ route, navigation }: any) {
    const { mealType } = route.params || {};
    const { logMeal, token, user } = useUserStore();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('auto');
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [scanned, setScanned] = useState(false);
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

    const toggleFlash = () => {
        setFlashMode(current => {
            if (current === 'off') return 'on';
            if (current === 'on') return 'auto';
            return 'off';
        });
    };

    const getFlashIcon = () => {
        switch (flashMode) {
            case 'on': return 'flash';
            case 'auto': return 'flash-outline'; // or a custom auto icon if available
            default: return 'flash-off';
        }
    };

    const takePicture = async () => {
        if (cameraRef.current && !isAnalyzing) {
            try {
                // Capture the actual image
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8, // Slightly higher for preview
                    base64: false,
                    // flashMode is handled by the CameraView prop
                });

                if (photo) {
                    setPreviewUri(photo.uri);
                }
            } catch (error) {
                Alert.alert("Error", "Failed to take picture");
            }
        }
    };

    const retakePicture = () => {
        setPreviewUri(null);
    };

    const confirmAndAnalyze = async () => {
        if (!previewUri || isAnalyzing) return;

        setIsAnalyzing(true);

        try {
            // OPTIMIZATION: Resize image to max 1024px width/height
            // This reduces 12MB+ images to ~200-500KB for fast upload
            const manipResult = await manipulateAsync(
                previewUri,
                [{ resize: { width: 1024 } }],
                { compress: 0.6, format: SaveFormat.JPEG }
            );

            const optimizedUri = manipResult.uri;

            // 1. ANALYZE (Connect to Backend AI only)
            const analyzeFormData = new FormData();
            analyzeFormData.append('image', {
                uri: optimizedUri,
                type: 'image/jpeg',
                name: 'food_analyze.jpg',
            } as any);

            console.log('Analyzing at: /meals/analyze');
            const analyzeResponse = await api.post('/meals/analyze', analyzeFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            });

            const analysisData = analyzeResponse.data;
            console.log('AI Analysis Result:', analysisData);

            // Prepare Meal Data
            const mealName = analysisData.items.map((i: any) => i.name).join(', ') || `Logged ${mealType || 'Meal'}`;
            const calories = analysisData.total_calories || 0;

            const mealId = Math.random().toString();
            const timestamp = Date.now();

            // Smart Defaulting for Meal Type
            let calculatedMealType = mealType;
            if (!calculatedMealType) {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 11) calculatedMealType = 'breakfast';
                else if (hour >= 11 && hour < 16) calculatedMealType = 'lunch';
                else if (hour >= 16 && hour < 22) calculatedMealType = 'dinner';
                else calculatedMealType = 'snacks';
            }

            const mealTypeVal = (calculatedMealType ? calculatedMealType.toLowerCase() : 'snacks') as any;

            // 2. LOG LOCAL (Immediate UI Update)
            logMeal({
                id: mealId,
                type: mealTypeVal,
                name: mealName,
                calories: calories,
                protein: analysisData.total_protein_g || 0,
                carbs: analysisData.total_carbs_g || 0,
                fat: analysisData.total_fat_g || 0,
                timestamp: timestamp,
                imageUri: optimizedUri
            });

            // STOP SPINNER NOW - Improve UX
            setIsAnalyzing(false);

            // SHOW SUCCESS ALERT IMMEDIATELY
            Alert.alert(
                "Item Logged!",
                `Identified: ${mealName}\nCalories: ${calories} kcal\n\nIs there any other food you have eaten?`,
                [
                    {
                        text: "Yes, Add More",
                        onPress: () => {
                            setPreviewUri(null); // Return to camera for next item
                        }
                    },
                    {
                        text: "No, Finish",
                        onPress: () => {
                            // Navigate to Home as requested
                            navigation.navigate('Main', { screen: 'Home' });
                        }
                    }
                ]
            );

            // 3. UPLOAD & SYNC (Background)
            try {
                // ALLOW DEMO MODE: Rely on Public Rules for now as requested
                // if (!auth.currentUser && user?.email !== 'demo@example.com') { ... }

                console.log('Starting Firebase Sync...');
                // Imports are now at top level

                // 3a. Upload Image in folder named after user's email
                // PRIORITIZE EMAIL as the unique identifier as per usage in Cloud Storage
                const userIdentifier = user?.email || user?.uid || 'demo-user-123';
                console.log('Using User Identifier for Storage/DB:', userIdentifier);

                const filename = `food_log_${Date.now()}.jpg`;
                const storageRef = ref(storage, `meals/${userIdentifier}/${filename}`);

                console.log('Fetching blob from:', optimizedUri);
                // Convert URI to Blob
                const imgResponse = await fetch(optimizedUri);
                const blob = await imgResponse.blob();
                console.log('Blob created, size:', blob.size);

                console.log('Uploading image to Firebase Storage...');
                await uploadBytes(storageRef, blob);
                console.log('Upload complete, getting URL...');
                const downloadURL = await getDownloadURL(storageRef);
                console.log('Image uploaded:', downloadURL);

                // 3b. Save to Firestore (Subcollection: users/{email}/meals)
                const mealDoc = {
                    date: new Date().toISOString(),
                    type: mealTypeVal,
                    items: (analysisData.items || []).map((item: any) => ({
                        name: item.name || 'Unknown Item',
                        calories: item.calories || 0,
                        protein: item.protein_g || 0,
                        carbs: item.carbs_g || 0,
                        fat: item.fat_g || 0
                    })),
                    photoUrl: downloadURL,
                    createdAt: new Date().toISOString()
                };

                console.log('Saving to Firestore subcollection...');
                // Path: users/aish@gmail.com/meals/AUTO_ID
                const docRef = await addDoc(collection(db, 'users', userIdentifier, 'meals'), mealDoc);
                console.log('Meal verified/saved with ID:', docRef.id);
                // Alert.alert("Cloud Sync Complete", "Meal saved to Database!\nID: " + docRef.id);

            } catch (uploadErr: any) {
                console.error('Failed to upload/sync meal:', uploadErr);
                // Show alert even if navigation happened, might show on top of new screen
                Alert.alert("Sync Failed", "Could not save to Cloud: " + (uploadErr.message || JSON.stringify(uploadErr)));
                console.log('Firebase Sync sequence finished.');
            }
            // Alert was already shown

        } catch (error) {
            console.error("Failed to analyze/log food", error);
            setIsAnalyzing(false);
            let msg = "Failed to create request.";
            if (axios.isAxiosError(error)) {
                msg = error.message;
                if (error.response) {
                    msg = `Server Error: ${error.response.status}`;
                }
            }
            Alert.alert("Analysis/Upload Failed", `Could not connect to server.\n${msg}`);
        }
    };

    const isBarcodeMode = route.params?.mode === 'barcode';
    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        Alert.alert(
            "Barcode Scanned!",
            `Type: ${type}\nData: ${data}`,
            [
                {
                    text: 'OK', onPress: () => {
                        // For now, go back. In future, fetch product details.
                        navigation.goBack();
                    }
                },
                { text: 'Scan Again', onPress: () => setScanned(false) }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Show Camera if no preview */}
            {!previewUri ? (
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    ref={cameraRef}
                    enableTorch={flashMode === 'on'}
                    flash={flashMode}
                    autofocus="on"
                    onBarcodeScanned={isBarcodeMode && !scanned ? handleBarCodeScanned : undefined}
                >
                    <SafeAreaView style={styles.uiContainer}>

                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>
                                {isBarcodeMode ? 'Scan Barcode' : (mealType ? `Log ${mealType}` : 'Log Meal')}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                                    <Ionicons name={getFlashIcon()} size={24} color={flashMode === 'auto' ? '#FFD700' : 'white'} />
                                </TouchableOpacity>
                                {!isBarcodeMode && (
                                    <TouchableOpacity onPress={toggleCameraType} style={styles.iconButton}>
                                        <Ionicons name="camera-reverse" size={28} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>

                        </View>

                        {/* Middle - Barcode Target Box */}
                        {isBarcodeMode && (
                            <View style={styles.scannerOverlay}>
                                <View style={styles.scannerBox} />
                                <Text style={styles.scannerText}>Align barcode within frame</Text>
                            </View>
                        )}

                        {/* Footer / Controls */}
                        <View style={styles.footer}>
                            {isBarcodeMode ? (
                                <Text style={{ color: 'white', alignSelf: 'center' }}>Scanning...</Text>
                            ) : (
                                <>
                                    <View style={styles.spacer} />
                                    <TouchableOpacity
                                        style={styles.captureBtnOuter}
                                        onPress={takePicture}
                                    >
                                        <View style={styles.captureBtnInner} />
                                    </TouchableOpacity>
                                    <View style={styles.spacer} />
                                </>
                            )}
                        </View>

                    </SafeAreaView>
                </CameraView>
            ) : (
                // Preview Mode
                <View style={styles.previewContainer}>
                    <Image source={{ uri: previewUri }} style={styles.previewImage} />
                    <SafeAreaView style={styles.previewOverlay}>
                        <View style={styles.header}>
                            <View />
                            <Text style={styles.headerTitle}>Preview</Text>
                            <View />
                        </View>

                        <View style={styles.previewFooter}>
                            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture} disabled={isAnalyzing}>
                                <Ionicons name="refresh" size={24} color="white" />
                                <Text style={styles.buttonText}>Retake</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.useButton} onPress={confirmAndAnalyze} disabled={isAnalyzing}>
                                <Ionicons name="checkmark" size={24} color="white" />
                                <Text style={styles.buttonText}>Use Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            )}

            {/* Loading Overlay (Global) */}
            {isAnalyzing && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#33CC33" />
                        <Text style={styles.loadingText}>Analyzing Food...</Text>
                        <Text style={styles.loadingSubText}>Consulting AI Nutritionist</Text>
                    </View>
                </View>
            )}
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
    previewContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    previewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 30,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingTop: 20,
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    useButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#33CC33',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    scannerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#33CC33',
        backgroundColor: 'transparent',
        borderRadius: 16,
    },
    scannerText: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        overflow: 'hidden', // for iOS
    },
});

import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '../../store/useUserStore';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }: { navigation: any }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* 1. Header Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {/* Placeholder Logo */}
                        <Image
                            source={{ uri: 'https://placehold.co/100x100/A8E063/ffffff.png?text=FV' }}
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.appName}>FoodVision</Text>
                    <Text style={styles.tagline}>Snap, Track, Thrive. Your diet decoded in a snap.</Text>
                </View>

                {/* 2. Hero Images */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80' }}
                        style={[styles.heroImage, { marginRight: 10 }]}
                    />
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80' }}
                        style={styles.heroImage}
                    />
                </View>

                {/* 3. Primary Call-to-Action Button */}
                <TouchableOpacity
                    style={styles.ctaButtonContainer}
                    onPress={() => {
                        navigation.navigate('Auth', { screen: 'PersonalDetails' });
                    }}
                >
                    <LinearGradient
                        colors={['#A8E063', '#56AB2F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.ctaText}>Get Started Free</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* 4. Alternative Sign-Up Section */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButton}>
                        {/* Placeholder Icon for Apple */}
                        <Text style={styles.socialButtonText}> Apple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        {/* Placeholder Icon for Google */}
                        <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>
                </View>

                {/* 5. Login Link */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
                        <Text style={styles.loginLink}>Log In</Text>
                    </TouchableOpacity>
                </View>

                {/* 6. Legal Disclaimer */}
                <View style={styles.legalContainer}>
                    <Text style={styles.legalText}>
                        By continuing, you agree to our
                        <Text style={styles.legalLink} onPress={() => alert('Terms of Service pressed')}> Terms of Service</Text> and
                        <Text style={styles.legalLink} onPress={() => alert('Privacy Policy pressed')}> Privacy Policy</Text>.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        marginTop: 20,
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    heroContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        width: '100%',
    },
    heroImage: {
        flex: 1,
        height: 180,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
    ctaButtonContainer: {
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 30,
    },
    gradientButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
        gap: 16,
    },
    socialButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    socialButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
    loginContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    loginText: {
        color: '#666',
        fontSize: 15,
    },
    loginLink: {
        color: '#56AB2F',
        fontWeight: '600',
        fontSize: 15,
    },
    legalContainer: {
        marginBottom: 10,
    },
    legalText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
    legalLink: {
        color: '#666',
        textDecorationLine: 'underline',
    },
});

export default WelcomeScreen;

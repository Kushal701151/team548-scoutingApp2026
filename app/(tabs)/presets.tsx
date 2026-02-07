import { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Switch } from "react-native";
import { Text, View } from "@/components/Themed";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
    const [name, setName] = useState("");
    const [teamNumber, setTeamNumber] = useState("");
    const [competitionCode, setCompetitionCode] = useState("");

    // Load saved data when app starts
    useEffect(() => {
        loadSettings();
    }, []);

    // Load all settings from storage
    const loadSettings = async () => {
        try {
            const savedName = await AsyncStorage.getItem('name');
            const savedTeamNumber = await AsyncStorage.getItem('teamNumber');
            const savedCompetitionCode = await AsyncStorage.getItem('competitionCode');

            if (savedName !== null) setName(savedName);
            if (savedTeamNumber !== null) setTeamNumber(savedTeamNumber);
            if (savedCompetitionCode !== null) setCompetitionCode(savedCompetitionCode);

        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    // Save all settings to storage
    const saveSettings = async () => {
        try {
            await AsyncStorage.setItem('name', name);
            await AsyncStorage.setItem('teamNumber', teamNumber);
            await AsyncStorage.setItem('competitionCode', competitionCode);

            setCompetitionCode(competitionCode);
            Alert.alert('Success', 'Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="px-6 pt-16 pb-10 bg-black">

                {/* Header Section */}
                <View className="mb-10 bg-black">
                    <Text className="text-4xl font-black text-cyan-500 tracking-tighter">
                        Presets
                    </Text>
                </View>

                {/* Form Section */}
                <View className="space-y-6 bg-black">

                    {/* Name Input */}
                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Full Name
                        </Text>
                        <TextInput
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                            placeholder="Enter your name"
                            placeholderTextColor="#4b5563"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Team Number Input */}
                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Team Number
                        </Text>
                        <TextInput
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                            placeholder="e.g. 254"
                            placeholderTextColor="#4b5563"
                            value={teamNumber}
                            onChangeText={setTeamNumber}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Competition Code Input */}
                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Competition Code
                        </Text>
                        <TextInput
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                            placeholder="Enter event key"
                            placeholderTextColor="#4b5563"
                            value={competitionCode}
                            onChangeText={setCompetitionCode}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={saveSettings}
                    activeOpacity={0.8}
                    className="bg-cyan-500 w-full py-5 rounded-2xl mt-12 shadow-lg shadow-cyan-500/40"
                >
                    <Text className="text-black text-center font-black text-xl uppercase tracking-tight">
                        Save Configuration
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// Cleaned up styles - mostly handled by NativeWind now
const styles = StyleSheet.create({
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
import { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from "react-native";
import { Text, View } from "@/components/Themed";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

export default function SettingsScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [teamNumber, setTeamNumber] = useState("");
    const [competitionCode, setCompetitionCode] = useState("");

    // Match Type states
    const [matchType, setMatchType] = useState('qm');
    const [matchTypeDropdownVisible, setMatchTypeDropdownVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Track original values to detect changes
    const [originalValues, setOriginalValues] = useState({
        name: "",
        teamNumber: "",
        competitionCode: "",
        matchType: 'qm'
    });

    // Match type options
    const matchTypeOptions = [
        { label: 'Qualification', value: 'qm' },
        { label: 'Playoff', value: 'sf' },
        { label: 'Final', value: 'f' }
    ];

    // Get label from match type value
    const getMatchTypeLabel = () => {
        return matchTypeOptions.find(option => option.value === matchType)?.label || 'Qualification';
    };


    const hasUnsavedChanges = useCallback(() => {
        if (!isLoaded) return false; // Don't warn before data is loaded

        const hasChanges = (
            name !== originalValues.name ||
            teamNumber !== originalValues.teamNumber ||
            competitionCode !== originalValues.competitionCode ||
            matchType !== originalValues.matchType
        );

        console.log('Checking unsaved changes:', hasChanges); // Debug log
        return hasChanges;
    }, [name, teamNumber, competitionCode, matchType, originalValues, isLoaded]);

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
            const savedMatchType = await AsyncStorage.getItem('matchType');

            if (savedName !== null) setName(savedName);
            if (savedTeamNumber !== null) setTeamNumber(savedTeamNumber);
            if (savedCompetitionCode !== null) setCompetitionCode(savedCompetitionCode);
            if (savedMatchType !== null) setMatchType(savedMatchType);

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
            await AsyncStorage.setItem('matchType', matchType);

            Alert.alert('Success', 'Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    // Select match type function
    const selectMatchType = (value: string) => {
        setMatchType(value);
        setMatchTypeDropdownVisible(false);
    };

    return (
        <ScrollView className="flex-1 bg-black">
            {/* Match Type Selection Modal */}
            <Modal animationType="slide" transparent={true} visible={matchTypeDropdownVisible}>
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-neutral-900 rounded-t-[40px] p-8 border-t-2 border-cyan-500/30">
                        <Text className="text-cyan-500 text-xs font-black uppercase tracking-widest mb-6 text-center">
                            Select Match Type
                        </Text>
                        {matchTypeOptions.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => selectMatchType(type.value)}
                                className={`p-5 rounded-2xl mb-3 border-2 ${
                                    matchType === type.value ? 'bg-cyan-500 border-cyan-500' : 'bg-black border-cyan-500/20'
                                }`}
                            >
                                <Text className={`text-center font-bold text-lg ${matchType === type.value ? 'text-black' : 'text-white'}`}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setMatchTypeDropdownVisible(false)}
                            className="mt-4 py-4 border-2 border-cyan-500 rounded-2xl bg-black"
                        >
                            <Text className="text-white text-center font-bold uppercase">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
                            placeholder="Enter a unique user id"
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
                            placeholder="e.g. 2025mimil"
                            placeholderTextColor="#4b5563"
                            value={competitionCode}
                            onChangeText={setCompetitionCode}
                        />
                    </View>

                    {/* Match Type Selector */}
                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Match Type
                        </Text>
                        <TouchableOpacity
                            onPress={() => setMatchTypeDropdownVisible(true)}
                            className="bg-neutral-900 border-2 border-cyan-500/20 rounded-2xl p-4"
                        >
                            <Text className="text-lg text-white font-medium">
                                {getMatchTypeLabel()}
                            </Text>
                        </TouchableOpacity>
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

const styles = StyleSheet.create({
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
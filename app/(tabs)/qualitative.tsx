import React, { useState, useEffect, SetStateAction} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, Modal} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { createClient } from '@supabase/supabase-js';
import NetInfo from '@react-native-community/netinfo';
import { useLocalSearchParams } from 'expo-router';
import FontAwesome from "@expo/vector-icons/FontAwesome";



const supabaseUrl = 'https://jwifgmdzmsdjpettsnaj.supabase.co'; // e.g., https://xxxxx.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);




export default function QualitativeScouting() {
    const [matchNumber, setMatchNumber] = useState('');
    const [position, setPosition] = useState('');
    const [teamNumber, setTeamNumber] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("Select");


    // Slider values
    const [Driving, setDriving] = useState(0);
    const [defense, setDefense] = useState(0);
    const [scoringAccuracy, setScoringAccuracy] = useState(0);
    const [intakeAbility, setIntakeAbility] = useState(0);

    // Chronometer
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [centiseconds, setCentiseconds] = useState(0);

    const [userTeamNumber, setUserTeamNumber] = useState("");
    const [userName, setUserName] = useState("");
    const [competitionCode, setCompetitionCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [pendingUploads, setPendingUploads] = useState(0);
    const params = useLocalSearchParams();

    const [matchType, setMatchType] = useState('qm');
    const [matchTypeLabel, setMatchTypeLabel] = useState('Select');
    const [matchTypeDropdownVisible, setMatchTypeDropdownVisible] = useState(false);

    const loadValuesFromStorage = async () => {
        try {
            const storedValue1 = await AsyncStorage.getItem('name'); // Replace 'key1' with your actual key
            const storedValue2 = await AsyncStorage.getItem('teamNumber'); // Replace 'key2' with your actual key

            setUserName(storedValue1 || '');
            setUserTeamNumber(storedValue2 || '');

        } catch (error) {
            console.error('Error loading values:', error);
        }
    };




    // Load competition code from settings on mount
    useEffect(() => {
        loadCompetitionCode();
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            loadCompetitionCode();
        }, [])
    );

    useEffect(() => {
        loadValuesFromStorage();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadValuesFromStorage();
        }, [])
    );


    useEffect(() => {
        loadMatchType();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadMatchType();
        }, [])
    );

    const loadMatchType = async () => {
        try {
            const savedMatchType = await AsyncStorage.getItem('matchType');
            const savedMatchTypeLabel = await AsyncStorage.getItem('matchTypeLabel');
            if (savedMatchType !== null) {
                setMatchType(savedMatchType);
            }
            if (savedMatchTypeLabel !== null) {
                setMatchTypeLabel(savedMatchTypeLabel);
            }
        } catch (error) {
            console.error('Error loading match type:', error);
        }
    };

    const getFullMatchNumber = () => {
        return `${matchType}${matchNumber}`;
    };

    const loadCompetitionCode = async () => {
        try {
            const savedCompetitionCode = await AsyncStorage.getItem('competitionCode');
            if (savedCompetitionCode !== null) {
                setCompetitionCode(savedCompetitionCode);
            }
        } catch (error) {
            console.error('Error loading competition code:', error);
        }
    };

    // Auto-fetch team when all info is present
    useEffect(() => {
        if (matchNumber && position && competitionCode) {
            fetchTeamNumber();
        }
    }, [matchNumber, position, competitionCode]);

    const fetchTeamNumber = async () => {
        setIsLoading(true);
        try {


            // The Blue Alliance API endpoint
            const apiUrl = `https://www.thebluealliance.com/api/v3/event/${competitionCode}/matches/simple`;

            console.log('Competition Code:', competitionCode);
            console.log('Match Number:', matchNumber);
            console.log('Position:', position);
            console.log('Full URL:', apiUrl);

            // Replace with your TBA auth key from https://www.thebluealliance.com/account
            const TBA_AUTH_KEY = '3TklPnjeCtdcjYFnv7axxHWx0DTUEwkUYgvgVJodaPZGj6KDJ8T4lE0inTcQ7PgO';

            console.log(`Fetching from: ${apiUrl}`);
            console.log(`Looking for match: ${matchNumber}, position: ${position}`);

            const response = await axios.get(apiUrl, {
                headers: {
                    'X-TBA-Auth-Key': TBA_AUTH_KEY
                },
                timeout: 10000 // 10 second timeout
            });

            console.log(`Found ${response.data.length} matches`);

            // Find the qualification match
            const match = response.data.find((m: any) => {
                const inputNum = parseInt(matchNumber);

                // Qualifications and Finals use match_number
                if (matchType === 'qm' || matchType === 'f') {
                    return m.comp_level === matchType && m.match_number === inputNum;
                }
                // Playoffs (sf) use input as set_number
                else if (matchType === 'sf') {
                    return m.comp_level === 'sf' && m.set_number === inputNum && m.match_number === 1;
                }
                return false;
            });


            if (match) {
                console.log('Match found:', match);
                let team = '';
                const alliances = match.alliances;

                // Map alliance position to team
                switch (position) {
                    case 'Blue1':
                        team = alliances.blue.team_keys[0]?.replace('frc', '') || '';
                        break;
                    case 'Blue2':
                        team = alliances.blue.team_keys[1]?.replace('frc', '') || '';
                        break;
                    case 'Blue3':
                        team = alliances.blue.team_keys[2]?.replace('frc', '') || '';
                        break;
                    case 'Red1':
                        team = alliances.red.team_keys[0]?.replace('frc', '') || '';
                        break;
                    case 'Red2':
                        team = alliances.red.team_keys[1]?.replace('frc', '') || '';
                        break;
                    case 'Red3':
                        team = alliances.red.team_keys[2]?.replace('frc', '') || '';
                        break;
                }

                if (team) {
                    console.log('Team found:', team);
                    setTeamNumber(team);
                } else {
                    Alert.alert('Not Found', 'Team not found for this match and position');
                }
            } else {
                Alert.alert('Not Found', `Match ${matchNumber} not found in event ${competitionCode}`);
            }
        } catch (error: any) {
            console.error('Error fetching team number:', error);

            // Detailed error handling
            if (error.code === 'ECONNABORTED') {
                Alert.alert('Timeout', 'Request timed out. Please check your internet connection.');
            } else if (error.response) {
                // Server responded with error
                const status = error.response.status;
                if (status === 401) {
                    Alert.alert('API Error', 'Invalid API key. Please check your TBA auth key.');
                } else if (status === 404) {
                    Alert.alert('Not Found', `Event code "${competitionCode}" not found. Please check your competition code in settings.`);
                } else {
                    Alert.alert('API Error', `Status: ${status}. ${error.response.data?.Error || 'Unknown error'}`);
                }
            } else if (error.request) {
                // Request made but no response
                Alert.alert('Network Error', 'No response from server. Check your internet connection.');
            } else {
                Alert.alert('Error', 'Failed to fetch team number. You can enter it manually.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateKey = () => {
        const key = `${competitionCode}-${getFullMatchNumber()}-${teamNumber}-${userName}-${userTeamNumber}`;
        return key;
    };

    const generateHKey = () => {
        const HKey = `${competitionCode}-${getFullMatchNumber()}-${teamNumber}`;
        return HKey;

    }
    const options = [
        {label: 'Blue 1', value: 'Blue1'},
        {label: 'Blue 2', value: 'Blue2'},
        {label: 'Blue 3', value: 'Blue3'},
        {label: 'Red 1', value: 'Red1'},
        {label: 'Red 2', value: 'Red2'},
        {label: 'Red 3', value: 'Red3'},
    ];
    const matchTypeOptions = [
        { label: 'Qual', value: 'qm' },
        { label: 'Semi', value: 'sf' },
        { label: 'Final', value: 'f' }
    ];

    const selectMatchType = (value: string, label: string) => {
        setMatchType(value);
        setMatchTypeLabel(label);
        setMatchTypeDropdownVisible(false);
    };

    const selectOption = (value: SetStateAction<string>, label: string) => {
        setPosition(value);
        setSelectedLabel(label);
        setDropdownVisible(false);
    };

    const getPositionLabel = () => {
        return options.find(p => p.value === position)?.label || 'Select ▼';
    };

    // Chronometer logic
    // Update the chronometer logic
    useEffect(() => {
        let interval: string | number | NodeJS.Timeout | undefined;
        if (isRunning) {
            interval = setInterval(() => {
                setCentiseconds(prev => prev + 1);
            }, 10); // Update every 10ms (centiseconds)
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setCentiseconds(0);
        setIsRunning(false);
    };

// New format function for seconds.milliseconds
    const formatTime = (totalCentiseconds: number) => {
        const seconds = Math.floor(totalCentiseconds / 100);
        const milliseconds = (totalCentiseconds % 100).toString().padStart(2, '0');
        return `${seconds}.${milliseconds}`;
    };


    const concatenateData = () => {

        const data = {
            userTeamNumber: userTeamNumber || 0,
            matchNumber: getFullMatchNumber(),
            competitionCode: competitionCode || 0,
            teamNumber: teamNumber || 0,
            // Auto
            Driving: Driving || 0,
            Defense: defense || 0,
            ScoringAccuracy: scoringAccuracy || 0,
            IntakeAbility: intakeAbility || 0,
            ClimbTime: centiseconds || 0,
        };

        // Return just the values as an array
        return JSON.stringify(Object.values(data));
    };

// Function 2: Generate QR Code and show modal
    const generateQRCode = () => {
        setQrModalVisible(true);
    };

    // Check network status
    useEffect(() => {
        console.log('🌐 Setting up network listener WITH PREVIOUS STATE TRACKING');

        let previousState: boolean | null = null;

        const unsubscribe = NetInfo.addEventListener(state => {
            const currentConnected = state.isConnected ?? false;

            console.log('🌐 === NETWORK STATE CHANGE ===');
            console.log('🌐 Previous state:', previousState);
            console.log('🌐 Current state:', currentConnected);
            console.log('🌐 Connection type:', state.type);

            setIsOnline(currentConnected);

            // If we just came back online (previous was false, now is true)
            if (previousState === false && currentConnected === true) {
                console.log('🌐 ✅ CAME BACK ONLINE - Calling syncOfflineData()');
                syncOfflineData();
            } else {
                console.log('🌐 No sync (prev=' + previousState + ', curr=' + currentConnected + ')');
            }

            // Update previous state for next time
            previousState = currentConnected;
        });

        // Load pending uploads count on mount
        loadPendingCount();

        // ✅ Check if we should sync on startup
        const checkAndSyncOnStartup = async () => {
            console.log('🔄 Checking if sync needed on startup...');

            const netInfo = await NetInfo.fetch();
            console.log('🔄 Startup network status:', netInfo.isConnected);

            if (netInfo.isConnected) {
                const keys = await AsyncStorage.getAllKeys();
                const offlineKeys = keys.filter(key => key.startsWith('offline_scouting_'));

                console.log('🔄 Pending uploads on startup:', offlineKeys.length);

                if (offlineKeys.length > 0) {
                    console.log('🔄 ✅ WiFi connected and data pending - Syncing now!');
                    syncOfflineData();
                } else {
                    console.log('🔄 No pending data to sync');
                }
            } else {
                console.log('🔄 Not connected - will sync when WiFi connects');
            }
        };

        checkAndSyncOnStartup();

        return () => unsubscribe();
    }, []);

    // Load pending uploads count
    const loadPendingCount = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const offlineKeys = keys.filter(key => key.startsWith('offline_scouting_'));
            setPendingUploads(offlineKeys.length);
        } catch (error) {
            console.error('Error loading pending count:', error);
        }
    };

    // Save data offline
    const saveOffline = async (scoutingData: any) => {
        try {
            const timestamp = Date.now();
            const key = `offline_scouting_${timestamp}`;
            await AsyncStorage.setItem(key, JSON.stringify(scoutingData));
            await loadPendingCount();
            console.log('Data saved offline:', key);
            return true;
        } catch (error) {
            console.error('Error saving offline:', error);
            return false;
        }
    };

    // Sync all offline data
    const syncOfflineData = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const offlineKeys = keys.filter(key => key.startsWith('offline_scouting_'));

            if (offlineKeys.length === 0) {
                console.log('No offline data to sync');
                return;
            }

            console.log(`Syncing ${offlineKeys.length} offline records...`);
            let successCount = 0;
            let failCount = 0;

            for (const key of offlineKeys) {
                try {
                    const dataString = await AsyncStorage.getItem(key);
                    if (dataString) {
                        const scoutingData = JSON.parse(dataString);

                        // Try to send to Supabase
                        const {error} = await supabase
                            .from('Scouting Qualitative Data')
                            .upsert(scoutingData, {
                                onConflict: 'key'
                            });

                        if (!error) {
                            // Success - delete from offline storage
                            await AsyncStorage.removeItem(key);
                            successCount++;
                        } else {
                            console.error('Error syncing record:', error);
                            failCount++;
                        }
                    }
                } catch (error) {
                    console.error('Error processing offline record:', error);
                    failCount++;
                }
            }

            await loadPendingCount();

            if (successCount > 0) {
                Alert.alert(
                    'Sync Complete',
                    `Successfully synced ${successCount} record(s)${failCount > 0 ? `. ${failCount} failed.` : ''}`
                );
            }
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    };

    // Reset function - convert back to 0
    const resetForm = () => {
        // Position and Match Info
        setPosition("");
        setSelectedLabel("Select ");
        setMatchNumber("");
        setTeamNumber("");
        setDriving(0);
        setDefense(0);
        setScoringAccuracy(0);
        setIntakeAbility(0);
        setCentiseconds(0);

        console.log('Form reset successfully');
    };


    // Main send function with offline support
    const sendToSupabase = async (): Promise<boolean> => {
        // Validation
        if (!userName || userName.trim() === '') {
            Alert.alert('Missing Information', 'Please enter your name in settings');
            return false;
        }

        if (!userTeamNumber || userTeamNumber.trim() === '') {
            Alert.alert('Missing Information', 'Please enter your team number in settings');
            return false;
        }

        if (!teamNumber || teamNumber.trim() === '') {
            Alert.alert('Missing Information', 'Please select a team number');
            return false;
        }

        if (!matchNumber || matchNumber.trim() === '') {
            Alert.alert('Missing Information', 'Please enter a match number');
            return false;
        }

        if (!competitionCode || competitionCode.trim() === '') {
            Alert.alert('Missing Information', 'Please enter a competition code in settings');
            return false;
        }

        try {
            // Create unique ID
            const key = generateKey();
            const Hkey = generateHKey()
            const Scoutingdata = {
                key: key,
                Hkey: Hkey,
                competitionCode: competitionCode || 0,
                userTeamNumber: userTeamNumber || 0,
                userName: userName || 0,
                matchNumber: getFullMatchNumber(),
                teamNumber: teamNumber || 0,
                // Auto
                Driving: Driving || 0,
                Defense: defense || 0,
                ScoringAccuracy: scoringAccuracy || 0,
                IntakeAbility: intakeAbility || 0,
                ClimbTime: centiseconds || 0,
            };


            // Check if online
            const netInfo = await NetInfo.fetch();

            if (!netInfo.isConnected) {

                // Save offline
                const saved = await saveOffline(Scoutingdata);
                if (saved) {
                    resetForm()
                    Alert.alert(
                        'Saved Offline',
                        'No internet connection. Data saved locally and will sync when online.'
                    );
                    return true;
                } else {
                    Alert.alert('Error', 'Failed to save data offline');
                    return false;
                }
            }

            // Try to send to Supabase
            const {data, error} = await supabase
                .from('Scouting Qualitative Data')
                .upsert(Scoutingdata, {
                    onConflict: 'key'
                });

            if (error) {
                console.error('Supabase error:', error);
                resetForm()

                // Save offline as fallback
                const saved = await saveOffline(Scoutingdata);
                if (saved) {
                    Alert.alert(
                        'Saved Offline',
                        `Network error. Data saved locally and will sync later.\nError: ${error.message}`
                    );
                    return true;
                } else {
                    Alert.alert('Error', `Failed to save: ${error.message}`);
                    return false;
                }
            }

            Alert.alert('Success', 'Data sent to database!');
            resetForm()
            return true;

        } catch (error: any) {
            console.error('Error sending to Supabase:', error);
            const key = generateKey();
            const Hkey = generateHKey()
            const scoutingData = {
                key: key,
                Hkey: Hkey,
                competitionCode: competitionCode || 0,
                userTeamNumber: userTeamNumber || 0,
                userName: userName || 0,
                matchNumber: getFullMatchNumber(),
                teamNumber: teamNumber || 0,
                // Auto
                Driving: Driving || 0,
                Defense: defense || 0,
                ScoringAccuracy: scoringAccuracy || 0,
                IntakeAbility: intakeAbility || 0,
                ClimbTime: centiseconds || 0,
                created_at: new Date().toISOString(),
            };

            const saved = await saveOffline(scoutingData);
            if (saved) {
                resetForm()
                Alert.alert(
                    'Saved Offline',
                    'Error connecting to database. Data saved locally and will sync later.'
                );
                return true;
            } else {
                Alert.alert('Error', 'Failed to save data');
                return false;
            }
        }
    };
    useEffect(() => {
        console.log('1. useEffect triggered');
        console.log('2. params:', params);
        if (params.selectedData) {
            console.log('3. selectedData exists');
            const data = JSON.parse(params.selectedData as string);
            console.log('4. Parsed data:', data);
            handleSelectedData(data);
        }
    }, [params.selectedData]);

    const handleSelectedData = (data: any) => {
        console.log('6. populateFormWithData called');

        // --- MATCH NUMBER & TYPE CLEANING ---
        const rawMatch = data.matchNumber?.toString() || "";

        // 2. Extract only the numeric part for the text input (e.g., "sf10" -> "10")
        const numericOnly = rawMatch.replace(/[^0-9]/g, '');
        setMatchNumber(numericOnly);
        // -------------------------------------

        setTeamNumber(data.teamNumber?.toString() || "");

        // Sliders
        setDriving(data.Driving || 0);
        setDefense(data.Defense || 0);
        setScoringAccuracy(data.ScoringAccuracy || 0);
        setIntakeAbility(data.IntakeAbility || 0);

        // Climb time (centiseconds)
        setCentiseconds(data.ClimbTime || 0);

        console.log('Data loaded successfully');
    };

    return (
        <ScrollView className="flex-1 bg-black">
            {/* QR Code Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={qrModalVisible}
                onRequestClose={() => setQrModalVisible(false)}
            >
                <View className="flex-1 bg-black/95 justify-center items-center p-6">
                    <View className="bg-neutral-900 border-2 border-blue-500/20 rounded-[40px] p-8 items-center w-full max-w-sm">
                        <Text className="text-blue-500 text-[10px] font-black uppercase tracking-[4px] mb-6">
                            Data Transfer
                        </Text>
                        <View className="bg-white p-6 rounded-[32px] mb-8">
                            <QRCode
                                value={concatenateData()}
                                size={220}
                                backgroundColor="white"
                                color="black"
                            />
                        </View>
                        <TouchableOpacity
                            className="w-full bg-blue-600 py-5 rounded-2xl"
                            onPress={() => setQrModalVisible(false)}
                        >
                            <Text className="text-white text-center font-black uppercase tracking-widest">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Position Selection Modal */}
            <Modal animationType="slide" transparent={true} visible={dropdownVisible}>
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-neutral-900 rounded-t-[40px] p-8 border-t-2 border-blue-500/30">
                        <Text className="text-blue-500 text-xs font-black uppercase tracking-widest mb-6 text-center">
                            Select Alliance Position
                        </Text>
                        {options.map((pos) => (
                            <TouchableOpacity
                                key={pos.value}
                                onPress={() => selectOption(pos.value, pos.label)}
                                className={`p-5 rounded-2xl mb-3 border-2 ${
                                    position === pos.value ? 'bg-blue-500 border-blue-500' : 'bg-black border-blue-500/20'
                                }`}
                            >
                                <Text className={`text-center font-bold text-lg ${position === pos.value ? 'text-black' : 'text-white'}`}>
                                    {pos.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setDropdownVisible(false)}
                            className="mt-4 py-4 border-2 border-blue-500 rounded-2xl bg-black"
                        >
                            <Text className="text-white text-center font-bold uppercase">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            <View className="px-6 pt-16 pb-10">
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-4xl font-black text-blue-500 tracking-tighter">
                        Qualitative
                    </Text>
                </View>

                {/* Top Row: Match # | Position | Team # */}
                <View className="flex-row gap-2 mb-8 items-end">
                    {/* Match Number */}
                    <View className="flex-1">
                        <Text className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-2 ml-1">Match #</Text>
                        <TextInput
                            className="bg-neutral-900 border-2 border-blue-500/20 focus:border-blue-500 rounded-2xl p-4 text-white font-black text-xl text-center h-16"
                            placeholder="00"
                            placeholderTextColor="#4b5563"
                            value={matchNumber}
                            onChangeText={setMatchNumber}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Position Selector */}
                    <View className="flex-[1.5]">
                        <Text className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-2 ml-1">Position</Text>
                        <TouchableOpacity
                            onPress={() => setDropdownVisible(true)}
                            className="bg-neutral-900 border-2 border-blue-500/20 rounded-2xl p-4 flex-row justify-between items-center h-16"
                        >
                            <Text className="text-white font-black text-sm uppercase">
                                {selectedLabel || "SEL"}
                            </Text>
                            <FontAwesome name="chevron-down" size={10} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>


                    {/* Team Number */}
                    <View className="flex-[1.2]">
                        <Text className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-2 ml-1">Team #</Text>
                        <TextInput
                            className="bg-neutral-900 border-2 border-blue-500/20 focus:border-blue-500 rounded-2xl p-4 text-white font-black text-xl text-center h-16"
                            placeholder="0000"
                            placeholderTextColor="#4b5563"
                            value={teamNumber}
                            onChangeText={setTeamNumber}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Sliders - Compact Layout */}
                <View className="space-y-3 mb-8">
                    {[
                        { label: 'Driving', val: Driving, setter: setDriving },
                        { label: 'Defense', val: defense, setter: setDefense },
                        { label: 'Accuracy', val: scoringAccuracy, setter: setScoringAccuracy },
                        { label: 'Intake', val: intakeAbility, setter: setIntakeAbility },
                    ].map((item, index) => (
                        <View key={index} className="bg-neutral-900/50 px-5 py-3 rounded-2xl border border-white/5">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-blue-500 font-black uppercase tracking-widest text-[10px]">{item.label}</Text>
                                <Text className="text-blue-400 font-black text-sm">{item.val}</Text>
                            </View>
                            <Slider
                                minimumValue={0}
                                maximumValue={5}
                                step={1}
                                value={item.val}
                                onValueChange={item.setter}
                                minimumTrackTintColor="#3b82f6"
                                maximumTrackTintColor="#1f2937"
                                thumbTintColor="#3b82f6"
                                style={{ height: 30 }}
                            />
                        </View>
                    ))}
                </View>

                {/* Climb Time */}
                <View className="mb-8">
                    <Text className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">Climb Timer</Text>
                    <View className="bg-neutral-900 border-2 border-blue-500/10 rounded-[32px] p-6 items-center">
                        <Text className="text-white text-5xl font-black tracking-tighter mb-4">
                            {formatTime(centiseconds)}
                        </Text>
                        <View className="flex-row gap-3 w-full">
                            <TouchableOpacity
                                onPress={toggleTimer}
                                className={`flex-1 py-4 rounded-xl items-center ${isRunning ? 'bg-red-500/20 border-2 border-red-500' : 'bg-blue-500'}`}
                            >
                                <Text className={`font-black uppercase tracking-widest text-xs ${isRunning ? 'text-red-500' : 'text-black'}`}>
                                    {isRunning ? 'Stop' : 'Start'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={resetTimer}
                                className="bg-neutral-800 py-4 rounded-xl items-center px-6"
                            >
                                <Text className="text-neutral-400 font-black uppercase tracking-widest text-xs">Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Final Action Buttons */}
                <View className="flex-row gap-4">
                    <TouchableOpacity
                        onPress={generateQRCode}
                        className="flex-1 bg-neutral-900 border-2 border-blue-500/40 py-4 rounded-xl"
                    >
                        <Text className="text-blue-500 font-black text-center uppercase tracking-widest text-xs">
                            QR Code
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={sendToSupabase}
                        className="flex-1 bg-blue-600 py-4 rounded-xl shadow-lg shadow-blue-500/40"
                    >
                        <Text className="text-white font-black text-center uppercase tracking-widest text-xs">
                            Submit
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
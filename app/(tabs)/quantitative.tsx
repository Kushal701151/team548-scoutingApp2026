import { StyleSheet } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useState } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView } from "react-native-gesture-handler";
import { TextInput} from "react-native";
import { TouchableOpacity} from "react-native";
import { Modal } from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import React from "react";
import QRCode from 'react-native-qrcode-svg';
import { createClient } from '@supabase/supabase-js';
import NetInfo from '@react-native-community/netinfo';
import { useLocalSearchParams } from 'expo-router';
import FontAwesome from "@expo/vector-icons/FontAwesome";


const supabaseUrl = 'https://jwifgmdzmsdjpettsnaj.supabase.co'; // e.g., https://xxxxx.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function TabOneScreen() {

    const [matchNumber, setMatchNumber] = useState("");
    const [Position, setPosition] = useState("");
    const [teamNumber, setTeamNumber] = useState("");
    const [selectedLabel, setSelectedLabel] = useState("Select");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [competitionCode, setCompetitionCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    //Auto
    const [AutoFuel, setAutoFuel] = useState(0);
    const [AutoPass, setAutoPass] = useState(0);
    const [AutoBump, setAutoBump] = useState(0);
    const [AutoTrench, setAutoTrench] = useState(0);
    const [AutoClimb, setAutoClimb] = useState(0);

    //Teleop
    const [TeleopFuel, setTeleopFuel] = useState(0);
    const [TeleopPass, setTeleopPass] = useState(0);
    const [TeleopBump, setTeleopBump] = useState(0);
    const [TeleopTrench, setTeleopTrench] = useState(0);
    const [EndgameLevel, setEndgameLevel] = useState(0);
    const [EndgamePosition, setEndgamePosition] = useState(0);

    //Timeshare
    const [shift1Passing, setShift1Passing] = useState(0);
    const [shift1Defense, setShift1Defense] = useState(0);
    const [shift1Scoring, setShift1Scoring] = useState(0);
    const [shift1Cycling, setShift1Cycling] = useState(0);

    const [shift2Passing, setShift2Passing] = useState(0);
    const [shift2Defense, setShift2Defense] = useState(0);
    const [shift2Scoring, setShift2Scoring] = useState(0);
    const [shift2Cycling, setShift2Cycling] = useState(0);

    const [shift3Passing, setShift3Passing] = useState(0);
    const [shift3Defense, setShift3Defense] = useState(0);
    const [shift3Scoring, setShift3Scoring] = useState(0);
    const [shift3Cycling, setShift3Cycling] = useState(0);

    const [shift4Passing, setShift4Passing] = useState(0);
    const [shift4Defense, setShift4Defense] = useState(0);
    const [shift4Scoring, setShift4Scoring] = useState(0);
    const [shift4Cycling, setShift4Cycling] = useState(0);

    const [endgamePassing, setEndgamePassing] = useState(0);
    const [endgameDefense, setEndgameDefense] = useState(0);
    const [endgameScoring, setEndgameScoring] = useState(0);
    const [endgameCycling, setEndgameCycling] = useState(0);

    //misc
    const [comments, setComments] = useState("");
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [userTeamNumber, setUserTeamNumber] = useState("");
    const [userName, setUserName] = useState("");
    const [isOnline, setIsOnline] = useState(true);
    const [pendingUploads, setPendingUploads] = useState(0);
    const params = useLocalSearchParams();

    useEffect(() => {
        console.log('1. useEffect triggered');
        console.log('2. params:', params);
        if (params.selectedData) {
            console.log('3. selectedData exists');
            const data = JSON.parse(params.selectedData as string);
            console.log('4. Parsed data:', data);
            console.log('5. teamNumber from data:', data.teamNumber);
            handleSelectedData(data);
        }
    }, [params.selectedData]);
    const handleSelectedData = (data: any) => {
        // Extract competition code from HKey if needed (format: "2025joh-4-1860")
        console.log('6. populateFormWithData called');
        console.log('7. Setting teamNumber to:', data.teamNumber);
        const competitionFromHKey = data.HKey?.split('-')[0] || '';

        // Set all form values
        setMatchNumber(data.matchNumber?.toString() || "");
        setTeamNumber(data.teamNumber?.toString() || "");

        // Auto
        setAutoFuel(data.AutoFuel || 0);
        setAutoPass(data.AutoPass || 0);
        setAutoBump(data.AutoBump || 0);
        setAutoTrench(data.AutoTrench || 0);
        setAutoClimb(data.AutoClimb || 0);

        // Teleop
        setTeleopFuel(data.TeleopFuel || 0);
        setTeleopPass(data.TeleopPass || 0);
        setTeleopBump(data.TeleopBump || 0);
        setTeleopTrench(data.TeleopTrench || 0);
        setEndgameLevel(data.EndgameLevel || 0);
        setEndgamePosition(data.EndgamePosition || 0);

        // Timeshare - Shift 1
        setShift1Passing(data.shift1Passing || 0);
        setShift1Defense(data.shift1Defense || 0);
        setShift1Scoring(data.shift1Scoring || 0);
        setShift1Cycling(data.shift1Cycling || 0);

        // Timeshare - Shift 2
        setShift2Passing(data.shift2Passing || 0);
        setShift2Defense(data.shift2Defense || 0);
        setShift2Scoring(data.shift2Scoring || 0);
        setShift2Cycling(data.shift2Cycling || 0);

        // Timeshare - Shift 3
        setShift3Passing(data.shift3Passing || 0);
        setShift3Defense(data.shift3Defense || 0);
        setShift3Scoring(data.shift3Scoring || 0);
        setShift3Cycling(data.shift3Cycling || 0);

        // Timeshare - Shift 4
        setShift4Passing(data.shift4Passing || 0);
        setShift4Defense(data.shift4Defense || 0);
        setShift4Scoring(data.shift4Scoring || 0);
        setShift4Cycling(data.shift4Cycling || 0);

        // Endgame
        setEndgamePassing(data.endgamePassing || 0);
        setEndgameDefense(data.endgameDefense || 0);
        setEndgameScoring(data.endgameScoring || 0);
        setEndgameCycling(data.endgameCycling || 0);

        // Misc
        setComments(data.comments || '');
        console.log('8. After setState');

    };

    const CheckboxCell = ({ value, onToggle }: { value: number; onToggle: () => void }) => (
        <TouchableOpacity
            onPress={onToggle}
            className="flex-1 p-2 items-center justify-center bg-gray-800"
        >
            <View className={`w-8 h-8 border-2 rounded ${value === 1 ? 'bg-blue-500 border-blue-500' : 'border-gray-600 bg-white'} items-center justify-center`}>
                {value === 1 && (
                    <Text className="text-white font-bold text-lg">✓</Text>
                )}
            </View>
        </TouchableOpacity>
    );


    const updateCounter = (amount: number, counter: React.Dispatch<React.SetStateAction<number>>) => {
        counter(prevValue => prevValue + amount);
    };

    const options = [
        { label: "Blue 1", value: "Blue1" },
        { label: "Blue 2", value: "Blue2" },
        { label: "Blue 3", value: "Blue3" },
        { label: "Red 1", value: "Red1" },
        { label: "Red 2", value: "Red2" },
        { label: "Red 3", value: "Red3" },
    ];

    const selectOption = (value: string, label: string) => {
        setPosition(value);
        setSelectedLabel(label);
        setDropdownVisible(false);
    };

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
        if (matchNumber && Position && competitionCode) {
            fetchTeamNumber();
        }
    }, [matchNumber, Position, competitionCode]);

    const fetchTeamNumber = async () => {
        setIsLoading(true);
        try {


            // The Blue Alliance API endpoint
            const apiUrl = `https://www.thebluealliance.com/api/v3/event/${competitionCode}/matches/simple`;

            // Replace with your TBA auth key from https://www.thebluealliance.com/account
            const TBA_AUTH_KEY = '3TklPnjeCtdcjYFnv7axxHWx0DTUEwkUYgvgVJodaPZGj6KDJ8T4lE0inTcQ7PgO';

            console.log(`Fetching from: ${apiUrl}`);
            console.log(`Looking for match: ${matchNumber}, position: ${Position}`);

            const response = await axios.get(apiUrl, {
                headers: {
                    'X-TBA-Auth-Key': TBA_AUTH_KEY
                },
                timeout: 10000 // 10 second timeout
            });

            console.log(`Found ${response.data.length} matches`);

            // Find the qualification match
            const match = response.data.find(
                (m: any) => m.comp_level === 'qm' && m.match_number === parseInt(matchNumber)
            );

            if (match) {
                console.log('Match found:', match);
                let team = '';
                const alliances = match.alliances;

                // Map alliance position to team
                switch (Position) {
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
        const key = `${competitionCode}-${matchNumber}-${teamNumber}-${userName}-${userTeamNumber}`;
        return key;
    };

    const generateHKey=()=>{
        const HKey = `${competitionCode}-${matchNumber}-${teamNumber}`;
        return HKey;

    }

    // Function 1: Concatenate all data into a string
    const concatenateData = () => {
        const key = generateKey();
        const Hkey = generateHKey()
        const data = {
            key: key,
            Hkey: Hkey,
            competitionCode: competitionCode || 0,
            userTeamNumber: userTeamNumber || 0,
            userName: userName || 0,
            matchNumber: matchNumber || 0,
            teamNumber: teamNumber || 0,
            // Auto
            AutoFuel: AutoFuel || 0,
            AutoPass: AutoPass || 0,
            AutoBump: AutoBump || 0,
            AutoTrench: AutoTrench || 0,
            AutoClimb: AutoClimb || 0,
            // Teleop
            TeleopFuel: TeleopFuel || 0,
            TeleopPass: TeleopPass || 0,
            TeleopBump: TeleopBump || 0,
            TeleopTrench: TeleopTrench || 0,
            EndgameLevel: EndgameLevel || 0,
            EndgamePosition: EndgamePosition || 0,
            // Timeshare - Shift 1
            shift1Passing: shift1Passing || 0,
            shift1Defense: shift1Defense || 0,
            shift1Scoring: shift1Scoring || 0,
            shift1Cycling: shift1Cycling || 0,
            // Timeshare - Shift 2
            shift2Passing: shift2Passing || 0,
            shift2Defense: shift2Defense || 0,
            shift2Scoring: shift2Scoring || 0,
            shift2Cycling: shift2Cycling || 0,
            // Timeshare - Shift 3
            shift3Passing: shift3Passing || 0,
            shift3Defense: shift3Defense || 0,
            shift3Scoring: shift3Scoring || 0,
            shift3Cycling: shift3Cycling || 0,
            // Timeshare - Shift 4
            shift4Passing: shift4Passing || 0,
            shift4Defense: shift4Defense || 0,
            shift4Scoring: shift4Scoring || 0,
            shift4Cycling: shift4Cycling || 0,
            // Endgame
            endgamePassing: endgamePassing || 0,
            endgameDefense: endgameDefense || 0,
            endgameScoring: endgameScoring || 0,
            endgameCycling: endgameCycling || 0,
            // Misc
            comments: comments || 0,
        };

        // Return just the values as an array
        return JSON.stringify(Object.values(data));
    };

// Function 2: Generate QR Code and show modal
    const generateQRCode = () => {
        setQrModalVisible(true);
    };



    // Check network status
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

        return () => unsubscribe();
    }, []);

    // Load pending uploads count
    const loadPendingCount = async () => {
        console.log('📊 Loading pending count...');

        try {
            const keys = await AsyncStorage.getAllKeys();
            console.log('📊 All keys in storage:', keys);

            const offlineKeys = keys.filter(key => key.startsWith('offline_scouting_'));
            console.log('📊 Offline keys:', offlineKeys);
            console.log('📊 Pending count:', offlineKeys.length);

            setPendingUploads(offlineKeys.length);
        } catch (error) {
            console.error('Error loading pending count:', error);
        }
    };

    // Save data offline
    const saveOffline = async (scoutingData: any) => {
        console.log('💾 === SAVE OFFLINE START ===');
        console.log('💾 Received data:', JSON.stringify(scoutingData).substring(0, 200) + '...');
        try {
            const timestamp = Date.now();
            const key = `offline_scouting_${timestamp}`;

            console.log('💾 Saving with key:', key);

            await AsyncStorage.setItem(key, JSON.stringify(scoutingData));

            console.log('💾 ✅ Save successful');

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
        console.log('🔄 ========== SYNC START ==========');

        try {
            const keys = await AsyncStorage.getAllKeys();
            console.log('🔄 All storage keys:', keys);

            const offlineKeys = keys.filter(key => key.startsWith('offline_scouting_'));
            console.log('🔄 Offline keys to sync:', offlineKeys);

            if (offlineKeys.length === 0) {

                console.log('No offline data to sync');
                return;
            }


            console.log(`Syncing ${offlineKeys.length} offline records...`);
            let successCount = 0;
            let failCount = 0;

            for (const key of offlineKeys) {
                console.log(`🔄 --- Processing: ${key} ---`);

                try {
                    const dataString = await AsyncStorage.getItem(key);
                    console.log(`🔄 Retrieved: ${dataString ? 'YES' : 'NO'}`);

                    if (dataString) {
                        const scoutingData = JSON.parse(dataString);
                        console.log('🔄 Parsed data, key:', scoutingData.key);

                        // Try to send to Supabase
                        console.log('🔄 Sending to Supabase...');
                        const { error } = await supabase
                            .from('Scouting Raw Data')
                            .upsert(scoutingData, {
                                onConflict: 'key'
                            });

                        if (!error) {
                            console.log(`🔄 ✅ Success for ${key}`);
                            // Success - delete from offline storage
                            await AsyncStorage.removeItem(key);
                            console.log(`🔄 🗑️ Removed from storage`);
                            successCount++;
                        } else {
                            console.error(`🔄 ❌ Supabase error:`, error);
                            console.error(`🔄 ❌ Error details:`, JSON.stringify(error));
                            failCount++;
                        }
                    }
                } catch (error) {
                    console.error(`🔄 ❌ Error processing ${key}:`, error);
                    failCount++;
                }
            }

            console.log(`🔄 ========== SYNC END: ${successCount} success, ${failCount} fail ==========`);


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

        // Auto Phase
        setAutoFuel(0);
        setAutoPass(0);
        setAutoBump(0);
        setAutoTrench(0);
        setAutoClimb(0);  // ← Reset to 0 instead of false

        // Teleop Phase
        setTeleopFuel(0);
        setTeleopPass(0);
        setTeleopBump(0);
        setTeleopTrench(0);

        // Endgame
        setEndgameLevel(0);
        setEndgamePosition(0);

        // Timeshare - Shift 1 (all 0 instead of false)
        setShift1Passing(0);
        setShift1Defense(0);
        setShift1Scoring(0);
        setShift1Cycling(0);

        // Timeshare - Shift 2
        setShift2Passing(0);
        setShift2Defense(0);
        setShift2Scoring(0);
        setShift2Cycling(0);

        // Timeshare - Shift 3
        setShift3Passing(0);
        setShift3Defense(0);
        setShift3Scoring(0);
        setShift3Cycling(0);

        // Timeshare - Shift 4
        setShift4Passing(0);
        setShift4Defense(0);
        setShift4Scoring(0);
        setShift4Cycling(0);

        // Endgame Timeshare
        setEndgamePassing(0);
        setEndgameDefense(0);
        setEndgameScoring(0);
        setEndgameCycling(0);

        // Misc
        setComments("");

        console.log('Form reset successfully');
    };


    // Main send function with offline support
    const sendToSupabase = async (): Promise<boolean> => {

        console.log('========== 📤 SEND START ==========');
        console.log('userName:', userName);
        console.log('matchNumber:', matchNumber);
        console.log('teamNumber:', teamNumber);
        console.log('competitionCode:', competitionCode);

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

        console.log('✅ Validation passed');



        try {
            // Create unique ID
            const key = generateKey();
            const Hkey = generateHKey()
            // Prepare data
            const Scoutingdata = {
                key: key || '',
                HKey: Hkey,
                competitionCode: competitionCode || 0,
                userTeamNumber: userTeamNumber || 0,
                userName: userName || '',
                matchNumber: matchNumber || 0,
                teamNumber: teamNumber || 0,
                // Auto
                AutoFuel: AutoFuel || 0,
                AutoPass: AutoPass || 0,
                AutoBump: AutoBump || 0,
                AutoTrench: AutoTrench || 0,
                AutoClimb: AutoClimb || 0,
                // Teleop
                TeleopFuel: TeleopFuel || 0,
                TeleopPass: TeleopPass || 0,
                TeleopBump: TeleopBump || 0,
                TeleopTrench: TeleopTrench || 0,
                EndgameLevel: EndgameLevel || 0,
                EndgamePosition: EndgamePosition || 0,
                // Timeshare - Shift 1
                shift1Passing: shift1Passing || 0,
                shift1Defense: shift1Defense || 0,
                shift1Scoring: shift1Scoring || 0,
                shift1Cycling: shift1Cycling || 0,
                // Timeshare - Shift 2
                shift2Passing: shift2Passing || 0,
                shift2Defense: shift2Defense || 0,
                shift2Scoring: shift2Scoring || 0,
                shift2Cycling: shift2Cycling || 0,
                // Timeshare - Shift 3
                shift3Passing: shift3Passing || 0,
                shift3Defense: shift3Defense || 0,
                shift3Scoring: shift3Scoring || 0,
                shift3Cycling: shift3Cycling || 0,
                // Timeshare - Shift 4
                shift4Passing: shift4Passing || 0,
                shift4Defense: shift4Defense || 0,
                shift4Scoring: shift4Scoring || 0,
                shift4Cycling: shift4Cycling || 0,
                // Endgame
                endgamePassing: endgamePassing || 0,
                endgameDefense: endgameDefense || 0,
                endgameScoring: endgameScoring || 0,
                endgameCycling: endgameCycling || 0,
                // Misc
                comments: comments || '',
            };

            console.log('📦 Scoutingdata created');
            console.log('📦 Key:', key);
            console.log('📦 Data sample:', {
                teamNumber: Scoutingdata.teamNumber,
                AutoFuel: Scoutingdata.AutoFuel,
                userName: Scoutingdata.userName
            });

            // Check if online
            const netInfo = await NetInfo.fetch();

            console.log('🌐 Network check:', {
                isConnected: netInfo.isConnected,
                type: netInfo.type
            });

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
            const { data, error } = await supabase
                .from('Scouting Raw Data')
                .upsert(Scoutingdata, {
                    onConflict: 'key'
                });

            if (error) {
                console.error('Supabase error:', error);

                // Save offline as fallback
                const saved = await saveOffline(Scoutingdata);
                if (saved) {
                    resetForm()
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
            const HKey = generateHKey()
            // Save offline as fallback
            const scoutingData = {
                key: key || '',
                Hkey: HKey || '',
                competitionCode: competitionCode || 0,
                userTeamNumber: userTeamNumber || 0,
                userName: userName || '',
                matchNumber: matchNumber || 0,
                teamNumber: teamNumber || 0,
                // Auto
                AutoFuel: AutoFuel || 0,
                AutoPass: AutoPass || 0,
                AutoBump: AutoBump || 0,
                AutoTrench: AutoTrench || 0,
                AutoClimb: AutoClimb || 0,
                // Teleop
                TeleopFuel: TeleopFuel || 0,
                TeleopPass: TeleopPass || 0,
                TeleopBump: TeleopBump || 0,
                TeleopTrench: TeleopTrench || 0,
                EndgameLevel: EndgameLevel || 0,
                EndgamePosition: EndgamePosition || 0,
                // Timeshare - Shift 1
                shift1Passing: shift1Passing || 0,
                shift1Defense: shift1Defense || 0,
                shift1Scoring: shift1Scoring || 0,
                shift1Cycling: shift1Cycling || 0,
                // Timeshare - Shift 2
                shift2Passing: shift2Passing || 0,
                shift2Defense: shift2Defense || 0,
                shift2Scoring: shift2Scoring || 0,
                shift2Cycling: shift2Cycling || 0,
                // Timeshare - Shift 3
                shift3Passing: shift3Passing || 0,
                shift3Defense: shift3Defense || 0,
                shift3Scoring: shift3Scoring || 0,
                shift3Cycling: shift3Cycling || 0,
                // Timeshare - Shift 4
                shift4Passing: shift4Passing || 0,
                shift4Defense: shift4Defense || 0,
                shift4Scoring: shift4Scoring || 0,
                shift4Cycling: shift4Cycling || 0,
                // Endgame
                endgamePassing: endgamePassing || 0,
                endgameDefense: endgameDefense || 0,
                endgameScoring: endgameScoring || 0,
                endgameCycling: endgameCycling || 0,
                // Misc
                comments: comments || '',
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
                                    Position === pos.value ? 'bg-blue-500 border-blue-500' : 'bg-black border-blue-500/20'
                                }`}
                            >
                                <Text className={`text-center font-bold text-lg ${Position === pos.value ? 'text-black' : 'text-white'}`}>
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

            <View className="px-6 pt-16 pb-10 bg-black">
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-4xl font-black text-blue-500 tracking-tighter bg-black">
                        Quantitative
                    </Text>
                </View>

                {/* Top Row: Match # | Position | Team # */}
                <View className="flex-row gap-2 mb-8 items-end bg-black">
                    {/* Match Number */}
                    <View className="flex-1 bg-black">
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
                    <View className="flex-[1.5] bg-black">
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
                    <View className="flex-[1.2] bg-black">
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

                {/* Autonomous Section */}
                <View className="mb-8 bg-black">
                    <Text className="text-blue-300 text-xl font-black uppercase tracking-tight mb-4">
                        Autonomous
                    </Text>

                    {/* Auto Fuel */}
                    <View className="bg-neutral-900/50 py-4 rounded-2xl border border-white/5 mb-3 bg-black">
                        <Text className="text-blue-300 font-black uppercase tracking-widest text-[10px] mb-3">Fuel</Text>
                        <View className="flex-row gap-2 bg-black">
                            <TouchableOpacity
                                onPress={() => updateCounter(-5, setAutoFuel)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">-5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(-1, setAutoFuel)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">-1</Text>
                            </TouchableOpacity>
                            <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                <Text className="text-black font-black text-center text-lg">{AutoFuel}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => updateCounter(1, setAutoFuel)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">+1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(5, setAutoFuel)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">+5</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Auto Passing */}
                    <View className="bg-neutral-900/50 py-4 rounded-2xl border border-white/5 mb-3 bg-black">
                        <Text className="text-blue-300 font-black uppercase tracking-widest text-[10px] mb-3">Passing</Text>
                        <View className="flex-row gap-2 bg-black">
                            <TouchableOpacity
                                onPress={() => updateCounter(-5, setAutoPass)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">-5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(-1, setAutoPass)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">-1</Text>
                            </TouchableOpacity>
                            <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                <Text className="text-black font-black text-center text-lg">{AutoPass}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => updateCounter(1, setAutoPass)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">+1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(5, setAutoPass)}
                                className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-300 font-black text-center text-sm">+5</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Auto Bump and Trench Row */}
                    <View className="flex-row gap-2 mb-2 bg-black">
                        {/* Bump */}
                        <View className="flex-1 bg-neutral-900/50 pr-1 py-4 rounded-2xl border border-white/5 bg-black">
                            <Text className="text-blue-300 font-black uppercase tracking-widest text-[10px] mb-3 text-center ">Bump</Text>
                            <View className="flex-row gap-2 bg-black">
                                <TouchableOpacity
                                    onPress={() => updateCounter(-1, setAutoBump)}
                                    className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-300 font-black text-center text-sm">-</Text>
                                </TouchableOpacity>
                                <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                    <Text className="text-black font-black text-center text-lg">{AutoBump}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => updateCounter(1, setAutoBump)}
                                    className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-300 font-black text-center text-sm">+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Trench */}
                        <View className="flex-1 bg-neutral-900/50 py-4 pl-1 rounded-2xl border border-white/5">
                            <Text className="text-blue-300 font-black uppercase tracking-widest text-[10px] mb-3 text-center">Trench</Text>
                            <View className="flex-row gap-2 bg-black">
                                <TouchableOpacity
                                    onPress={() => updateCounter(-1, setAutoTrench)}
                                    className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-300 font-black text-center text-sm">-</Text>
                                </TouchableOpacity>
                                <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                    <Text className="text-black font-black text-center text-lg">{AutoTrench}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => updateCounter(1, setAutoTrench)}
                                    className="bg-neutral-900 border-2 border-blue-300/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-300 font-black text-center text-sm">+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Auto Climb Checkbox */}
                    <TouchableOpacity
                        onPress={() => setAutoClimb(AutoClimb ? 0 : 1)}
                        className="bg-neutral-900/50 px-5 py-4 rounded-2xl border border-white/5 flex-row items-center justify-center"
                    >
                        <View className={`w-8 h-8 border-2 rounded-lg ${AutoClimb ? 'bg-blue-300 border-blue-300' : 'bg-black border-blue-300/40'} items-center justify-center`}>
                            {AutoClimb === 1 && (
                                <Text className="text-black font-black text-lg">✓</Text>
                            )}
                        </View>
                        <Text className="text-blue-300 font-black uppercase tracking-widest text-[10px] ml-4">
                            Auto Climb
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tele-Op Section */}
                <View className="mb-8 mt-2 bg-black">
                    <Text className="text-blue-500 text-xl font-black uppercase tracking-tight mb-4">
                        Tele-Op
                    </Text>

                    {/* Teleop Fuel */}
                    <View className="bg-neutral-900/50 py-4 rounded-2xl border border-white/5 mb-3 bg-black">
                        <Text className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-3">Fuel</Text>
                        <View className="flex-row gap-2 bg-black">
                            <TouchableOpacity
                                onPress={() => updateCounter(-5, setTeleopFuel)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">-5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(-1, setTeleopFuel)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">-1</Text>
                            </TouchableOpacity>
                            <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                <Text className="text-black font-black text-center text-lg">{TeleopFuel}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => updateCounter(1, setTeleopFuel)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">+1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(5, setTeleopFuel)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">+5</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Teleop Passing */}
                    <View className="bg-neutral-900/50 py-4 rounded-2xl border border-white/5 mb-3 bg-black">
                        <Text className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-3">Passing</Text>
                        <View className="flex-row gap-2 bg-black">
                            <TouchableOpacity
                                onPress={() => updateCounter(-5, setTeleopPass)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">-5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(-1, setTeleopPass)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">-1</Text>
                            </TouchableOpacity>
                            <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                <Text className="text-black font-black text-center text-lg">{TeleopPass}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => updateCounter(1, setTeleopPass)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">+1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateCounter(5, setTeleopPass)}
                                className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                            >
                                <Text className="text-blue-500 font-black text-center text-sm">+5</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Teleop Bump and Trench Row */}
                    <View className="flex-row gap-2 bg-black">
                        {/* Bump */}
                        <View className="flex-1 bg-neutral-900/50 pr-1 py-4 rounded-2xl border border-white/5">
                            <Text className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-3 text-center">Bump</Text>
                            <View className="flex-row gap-2 bg-black">
                                <TouchableOpacity
                                    onPress={() => updateCounter(-1, setTeleopBump)}
                                    className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-500 font-black text-center text-sm">-</Text>
                                </TouchableOpacity>
                                <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                    <Text className="text-black font-black text-center text-lg">{TeleopBump}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => updateCounter(1, setTeleopBump)}
                                    className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-500 font-black text-center text-sm">+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Trench */}
                        <View className="flex-1 bg-neutral-900/50 pl-1 py-4 rounded-2xl border border-white/5">
                            <Text className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-3 text-center">Trench</Text>
                            <View className="flex-row gap-2 bg-black">
                                <TouchableOpacity
                                    onPress={() => updateCounter(-1, setTeleopTrench)}
                                    className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-500 font-black text-center text-sm">-</Text>
                                </TouchableOpacity>
                                <View className="bg-white flex-1 py-3 rounded-xl justify-center">
                                    <Text className="text-black font-black text-center text-lg">{TeleopTrench}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => updateCounter(1, setTeleopTrench)}
                                    className="bg-neutral-900 border-2 border-blue-500/40 flex-1 py-3 rounded-xl"
                                >
                                    <Text className="text-blue-500 font-black text-center text-sm">+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Match Share Table */}
                <View className="mb-8 bg-black ">
                    <Text className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">Match Share</Text>
                    <View className="bg-neutral-900 border-2 border-blue-500/10 rounded-[32px] overflow-hidden">
                        {/* Header Row */}
                        <View className="flex-row bg-neutral-900 border-b border-white/5 ">
                            <View className="flex-1 p-3 border-r border-white/5 bg-neutral-900">
                                <Text className="text-white font-black text-center text-[10px] uppercase tracking-wider">Shift</Text>
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-neutral-900 py-3">
                                <Text className="text-white font-black text-center text-[10px] uppercase tracking-wider">Pass</Text>
                            </View>
                            <View className="flex-1  border-r border-white/5 bg-neutral-900 py-3">
                                <Text className="text-white font-black text-center text-[10px] uppercase tracking-wider">Def</Text>
                            </View>
                            <View className="flex-1  border-r border-white/5 bg-neutral-900 py-3">
                                <Text className="text-white font-black text-center text-[10px] uppercase tracking-wider">Score</Text>
                            </View>
                            <View className="flex-1  bg-neutral-900 py-3">
                                <Text className="text-white font-black text-center text-[10px] uppercase tracking-wider">Cycle</Text>
                            </View>
                        </View>

                        {/* Shift 1 */}
                        <View className="flex-row border-b border-white/5 bg-black">
                            <View className="flex-1 p-3 border-r border-white/5 justify-center bg-neutral-900">
                                <Text className="text-blue-400 font-black text-center text-xs">S1</Text>
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift1Passing} onToggle={() => setShift1Passing(shift1Passing === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift1Defense} onToggle={() => setShift1Defense(shift1Defense === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift1Scoring} onToggle={() => setShift1Scoring(shift1Scoring === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 bg-black">
                                <CheckboxCell value={shift1Cycling} onToggle={() => setShift1Cycling(shift1Cycling === 1 ? 0 : 1)} />
                            </View>
                        </View>

                        {/* Shift 2 */}
                        <View className="flex-row border-b border-white/5 bg-black">
                            <View className="flex-1 p-3 border-r border-white/5 justify-center bg-neutral-900">
                                <Text className="text-blue-400 font-black text-center text-xs">S2</Text>
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift2Passing} onToggle={() => setShift2Passing(shift2Passing === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift2Defense} onToggle={() => setShift2Defense(shift2Defense === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift2Scoring} onToggle={() => setShift2Scoring(shift2Scoring === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1">
                                <CheckboxCell value={shift2Cycling} onToggle={() => setShift2Cycling(shift2Cycling === 1 ? 0 : 1)} />
                            </View>
                        </View>

                        {/* Shift 3 */}
                        <View className="flex-row border-b border-white/5 bg-black">
                            <View className="flex-1 p-3 border-r border-white/5 justify-center bg-neutral-900">
                                <Text className="text-blue-400 font-black text-center text-xs">S3</Text>
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift3Passing} onToggle={() => setShift3Passing(shift3Passing === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift3Defense} onToggle={() => setShift3Defense(shift3Defense === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift3Scoring} onToggle={() => setShift3Scoring(shift3Scoring === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 bg-black">
                                <CheckboxCell value={shift3Cycling} onToggle={() => setShift3Cycling(shift3Cycling === 1 ? 0 : 1)} />
                            </View>
                        </View>

                        {/* Shift 4 */}
                        <View className="flex-row border-b border-white/5 bg-black">
                            <View className="flex-1 p-3 border-r border-white/5 justify-center bg-neutral-900">
                                <Text className="text-blue-400 font-black text-center text-xs">S4</Text>
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift4Passing} onToggle={() => setShift4Passing(shift4Passing === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift4Defense} onToggle={() => setShift4Defense(shift4Defense === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={shift4Scoring} onToggle={() => setShift4Scoring(shift4Scoring === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 bg-black">
                                <CheckboxCell value={shift4Cycling} onToggle={() => setShift4Cycling(shift4Cycling === 1 ? 0 : 1)} />
                            </View>
                        </View>

                        {/* Endgame */}
                        <View className="flex-row">
                            <View className="flex-1 p-3 border-r border-white/5 justify-center bg-neutral-900">
                                <Text className="text-blue-400 font-black text-center text-xs">End</Text>
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={endgamePassing} onToggle={() => setEndgamePassing(endgamePassing === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={endgameDefense} onToggle={() => setEndgameDefense(endgameDefense === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 border-r border-white/5 bg-black">
                                <CheckboxCell value={endgameScoring} onToggle={() => setEndgameScoring(endgameScoring === 1 ? 0 : 1)} />
                            </View>
                            <View className="flex-1 bg-black">
                                <CheckboxCell value={endgameCycling} onToggle={() => setEndgameCycling(endgameCycling === 1 ? 0 : 1)} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Endgame Level */}
                <View className="mb-8 bg-black">
                    <Text className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">Endgame Level</Text>
                    <View className="flex-row gap-2 bg-black">
                        <TouchableOpacity
                            onPress={() => setEndgameLevel(0)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgameLevel === 0 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgameLevel === 0 ? 'text-black' : 'text-white'
                            }`}>
                                Ground
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEndgameLevel(1)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgameLevel === 1 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgameLevel === 1 ? 'text-black' : 'text-white'
                            }`}>
                                Level 1
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEndgameLevel(2)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgameLevel === 2 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgameLevel === 2 ? 'text-black' : 'text-white'
                            }`}>
                                Level 2
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEndgameLevel(3)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgameLevel === 3 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgameLevel === 3 ? 'text-black' : 'text-white'
                            }`}>
                                Level 3
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Climb Position */}
                <View className="mb-8 bg-black">
                    <Text className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">Climb Position</Text>
                    <View className="flex-row gap-2 mb-2 bg-black">
                        <TouchableOpacity
                            onPress={() => setEndgamePosition(0)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgamePosition === 0 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgamePosition === 0 ? 'text-black' : 'text-white'
                            }`}>
                                N/A
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEndgamePosition(1)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgamePosition === 1 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgamePosition === 1 ? 'text-black' : 'text-white'
                            }`}>
                                Center
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEndgamePosition(2)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgamePosition === 2 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgamePosition === 2 ? 'text-black' : 'text-white'
                            }`}>
                                Left
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-2 bg-black">
                        <TouchableOpacity
                            onPress={() => setEndgamePosition(3)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgamePosition === 3 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgamePosition === 3 ? 'text-black' : 'text-white'
                            }`}>
                                Right
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEndgamePosition(4)}
                            className={`flex-1 py-4 rounded-xl border-2 ${
                                EndgamePosition === 4 ? 'bg-blue-500 border-blue-500' : 'bg-neutral-900 border-blue-500/20'
                            }`}
                        >
                            <Text className={`text-center font-black text-xs uppercase ${
                                EndgamePosition === 4 ? 'text-black' : 'text-white'
                            }`}>
                                Back
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Comments */}
                <View className="mb-8 bg-black">
                    <Text className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">Comments</Text>
                    <View className="bg-neutral-900 border-2 border-blue-500/10 rounded-[32px] p-6">
                        <TextInput
                            className="text-white text-base min-h-[80px]"
                            placeholder="Enter comments (max 100 characters)"
                            placeholderTextColor="#4b5563"
                            value={comments}
                            onChangeText={setComments}
                            maxLength={100}
                            multiline
                            numberOfLines={3}
                        />
                        <Text className="text-neutral-500 text-xs mt-2 text-right">
                            {comments.length}/100
                        </Text>
                    </View>
                </View>

                {/* Final Action Buttons */}
                <View className="flex-row gap-4 bg-black">
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

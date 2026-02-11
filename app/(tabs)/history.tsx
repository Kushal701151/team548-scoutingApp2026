import React, {SetStateAction, useEffect, useState} from 'react';
import {View, Text, TextInput, ScrollView, TouchableOpacity, Modal, Alert} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect} from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import axios from "axios";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwifgmdzmsdjpettsnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HistoryScreen() {
    const [competition, setCompetition] = useState('');
    const [matchNumber, setMatchNumber] = useState('');
    const [position, setPosition] = useState('');
    const [teamNumber, setTeamNumber] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [qnhkeyModalVisible, setqnHkeyModalVisible] = useState(false);
    const [qlhkeyModalVisible, setqlHkeyModalVisible] = useState(false);

    const [selectedRowData, setSelectedRowData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userTeamNumber, setUserTeamNumber] = useState("");
    const [userName, setUserName] = useState("");
    const [hkeyResults, setHkeyResults] = useState<any[]>([]);
    const navigation = useNavigation();

    const positions = [
        {label: 'Blue 1', value: 'Blue1'},
        {label: 'Blue 2', value: 'Blue2'},
        {label: 'Blue 3', value: 'Blue3'},
        {label: 'Red 1', value: 'Red1'},
        {label: 'Red 2', value: 'Red2'},
        {label: 'Red 3', value: 'Red3'},
    ];

    const selectPosition = (value: SetStateAction<string>) => {
        setPosition(value);
        setModalVisible(false);
    };

    const getFullMatchNumber = () => {
        return `${matchType}${matchNumber}`;
    };

    // Match Type states
    const [matchType, setMatchType] = useState('qm');
    const [matchTypeDropdownVisible, setMatchTypeDropdownVisible] = useState(false);

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

    const selectMatchType = (value: string) => {
        setMatchType(value);
        setMatchTypeDropdownVisible(false);
    };

    const getPositionLabel = () => {
        return positions.find(p => p.value === position)?.label || 'SELECT';
    };

    const loadValuesFromStorage = async () => {
        try {
            const storedValue1 = await AsyncStorage.getItem('name');
            const storedValue2 = await AsyncStorage.getItem('teamNumber');
            setUserName(storedValue1 || '');
            setUserTeamNumber(storedValue2 || '');
        } catch (error) {
            console.error('Error loading values:', error);
        }
    };

    useEffect(() => {
        if (matchNumber && position && competition) {
            fetchTeamNumber();
        }
    }, [matchNumber, position, competition, matchType]);

    const fetchTeamNumber = async () => {
        if (!matchNumber || !position || !competition) return; // Guard clause
        setIsLoading(true);
        try {
            const apiUrl = `https://www.thebluealliance.com/api/v3/event/${competition}/matches/simple`;
            const TBA_AUTH_KEY = '3TklPnjeCtdcjYFnv7axxHWx0DTUEwkUYgvgVJodaPZGj6KDJ8T4lE0inTcQ7PgO';

            const response = await axios.get(apiUrl, {
                headers: { 'X-TBA-Auth-Key': TBA_AUTH_KEY },
                timeout: 10000
            });

            const inputNum = parseInt(matchNumber);

            // Updated Match Finding Logic
            const match = response.data.find((m: any) => {
                if (matchType === 'qm' || matchType === 'f') {
                    // Quals and Finals look at match_number
                    return m.comp_level === matchType && m.match_number === inputNum;
                } else if (matchType === 'sf') {
                    // Playoffs (sf) look at set_number and force match 1
                    return m.comp_level === 'sf' && m.set_number === inputNum && m.match_number === 1;
                }
                return false;
            });

            if (match) {
                let team = '';
                const alliances = match.alliances;
                // Map alliance position to team
                const isBlue = position.startsWith('Blue');
                const posIndex = parseInt(position.slice(-1)) - 1;
                team = alliances[isBlue ? 'blue' : 'red'].team_keys[posIndex]?.replace('frc', '') || '';

                if (team) { setTeamNumber(team); }
            }
        } catch (error: any) {
            console.error('Error fetching team number:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const searchByHkeyQn = async () => {
        const hkey = `${competition}-${getFullMatchNumber()}-${teamNumber}`;
        const { data, error } = await supabase
            .from('Scouting Raw Data')
            .select('key, userTeamNumber')
            .eq('HKey', hkey);

        if (error) { console.error('Error fetching data:', error); return; }
        if (data?.length) {
            setHkeyResults(data);
            setqnHkeyModalVisible(true);
        } else {
            alert('No matching records found');
        }
    };

    const selectHkeyRowQn = async (rowId: any) => {
        const { data, error } = await supabase
            .from('Scouting Raw Data')
            .select('*')
            .eq('key', rowId)
            .maybeSingle();

        if (error) { console.error('Error fetching row data:', error); return; }
        setSelectedRowData(data);
        setqnHkeyModalVisible(false);
        router.push({
            pathname: '/(tabs)/quantitative',
            params: { selectedData: JSON.stringify(data) }
        });
    };

    const searchByHkeyQl = async () => {
        const hkey = `${competition}-${getFullMatchNumber()}-${teamNumber}`;
        const { data, error } = await supabase
            .from('Scouting Qualitative Data')
            .select('key, userTeamNumber')
            .eq('Hkey', hkey);

        if (error) { console.error('Error fetching data:', error); return; }
        if (data?.length) {
            setHkeyResults(data);
            setqlHkeyModalVisible(true);
        } else {
            alert('No matching records found');
        }
    };

    const selectHkeyRowql = async (rowId: any) => {
        const { data, error } = await supabase
            .from('Scouting Qualitative Data')
            .select('*')
            .eq('key', rowId)
            .maybeSingle();

        if (error) { console.error('Error fetching row data:', error); return; }
        setSelectedRowData(data);
        setqlHkeyModalVisible(false);
        router.push({
            pathname: '/(tabs)/qualitative',
            params: { selectedData: JSON.stringify(data) }
        });
    };

    return (
        <ScrollView className="flex-1 bg-black">
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

                {/* Standard Header */}
                <View className="mb-10 bg-black">
                    <Text className="text-4xl font-black text-cyan-500 tracking-tighter">
                        History
                    </Text>
                </View>

                {/* Form Controls */}
                <View className="space-y-6 bg-black">

                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Competition Code
                        </Text>
                        <TextInput
                            value={competition}
                            onChangeText={setCompetition}
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                            placeholder="e.g. 2024micmp"
                            placeholderTextColor="#4b5563"
                        />
                    </View>

                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Match Number
                        </Text>
                        <TextInput
                            value={matchNumber}
                            onChangeText={setMatchNumber}
                            keyboardType="numeric"
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                            placeholder="Enter Match #"
                            placeholderTextColor="#4b5563"
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

                    <View className="bg-blcaack">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Position
                        </Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="bg-neutral-900 border-2 border-cyan-500/20 rounded-2xl p-4"
                        >
                            <Text className={`text-lg ${!position ? 'text-white font-bold' : 'text-white font-bold'}`}>
                                {!position ? 'Select Position' : getPositionLabel()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Team Number
                        </Text>
                        <TextInput
                            value={teamNumber}
                            onChangeText={setTeamNumber}
                            keyboardType="numeric"
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                            placeholder={isLoading ? "Fetching..." : "Manual Entry"}
                            placeholderTextColor="#4b5563"
                        />
                    </View>
                </View>

                {/* Execution Section */}
                <View className="mt-12 bg-black">
                    <Text className="text-neutral-500 text-center text-xs font-bold uppercase tracking-[4px] mb-4">
                        Search Data Type
                    </Text>

                    <View className="flex-row gap-4 bg-black">
                        <TouchableOpacity
                            onPress={searchByHkeyQn}
                            className="flex-1 bg-cyan-500 py-5 rounded-2xl shadow-lg shadow-cyan-500/40"
                        >
                            <Text className="text-black font-black text-center uppercase tracking-tighter">
                                Quantitative
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={searchByHkeyQl}
                            className="flex-1 bg-cyan-500 py-5 rounded-2xl shadow-lg shadow-cyan-500/40"
                        >
                            <Text className="text-black font-black text-center uppercase tracking-tighter">
                                Qualitative
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            {/* Position Selection Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-neutral-900 rounded-t-[40px] p-8 border-t-2 border-cyan-500/30">
                        <Text className="text-cyan-500 text-xs font-black uppercase tracking-widest mb-6 text-center">
                            Select Alliance Position
                        </Text>
                        {positions.map((pos) => (
                            <TouchableOpacity
                                key={pos.value}
                                onPress={() => selectPosition(pos.value)}
                                className={`p-5 rounded-2xl mb-3 border-2 ${
                                    position === pos.value ? 'bg-cyan-500 border-cyan-500' : 'bg-black border-cyan-500/20'
                                }`}
                            >
                                <Text className={`text-center font-bold text-lg ${position === pos.value ? 'text-black' : 'text-white'}`}>
                                    {pos.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="mt-4 py-4 border-2 border-cyan-500 rounded-2xl bg-black"
                        >
                            <Text className="text-white text-center font-bold uppercase">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Results Modal (Shared Style) */}
            <Modal animationType="slide" transparent={true} visible={qnhkeyModalVisible || qlhkeyModalVisible}>
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-neutral-900 rounded-t-[40px] p-8 border-t-2 border-cyan-500/30">
                        <Text className="text-cyan-500 text-xs font-black uppercase tracking-widest mb-2 text-center">
                            Matching Records Found
                        </Text>
                        <Text className="text-neutral-500 text-xs text-center mb-6 uppercase">Select the scout who submitted</Text>

                        <ScrollView className="max-h-[400px]">
                            {hkeyResults.map((row, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => qnhkeyModalVisible ? selectHkeyRowQn(row.key) : selectHkeyRowql(row.key)}
                                    className="p-5 rounded-2xl mb-3 bg-black border-2 border-cyan-500/20"
                                >
                                    <Text className="text-white text-center font-black text-lg">
                                        SCOUT TEAM {row.userTeamNumber}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => {setqnHkeyModalVisible(false); setqlHkeyModalVisible(false);}}
                            className="mt-6 bg-neutral-800 py-4 rounded-2xl border-2 border-cyan-500"
                        >
                            <Text className="text-white text-center font-bold uppercase">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
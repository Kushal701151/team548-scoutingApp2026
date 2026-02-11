import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Alert,
    Modal
} from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { BarChart } from 'react-native-chart-kit';
import FontAwesome from "@expo/vector-icons/FontAwesome";

const supabaseUrl = 'https://jwifgmdzmsdjpettsnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const screenWidth = Dimensions.get('window').width;

interface TeamStats {
    teamNumber: number | string;
    avgPoints: number;
    avgPasses: number;
    avgAutoFuel: number;
    avgClimb: number;
    matchCount: number;
}

export default function MatchStrategyScreen() {
    const [competitionCode, setCompetitionCode] = useState('');
    const [matchNumber, setMatchNumber] = useState('');
    const [filterByComp, setFilterByComp] = useState(true);
    const [selectedAlliance, setSelectedAlliance] = useState<'red' | 'blue'>('red');
    const [redTeams, setRedTeams] = useState<any[]>([0, 0, 0]);
    const [blueTeams, setBlueTeams] = useState<any[]>([0, 0, 0]);
    const [allianceStats, setAllianceStats] = useState<TeamStats[]>([]);
    const [loadingMatch, setLoadingMatch] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<'points' | 'passes' | 'autoFuel' | 'climb'>('points');


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
    const fetchMatchDetails = async () => {
        if (!competitionCode || !matchNumber) {
            Alert.alert("Missing Info", "Enter Competition Code and Match #");
            return;
        }
        setLoadingMatch(true);
        try {
            const TBA_AUTH_KEY = '3TklPnjeCtdcjYFnv7axxHWx0DTUEwkUYgvgVJodaPZGj6KDJ8T4lE0inTcQ7PgO';
            const response = await axios.get(
                `https://www.thebluealliance.com/api/v3/event/${competitionCode}/matches/simple`,
                {
                    headers: { 'X-TBA-Auth-Key': TBA_AUTH_KEY },
                    timeout: 10000
                }
            );

            const inputNum = parseInt(matchNumber);

            // Filter logic matching your other screens
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
                setRedTeams(match.alliances.red.team_keys.map((k: string) => parseInt(k.replace('frc', ''))));
                setBlueTeams(match.alliances.blue.team_keys.map((k: string) => parseInt(k.replace('frc', ''))));
            } else {
                const typeLabel = matchTypeOptions.find(opt => opt.value === matchType)?.label;
                Alert.alert('Not Found', `${typeLabel} Match ${matchNumber} not found.`);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch match data from TBA.');
        } finally {
            setLoadingMatch(false);
        }
    };

    useEffect(() => {
        const currentTeams = selectedAlliance === 'red' ? redTeams : blueTeams;
        fetchAllianceStats(currentTeams);
    }, [selectedAlliance, redTeams, blueTeams, filterByComp]);

    const fetchAllianceStats = async (teamList: any[]) => {
        setLoadingStats(true);
        const stats: TeamStats[] = [];
        for (const team of teamList) {
            if (!team || team === 0) {
                stats.push({ teamNumber: 0, avgPoints: 0, avgPasses: 0, avgAutoFuel: 0, avgClimb: 0, matchCount: 0 });
                continue;
            }
            try {
                const { data, error } = await supabase.rpc('quantitative_stats', {
                    p_team_number: team,
                    p_competition_code: filterByComp ? competitionCode : null,
                    p_scout_team_number: null
                });
                if (!error && data) {
                    stats.push({
                        teamNumber: team,
                        avgPoints: data.AVGTotalPoints || 0,
                        avgPasses: data.AVGTotalPasses || 0,
                        avgAutoFuel: data.AVGAutoFuel || 0,
                        avgClimb: data.AVGEndgamePoints || 0,
                        matchCount: data.matchCount || 0
                    });
                } else {
                    stats.push({ teamNumber: team, avgPoints: 0, avgPasses: 0, avgAutoFuel: 0, avgClimb: 0, matchCount: 0 });
                }
            } catch (err) { console.error(err); }
        }
        setAllianceStats(stats);
        setLoadingStats(false);
    };

    const handleManualTeamChange = (text: string, index: number) => {
        const newTeamNum = parseInt(text) || 0;
        const newTeams = [...(selectedAlliance === 'red' ? redTeams : blueTeams)];
        newTeams[index] = newTeamNum;
        selectedAlliance === 'red' ? setRedTeams(newTeams) : setBlueTeams(newTeams);
    };

    const getAllianceTotal = (metric: keyof TeamStats) => {
        return allianceStats.reduce((sum, team) => sum + (team[metric] as number), 0).toFixed(1);
    };

    const chartConfig = {
        backgroundColor: '#000',
        backgroundGradientFrom: '#000',
        backgroundGradientTo: '#171717',
        decimalPlaces: 1,
        color: (opacity = 1) => selectedAlliance === 'red' ? `rgba(239, 68, 68, ${opacity})` : `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
        barPercentage: 0.6,
        propsForBackgroundLines: { stroke: '#262626' }
    };

    return (
        <ScrollView className="flex-1 bg-black">
            <Modal animationType="slide" transparent={true} visible={matchTypeDropdownVisible}>
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-neutral-900 rounded-t-[40px] p-8 border-t-2 border-emerald-500/30">
                        <Text className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-6 text-center">
                            Select Match Type
                        </Text>
                        {matchTypeOptions.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                onPress={() => selectMatchType(type.value)}
                                className={`p-5 rounded-2xl mb-3 border-2 ${
                                    matchType === type.value ? 'bg-emerald-500 border-emerald-500' : 'bg-black border-emerald-500/20'
                                }`}
                            >
                                <Text className={`text-center font-bold text-lg ${matchType === type.value ? 'text-black' : 'text-white'}`}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setMatchTypeDropdownVisible(false)}
                            className="mt-4 py-4 border-2 border-emerald-500 rounded-2xl bg-black"
                        >
                            <Text className="text-white text-center font-bold uppercase">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View className="px-6 pt-16 pb-10">

                {/* Header */}
                <View className="mb-6">
                    <Text className="text-4xl font-black text-emerald-500 tracking-tighter">Alliance Analysis</Text>
                </View>

                {/* Search Bar - Fixed items-end */}
                <View className="flex-row gap-2 items-end mb-3">
                    <View className="flex-[2]">
                        <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Competition Code </Text>
                        <TextInput
                            value={competitionCode}
                            onChangeText={setCompetitionCode}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholder="e.g. 2024joh"
                            placeholderTextColor="#4b5563"
                            className="bg-neutral-900 border-2 border-emerald-500/20 focus:border-emerald-500 rounded-xl p-3 text-white font-bold h-12"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Match</Text>
                        <TextInput
                            value={matchNumber}
                            onChangeText={setMatchNumber}
                            keyboardType="numeric"
                            className="bg-neutral-900 border-2 border-emerald-500/20 focus:border-emerald-500 rounded-xl p-3 text-white font-bold text-center h-12"
                        />
                    </View>
                </View>

                <View className="flex-row gap-2 items-end mb-6 justify-start">
                    <View className="flex-1">
                        <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">MATCH TYPE</Text>
                        <TouchableOpacity
                            onPress={() => setMatchTypeDropdownVisible(true)}
                            className="bg-neutral-900 border-2 border-emerald-500/20 rounded-xl p-4"
                        >
                            <Text className=" text-white font-bold">
                                {getMatchTypeLabel()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={fetchMatchDetails} className="bg-emerald-500 w-20 h-14 rounded-xl items-center justify-center">
                        {/* Removed ml-4 from here since you have gap-2 on parent */}
                        {loadingMatch ? <ActivityIndicator color="black" /> : <FontAwesome name="search" size={18} color="black" />}
                    </TouchableOpacity>
                </View>

                {/* Alliance Tabs */}
                <View className="flex-row bg-neutral-900 p-1 rounded-2xl mb-6">
                    <TouchableOpacity onPress={() => setSelectedAlliance('red')} className={`flex-1 py-2 rounded-xl ${selectedAlliance === 'red' ? 'bg-red-600' : ''}`}>
                        <Text className={`text-center font-black text-[10px] ${selectedAlliance === 'red' ? 'text-white' : 'text-neutral-500'}`}>RED ALLIANCE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedAlliance('blue')} className={`flex-1 py-2 rounded-xl ${selectedAlliance === 'blue' ? 'bg-blue-600' : ''}`}>
                        <Text className={`text-center font-black text-[10px] ${selectedAlliance === 'blue' ? 'text-white' : 'text-neutral-500'}`}>BLUE ALLIANCE</Text>
                    </TouchableOpacity>
                </View>

                {/* Team Tactical Grid - Larger Text */}
                <View className="flex-row gap-2 mb-8">
                    {[0, 1, 2].map((index) => {
                        const stat = allianceStats[index] || { teamNumber: 0, avgPoints: 0, avgPasses: 0, avgAutoFuel: 0, avgClimb: 0, matchCount: 0 };
                        return (
                            <View key={index} className={`flex-1 bg-neutral-900 border-2 rounded-2xl p-3 ${selectedAlliance === 'red' ? 'border-red-500/40' : 'border-blue-500/40'}`}>
                                <TextInput
                                    defaultValue={stat.teamNumber === 0 ? '' : stat.teamNumber.toString()}
                                    keyboardType="numeric"
                                    className="text-white font-black text-center text-2xl mb-1"
                                    onEndEditing={(e) => handleManualTeamChange(e.nativeEvent.text, index)}
                                    placeholder="0"
                                    placeholderTextColor="#262626"
                                />
                                <View className="space-y-2 mt-2 pt-2 border-t border-white/5">
                                    <View className="items-center"><Text className="text-neutral-500 text-[8px] font-black uppercase">Pts</Text><Text className="text-white font-black text-xl">{stat.avgPoints.toFixed(0)}</Text></View>
                                    <View className="items-center"><Text className="text-emerald-500/50 text-[8px] font-black uppercase">Pass</Text><Text className="text-emerald-500 font-black text-xl">{stat.avgPasses.toFixed(0)}</Text></View>
                                    <View className="items-center"><Text className="text-yellow-500/50 text-[8px] font-black uppercase">Auto Fuel</Text><Text className="text-yellow-500 font-black text-xl">{stat.avgAutoFuel.toFixed(0)}</Text></View>
                                    <View className="items-center"><Text className="text-purple-500/50 text-[8px] font-black uppercase">Climb</Text><Text className="text-purple-500 font-black text-xl">{stat.avgClimb.toFixed(0)}</Text></View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Smaller Chart Selector Buttons */}
                <Text className="text-neutral-500 text-center text-[10px] font-black uppercase tracking-[3px] mb-4">Alliance Totals • View in Chart</Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                    {[
                        { id: 'points', label: 'Points', val: 'avgPoints', color: 'text-white' },
                        { id: 'passes', label: 'Passes', val: 'avgPasses', color: 'text-emerald-500' },
                        { id: 'autoFuel', label: 'Auto Fuel', val: 'avgAutoFuel', color: 'text-yellow-500' },
                        { id: 'climb', label: 'Climb', val: 'avgClimb', color: 'text-purple-500' }
                    ].map((m) => (
                        <TouchableOpacity
                            key={m.id}
                            onPress={() => setSelectedMetric(m.id as any)}
                            className={`flex-1 min-w-[45%] py-3 rounded-xl border-2 items-center ${selectedMetric === m.id ? 'bg-emerald-500 border-emerald-500' : 'bg-neutral-900 border-white/5'}`}
                        >
                            <Text className={`font-black uppercase text-[8px] tracking-widest ${selectedMetric === m.id ? 'text-black' : 'text-neutral-500'}`}>{m.label}</Text>
                            <Text className={`text-xl font-black ${selectedMetric === m.id ? 'text-black' : m.color}`}>{getAllianceTotal(m.val as any)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Chart Card */}
                <View className="bg-neutral-900 p-5 rounded-3xl border border-white/5">
                    <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">Metric Breakdown: {selectedMetric === 'autoFuel' ? 'Auto Fuel' : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</Text>
                    {allianceStats.length > 0 ? (
                        <BarChart
                            data={{
                                labels: allianceStats.map(s => s.teamNumber.toString()),
                                datasets: [{
                                    data: selectedMetric === 'passes'
                                        ? allianceStats.map(s => s.avgPasses)
                                        : selectedMetric === 'autoFuel'
                                            ? allianceStats.map(s => s.avgAutoFuel)
                                            : selectedMetric === 'climb'
                                                ? allianceStats.map(s => s.avgClimb)
                                                : allianceStats.map(s => s.avgPoints)
                                }]
                            }}
                            width={screenWidth - 80}
                            height={180}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={chartConfig}
                            fromZero
                            showValuesOnTopOfBars
                            style={{ borderRadius: 12 }}
                        />
                    ) : (
                        <Text className="text-neutral-700 text-center font-bold py-6">Awaiting Input...</Text>
                    )}
                </View>

            </View>
        </ScrollView>
    );
}
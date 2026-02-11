import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, Dimensions } from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import FontAwesome from "@expo/vector-icons/FontAwesome";

const screenWidth = Dimensions.get('window').width;

const supabaseUrl = 'https://jwifgmdzmsdjpettsnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AnalysisScreen() {
    const [competitionCode, setCompetitionCode] = useState('');
    const [filterByComp, setFilterByComp] = useState(true);
    const [scoutTeamFilter, setScoutTeamFilter] = useState('');
    const [teams, setTeams] = useState<number[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
    const [teamStats, setTeamStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const loadTeamsFromTBA = async () => {
        if (!competitionCode || competitionCode.trim() === '') {
            Alert.alert('Missing Information', 'Please enter a competition code');
            return;
        }
        setLoadingTeams(true);
        try {
            const TBA_AUTH_KEY = '3TklPnjeCtdcjYFnv7axxHWx0DTUEwkUYgvgVJodaPZGj6KDJ8T4lE0inTcQ7PgO';
            const apiUrl = `https://www.thebluealliance.com/api/v3/event/${competitionCode}/teams/simple`;
            const response = await axios.get(apiUrl, {
                headers: { 'X-TBA-Auth-Key': TBA_AUTH_KEY },
                timeout: 10000
            });
            const teamNumbers = response.data
                .map((team: any) => team.team_number)
                .sort((a: number, b: number) => a - b);
            setTeams(teamNumbers);
            if (teamNumbers.length === 0) Alert.alert('No Teams Found', 'No teams found for this competition');
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load teams. Check your connection and Competition Code.');
        } finally {
            setLoadingTeams(false);
        }
    };

    const loadTeamStats = async (teamNumber: number) => {
        setLoadingStats(true);
        setModalVisible(true);
        setSelectedTeam(teamNumber);
        setTeamStats(null);
        try {
            const { data: quantData } = await supabase.rpc('quantitative_stats', {
                p_team_number: teamNumber,
                p_competition_code: filterByComp ? competitionCode : null,
                p_scout_team_number: scoutTeamFilter || null
            });
            const { data: qualData } = await supabase.rpc('qualitative_stats', {
                p_team_number: teamNumber,
                p_competition_code: filterByComp ? competitionCode : null,
                p_scout_team_number: scoutTeamFilter || null
            });

            if ((!quantData || quantData.matchCount === 0) && (!qualData || qualData.matchCount === 0)) {
                setTeamStats({ noData: true });
            } else {
                setTeamStats({ quantitative: quantData, qualitative: qualData });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load team stats');
        } finally {
            setLoadingStats(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="px-6 pt-16 pb-10 bg-black">
                {/* Header Section */}
                <View className="mb-10 bg-black">
                    <Text className="text-4xl font-black text-emerald-500 tracking-tighter">
                        Team Analysis
                    </Text>
                </View>

                {/* Form Section */}
                <View className="space-y-6 bg-black">

                    {/* Event Key Input */}
                    <View className="bg-black">
                        <Text className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Competition Code
                        </Text>
                        <TextInput
                            value={competitionCode}
                            onChangeText={setCompetitionCode}
                            autoCapitalize="none"
                            className="bg-neutral-900 border-2 border-emerald-500/20 focus:border-emerald-500 rounded-2xl p-4 text-lg text-white"
                            placeholder="e.g. 2024micmp"
                            placeholderTextColor="#4b5563"
                        />
                    </View>

                    {/* Data Scope Selector */}
                    <View className="bg-black">
                        <Text className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
                            Data Scope
                        </Text>
                        <View className="flex-row gap-3 bg-black">
                            <TouchableOpacity
                                onPress={() => setFilterByComp(true)}
                                className={`flex-1 py-4 rounded-2xl border-2 ${
                                    filterByComp ? 'bg-emerald-500 border-emerald-500' : 'bg-neutral-900 border-emerald-500/30'
                                }`}
                            >
                                <Text className={`text-center font-black uppercase tracking-tight ${filterByComp ? 'text-black' : 'text-emerald-500'}`}>
                                    Event Only
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFilterByComp(false)}
                                className={`flex-1 py-4 rounded-2xl border-2 ${
                                    !filterByComp ? 'bg-emerald-500 border-emerald-500' : 'bg-neutral-900 border-emerald-500/30'
                                }`}
                            >
                                <Text className={`text-center font-black uppercase tracking-tight ${!filterByComp ? 'text-black' : 'text-emerald-500'}`}>
                                    All History
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Scout Filter Input */}
                    <View className="bg-black">
                        <Text className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Scout Team Filter (Optional)
                        </Text>
                        <TextInput
                            value={scoutTeamFilter}
                            onChangeText={setScoutTeamFilter}
                            placeholder="Leave empty for all teams"
                            placeholderTextColor="#4b5563"
                            keyboardType="numeric"
                            className="bg-neutral-900 border-2 border-emerald-500/20 focus:border-emerald-500 rounded-2xl p-4 text-lg text-white"
                        />
                    </View>

                    {/* Load Button */}
                    <TouchableOpacity
                        onPress={loadTeamsFromTBA}
                        disabled={loadingTeams}
                        className="bg-emerald-500 py-5 rounded-2xl shadow-lg shadow-emerald-500/40 mt-4"
                    >
                        {loadingTeams ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Text className="text-black font-black text-xl text-center uppercase tracking-tighter">
                                Load Team List
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Team Grid */}
                {teams.length > 0 && (
                    <View className="mt-12">
                        <View className="flex-row items-center justify-between mb-6 px-1">
                            <Text className="text-white font-black text-2xl tracking-tight">Event Teams</Text>
                            <View className="bg-emerald-500 px-4 py-1 rounded-full">
                                <Text className="text-black font-black text-xs">{teams.length}</Text>
                            </View>
                        </View>

                        {/* Force 3 items per row using flex-row and calculated width */}
                        <View className="flex-row flex-wrap justify-start bg-black">
                            {teams.map((teamNum) => (
                                <View
                                    key={teamNum}
                                    style={{ width: '33.33%', padding: 6 }} // Precise 1/3 width with padding for gutters
                                >
                                    <TouchableOpacity
                                        onPress={() => loadTeamStats(teamNum)}
                                        className="bg-neutral-900 border-2 border-emerald-500/20 rounded-2xl py-6 items-center justify-center active:bg-emerald-500/10 active:border-emerald-500"
                                    >
                                        <Text className="text-white font-black text-xl tracking-tighter">
                                            {teamNum}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {/* Stats Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 bg-black/95 justify-end">
                    <View className="bg-neutral-900 rounded-t-[40px] h-[85%] border-t-2 border-emerald-500/30 overflow-hidden">
                        <View className="p-8 border-b border-white/5 items-center bg-neutral-900">
                            <View className="w-12 h-1.5 bg-neutral-800 rounded-full mb-6" />
                            <Text className="text-emerald-500 text-xs font-black uppercase tracking-[4px] mb-1">
                                Detailed Analysis
                            </Text>
                            <Text className="text-white text-5xl font-black tracking-tighter">
                                Team {selectedTeam}
                            </Text>
                        </View>

                        <ScrollView className="p-6">
                            {loadingStats ? (
                                <View className="py-20 items-center">
                                    <ActivityIndicator size="large" color="#10b981" />
                                    <Text className="text-neutral-500 font-bold mt-4 uppercase tracking-widest text-xs">Syncing Cloud Data</Text>
                                </View>
                            ) : teamStats?.noData ? (
                                <View className="py-20 items-center">
                                    <FontAwesome name="database" size={48} color="#374151" />
                                    <Text className="text-neutral-500 font-bold mt-6 text-center px-10">No records found for this team with active filters.</Text>
                                </View>
                            ) : (
                                <View className="pb-10">
                                    {/* Quantitative Section */}
                                    {teamStats?.quantitative && (
                                        <View className="mb-10">
                                            <Text className="text-emerald-500 font-black text-xs uppercase tracking-[2px] mb-4 ml-1">Performance Metrics</Text>
                                            <View className="flex-row flex-wrap gap-3">
                                                {[
                                                    { label: 'Avg Pts', val: teamStats.quantitative.AVGTotalPoints },
                                                    { label: 'Avg Pass', val: teamStats.quantitative.AVGTotalPasses },
                                                    { label: 'Avg Auto', val: teamStats.quantitative.AVGAutoFuel },
                                                    { label: 'Avg Climb', val: teamStats.quantitative.AVGEndgamePoints }
                                                ].map((stat, i) => (
                                                    <View key={i} className="bg-black/40 border-2 border-emerald-500/10 rounded-3xl p-5 flex-1 min-w-[45%]">
                                                        <Text className="text-neutral-500 text-[10px] font-black uppercase mb-1">{stat.label}</Text>
                                                        <Text className="text-white text-3xl font-black tracking-tighter">{Number(stat.val).toFixed(1)}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Qualitative Section */}
                                    {teamStats?.qualitative && (
                                        <View>
                                            <Text className="text-emerald-500 font-black text-xs uppercase tracking-[2px] mb-4 ml-1">Qualitative (1-5)</Text>
                                            <View className="space-y-3">
                                                {[
                                                    { label: 'Driving Skill', val: teamStats.qualitative.AVGDriving },
                                                    { label: 'Defense Strength', val: teamStats.qualitative.AVGDefense },
                                                    { label: 'Scoring Accuracy', val: teamStats.qualitative.AVGAccuracy },
                                                    { label: 'Intake Ability', val: teamStats.qualitative.AVGIntake }
                                                ].map((rate, i) => (
                                                    <View key={i} className="flex-row justify-between items-center bg-black/40 p-5 rounded-2xl border-2 border-emerald-500/5">
                                                        <Text className="text-neutral-300 font-bold text-base">{rate.label}</Text>
                                                        <Text className="text-emerald-500 font-black text-2xl">{Number(rate.val).toFixed(1)}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="bg-emerald-500 py-8 items-center"
                        >
                            <Text className="text-black font-black text-xl uppercase tracking-tighter">Close Analysis</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
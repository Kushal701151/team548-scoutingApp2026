import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { BarChart } from 'react-native-chart-kit';

const supabaseUrl = 'https://jwifgmdzmsdjpettsnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const screenWidth = Dimensions.get('window').width;

export default function AnalysisScreen() {
    const [competitionCode, setCompetitionCode] = useState('');
    const [teams, setTeams] = useState<number[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(false);

    // Graph states
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [graphData, setGraphData] = useState<any>(null);
    const [loadingGraph, setLoadingGraph] = useState(false);

    const metrics = [
        { label: 'Total Points', value: 'totalPoints' },
        { label: 'Climb Points', value: 'climbPoints' },
        { label: 'Auto Fuel', value: 'autoFuel' },
        { label: 'Passing', value: 'passing' },
    ];

    const loadTeamsFromTBA = async () => {
        if (!competitionCode || competitionCode.trim() === '') {
            Alert.alert('Missing Information', 'Please enter a competition code');
            return;
        }
        setLoadingTeams(true);
        setSelectedMetric(null);
        setGraphData(null);

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
            console.error('Error fetching teams:', error);
            Alert.alert('Error', 'Failed to load teams.');
        } finally {
            setLoadingTeams(false);
        }
    };

    const calculatePercentiles = (data: any[]) => {
        const values = data.map(item => item.value).sort((a, b) => a - b);
        const p25Index = Math.floor(values.length * 0.25);
        const p50Index = Math.floor(values.length * 0.50);
        const p75Index = Math.floor(values.length * 0.75);

        return {
            p25: values[p25Index] || 0,
            p50: values[p50Index] || 0,
            p75: values[p75Index] || 0,
            max: Math.max(...values) || 1
        };
    };

    const loadGraphData = async (metric: string) => {
        if (!competitionCode) return;
        setLoadingGraph(true);
        setSelectedMetric(metric);

        try {
            const { data, error } = await supabase.rpc('get_team_averages_for_comp', {
                p_competition_code: competitionCode,
                p_metric: metric
            });

            if (error) throw error;
            const formattedData = data.map((item: any) => ({
                teamNumber: parseInt(item.teamNumber),
                value: item.value
            }));
            setGraphData(formattedData.length > 0 ? formattedData : null);
        } catch (error) {
            Alert.alert('Error', 'Failed to load graph data');
        } finally {
            setLoadingGraph(false);
        }
    };

    const chartConfig = {
        backgroundColor: '#000000',
        backgroundGradientFrom: '#000000',
        backgroundGradientTo: '#171717',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald 500
        labelColor: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
        style: { borderRadius: 16 },
        barPercentage: 0.6,
        propsForBackgroundLines: { strokeDasharray: '', stroke: '#262626', strokeWidth: 1 }
    };

    const renderChartWithPercentiles = () => {
        if (!graphData || graphData.length === 0) return null;
        const percentiles = calculatePercentiles(graphData);
        const chartWidth = Math.max(screenWidth - 48, graphData.length * 60);
        const chartHeight = 350;

        const getPercentileY = (percentileValue: number) => {
            const chartContentHeight = chartHeight - 100;
            const yPosition = chartContentHeight - (percentileValue / percentiles.max) * chartContentHeight;
            return yPosition + 40;
        };

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={true} className="rounded-2xl bg-neutral-900/50">
                <View className="relative py-4 pr-4">
                    <BarChart
                        data={{
                            labels: graphData.map((item: any) => item.teamNumber.toString()),
                            datasets: [{ data: graphData.map((item: any) => item.value) }]
                        }}
                        width={chartWidth}
                        height={chartHeight}
                        chartConfig={chartConfig}
                        yAxisLabel=""
                        yAxisSuffix=""
                        fromZero
                        showValuesOnTopOfBars
                        style={{ borderRadius: 16 }}
                    />

                    {/* Percentile Lines */}
                    <View className="absolute left-16 right-0 top-0" style={{ height: chartHeight, pointerEvents: 'none' }}>
                        {[
                            { val: percentiles.p25, color: 'bg-emerald-600', label: 'P25' },
                            { val: percentiles.p50, color: 'bg-blue-500', label: 'MED' },
                            { val: percentiles.p75, color: 'bg-purple-500', label: 'P75' }
                        ].map((line, i) => (
                            <View key={i} className="absolute left-0 right-0 flex-row items-center" style={{ top: getPercentileY(line.val) }}>
                                <View className={`flex-1 h-[1px] ${line.color} opacity-40`} />
                                <View className={`${line.color} px-1.5 py-0.5 rounded-md ml-1`}>
                                    <Text className="text-white text-[9px] font-black">{line.label}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        );
    };

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="px-6 pt-16 pb-10 bg-black">

                {/* Header */}
                <View className="mb-10">
                    <Text className="text-4xl font-black text-emerald-500 tracking-tighter">
                        Competition Analysis
                    </Text>
                </View>

                {/* Competition Search Section */}
                <View className="space-y-4 mb-10">
                    <View>
                        <Text className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Competition Code
                        </Text>
                        <TextInput
                            value={competitionCode}
                            onChangeText={setCompetitionCode}
                            placeholder="e.g. 2025miwmi"
                            placeholderTextColor="#4b5563"
                            className="bg-neutral-900 border-2 border-emerald-500/20 focus:border-emerald-500 rounded-2xl p-4 text-lg text-white"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={loadTeamsFromTBA}
                        disabled={loadingTeams}
                        className="bg-emerald-500 py-5 rounded-2xl shadow-lg shadow-emerald-500/20"
                    >
                        {loadingTeams ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Text className="text-black font-black text-center uppercase tracking-tight text-lg">
                                Load Event Data
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {teams.length > 0 && (
                    <View className="animate-in fade-in duration-500">
                        <Text className="text-neutral-300 text-xs font-bold uppercase tracking-[4px] mb-4 text-center">
                            Select Metric
                        </Text>

                        <View className="flex-row flex-wrap gap-3 mb-10">
                            {metrics.map((metric) => (
                                <TouchableOpacity
                                    key={metric.value}
                                    onPress={() => loadGraphData(metric.value)}
                                    className={`flex-1 min-w-[45%] py-4 rounded-2xl border-2 ${
                                        selectedMetric === metric.value
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'bg-neutral-900 border-emerald-500/20'
                                    }`}
                                >
                                    <Text className={`text-center font-black uppercase tracking-tighter ${
                                        selectedMetric === metric.value ? 'text-black' : 'text-emerald-500'
                                    }`}>
                                        {metric.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Main Graph Area */}
                {loadingGraph ? (
                    <View className="py-20">
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text className="text-neutral-300 text-center mt-4 font-bold uppercase text-xs tracking-widest">
                            Analyzing DB Records...
                        </Text>
                    </View>
                ) : graphData && (
                    <View className="space-y-8">
                        <View>
                            <Text className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-4 ml-1">
                                {metrics.find(m => m.value === selectedMetric)?.label} Distribution
                            </Text>
                            {renderChartWithPercentiles()}
                        </View>

                        {/* Percentile Stats Card */}
                        <View className="bg-neutral-900 rounded-[32px] p-6 border-2 border-emerald-500/10">
                            <Text className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-4">
                                Statistical Breakdown
                            </Text>
                            <View className="space-y-3">
                                {[
                                    { label: 'Top 25% Threshold', val: calculatePercentiles(graphData).p75, color: 'bg-purple-500' },
                                    { label: 'Event Median (P50)', val: calculatePercentiles(graphData).p50, color: 'bg-blue-500' },
                                    { label: 'Lower 25% Threshold', val: calculatePercentiles(graphData).p25, color: 'bg-emerald-600' }
                                ].map((item, i) => (
                                    <View key={i} className="flex-row items-center justify-between py-2 border-b border-white/5">
                                        <View className="flex-row items-center">
                                            <View className={`w-2 h-2 rounded-full ${item.color} mr-3`} />
                                            <Text className="text-neutral-400 font-medium">{item.label}</Text>
                                        </View>
                                        <Text className="text-white font-black text-lg">{item.val.toFixed(1)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Data Table Card */}
                        <View className="bg-neutral-900 rounded-[32px] p-6 border-2 border-emerald-500/10">
                            <Text className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-4">
                                Raw Averages
                            </Text>
                            <View className="flex-row pb-3 border-b border-emerald-500/20">
                                <Text className="text-neutral-300 font-bold uppercase text-[10px] flex-1">Team</Text>
                                <Text className="text-neutral-300 font-bold uppercase text-[10px] w-20 text-right">Value</Text>
                            </View>
                            {graphData.map((item: any, index: number) => (
                                <View key={index} className="flex-row py-3 border-b border-white/5">
                                    <Text className="text-white font-bold flex-1"># {item.teamNumber}</Text>
                                    <Text className="text-emerald-500 font-black w-20 text-right">{item.value.toFixed(1)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {!loadingGraph && selectedMetric && !graphData && (
                    <View className="py-20 items-center">
                        <Text className="text-neutral-600 font-bold uppercase tracking-widest">No scout data found</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
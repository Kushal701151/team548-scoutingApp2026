import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    Modal, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const supabaseUrl     = 'https://jwifgmdzmsdjpettsnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MatchPoint {
    match_label:    string;
    match_order:    number;
    match_num:      number;
    auto_fuel:      number;
    teleop_fuel:    number;
    endgame_points: number;
    total_points:   number;
    total_passes:   number;
}

type StatKey = 'total_points' | 'total_passes' | 'auto_fuel' | 'endgame_points';

// ─── Dimensions ───────────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
// Modal inner width: screen - modal px-6 (24*2) = screen - 48
// Card grid: two cards + 12px gap between them
const MODAL_INNER_W = SCREEN_W - 48;
const CARD_GAP      = 12;
const CARD_W        = (MODAL_INNER_W - CARD_GAP) / 2;

// Chart sits inside a card with p-5 (20px) padding on each side
const CHART_CARD_PADDING = 20;
const CHART_W = MODAL_INNER_W - CHART_CARD_PADDING * 2;
const CHART_H = 160;
const DOT_R   = 5;
const LABEL_H = 22;

// ─── Pure-RN Line Chart ───────────────────────────────────────────────────────
function PureLineChart({ data, labels }: { data: number[]; labels: string[] }) {
    if (data.length < 2) return null;

    const maxVal = Math.max(...data, 1);
    const minVal = Math.min(...data);
    const range  = maxVal - minVal || 1;

    const toY = (v: number) =>
        DOT_R + ((maxVal - v) / range) * (CHART_H - DOT_R * 2);
    const toX = (i: number) =>
        DOT_R + (i / (data.length - 1)) * (CHART_W - DOT_R * 2);

    // How many x-labels fit without overlapping (~36px each)
    const maxLabels = Math.floor(CHART_W / 36);
    const step      = Math.max(1, Math.ceil(data.length / maxLabels));
    const showLabel = (i: number) =>
        i === 0 || i === data.length - 1 || i % step === 0;

    return (
        <View style={{ width: CHART_W, height: CHART_H + LABEL_H }}>
            {/* Guide lines */}
            {[0, 0.5, 1].map((t, i) => (
                <View
                    key={i}
                    style={{
                        position:        'absolute',
                        left: 0, right: 0,
                        top:             DOT_R + t * (CHART_H - DOT_R * 2) - 0.5,
                        height:          1,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                    }}
                />
            ))}

            {/* Line segments */}
            {data.slice(0, -1).map((_, i) => {
                const x1  = toX(i),     y1 = toY(data[i]);
                const x2  = toX(i + 1), y2 = toY(data[i + 1]);
                const dx  = x2 - x1,    dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
                return (
                    <View
                        key={i}
                        style={{
                            position:        'absolute',
                            left:            x1,
                            top:             y1 - 1.25,
                            width:           len,
                            height:          2.5,
                            backgroundColor: '#10b981',
                            transformOrigin: '0 50%',
                            transform:       [{ rotate: `${ang}deg` }],
                        }}
                    />
                );
            })}

            {/* Dots + value labels */}
            {data.map((v, i) => {
                const x = toX(i), y = toY(v);
                return (
                    <React.Fragment key={i}>
                        {/* Glow */}
                        <View style={{
                            position:        'absolute',
                            left:            x - DOT_R - 3,
                            top:             y - DOT_R - 3,
                            width:           (DOT_R + 3) * 2,
                            height:          (DOT_R + 3) * 2,
                            borderRadius:    DOT_R + 3,
                            backgroundColor: 'rgba(16,185,129,0.18)',
                        }} />
                        {/* Dot */}
                        <View style={{
                            position:        'absolute',
                            left:            x - DOT_R,
                            top:             y - DOT_R,
                            width:           DOT_R * 2,
                            height:          DOT_R * 2,
                            borderRadius:    DOT_R,
                            backgroundColor: '#10b981',
                        }} />
                        {/* Value above */}
                        <Text style={{
                            position:   'absolute',
                            left:       x - 20,
                            top:        y - DOT_R - 18,
                            width:      40,
                            textAlign:  'center',
                            color:      'rgba(255,255,255,0.5)',
                            fontSize:   9,
                            fontWeight: '700',
                        }}>
                            {Number(v).toFixed(1)}
                        </Text>
                    </React.Fragment>
                );
            })}

            {/* X-axis labels */}
            {labels.map((lbl, i) => {
                if (!showLabel(i)) return null;
                return (
                    <Text key={i} style={{
                        position:   'absolute',
                        left:       toX(i) - 20,
                        top:        CHART_H + 4,
                        width:      40,
                        textAlign:  'center',
                        color:      'rgba(163,163,163,0.7)',
                        fontSize:   9,
                        fontWeight: '600',
                    }}>
                        {lbl}
                    </Text>
                );
            })}
        </View>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shortLabel(key: string): string {
    if (!key) return '';
    const k = key.toLowerCase();
    if (k.startsWith('qm')) return 'Q'  + k.slice(2);
    if (k.startsWith('sf')) return 'SF' + (k.match(/\d+/)?.[0] ?? '');
    if (k.startsWith('f'))  return 'F'  + (k.match(/\d+/)?.[0] ?? '');
    return key;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AnalysisScreen() {
    const [competitionCode, setCompetitionCode] = useState('');
    const [filterByComp,    setFilterByComp]    = useState(true);
    const [scoutTeamFilter, setScoutTeamFilter] = useState('');
    const [teams,           setTeams]           = useState<number[]>([]);
    const [loadingTeams,    setLoadingTeams]    = useState(false);
    const [selectedTeam,    setSelectedTeam]    = useState<number | null>(null);
    const [teamStats,       setTeamStats]       = useState<any>(null);
    const [matchHistory,    setMatchHistory]    = useState<MatchPoint[] | null>(null);
    const [loadingStats,    setLoadingStats]    = useState(false);
    const [modalVisible,    setModalVisible]    = useState(false);
    const [activeStat,      setActiveStat]      = useState<StatKey | null>(null);

    const loadTeamsFromTBA = async () => {
        if (!competitionCode.trim()) {
            Alert.alert('Missing Information', 'Please enter a competition code');
            return;
        }
        setLoadingTeams(true);
        try {
            const res = await axios.get(
                `https://www.thebluealliance.com/api/v3/event/${competitionCode}/teams/simple`,
                {
                    headers: { 'X-TBA-Auth-Key': '3TklPnjeCtdcjYFnv7axxHWx0DTUEwkUYgvgVJodaPZGj6KDJ8T4lE0inTcQ7PgO' },
                    timeout: 10000,
                }
            );
            const nums = res.data
                .map((t: any) => t.team_number)
                .sort((a: number, b: number) => a - b);
            setTeams(nums);
            if (!nums.length) Alert.alert('No Teams Found', 'No teams found for this competition');
        } catch {
            Alert.alert('Error', 'Failed to load teams. Check connection and Competition Code.');
        } finally {
            setLoadingTeams(false);
        }
    };

    const loadTeamStats = async (teamNumber: number) => {
        setLoadingStats(true);
        setModalVisible(true);
        setSelectedTeam(teamNumber);
        setTeamStats(null);
        setMatchHistory(null);
        setActiveStat(null);

        try {
            const compCode  = filterByComp ? competitionCode : null;
            const scoutTeam = scoutTeamFilter || null;

            const [{ data: quantData }, { data: qualData }, { data: histData }] =
                await Promise.all([
                    supabase.rpc('quantitative_stats', {
                        p_team_number:       teamNumber,
                        p_competition_code:  compCode,
                        p_scout_team_number: scoutTeam,
                    }),
                    supabase.rpc('qualitative_stats', {
                        p_team_number:       teamNumber,
                        p_competition_code:  compCode,
                        p_scout_team_number: scoutTeam,
                    }),
                    // Always try to fetch match history if we have a competition code
                    competitionCode
                        ? supabase.rpc('team_match_history', {
                            p_team_number:       teamNumber,
                            p_competition_code:  competitionCode,
                            p_scout_team_number: scoutTeam,
                        })
                        : Promise.resolve({ data: null }),
                ]);

            if (
                (!quantData || quantData.matchCount === 0) &&
                (!qualData  || qualData.matchCount  === 0)
            ) {
                setTeamStats({ noData: true });
            } else {
                setTeamStats({ quantitative: quantData, qualitative: qualData });
            }

            setMatchHistory(Array.isArray(histData) && histData.length > 0 ? histData : null);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load team stats');
        } finally {
            setLoadingStats(false);
        }
    };

    // Graph is available whenever we have match history (regardless of filterByComp)
    const hasGraphData = !!matchHistory && matchHistory.length >= 2;

    const STATS: { key: StatKey; label: string; sublabel: string; value: string }[] =
        teamStats?.quantitative
            ? [
                { key: 'total_points',   label: 'Avg Pts',  sublabel: 'Total points',  value: Number(teamStats.quantitative.AVGTotalPoints).toFixed(1)   },
                { key: 'total_passes',   label: 'Avg Pass', sublabel: 'Passes made',   value: Number(teamStats.quantitative.AVGTotalPasses).toFixed(1)   },
                { key: 'auto_fuel',      label: 'Avg Auto', sublabel: 'Auto fuel pts', value: Number(teamStats.quantitative.AVGAutoFuel).toFixed(1)      },
                { key: 'endgame_points', label: 'Avg EG',   sublabel: 'Endgame pts',   value: Number(teamStats.quantitative.AVGEndgamePoints).toFixed(1) },
            ]
            : [];

    const graphData      = activeStat && matchHistory ? matchHistory.map(m => Number(m[activeStat]) || 0) : [];
    const graphLabels    = matchHistory ? matchHistory.map(m => shortLabel(m.match_label)) : [];
    const activeStatMeta = STATS.find(s => s.key === activeStat);

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="px-6 pt-16 pb-10 bg-black">

                {/* Header */}
                <View className="mb-10">
                    <Text className="text-4xl font-black text-emerald-500 tracking-tighter">
                        Team Analysis
                    </Text>
                </View>

                {/* Form */}
                <View className="space-y-6">
                    <View>
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

                    <View>
                        <Text className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
                            Data Scope
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {([true, false] as const).map((val) => (
                                <TouchableOpacity
                                    key={String(val)}
                                    onPress={() => setFilterByComp(val)}
                                    style={{ flex: 1 }}
                                    className={`py-4 rounded-2xl border-2 ${
                                        filterByComp === val
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'bg-neutral-900 border-emerald-500/30'
                                    }`}
                                >
                                    <Text className={`text-center font-black uppercase tracking-tight ${
                                        filterByComp === val ? 'text-black' : 'text-emerald-500'
                                    }`}>
                                        {val ? 'Event Only' : 'All History'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View>
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
                        <View className="flex-row flex-wrap">
                            {teams.map((teamNum) => (
                                <View key={teamNum} style={{ width: '33.33%', padding: 6 }}>
                                    <TouchableOpacity
                                        onPress={() => loadTeamStats(teamNum)}
                                        className="bg-neutral-900 border-2 border-emerald-500/20 rounded-2xl py-6 items-center justify-center"
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

            {/* ── Modal ──────────────────────────────────────────────────────── */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/95 justify-end">
                    <View
                        className="bg-neutral-900 rounded-t-[40px] border-t-2 border-emerald-500/30 overflow-hidden"
                        style={{ height: '88%' }}
                    >
                        {/* Handle + title */}
                        <View className="px-8 pt-8 pb-6 border-b border-white/5 items-center">
                            <View className="w-12 h-1.5 bg-neutral-800 rounded-full mb-6" />
                            <Text className="text-emerald-500 text-xs font-black uppercase tracking-[4px] mb-1">
                                Detailed Analysis
                            </Text>
                            <Text className="text-white text-5xl font-black tracking-tighter">
                                Team {selectedTeam}
                            </Text>
                            {hasGraphData && !loadingStats && (
                                <Text className="w-full text-center text-emerald-500 text-xs font-black uppercase tracking-[4px] mb-1">
                                    Tap A Stat for Per game performance
                                </Text>
                            )}
                        </View>

                        <ScrollView
                            style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {loadingStats ? (
                                <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color="#10b981" />
                                    <Text style={{ color: '#6b7280', fontWeight: '700', marginTop: 16, letterSpacing: 3, fontSize: 11 }}>
                                        SYNCING CLOUD DATA
                                    </Text>
                                </View>

                            ) : teamStats?.noData ? (
                                <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                                    <FontAwesome name="database" size={48} color="#374151" />
                                    <Text style={{ color: '#6b7280', fontWeight: '700', marginTop: 24, textAlign: 'center', paddingHorizontal: 40 }}>
                                        No records found for this team with active filters.
                                    </Text>
                                </View>

                            ) : (
                                <View style={{ paddingBottom: 48 }}>

                                    {/* ── 2×2 Stat Cards ───────────────────────
                                        Using explicit pixel widths — NativeWind
                                        gap+flex-wrap is unreliable in RN.       */}
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {STATS.map((stat, idx) => {
                                            const isActive = activeStat === stat.key;
                                            const isRight  = idx % 2 === 1;
                                            return (
                                                <TouchableOpacity
                                                    key={stat.key}
                                                    onPress={() =>
                                                        hasGraphData &&
                                                        setActiveStat(prev =>
                                                            prev === stat.key ? null : stat.key
                                                        )
                                                    }
                                                    activeOpacity={hasGraphData ? 0.7 : 1}
                                                    style={{
                                                        width:           CARD_W,
                                                        marginLeft:      isRight ? CARD_GAP : 0,
                                                        marginBottom:    CARD_GAP,
                                                        borderRadius:    24,
                                                        padding:         20,
                                                        borderWidth:     2,
                                                        backgroundColor: isActive ? '#10b981' : 'rgba(0,0,0,0.4)',
                                                        borderColor:     isActive ? '#10b981' : 'rgba(16,185,129,0.1)',
                                                    }}
                                                >
                                                    <Text style={{
                                                        fontSize:    10,
                                                        fontWeight:  '900',
                                                        letterSpacing: 1.5,
                                                        marginBottom: 4,
                                                        color: isActive ? 'rgba(0,0,0,0.6)' : '#737373',
                                                        textTransform: 'uppercase',
                                                    }}>
                                                        {stat.label}
                                                    </Text>
                                                    <Text style={{
                                                        fontSize:    32,
                                                        fontWeight:  '900',
                                                        letterSpacing: -1,
                                                        color: isActive ? '#000' : '#fff',
                                                    }}>
                                                        {stat.value}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* ── Line Graph ───────────────────────────── */}
                                    {activeStat && hasGraphData && graphData.length >= 2 && (
                                        <View style={{
                                            backgroundColor: 'rgba(0,0,0,0.4)',
                                            borderRadius:    24,
                                            borderWidth:     2,
                                            borderColor:     'rgba(16,185,129,0.2)',
                                            padding:         CHART_CARD_PADDING,
                                            marginBottom:    16,
                                        }}>
                                            <Text style={{
                                                color:        '#10b981',
                                                fontWeight:   '900',
                                                fontSize:     11,
                                                letterSpacing: 2,
                                                textTransform: 'uppercase',
                                                marginBottom: 4,
                                            }}>
                                                {activeStatMeta?.label} per Match
                                            </Text>
                                            <Text style={{
                                                color:        '#737373',
                                                fontSize:     11,
                                                marginBottom: 20,
                                            }}>
                                            </Text>
                                            <PureLineChart data={graphData} labels={graphLabels} />
                                        </View>
                                    )}

                                    {/* ── Qualitative ──────────────────────────── */}
                                    {teamStats?.qualitative && (
                                        <View style={{ marginTop: 8 }}>
                                            <Text style={{
                                                color:        '#10b981',
                                                fontWeight:   '900',
                                                fontSize:     11,
                                                letterSpacing: 2,
                                                textTransform: 'uppercase',
                                                marginBottom: 16,
                                                marginLeft:   4,
                                            }}>
                                                Qualitative (1–5)
                                            </Text>
                                            {[
                                                { label: 'Driving Skill',    val: teamStats.qualitative.AVGDriving  },
                                                { label: 'Defense Strength', val: teamStats.qualitative.AVGDefense  },
                                                { label: 'Scoring Accuracy', val: teamStats.qualitative.AVGAccuracy },
                                                { label: 'Intake Ability',   val: teamStats.qualitative.AVGIntake   },
                                            ].map((rate, i) => (
                                                <View key={i} style={{
                                                    flexDirection:   'row',
                                                    justifyContent:  'space-between',
                                                    alignItems:      'center',
                                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                                    padding:         20,
                                                    borderRadius:    16,
                                                    borderWidth:     2,
                                                    borderColor:     'rgba(16,185,129,0.05)',
                                                    marginBottom:    10,
                                                }}>
                                                    <Text style={{ color: '#d4d4d4', fontWeight: '700', fontSize: 16 }}>
                                                        {rate.label}
                                                    </Text>
                                                    <Text style={{ color: '#10b981', fontWeight: '900', fontSize: 24 }}>
                                                        {Number(rate.val).toFixed(1)}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="bg-emerald-500 py-8 items-center"
                        >
                            <Text className="text-black font-black text-xl uppercase tracking-tighter">
                                Close Analysis
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
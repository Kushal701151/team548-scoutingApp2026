import { StyleSheet, Alert, Platform } from "react-native";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Text, View } from "../../components/Themed";
import * as FileSystem from 'expo-file-system/legacy';
import {EncodingType} from "expo-file-system/legacy";
import {StorageAccessFramework} from "expo-file-system/legacy";
import {documentDirectory} from "expo-file-system/legacy";

import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwifgmdzmsdjpettsnaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aWZnbWR6bXNkanBldHRzbmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgwNDEsImV4cCI6MjA4NDQzNDA0MX0.wAODS7IkKYoQM3b8aaf7tu7kMSmDD9IkvbkYu1I_fdQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ExportScreen() {
    const [competitionCode, setCompetitionCode] = useState("");
    const [QvsQchoice, setQvsQchoice] = useState("Quantitative");
    const [scoutTeamFilter, setScoutTeamFilter] = useState('');


    const exportData = async (format: 'csv' | 'excel') => {
        if (!competitionCode || competitionCode.trim() === '') {
            Alert.alert('Missing Information', 'Please enter a competition code');
            return;
        }
        if (!QvsQchoice) {
            Alert.alert('Missing Selection', 'Please select Qualitative or Quantitative');
            return;
        }

        try {
            const functionName = QvsQchoice === 'Qualitative'
                ? 'export_qualitative_data'
                : 'export_quantitative_data';

            const { data, error } = await supabase.rpc(functionName, {
                comp_code: competitionCode,
                team_filter: scoutTeamFilter || null
            });

            if (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', `Failed to fetch data: ${error.message}`);
                return;
            }

            if (!data || data.length === 0) {
                Alert.alert('No Data', 'No data found for the specified criteria');
                return;
            }

            if (format === 'csv') {
                await exportToCSV(data, QvsQchoice, competitionCode);
            } else {
                await exportToExcel(data, QvsQchoice, competitionCode);
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export data');
        }
    };

    const exportToCSV = async (data: any[], dataType: string, competitionCode: string) => {
        try {
            const headers = Object.keys(data[0]);
            const csvHeaders = headers.join(',');
            const csvRows = data.map(row => {
                return headers.map(header => {
                    const value = row[header];
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value ?? '';
                }).join(',');
            });

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `${competitionCode}_${dataType}_${timestamp}.csv`;

            // Platform-specific saving
            if (Platform.OS === 'android') {
                // Android: Use Storage Access Framework
                const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (permissions.granted) {
                    try {
                        const uri = await StorageAccessFramework.createFileAsync(
                            permissions.directoryUri,
                            filename,
                            'text/csv'
                        );

                        await StorageAccessFramework.writeAsStringAsync(uri, csvContent, {
                            encoding: EncodingType.UTF8
                        });
                        Alert.alert('Success', `CSV file saved successfully as ${filename}`);
                    } catch (error) {
                        console.error('Error saving file:', error);
                        Alert.alert('Error', 'Failed to save file to selected location');
                    }
                } else {
                    Alert.alert('Permission Denied', 'Storage permission is required to save files');
                }
            } else {
                // iOS: Save to temp directory then share (user can choose where to save)
                const fileUri = documentDirectory + filename;
                await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                    encoding: EncodingType.UTF8
                });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'text/csv',
                        dialogTitle: 'Save Scouting Data',
                        UTI: 'public.comma-separated-values-text',
                    });
                } else {
                    Alert.alert('Success', `CSV file created at ${fileUri}`);
                }
            }
        } catch (error) {
            console.error('CSV export error:', error);
            Alert.alert('Error', 'Failed to create CSV file');
        }
    };

    const exportToExcel = async (data: any[], dataType: string, competitionCode: string) => {
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Scouting Data');
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `${competitionCode}_${dataType}_${timestamp}.xlsx`;

            // Platform-specific saving
            if (Platform.OS === 'android') {
                // Android: Use Storage Access Framework
                const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (permissions.granted) {
                    try {
                        const uri = await StorageAccessFramework.createFileAsync(
                            permissions.directoryUri,
                            filename,
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        );

                        await StorageAccessFramework.writeAsStringAsync(uri, wbout, {
                            encoding: EncodingType.Base64
                        });
                        Alert.alert('Success', `Excel file saved successfully as ${filename}`);
                    } catch (error) {
                        console.error('Error saving file:', error);
                        Alert.alert('Error', 'Failed to save file to selected location');
                    }
                } else {
                    Alert.alert('Permission Denied', 'Storage permission is required to save files');
                }
            } else {
                // iOS: Save to temp directory then share (user can choose where to save)
                const fileUri = documentDirectory + filename;
                await FileSystem.writeAsStringAsync(fileUri, wbout, {
                    encoding: EncodingType.Base64
                });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        dialogTitle: 'Save Scouting Data',
                    });
                } else {
                    Alert.alert('Success', `Excel file created at ${fileUri}`);
                }
            }
        } catch (error) {
            console.error('Excel export error:', error);
            Alert.alert('Error', 'Failed to create Excel file');
        }
    };

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="px-6 pt-16 pb-10 bg-black">

                {/* Header Section */}
                <View className="mb-10 bg-black">
                    <Text className="text-4xl font-black text-cyan-500 tracking-tighter">
                        Export
                    </Text>
                </View>

                {/* Form Section */}
                <View className="space-y-6 bg-black">

                    {/* Competition Input */}
                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Competition Code
                        </Text>
                        <TextInput
                            value={competitionCode}
                            onChangeText={setCompetitionCode}
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                            placeholder="Enter Event Key (e.g. 2024micmp)"
                            placeholderTextColor="#4b5563"
                        />
                    </View>

                    {/* Team Filter Input */}
                    <View className="bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            Scout Team Filter (Optional)
                        </Text>
                        <TextInput
                            value={scoutTeamFilter}
                            onChangeText={setScoutTeamFilter}
                            placeholder="Leave empty for all teams"
                            placeholderTextColor="#4b5563"
                            keyboardType="numeric"
                            className="bg-neutral-900 border-2 border-cyan-500/20 focus:border-cyan-500 rounded-2xl p-4 text-lg text-white"
                        />
                    </View>

                    {/* Selector Section */}
                    <View className="mt-4 bg-black">
                        <Text className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
                            Data Type
                        </Text>

                        <View className="flex-row gap-3 bg-black">


                            <TouchableOpacity
                                onPress={() => setQvsQchoice("Quantitative")}
                                className={`flex-1 py-4 rounded-2xl border-2 ${
                                    QvsQchoice === "Quantitative"
                                        ? 'bg-cyan-500 border-cyan-500'
                                        : 'bg-neutral-900 border-cyan-500/30'
                                }`}
                            >
                                <Text className={`text-center font-black uppercase tracking-tight ${
                                    QvsQchoice === "Quantitative" ? 'text-black' : 'text-cyan-500'
                                }`}>
                                    Quantitative
                                </Text>
                            </TouchableOpacity>


                            <TouchableOpacity
                                onPress={() => setQvsQchoice("Qualitative")}
                                className={`flex-1 py-4 rounded-2xl border-2 ${
                                    QvsQchoice === "Qualitative"
                                        ? 'bg-cyan-500 border-cyan-500'
                                        : 'bg-neutral-900 border-cyan-500/30'
                                }`}
                            >
                                <Text className={`text-center font-black uppercase tracking-tight ${
                                    QvsQchoice === "Qualitative" ? 'text-black' : 'text-cyan-500'
                                }`}>
                                    Qualitative
                                </Text>
                            </TouchableOpacity>


                        </View>
                    </View>
                </View>

                {/* Action Section */}
                <View className="mt-12 bg-black">
                    <Text className="text-neutral-500 text-center text-xs font-bold uppercase tracking-[4px] mb-4">
                        Export Options
                    </Text>

                    <View className="flex-row gap-4 bg-black">
                        <TouchableOpacity
                            onPress={() => exportData('csv')}
                            className="flex-1 bg-cyan-500 py-5 rounded-2xl shadow-lg shadow-cyan-500/40"
                        >
                            <Text className="text-black font-black text-xl text-center uppercase tracking-tighter">
                                CSV
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => exportData('excel')}
                            className="flex-1 bg-cyan-500 py-5 rounded-2xl shadow-lg shadow-cyan-500/40"
                        >
                            <Text className="text-black font-black text-xl text-center uppercase tracking-tighter">
                                EXCEL
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
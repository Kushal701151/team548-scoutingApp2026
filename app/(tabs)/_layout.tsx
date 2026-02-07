import FontAwesome from "@expo/vector-icons/FontAwesome";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity } from "react-native";
import {
    DrawerContentScrollView,
    DrawerContentComponentProps,
} from '@react-navigation/drawer';


function DrawerIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>["name"];
    color: string;
    size?: number;
}) {
    return <FontAwesome size={props.size || 24} {...props} />;
}


function CustomDrawerItem({
                              label,
                              icon,
                              onPress,
                              isActive,
                              accentColor
                          }: {
    label: string;
    icon: string;
    onPress: () => void;
    isActive?: boolean;
    accentColor: 'cyan' | 'emerald' | 'sky';
}) {
    // Define your color mappings clearly
    const theme = {
        cyan: {
            bg: 'bg-cyan-500/10 border-l-4 border-cyan-500',
            text: 'text-cyan-400',
            icon: '#22d3ee' // cyan-400
        },
        emerald: {
            bg: 'bg-emerald-500/10 border-l-4 border-emerald-500',
            text: 'text-emerald-400',
            icon: '#34d399' // emerald-400
        },
        sky: {
            bg: 'bg-blue-500/10 border-l-4 border-blue-500',
            text: 'text-blue-400',
            icon: '#51a2ff' // blue-400
        }
    };

    const activeStyle = theme[accentColor];

    return (
        <TouchableOpacity
            onPress={onPress}
            // Use logical AND for cleaner class injection
            className={`flex-row items-center px-4 py-3 mx-2 rounded-lg mb-1 ${
                isActive ? activeStyle.bg : 'border-l-4 border-transparent'
            }`}
        >
            <DrawerIcon
                name={icon as any}
                color={isActive ? activeStyle.icon : '#6b7280'} // gray-500 for inactive
                size={22}
            />
            <Text className={`ml-4 text-base font-semibold ${
                isActive ? activeStyle.text : 'text-gray-500'
            }`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

/**
 * Custom drawer content with section headers
 */
function CustomDrawerContent(props: DrawerContentComponentProps) {
    const currentRoute = props.state.routeNames[props.state.index];

    // Determine color based on current route
    const getTitleColor = () => {
        // Scouting screens = blue
        if (['quantitative', 'qualitative', 'Qualitative'].includes(currentRoute)) {
            return 'text-blue-500';
        }
        // Analysis screens = emerald
        if (['teamData', 'Aallianceanylsis', 'charts'].includes(currentRoute)) {
            return 'text-emerald-500';
        }
        // Misc screens = cyan
        if (['history', 'presets', 'export'].includes(currentRoute)) {
            return 'text-cyan-500';
        }
        // Default
        return 'text-blue-500';
    };

    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: '#141414' }}>
            {/* App Title - Dynamic Color */}
            <View className="px-4 py-6 border-b border-gray-700">
                <Text className={`${getTitleColor()} text-2xl font-bold`}>
                    MANE FRAME
                </Text>
            </View>

            {/* Scouting Section */}
            <View className="mt-4">
                <Text className="px-4 py-2 text-gray-400 text-xs font-bold tracking-wider">
                    SCOUTING
                </Text>
                <CustomDrawerItem
                    label="Quantitative"
                    icon="hashtag"
                    onPress={() => props.navigation.navigate('quantitative')}
                    isActive={currentRoute === 'quantitative'}
                    accentColor="sky"
                />
                <CustomDrawerItem
                    label="Qualitative"
                    icon="comment"
                    onPress={() => props.navigation.navigate('qualitative')}
                    isActive={currentRoute === 'qualitative'}
                    accentColor="sky"
                />
            </View>

            {/* Analysis Section */}
            <View className="mt-6">
                <Text className="px-4 py-2 text-gray-400 text-xs font-bold tracking-wider">
                    ANALYSIS
                </Text>
                <CustomDrawerItem
                    label="Team Anylsis"
                    icon="gears"
                    onPress={() => props.navigation.navigate('teamData')}
                    isActive={currentRoute === 'teamData'}
                    accentColor="emerald"
                />
                <CustomDrawerItem
                    label="Alliance Anylsis"
                    icon="users"
                    onPress={() => props.navigation.navigate('Aallianceanylsis')}
                    isActive={currentRoute === 'Aallianceanylsis'}
                    accentColor="emerald"
                />
                <CustomDrawerItem
                    label="Competition Anylsis"
                    icon="bar-chart"
                    onPress={() => props.navigation.navigate('charts')}
                    isActive={currentRoute === 'charts'}
                    accentColor="emerald"
                />
            </View>

            {/* Misc Section */}
            <View className="mt-6">
                <Text className="px-4 py-2 text-gray-400 text-xs font-bold tracking-wider">
                    MISC
                </Text>
                <CustomDrawerItem
                    label="History"
                    icon="history"
                    onPress={() => props.navigation.navigate('history')}
                    isActive={currentRoute === 'history'}
                    accentColor="cyan"
                />
                <CustomDrawerItem
                    label="Presets"
                    icon="save"
                    onPress={() => props.navigation.navigate('presets')}
                    isActive={currentRoute === 'presets'}
                    accentColor="cyan"
                />
                <CustomDrawerItem
                    label="Export"
                    icon="upload"
                    onPress={() => props.navigation.navigate('export')}
                    isActive={currentRoute === 'export'}
                    accentColor="cyan"
                />
            </View>
        </DrawerContentScrollView>
    );
}

export default function DrawerLayout() {
    return (
        <GestureHandlerRootView className="flex-1">
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    drawerStyle: {
                        backgroundColor: '#111827',
                        width: 280,
                    },
                    headerStyle: {
                        backgroundColor: '#000000',
                    },
                    headerTintColor: '#06b6d4',
                    headerTitleStyle: {
                        color: '#ffffff',
                        fontWeight: 'bold',
                    },
                }}
            >
                <Drawer.Screen
                    name="quantitative"
                    options={{
                        title: "",
                        headerTintColor: '#3b82f6', // blue-500
                    }}
                />

                <Drawer.Screen
                    name="qualitative"
                    options={{
                        title: "",
                        headerTintColor: '#3b82f6', // blue-500
                    }}
                />

                <Drawer.Screen
                    name="export"
                    options={{
                        title: "",
                        headerTintColor: '#06b6d4', // cyan-500
                    }}
                />

                <Drawer.Screen
                    name="Aallianceanylsis"
                    options={{
                        title: "",
                        headerTintColor: '#10b981', // emerald-500
                    }}
                />

                <Drawer.Screen
                    name="teamData"
                    options={{
                        title: "",
                        headerTintColor: '#10b981', // emerald-500
                    }}
                />

                <Drawer.Screen
                    name="charts"
                    options={{
                        title: "",
                        headerTintColor: '#10b981', // emerald-500
                    }}
                />

                <Drawer.Screen
                    name="history"
                    options={{
                        title: "",
                        headerTintColor: '#06b6d4', // cyan-500
                    }}
                />

                <Drawer.Screen
                    name="presets"
                    options={{
                        title: "",
                        headerTintColor: '#06b6d4', // cyan-500
                    }}
                />

                {/* Hide duplicate */}
                <Drawer.Screen
                    name="Qualitative"
                    options={{
                        drawerItemStyle: { display: 'none' },
                        headerShown: false,
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}

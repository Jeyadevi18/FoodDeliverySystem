import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import Landing from '../screens/Landing';
import Login from '../screens/Login';
import Register from '../screens/Register';

// Customer Screens
import CustomerDashboard from '../screens/customer/Dashboard';
import Menu from '../screens/customer/Menu';
import Cart from '../screens/customer/Cart';
import Checkout from '../screens/customer/Checkout';
import OrderHistory from '../screens/customer/OrderHistory';
import CustomerTracking from '../screens/customer/Tracking';

// Admin Screens
import AdminDashboard from '../screens/admin/Dashboard';
import AdminFoods from '../screens/admin/Foods';
import AdminOrders from '../screens/admin/Orders';
import AdminUsers from '../screens/admin/Users';

// Delivery Screens
import DeliveryDashboard from '../screens/delivery/Dashboard';
import DeliveryTracking from '../screens/delivery/Tracking';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabBarIcon = (name) => ({ color, size }) => (
    <Text style={{ fontSize: size, color }}>{name}</Text>
);

function CustomerTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#FF6B35' },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: '#888',
            }}
        >
            <Tab.Screen name="Home" component={CustomerDashboard} options={{ tabBarIcon: tabBarIcon('🏠') }} />
            <Tab.Screen name="Menu" component={Menu} options={{ tabBarIcon: tabBarIcon('🍔') }} />
            <Tab.Screen name="Cart" component={Cart} options={{ tabBarIcon: tabBarIcon('🛒') }} />
            <Tab.Screen name="Orders" component={OrderHistory} options={{ tabBarIcon: tabBarIcon('📦') }} />
        </Tab.Navigator>
    );
}

function AdminTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#FF6B35' },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: '#888',
            }}
        >
            <Tab.Screen name="Dashboard" component={AdminDashboard} options={{ tabBarIcon: tabBarIcon('📊') }} />
            <Tab.Screen name="Foods" component={AdminFoods} options={{ tabBarIcon: tabBarIcon('🍽️') }} />
            <Tab.Screen name="Orders" component={AdminOrders} options={{ tabBarIcon: tabBarIcon('📋') }} />
            <Tab.Screen name="Users" component={AdminUsers} options={{ tabBarIcon: tabBarIcon('👥') }} />
        </Tab.Navigator>
    );
}

function DeliveryTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#FF6B35' },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: '#888',
            }}
        >
            <Tab.Screen name="Dashboard" component={DeliveryDashboard} options={{ tabBarIcon: tabBarIcon('🚴') }} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    const getMainScreen = () => {
        if (!user) return null;
        if (user.role === 'admin') return AdminTabs;
        if (user.role === 'delivery') return DeliveryTabs;
        return CustomerTabs;
    };

    const MainScreen = getMainScreen();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Landing" component={Landing} />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Register" component={Register} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainScreen} />
                        {user.role === 'customer' && (
                            <>
                                <Stack.Screen name="Checkout" component={Checkout} />
                                <Stack.Screen name="Tracking" component={CustomerTracking} />
                            </>
                        )}
                        {user.role === 'delivery' && (
                            <Stack.Screen name="DeliveryTracking" component={DeliveryTracking} />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

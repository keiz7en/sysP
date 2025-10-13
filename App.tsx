// @ts-ignore
import React, {useEffect, useState} from 'react';

import {
    StatusBar,
} from "react-native";
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider as PaperProvider, DefaultTheme} from 'react-native-paper';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import AssessmentsScreen from './src/screens/AssessmentsScreen';
import CareerScreen from './src/screens/CareerScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import StudentProfileScreen from './src/screens/StudentProfileScreen';
import TeacherDashboardScreen from './src/screens/TeacherDashboardScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import LearningPathScreen from './src/screens/LearningPathScreen';
import SkillAssessmentScreen from './src/screens/SkillAssessmentScreen';
import ResumeBuilderScreen from './src/screens/ResumeBuilderScreen';
import JobRecommendationsScreen from './src/screens/JobRecommendationsScreen';

// Import Redux store
import {store, persistor} from './src/store/store';

// Import components
import LoadingScreen from './src/components/LoadingScreen';
import CustomTabBar from './src/components/CustomTabBar';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom theme
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#6366f1',
        accent: '#8b5cf6',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
        error: '#ef4444',
    },
};

// Main Tab Navigator for Students
function StudentTabNavigator() {
  return (
      <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
          }}>
          <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                  tabBarIcon: ({focused}) => (
                      <Icon
                          name="dashboard"
                          size={24}
                          color={focused ? '#6366f1' : '#64748b'}
                      />
                  ),
              }}
          />
          <Tab.Screen
              name="Courses"
              component={CoursesScreen}
              options={{
                  tabBarIcon: ({focused}) => (
                      <Icon
                          name="school"
                          size={24}
                          color={focused ? '#6366f1' : '#64748b'}
                      />
                  ),
              }}
          />
          <Tab.Screen
              name="Assessments"
              component={AssessmentsScreen}
              options={{
                  tabBarIcon: ({focused}) => (
                      <Icon
                          name="quiz"
                          size={24}
                          color={focused ? '#6366f1' : '#64748b'}
                      />
                  ),
              }}
          />
          <Tab.Screen
              name="Career"
              component={CareerScreen}
              options={{
                  tabBarIcon: ({focused}) => (
                      <Icon
                          name="work"
                          size={24}
                          color={focused ? '#6366f1' : '#64748b'}
                      />
                  ),
              }}
          />
          <Tab.Screen
              name="AI Chat"
              component={ChatbotScreen}
              options={{
                  tabBarIcon: ({focused}) => (
                      <Icon
                          name="smart-toy"
                          size={24}
                          color={focused ? '#6366f1' : '#64748b'}
                      />
                  ),
              }}
          />
      </Tab.Navigator>
  );
}

// Main Tab Navigator for Teachers
function TeacherTabNavigator() {
  return (
      <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
          }}>
          <Tab.Screen
              name="Dashboard"
              component={TeacherDashboardScreen}
              options={{
                  tabBarIcon: ({focused}) => (
                      <Icon
                          name="dashboard"
                          size={24}
                          color={focused ? '#6366f1' : '#64748b'}
                      />
                  ),
              }}
      />
        <Tab.Screen
            name="Courses"
            component={CoursesScreen}
            options={{
                tabBarIcon: ({focused}) => (
                    <Icon
                        name="school"
                        size={24}
                        color={focused ? '#6366f1' : '#64748b'}
                    />
                ),
            }}
        />
        <Tab.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{
                tabBarIcon: ({focused}) => (
                    <Icon
                        name="analytics"
                        size={24}
                        color={focused ? '#6366f1' : '#64748b'}
                    />
                ),
            }}
        />
        <Tab.Screen
            name="Assessments"
            component={AssessmentsScreen}
            options={{
                tabBarIcon: ({focused}) => (
                    <Icon
                        name="quiz"
                        size={24}
                        color={focused ? '#6366f1' : '#64748b'}
                    />
                ),
            }}
        />
        <Tab.Screen
            name="AI Chat"
            component={ChatbotScreen}
            options={{
                tabBarIcon: ({focused}) => (
                    <Icon
                        name="smart-toy"
                        size={24}
                        color={focused ? '#6366f1' : '#64748b'}
                    />
                ),
            }}
        />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function MainNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userType, setUserType] = useState('student'); // 'student', 'teacher', 'admin'
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // Check authentication status and user preferences
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            // Simulate checking stored authentication
            setTimeout(() => {
                setIsLoading(false);
                // For demo purposes, show onboarding
                setShowOnboarding(true);
            }, 2000);
        } catch {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingScreen/>;
    }

    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            {showOnboarding ? (
                <Stack.Screen name="Onboarding">
                    {() => (
                        <OnboardingScreen
                            onComplete={() => {
                                setShowOnboarding(false);
                                setIsLoggedIn(false);
                            }}
                        />
                    )}
                </Stack.Screen>
            ) : !isLoggedIn ? (
                <Stack.Screen name="Login">
                    {() => (
                        <LoginScreen
                            onLogin={(type) => {
                                setUserType(type);
                                setIsLoggedIn(true);
                            }}
                        />
                    )}
                </Stack.Screen>
            ) : (
                <>
                    <Stack.Screen name="MainTabs">
                        {() => userType === 'teacher' ? <TeacherTabNavigator/> : <StudentTabNavigator/>}
                    </Stack.Screen>
                    <Stack.Screen name="Profile" component={ProfileScreen}/>
                    <Stack.Screen name="StudentProfile" component={StudentProfileScreen}/>
                    <Stack.Screen name="LearningPath" component={LearningPathScreen}/>
                    <Stack.Screen name="SkillAssessment" component={SkillAssessmentScreen}/>
                    <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen}/>
                    <Stack.Screen name="JobRecommendations" component={JobRecommendationsScreen}/>
                </>
            )}
        </Stack.Navigator>
    );
}

// Main App Component
function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingScreen/>} persistor={persistor}>
                <PaperProvider theme={theme}>
                    <SafeAreaProvider>
                        <StatusBar
                            barStyle="dark-content"
                            backgroundColor="#f8fafc"
                            translucent={false}
                        />
                        <NavigationContainer>
                            <MainNavigator/>
                        </NavigationContainer>
                    </SafeAreaProvider>
                </PaperProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;

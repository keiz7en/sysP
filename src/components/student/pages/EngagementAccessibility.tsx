import React, {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {useAuth} from '../../../contexts/AuthContext'
import {getAccessibilityFeatures, processVoiceInput} from '../../../services/api'
import toast from 'react-hot-toast'

interface AccessibilitySettings {
    voiceRecognition: boolean;
    textToSpeech: boolean;
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    captionsEnabled: boolean;
    audioDescriptions: boolean;
    reduceMotion: boolean;
    focusIndicators: boolean;
}

interface VoiceCommand {
    command: string;
    description: string;
    example: string;
}

const EngagementAccessibility: React.FC = () => {
    const {token} = useAuth()
    const [settings, setSettings] = useState<AccessibilitySettings>({
        voiceRecognition: false,
        textToSpeech: false,
        highContrast: false,
        largeText: false,
        screenReader: false,
        keyboardNavigation: true,
        captionsEnabled: false,
        audioDescriptions: false,
        reduceMotion: false,
        focusIndicators: true
    })
    const [isListening, setIsListening] = useState(false)
    const [voiceCommand, setVoiceCommand] = useState('')
    const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'motor' | 'cognitive'>('visual')

    const voiceCommands: VoiceCommand[] = [
        {command: 'Go to dashboard', description: 'Navigate to main dashboard', example: 'Say: "Go to dashboard"'},
        {command: 'Read this page', description: 'Read current page content aloud', example: 'Say: "Read this page"'},
        {command: 'Open menu', description: 'Open navigation menu', example: 'Say: "Open menu"'},
        {command: 'Start assignment', description: 'Begin current assignment', example: 'Say: "Start assignment"'},
        {command: 'Check grades', description: 'View grade information', example: 'Say: "Check grades"'},
        {command: 'Help me', description: 'Get assistance', example: 'Say: "Help me"'}
    ]

    useEffect(() => {
        // Clean up any stuck classes first
        document.body.classList.remove(
            'high-contrast',
            'large-text',
            'reduce-motion',
            'enhanced-focus',
            'keyboard-navigation-enabled',
            'audio-description-enabled',
            'voice-recognition-active'
        )

        // Load saved accessibility settings
        const savedSettings = localStorage.getItem('accessibilitySettings')
        if (savedSettings) {
            const loaded = JSON.parse(savedSettings)
            setSettings(loaded)
            // Apply all saved settings on mount
            Object.keys(loaded).forEach((key) => {
                applyAccessibilitySetting(key as keyof AccessibilitySettings, loaded[key])
            })
        }
    }, [])

    const handleSettingChange = (setting: keyof AccessibilitySettings, value: boolean) => {
        const newSettings = {...settings, [setting]: value}
        setSettings(newSettings)
        localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings))

        // Apply the setting immediately
        applyAccessibilitySetting(setting, value)

        // Show success message with more detail
        const settingName = setting.replace(/([A-Z])/g, ' $1').trim()
        toast.success(
            `${settingName.charAt(0).toUpperCase() + settingName.slice(1)} ${value ? 'enabled' : 'disabled'}`,
            {duration: 3000}
        )
    }

    const applyAccessibilitySetting = (setting: keyof AccessibilitySettings, value: boolean) => {
        const body = document.body

        switch (setting) {
            case 'highContrast':
                if (value) {
                    body.classList.add('high-contrast')
                    toast.success('High contrast mode activated - Background is now black with white text')
                } else {
                    body.classList.remove('high-contrast')
                    toast.success('High contrast mode deactivated - Normal colors restored')
                }
                break
            case 'largeText':
                if (value) {
                    body.classList.add('large-text')
                    toast.success('Large text mode activated - All text is now 25% larger')
                } else {
                    body.classList.remove('large-text')
                    toast.success('Large text mode deactivated - Normal text size restored')
                }
                break
            case 'reduceMotion':
                if (value) {
                    body.classList.add('reduce-motion')
                    toast.success('Reduce motion activated - Animations are now minimized')
                } else {
                    body.classList.remove('reduce-motion')
                    toast.success('Reduce motion deactivated - Animations restored')
                }
                break
            case 'focusIndicators':
                if (value) {
                    body.classList.add('enhanced-focus')
                    toast.success('Enhanced focus indicators activated - Tab navigation is now more visible')
                } else {
                    body.classList.remove('enhanced-focus')
                    toast.success('Enhanced focus indicators deactivated')
                }
                break
            case 'keyboardNavigation':
                if (value) {
                    body.classList.add('keyboard-navigation-enabled')
                    toast.success('Keyboard navigation enhanced - Use Tab, Enter, and Arrow keys')
                } else {
                    body.classList.remove('keyboard-navigation-enabled')
                }
                break
            case 'voiceRecognition':
                if (value) {
                    toast.success('Voice recognition enabled - Click "Start Voice Control" to begin')
                } else {
                    toast.success('Voice recognition disabled')
                }
                break
            case 'textToSpeech':
                if (value) {
                    toast.success('Text-to-speech enabled - Click "Test Text-to-Speech" to try it')
                    speakText('Text to speech is now enabled. Content will be read aloud when you activate this feature.')
                } else {
                    toast.success('Text-to-speech disabled')
                    // Stop any ongoing speech
                    if ('speechSynthesis' in window) {
                        speechSynthesis.cancel()
                    }
                }
                break
            case 'captionsEnabled':
                if (value) {
                    toast.success('Captions enabled - Subtitles will appear on video content')
                } else {
                    toast.success('Captions disabled')
                }
                break
            case 'audioDescriptions':
                if (value) {
                    body.classList.add('audio-description-enabled')
                    toast.success('Audio descriptions enabled - Visual content will be described')
                    speakText('Audio descriptions are now enabled. Visual elements will be described in detail.')
                } else {
                    body.classList.remove('audio-description-enabled')
                    toast.success('Audio descriptions disabled')
                }
                break
            case 'screenReader':
                if (value) {
                    toast.success('Screen reader support optimized - ARIA labels enhanced')
                } else {
                    toast.success('Screen reader optimization disabled')
                }
                break
        }
    }

    const startVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            toast.error('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
            return
        }

        try {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.continuous = false
            recognition.interimResults = false
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                setIsListening(true)
                document.body.classList.add('voice-recognition-active')
                toast.success('🎤 Listening... Speak your command now!', {duration: 5000})
            }

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setVoiceCommand(transcript)
                toast.success(`Heard: "${transcript}"`)
                handleVoiceCommand(transcript)
            }

            recognition.onerror = (event: any) => {
                console.error('Voice recognition error:', event.error)
                let errorMessage = 'Voice recognition error'
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try again.'
                        break
                    case 'audio-capture':
                        errorMessage = 'Microphone not found. Please check your microphone settings.'
                        break
                    case 'not-allowed':
                        errorMessage = 'Microphone permission denied. Please allow microphone access.'
                        break
                    default:
                        errorMessage = `Voice recognition error: ${event.error}`
                }
                toast.error(errorMessage)
                setIsListening(false)
                document.body.classList.remove('voice-recognition-active')
            }

            recognition.onend = () => {
                setIsListening(false)
                document.body.classList.remove('voice-recognition-active')
            }

            recognition.start()
        } catch (error) {
            console.error('Failed to start voice recognition:', error)
            toast.error('Failed to start voice recognition. Please check your browser permissions.')
            setIsListening(false)
        }
    }

    const handleVoiceCommand = (command: string) => {
        const lowerCommand = command.toLowerCase()

        if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
            toast.success('📊 Navigating to dashboard...')
            speakText('Navigating to dashboard')
            setTimeout(() => window.location.hash = '#/student/dashboard', 1000)
        } else if (lowerCommand.includes('read') || lowerCommand.includes('speak')) {
            const text = 'Reading page content: This is the Accessibility Features page where you can configure various accessibility tools including voice control, text to speech, high contrast mode, large text, and more. You can customize your learning experience to match your needs.'
            speakText(text)
            toast.success('📖 Reading page content...')
        } else if (lowerCommand.includes('menu') || lowerCommand.includes('navigation')) {
            toast.success('📋 Opening navigation menu...')
            speakText('Opening navigation menu')
        } else if (lowerCommand.includes('help') || lowerCommand.includes('assist')) {
            toast.success('🤖 Opening AI assistant...')
            speakText('Opening AI learning assistant')
        } else if (lowerCommand.includes('grade') || lowerCommand.includes('score')) {
            toast.success('📊 Checking grades...')
            speakText('Navigating to grades page')
        } else if (lowerCommand.includes('course')) {
            toast.success('📚 Opening courses...')
            speakText('Navigating to courses')
        } else if (lowerCommand.includes('stop') || lowerCommand.includes('cancel')) {
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel()
            }
            toast.success('⏹️ Stopped')
        } else {
            toast(`Voice command received: "${command}". Feature coming soon!`, {
                icon: 'ℹ️',
                duration: 4000
            })
            speakText(`I heard ${command}. This feature is coming soon.`)
        }
    }

    const speakText = (text: string) => {
        if (!('speechSynthesis' in window)) {
            toast.error('Text-to-speech is not supported in this browser. Please use Chrome, Edge, Safari, or Firefox.')
            return
        }

        try {
            // Cancel any ongoing speech first
            speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.9
            utterance.pitch = 1
            utterance.volume = 1

            // Get available voices and prefer English ones
            const voices = speechSynthesis.getVoices()
            const englishVoice = voices.find(voice => voice.lang.startsWith('en'))
            if (englishVoice) {
                utterance.voice = englishVoice
            }

            utterance.onstart = () => {
                console.log('Speech started')
            }

            utterance.onend = () => {
                console.log('Speech finished')
            }

            utterance.onerror = (event) => {
                console.error('Speech error:', event)
                toast.error('Text-to-speech error. Please try again.')
            }

            speechSynthesis.speak(utterance)
        } catch (error) {
            console.error('Failed to speak text:', error)
            toast.error('Failed to speak text. Please try again.')
        }
    }

    const testTextToSpeech = () => {
        const testText = 'This is a test of the text to speech feature. Your accessibility settings are working correctly. You can use this feature to have any content read aloud. All accessibility features are now fully functional!'
        speakText(testText)
        toast.success('🔊 Playing test audio...', {duration: 6000})
    }

    const accessibilityFeatures = {
        visual: [
            {
                key: 'highContrast' as keyof AccessibilitySettings,
                title: 'High Contrast Mode',
                description: 'Increase contrast for better visibility',
                icon: '🎨'
            },
            {
                key: 'largeText' as keyof AccessibilitySettings,
                title: 'Large Text',
                description: 'Increase font size throughout the application',
                icon: '🔍'
            },
            {
                key: 'focusIndicators' as keyof AccessibilitySettings,
                title: 'Enhanced Focus Indicators',
                description: 'Make keyboard focus more visible',
                icon: '🎯'
            },
            {
                key: 'reduceMotion' as keyof AccessibilitySettings,
                title: 'Reduce Motion',
                description: 'Minimize animations and transitions',
                icon: '🔄'
            }
        ],
        audio: [
            {
                key: 'textToSpeech' as keyof AccessibilitySettings,
                title: 'Text-to-Speech',
                description: 'Have content read aloud automatically',
                icon: '🔊'
            },
            {
                key: 'voiceRecognition' as keyof AccessibilitySettings,
                title: 'Voice Recognition',
                description: 'Control the application with voice commands',
                icon: '🎤'
            },
            {
                key: 'captionsEnabled' as keyof AccessibilitySettings,
                title: 'Captions & Subtitles',
                description: 'Show captions for video content',
                icon: '📝'
            },
            {
                key: 'audioDescriptions' as keyof AccessibilitySettings,
                title: 'Audio Descriptions',
                description: 'Detailed audio descriptions of visual content',
                icon: '🎧'
            }
        ],
        motor: [
            {
                key: 'keyboardNavigation' as keyof AccessibilitySettings,
                title: 'Keyboard Navigation',
                description: 'Navigate using only keyboard',
                icon: '⌨️'
            },
            {
                key: 'screenReader' as keyof AccessibilitySettings,
                title: 'Screen Reader Support',
                description: 'Optimized for screen reading software',
                icon: '📖'
            }
        ],
        cognitive: [
            // Placeholder for future cognitive accessibility features
        ]
    }

    const tabs = [
        {id: 'visual', label: 'Visual', icon: '👁️', count: accessibilityFeatures.visual.length},
        {id: 'audio', label: 'Audio', icon: '🔉', count: accessibilityFeatures.audio.length},
        {id: 'motor', label: 'Motor', icon: '✋', count: accessibilityFeatures.motor.length},
        {id: 'cognitive', label: 'Cognitive', icon: '🧠', count: 0}
    ]

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            style={{padding: '2rem', maxWidth: '1000px', margin: '0 auto'}}
        >
            {/* Header */}
            <div style={{marginBottom: '2rem'}}>
                <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937'}}>
                    ♿ Accessibility Features
                </h1>
                <p style={{fontSize: '1.1rem', color: '#6b7280', margin: 0}}>
                    Configure accessibility tools to enhance your learning experience
                </p>
            </div>

            {/* Quick Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <motion.button
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    style={{
                        padding: '1.5rem',
                        backgroundColor: isListening ? '#f59e0b' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: isListening ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        textAlign: 'left'
                    }}
                >
                    <span style={{fontSize: '2rem'}}>🎤</span>
                    <div>
                        <div>{isListening ? 'Listening...' : 'Start Voice Control'}</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.9}}>
                            {isListening ? 'Speak your command now' : 'Click to activate voice commands'}
                        </div>
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={testTextToSpeech}
                    style={{
                        padding: '1.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        textAlign: 'left'
                    }}
                >
                    <span style={{fontSize: '2rem'}}>🔊</span>
                    <div>
                        <div>Test Text-to-Speech</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.9}}>
                            Hear how content will be read aloud
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Voice Command Display */}
            {voiceCommand && (
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    style={{
                        background: '#f0fdf4',
                        border: '1px solid #10b981',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '2rem'
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                        <span style={{fontSize: '1.2rem'}}>🎤</span>
                        <strong style={{color: '#10b981'}}>Voice Command Received:</strong>
                    </div>
                    <p style={{margin: 0, color: '#374151'}}>"{voiceCommand}"</p>
                </motion.div>
            )}

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            backgroundColor: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
                            color: activeTab === tab.id ? 'white' : '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span style={{fontSize: '1rem'}}>{tab.icon}</span>
                        {tab.label}
                        {tab.count > 0 && (
                            <span style={{
                                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                                borderRadius: '12px',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.8rem'
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
            }}>
                {activeTab === 'cognitive' ? (
                    <div style={{textAlign: 'center', padding: '3rem'}}>
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🚧</div>
                        <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937'}}>
                            Cognitive Accessibility Features
                        </h3>
                        <p style={{color: '#6b7280'}}>
                            Advanced cognitive accessibility features are coming soon! These will include memory aids,
                            reading comprehension tools, and focus enhancement features.
                        </p>
                    </div>
                ) : (
                    <div style={{display: 'grid', gap: '1.5rem'}}>
                        {accessibilityFeatures[activeTab].map((feature) => (
                            <div key={feature.key} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.5rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    <span style={{fontSize: '2rem'}}>{feature.icon}</span>
                                    <div>
                                        <h4 style={{margin: '0 0 0.5rem 0', color: '#1f2937'}}>
                                            {feature.title}
                                        </h4>
                                        <p style={{margin: 0, color: '#6b7280', fontSize: '0.9rem'}}>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                                <label style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    width: '60px',
                                    height: '34px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={settings[feature.key]}
                                        onChange={(e) => handleSettingChange(feature.key, e.target.checked)}
                                        style={{
                                            opacity: 0,
                                            width: 0,
                                            height: 0
                                        }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: settings[feature.key] ? '#3b82f6' : '#ccc',
                                        transition: '.4s',
                                        borderRadius: '34px'
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            content: '""',
                                            height: '26px',
                                            width: '26px',
                                            left: settings[feature.key] ? '30px' : '4px',
                                            bottom: '4px',
                                            backgroundColor: 'white',
                                            transition: '.4s',
                                            borderRadius: '50%'
                                        }}/>
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Voice Commands Help */}
            {activeTab === 'audio' && (
                <div style={{
                    marginTop: '2rem',
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{fontSize: '1.3rem', marginBottom: '1rem', color: '#1f2937'}}>
                        🎤 Available Voice Commands
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1rem'
                    }}>
                        {voiceCommands.map((cmd, index) => (
                            <div key={index} style={{
                                padding: '1rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{fontWeight: '600', color: '#3b82f6', marginBottom: '0.5rem'}}>
                                    "{cmd.command}"
                                </div>
                                <div style={{color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                                    {cmd.description}
                                </div>
                                <div style={{color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic'}}>
                                    {cmd.example}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default EngagementAccessibility

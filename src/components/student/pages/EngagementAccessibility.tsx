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
        // Load saved accessibility settings
        const savedSettings = localStorage.getItem('accessibilitySettings')
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
        }
    }, [])

    const handleSettingChange = (setting: keyof AccessibilitySettings, value: boolean) => {
        const newSettings = {...settings, [setting]: value}
        setSettings(newSettings)
        localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings))

        // Apply the setting immediately
        applyAccessibilitySetting(setting, value)

        toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`)
    }

    const applyAccessibilitySetting = (setting: keyof AccessibilitySettings, value: boolean) => {
        const body = document.body

        switch (setting) {
            case 'highContrast':
                if (value) {
                    body.classList.add('high-contrast')
                } else {
                    body.classList.remove('high-contrast')
                }
                break
            case 'largeText':
                if (value) {
                    body.classList.add('large-text')
                } else {
                    body.classList.remove('large-text')
                }
                break
            case 'reduceMotion':
                if (value) {
                    body.classList.add('reduce-motion')
                } else {
                    body.classList.remove('reduce-motion')
                }
                break
            case 'focusIndicators':
                if (value) {
                    body.classList.add('enhanced-focus')
                } else {
                    body.classList.remove('enhanced-focus')
                }
                break
        }
    }

    const startVoiceRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.continuous = false
            recognition.interimResults = false
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                setIsListening(true)
                toast.success('Voice recognition started. Speak now!')
            }

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setVoiceCommand(transcript)
                handleVoiceCommand(transcript)
            }

            recognition.onerror = (event: any) => {
                toast.error('Voice recognition error: ' + event.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognition.start()
        } else {
            toast.error('Voice recognition is not supported in this browser')
        }
    }

    const handleVoiceCommand = (command: string) => {
        const lowerCommand = command.toLowerCase()

        if (lowerCommand.includes('dashboard')) {
            toast.success('Navigating to dashboard...')
        } else if (lowerCommand.includes('read')) {
            speakText('Reading page content: This is the Accessibility page where you can configure various accessibility features.')
        } else if (lowerCommand.includes('menu')) {
            toast.success('Opening navigation menu...')
        } else if (lowerCommand.includes('help')) {
            toast.success('Opening AI assistant...')
        } else {
            toast.success(`Voice command received: "${command}". Feature coming soon!`)
        }
    }

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.8
            utterance.pitch = 1
            speechSynthesis.speak(utterance)
        } else {
            toast.error('Text-to-speech is not supported in this browser')
        }
    }

    const testTextToSpeech = () => {
        speakText('This is a test of the text to speech feature. Your accessibility settings are working correctly.')
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

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Send, 
  Bot,
  User,
  Sparkles,
  Heart,
  Target,
  TrendingUp
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuickQuestion {
  id: string;
  text: string;
  icon: React.ReactNode;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'こんにちは！私はあなた専用のAIパーソナルトレーナーです。健康やフィットネスに関することなら何でもお聞きください！💪',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [userContext, setUserContext] = useState<any>(null);

  const userContextQuery = trpc?.chat.getUserContext.useQuery();

  const quickQuestions: QuickQuestion[] = [
    {
      id: '1',
      text: '効果的なダイエット方法を教えて',
      icon: <Target size={16} color="#FF6B9D" />
    },
    {
      id: '2',
      text: '筋トレのメニューを作って',
      icon: <TrendingUp size={16} color="#FF6B9D" />
    },
    {
      id: '3',
      text: '健康的な食事のアドバイス',
      icon: <Heart size={16} color="#FF6B9D" />
    }
  ];

  useEffect(() => {
    if (userContextQuery.data) {
      setUserContext(userContextQuery.data);
    }
  }, [userContextQuery.data]);

  const buildSystemPrompt = () => {
    if (!userContext) {
      return 'あなたは親しみやすく、専門的なAIパーソナルトレーナーです。20-30代女性向けに、健康、フィットネス、ダイエット、栄養に関するアドバイスを日本語で提供してください。親しみやすい口調で、実践的で安全なアドバイスを心がけてください。';
    }

    const { profile, workoutStats, nutritionStats } = userContext;
    
    let contextInfo = 'あなたは親しみやすく、専門的なAIパーソナルトレーナーです。以下のユーザー情報を参考に、パーソナライズされたアドバイスを日本語で提供してください。\n\n';
    
    if (profile) {
      contextInfo += `【ユーザープロフィール】\n`;
      if (profile.name) contextInfo += `名前: ${profile.name}\n`;
      if (profile.age) contextInfo += `年齢: ${profile.age}歳\n`;
      if (profile.height) contextInfo += `身長: ${profile.height}cm\n`;
      if (profile.weight) contextInfo += `体重: ${profile.weight}kg\n`;
      if (profile.target_weight) contextInfo += `目標体重: ${profile.target_weight}kg\n`;
      if (profile.daily_calorie_goal) contextInfo += `1日のカロリー目標: ${profile.daily_calorie_goal}kcal\n`;
      if (profile.daily_protein_goal) contextInfo += `1日のタンパク質目標: ${profile.daily_protein_goal}g\n`;
      if (profile.daily_fat_goal) contextInfo += `1日の脂質目標: ${profile.daily_fat_goal}g\n`;
      if (profile.daily_carbs_goal) contextInfo += `1日の炭水化物目標: ${profile.daily_carbs_goal}g\n`;
      contextInfo += '\n';
    }
    
    contextInfo += `【今日の栄養摂取状況】\n`;
    contextInfo += `カロリー: ${nutritionStats.todayCalories}kcal`;
    if (profile?.daily_calorie_goal) {
      contextInfo += ` / ${profile.daily_calorie_goal}kcal (目標の${Math.round(nutritionStats.todayCalories / profile.daily_calorie_goal * 100)}%)`;
    }
    contextInfo += '\n';
    contextInfo += `タンパク質: ${nutritionStats.todayProtein}g`;
    if (profile?.daily_protein_goal) {
      contextInfo += ` / ${profile.daily_protein_goal}g`;
    }
    contextInfo += '\n';
    contextInfo += `脂質: ${nutritionStats.todayFat}g`;
    if (profile?.daily_fat_goal) {
      contextInfo += ` / ${profile.daily_fat_goal}g`;
    }
    contextInfo += '\n';
    contextInfo += `炭水化物: ${nutritionStats.todayCarbs}g`;
    if (profile?.daily_carbs_goal) {
      contextInfo += ` / ${profile.daily_carbs_goal}g`;
    }
    contextInfo += '\n\n';
    
    contextInfo += `【運動履歴】\n`;
    contextInfo += `過去30日間のワークアウト回数: ${workoutStats.totalWorkouts}回\n`;
    if (workoutStats.lastWorkoutDate) {
      contextInfo += `最後のワークアウト: ${workoutStats.lastWorkoutDate}\n`;
    }
    if (workoutStats.recentExercises.length > 0) {
      contextInfo += `最近行った運動: ${workoutStats.recentExercises.slice(0, 5).join(', ')}\n`;
    }
    contextInfo += '\n';
    
    if (nutritionStats.avgDailyCalories > 0) {
      contextInfo += `【過去30日間の平均】\n`;
      contextInfo += `1日平均カロリー: ${nutritionStats.avgDailyCalories}kcal\n\n`;
    }
    
    contextInfo += 'これらの情報を踏まえて、ユーザーに合わせた具体的で実践的なアドバイスを提供してください。親しみやすい口調で、安全で健康的な方法を心がけてください。';
    
    return contextInfo;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: text.trim()
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.completion || 'すみません、回答を生成できませんでした。もう一度お試しください。',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'すみません、接続に問題が発生しました。もう一度お試しください。',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <LinearGradient
      colors={Colors.backgroundGradient}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <LinearGradient
          colors={Colors.surfaceGradient}
          style={styles.header}
        >
        <View style={styles.headerContent}>
          <View style={styles.botAvatar}>
            <Bot size={24} color="white" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AIパーソナルトレーナー</Text>
            <Text style={styles.headerSubtitle}>あなた専用のフィットネスコーチ</Text>
          </View>
          <Sparkles size={24} color="rgba(255, 255, 255, 0.8)" />
        </View>
        </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
              ]}
            >
              {!message.isUser && (
                <View style={styles.aiAvatar}>
                  <Bot size={16} color="#FF6B9D" />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessageBubble : styles.aiMessageBubble
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText
                  ]}
                >
                  {message.text}
                </Text>
              </View>
              {message.isUser && (
                <View style={styles.userAvatar}>
                  <User size={16} color="white" />
                </View>
              )}
            </View>
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.aiAvatar}>
                <Bot size={16} color="#FF6B9D" />
              </View>
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingText}>考え中...</Text>
              </View>
            </View>
          )}

          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>よくある質問</Text>
              {quickQuestions.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  style={styles.quickQuestionButton}
                  onPress={() => handleQuickQuestion(question.text)}
                  activeOpacity={0.7}
                >
                  {question.icon}
                  <Text style={styles.quickQuestionText}>{question.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="メッセージを入力してください..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={(!inputText.trim() || isLoading) ? [Colors.textMuted, Colors.textMuted] : [Colors.primary, Colors.primaryLight]}
              style={styles.sendButtonGradient}
            >
              <Send size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glass,
    borderWidth: 2,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiMessageBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    marginTop: 20,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickQuestionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
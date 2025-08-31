import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Camera, 
  Image as ImageIcon, 
  Upload,
  Utensils,
  Dumbbell,
  Scale,
  ChevronRight
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

interface RecordOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

export default function CameraScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pickImage = async (type: 'workout' | 'meal' | 'body') => {
    try {
      setIsLoading(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('権限が必要です', 'フォトライブラリへのアクセス権限が必要です。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log(`${type} image selected:`, result.assets[0].uri);
        Alert.alert('成功', `${getTypeLabel(type)}の画像を選択しました。AIが分析中です...`);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('エラー', '画像の選択に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async (type: 'workout' | 'meal' | 'body') => {
    try {
      setIsLoading(true);
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('権限が必要です', 'カメラへのアクセス権限が必要です。');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log(`${type} photo taken:`, result.assets[0].uri);
        Alert.alert('成功', `${getTypeLabel(type)}の写真を撮影しました。AIが分析中です...`);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('エラー', '写真の撮影に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: 'workout' | 'meal' | 'body') => {
    switch (type) {
      case 'workout': return 'ワークアウト';
      case 'meal': return '食事';
      case 'body': return '体型';
      default: return '';
    }
  };

  const showImageOptions = (type: 'workout' | 'meal' | 'body') => {
    Alert.alert(
      `${getTypeLabel(type)}を記録`,
      '写真を撮影するか、ギャラリーから選択してください。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'ギャラリーから選択', onPress: () => pickImage(type) },
        { text: '写真を撮影', onPress: () => takePhoto(type) },
      ]
    );
  };

  const recordOptions: RecordOption[] = [
    {
      id: 'workout',
      title: 'ワークアウト記録',
      subtitle: '運動フォームや器具の使い方をAIが分析',
      icon: <Dumbbell size={32} color="#FF6B9D" />,
      color: '#FF6B9D',
      onPress: () => showImageOptions('workout')
    },
    {
      id: 'meal',
      title: '食事記録',
      subtitle: 'カロリーや栄養バランスを自動計算',
      icon: <Utensils size={32} color="#34C759" />,
      color: '#34C759',
      onPress: () => showImageOptions('meal')
    },
    {
      id: 'body',
      title: '体型記録',
      subtitle: '体型の変化をAIが分析・アドバイス',
      icon: <Scale size={32} color="#5856D6" />,
      color: '#5856D6',
      onPress: () => showImageOptions('body')
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8A80']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>記録する</Text>
        <Text style={styles.headerSubtitle}>
          写真でかんたんに健康管理
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>何を記録しますか？</Text>
          <Text style={styles.sectionSubtitle}>
            写真を撮るだけで、AIがあなたの健康管理をサポートします
          </Text>
          
          {recordOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
                {option.icon}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AIの機能</Text>
          <View style={styles.featureCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.featureGradient}
            >
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <Camera size={24} color="white" />
                  <Text style={styles.featureTitle}>画像認識</Text>
                  <Text style={styles.featureDescription}>高精度な画像解析</Text>
                </View>
                <View style={styles.featureItem}>
                  <Upload size={24} color="white" />
                  <Text style={styles.featureTitle}>自動記録</Text>
                  <Text style={styles.featureDescription}>手間なく簡単記録</Text>
                </View>
                <View style={styles.featureItem}>
                  <ImageIcon size={24} color="white" />
                  <Text style={styles.featureTitle}>分析結果</Text>
                  <Text style={styles.featureDescription}>詳細なフィードバック</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 撮影のコツ</Text>
          <Text style={styles.tipText}>
            • 明るい場所で撮影してください{"\n"}
            • 対象物全体が写るようにしてください{"\n"}
            • ブレないようにしっかり持って撮影してください
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureGradient: {
    padding: 24,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#92400E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
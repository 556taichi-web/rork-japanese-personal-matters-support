import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera, PenTool, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function MealRecordScreen() {
  const [recordMethod, setRecordMethod] = useState<'photo' | 'manual' | null>('manual');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [foodName, setFoodName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unit, setUnit] = useState<string>('人前');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [imageUri, setImageUri] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mealTypes: { key: MealType; label: string; color: string }[] = [
    { key: 'breakfast', label: '朝食', color: '#f59e0b' },
    { key: 'lunch', label: '昼食', color: '#06b6d4' },
    { key: 'dinner', label: '夕食', color: '#8b5cf6' },
    { key: 'snack', label: '間食', color: '#10b981' },
  ];

  const commonUnits = ['人前', 'g', 'ml', '個', '切れ', '杯'];

  const handleMethodSelect = (method: 'photo' | 'manual') => {
    setRecordMethod(method);
    if (method === 'photo') {
      showImageOptions();
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      '食事の写真を記録',
      '写真を撮影するか、ギャラリーから選択してください。',
      [
        { text: 'キャンセル', style: 'cancel', onPress: () => setRecordMethod(null) },
        { text: 'ギャラリーから選択', onPress: () => pickImage() },
        { text: '写真を撮影', onPress: () => takePhoto() },
      ]
    );
  };

  const pickImage = async () => {
    try {
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
        setImageUri(result.assets[0].uri);
        setFoodName('写真から自動認識された食事');
        Alert.alert('写真を選択しました', 'AIが食事内容を分析しています...');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('エラー', '画像の選択に失敗しました。');
    }
  };

  const takePhoto = async () => {
    try {
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
        setImageUri(result.assets[0].uri);
        setFoodName('写真から自動認識された食事');
        Alert.alert('写真を撮影しました', 'AIが食事内容を分析しています...');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('エラー', '写真の撮影に失敗しました。');
    }
  };

  const saveMealRecord = async () => {
    if (!foodName.trim()) {
      Alert.alert('エラー', '食事内容を入力してください。');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('エラー', '正しい数量を入力してください。');
      return;
    }

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('エラー', 'ログインが必要です。');
        return;
      }

      const mealData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        meal_type: selectedMealType,
        food_name: foodName.trim(),
        quantity: quantityNum,
        unit: unit,
        calories: calories ? parseFloat(calories) : null,
        protein_g: protein ? parseFloat(protein) : null,
        carbs_g: carbs ? parseFloat(carbs) : null,
        fat_g: fat ? parseFloat(fat) : null,
        image_url: imageUri || null,
      };

      console.log('Saving meal data:', mealData);
      
      const { data, error } = await (supabase as any)
        .from('nutrition_logs')
        .insert(mealData)
        .select()
        .single();
      
      if (error) {
        throw new Error(`データベースエラー: ${error.message}`);
      }
      
      console.log('Meal saved successfully:', data);
      Alert.alert('保存完了', '食事記録が保存されました。', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error saving meal record:', error);
      
      let errorMessage = '食事記録の保存に失敗しました。';
      
      if (error?.message) {
        errorMessage = `エラー: ${error.message}`;
      }
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>記録方法を選択</Text>
      <View style={styles.methodContainer}>
        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => handleMethodSelect('manual')}
        >
          <View style={styles.methodIcon}>
            <PenTool size={48} color={Colors.primary} />
          </View>
          <Text style={styles.methodTitle}>手動で記録</Text>
          <Text style={styles.methodDescription}>
            食事内容とカロリーを手動で入力
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => handleMethodSelect('photo')}
        >
          <View style={styles.methodIcon}>
            <Camera size={48} color={Colors.secondary} />
          </View>
          <Text style={styles.methodTitle}>写真で記録</Text>
          <Text style={styles.methodDescription}>
            食事の写真を撮影してAIが自動で分析
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMealTypeSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>食事の種類</Text>
      <View style={styles.mealTypeContainer}>
        {mealTypes.map((mealType) => (
          <TouchableOpacity
            key={mealType.key}
            style={[
              styles.mealTypeCard,
              { backgroundColor: mealType.color },
              selectedMealType === mealType.key && styles.selectedMealType,
            ]}
            onPress={() => setSelectedMealType(mealType.key)}
          >
            <Text style={styles.mealTypeText}>{mealType.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFoodInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>食事内容</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>食事名</Text>
        <TextInput
          style={styles.textInput}
          value={foodName}
          onChangeText={setFoodName}
          placeholder="例: ご飯、味噌汁、焼き魚"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 2 }]}>
          <Text style={styles.inputLabel}>数量</Text>
          <TextInput
            style={styles.textInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 3 }]}>
          <Text style={styles.inputLabel}>単位</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.unitContainer}>
              {commonUnits.map((unitOption) => (
                <TouchableOpacity
                  key={unitOption}
                  style={[
                    styles.unitChip,
                    unit === unitOption && styles.selectedUnit,
                  ]}
                  onPress={() => setUnit(unitOption)}
                >
                  <Text
                    style={[
                      styles.unitText,
                      unit === unitOption && styles.selectedUnitText,
                    ]}
                  >
                    {unitOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderNutritionInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>栄養情報（任意）</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>カロリー (kcal)</Text>
        <TextInput
          style={styles.textInput}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="例: 500"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <Text style={styles.macrosLabel}>PFC（タンパク質・脂質・炭水化物）</Text>
      <View style={styles.macrosGrid}>
        <View style={styles.macroInputWrapper}>
          <Text style={styles.inputLabel}>P</Text>
          <View style={styles.macroInputContainer}>
            <TextInput
              style={styles.macroInput}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.macroUnit}>g</Text>
          </View>
        </View>

        <View style={styles.macroInputWrapper}>
          <Text style={styles.inputLabel}>F</Text>
          <View style={styles.macroInputContainer}>
            <TextInput
              style={styles.macroInput}
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.macroUnit}>g</Text>
          </View>
        </View>

        <View style={styles.macroInputWrapper}>
          <Text style={styles.inputLabel}>C</Text>
          <View style={styles.macroInputContainer}>
            <TextInput
              style={styles.macroInput}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.macroUnit}>g</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSaveButton = () => (
    <TouchableOpacity
      style={styles.saveButton}
      onPress={saveMealRecord}
      disabled={isLoading}
    >
      <Save size={20} color="white" />
      <Text style={styles.saveButtonText}>
        {isLoading ? '保存中...' : '食事記録を保存'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>食事記録</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {recordMethod === null && renderMethodSelection()}
        {recordMethod && (
          <>
            <View style={styles.methodSwitcher}>
              <TouchableOpacity
                style={[
                  styles.methodTab,
                  recordMethod === 'manual' && styles.activeMethodTab,
                ]}
                onPress={() => setRecordMethod('manual')}
              >
                <PenTool size={16} color={recordMethod === 'manual' ? 'white' : Colors.textMuted} />
                <Text style={[
                  styles.methodTabText,
                  recordMethod === 'manual' && styles.activeMethodTabText,
                ]}>手動入力</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.methodTab,
                  recordMethod === 'photo' && styles.activeMethodTab,
                ]}
                onPress={() => handleMethodSelect('photo')}
              >
                <Camera size={16} color={recordMethod === 'photo' ? 'white' : Colors.textMuted} />
                <Text style={[
                  styles.methodTabText,
                  recordMethod === 'photo' && styles.activeMethodTabText,
                ]}>写真撮影</Text>
              </TouchableOpacity>
            </View>
            
            {renderMealTypeSelection()}
            {renderFoodInput()}
            {renderNutritionInput()}
            {renderSaveButton()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  methodContainer: {
    gap: 16,
  },
  methodCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  methodIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#252545',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.7,
  },
  selectedMealType: {
    borderColor: '#ffffff',
    borderWidth: 3,
    opacity: 1,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
    textAlignVertical: 'top',
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  unitContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unitChip: {
    backgroundColor: '#252545',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedUnit: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  unitText: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  selectedUnitText: {
    color: '#ffffff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  methodSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#252545',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeMethodTab: {
    backgroundColor: '#4f46e5',
  },
  methodTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  activeMethodTabText: {
    color: '#ffffff',
  },

  macrosLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  macroInputWrapper: {
    flex: 1,
  },
  macroInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  macroInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'left',
    minWidth: 0,
  },
  macroUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 4,
    paddingLeft: 4,
  },
});
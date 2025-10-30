import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { EXERCISE_CATEGORIES } from '@/constants/exercises';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface WorkoutAnalyticsData {
  date: string;
  exercise_name: string;
  max_weight: number;
  total_volume: number;
  sets: number;
  category: string;
}

const CHART_CATEGORIES = EXERCISE_CATEGORIES.filter((cat) => cat !== '有酸素');

export function WorkoutChart() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CHART_CATEGORIES[0] || '胸筋');
  
  const analyticsQuery = trpc.workouts.analytics.useQuery();

  const chartData = useMemo(() => {
    if (!analyticsQuery.data || !analyticsQuery.data[selectedCategory]) {
      return null;
    }

    const categoryData = analyticsQuery.data[selectedCategory];
    
    const dateMap = new Map<string, { maxWeight: number; totalVolume: number }>();
    
    categoryData.forEach((item: WorkoutAnalyticsData) => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.maxWeight = Math.max(existing.maxWeight, item.max_weight);
        existing.totalVolume += item.total_volume;
      } else {
        dateMap.set(item.date, {
          maxWeight: item.max_weight,
          totalVolume: item.total_volume,
        });
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const last10Dates = sortedDates.slice(-10);

    if (last10Dates.length === 0) {
      return null;
    }

    const weights = last10Dates.map((date) => dateMap.get(date)!.maxWeight);
    const labels = last10Dates.map((date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    return {
      labels,
      datasets: [
        {
          data: weights,
          color: (opacity = 1) => Colors.primary,
          strokeWidth: 3,
        },
      ],
    };
  }, [analyticsQuery.data, selectedCategory]);

  const hasData = useMemo(() => {
    return (
      analyticsQuery.data &&
      Object.keys(analyticsQuery.data).some(
        (key) => analyticsQuery.data![key].length > 0
      )
    );
  }, [analyticsQuery.data]);

  if (analyticsQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>グラフを読み込み中...</Text>
      </View>
    );
  }

  if (!hasData) {
    return (
      <LinearGradient colors={Colors.surfaceGradient} style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>トレーニングデータがありません</Text>
        <Text style={styles.emptyText}>
          トレーニングを記録すると、部位別の進捗グラフが表示されます
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.surfaceGradient} style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{selectedCategory} - 最大重量 (kg)</Text>
          <Text style={styles.chartSubtitle}>過去10回のトレーニング</Text>
        </View>

        {chartData ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            <LineChart
              data={chartData}
              width={Math.max(SCREEN_WIDTH - 60, chartData.labels.length * 60)}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(109, 40, 217, ${opacity})`,
                labelColor: (opacity = 1) => Colors.textSecondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: Colors.primary,
                  fill: 'white',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: Colors.divider,
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
            />
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>このカテゴリーのデータがありません</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabsScroll}
      >
        {CHART_CATEGORIES.map((category) => {
          const hasDataForCategory =
            analyticsQuery.data && analyticsQuery.data[category]?.length > 0;
          
          if (!hasDataForCategory) return null;

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.tab,
                selectedCategory === category && styles.tabActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedCategory === category && styles.tabTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tabsScroll: {
    marginTop: 16,
  },
  tabsContainer: {
    paddingRight: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: 'white',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  chartScrollContent: {
    paddingRight: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
});

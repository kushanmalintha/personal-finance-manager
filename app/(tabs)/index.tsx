import { StyleSheet } from 'react-native';

import { Text, View } from '@/src/components/common/Themed';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Finance Manager</Text>
      <Text style={styles.description}>
        Your financial dashboard will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
});

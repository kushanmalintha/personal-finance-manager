import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppCard } from "@/src/components/common/AppCard";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import { listAccounts } from "@/src/features/accounts/application/listAccounts";
import { getAccounts } from "@/src/features/accounts/data/accountRepository";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, spacing, typography } from "@/src/theme/tokens";
import type { Account } from "@/src/types/domain";
import { formatMinorUnitsAsLkr } from "@/src/utils/money";

export default function AccountsScreen() {
  const router = useRouter();
  const theme = useColorScheme();
  const themeColors = colors[theme];

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadAccounts() {
        setIsLoading(true);
        setError(null);

        try {
          const result = await listAccounts(getAccounts);

          if (isActive) {
            setAccounts(result);
          }
        } catch {
          if (isActive) {
            setError(
              "Unable to load your accounts. Please check your connection and try again.",
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadAccounts();

      return () => {
        isActive = false;
      };
    }, [reloadToken]),
  );

  function openAccountDetails(accountId: string) {
    router.push({
      pathname: "/account/[accountId]",
      params: { accountId },
    });
  }

  function renderAccount(account: Account) {
    return (
      <Pressable
        key={account.id}
        onPress={() => openAccountDetails(account.id)}
        accessibilityRole="button"
        accessibilityLabel={`View ${account.name} account details`}
      >
        <AppCard>
          <View style={styles.accountHeader}>
            <View style={styles.accountTitleContainer}>
              <Text style={[styles.accountName, { color: themeColors.text }]}>
                {account.name}
              </Text>

              <Text
                style={[
                  styles.accountType,
                  { color: themeColors.textSecondary },
                ]}
              >
                {account.type === "WALLET"
                  ? "Wallet"
                  : account.bankName || "Bank account"}
              </Text>
            </View>

            <Text
              style={[
                styles.status,
                {
                  color: account.isActive
                    ? themeColors.success
                    : themeColors.textSecondary,
                },
              ]}
            >
              {account.isActive ? "Active" : "Inactive"}
            </Text>
          </View>

          <Text
            style={[styles.balanceLabel, { color: themeColors.textSecondary }]}
          >
            Current balance
          </Text>

          <Text style={[styles.balance, { color: themeColors.text }]}>
            {formatMinorUnitsAsLkr(account.currentBalance)}
          </Text>

          <Text style={[styles.detailsHint, { color: themeColors.primary }]}>
            View account details →
          </Text>
        </AppCard>
      </Pressable>
    );
  }

  return (
    <ScreenContainer scrollable contentStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          My Accounts
        </Text>

        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          View your wallet and bank account balances.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={themeColors.primary}
          style={styles.loader}
        />
      ) : error ? (
        <View style={styles.messageContainer}>
          <Text style={[styles.message, { color: themeColors.danger }]}>
            {error}
          </Text>

          <AppButton onPress={() => setReloadToken((current) => current + 1)}>
            Try again
          </AppButton>
        </View>
      ) : accounts.length === 0 ? (
        <View style={styles.messageContainer}>
          <Text style={[styles.message, { color: themeColors.textSecondary }]}>
            No accounts found.
          </Text>
        </View>
      ) : (
        <View style={styles.accountList}>{accounts.map(renderAccount)}</View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.md,
    lineHeight: 24,
  },
  accountList: {
    gap: spacing.md,
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  accountTitleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  accountName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  accountType: {
    fontSize: typography.size.sm,
  },
  status: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  balanceLabel: {
    fontSize: typography.size.sm,
    marginBottom: spacing.xs,
  },
  balance: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  detailsHint: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginTop: spacing.md,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  messageContainer: {
    gap: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  message: {
    fontSize: typography.size.md,
    textAlign: "center",
    lineHeight: 24,
  },
});

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppCard } from "@/src/components/common/AppCard";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import { getAccountDetails } from "@/src/features/accounts/application/getAccountDetails";
import { getAccount } from "@/src/features/accounts/data/accountRepository";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, spacing, typography } from "@/src/theme/tokens";
import type { Account } from "@/src/types/domain";
import { formatMinorUnitsAsLkr } from "@/src/utils/money";

export default function AccountDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    accountId?: string | string[];
  }>();

  const accountId =
    typeof params.accountId === "string"
      ? params.accountId
      : params.accountId?.[0];

  const theme = useColorScheme();
  const themeColors = colors[theme];

  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadAccount() {
      setIsLoading(true);
      setError(null);

      if (!accountId) {
        setError("Invalid account ID.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getAccountDetails(accountId, getAccount);

        if (isActive) {
          setAccount(result);

          if (!result) {
            setError("The requested account could not be found.");
          }
        }
      } catch {
        if (isActive) {
          setError("Unable to load account details. Please try again.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      isActive = false;
    };
  }, [accountId, reloadToken]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScreenContainer scrollable contentStyle={styles.container}>
        <View style={styles.header}>
          <AppButton variant="outline" onPress={() => router.back()}>
            Back to accounts
          </AppButton>

          <Text style={[styles.title, { color: themeColors.text }]}>
            Account Details
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

            {accountId && (
              <AppButton
                onPress={() => setReloadToken((current) => current + 1)}
              >
                Try again
              </AppButton>
            )}
          </View>
        ) : account ? (
          <>
            <AppCard>
              <View style={styles.accountHeader}>
                <View style={styles.accountTitleContainer}>
                  <Text
                    style={[styles.accountName, { color: themeColors.text }]}
                  >
                    {account.name}
                  </Text>

                  <Text
                    style={[
                      styles.accountType,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {account.type === "WALLET" ? "Wallet" : "Bank account"}
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
                style={[
                  styles.balanceLabel,
                  { color: themeColors.textSecondary },
                ]}
              >
                Current balance
              </Text>

              <Text style={[styles.balance, { color: themeColors.text }]}>
                {formatMinorUnitsAsLkr(account.currentBalance)}
              </Text>
            </AppCard>

            <AppCard>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Account information
              </Text>

              <DetailRow
                label="Account type"
                value={account.type === "WALLET" ? "Wallet" : "Bank account"}
              />

              {account.type === "BANK" && account.bankName && (
                <DetailRow label="Bank name" value={account.bankName} />
              )}

              <DetailRow label="Account name" value={account.name} />

              <DetailRow label="Opening date" value={account.openingDate} />

              <DetailRow
                label="Opening balance"
                value={formatMinorUnitsAsLkr(account.openingBalance)}
              />

              <DetailRow
                label="Current balance"
                value={formatMinorUnitsAsLkr(account.currentBalance)}
              />

              <DetailRow
                label="Status"
                value={account.isActive ? "Active" : "Inactive"}
                isLast
              />
            </AppCard>
          </>
        ) : null}
      </ScreenContainer>
    </>
  );
}

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const theme = useColorScheme();
  const themeColors = colors[theme];

  return (
    <View
      style={[
        styles.detailRow,
        !isLast && {
          borderBottomColor: themeColors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>
        {label}
      </Text>

      <Text style={[styles.detailValue, { color: themeColors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
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
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
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
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    flex: 1,
    fontSize: typography.size.sm,
  },
  detailValue: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    textAlign: "right",
  },
  loader: {
    marginTop: spacing.xxl,
  },
  messageContainer: {
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  message: {
    fontSize: typography.size.md,
    textAlign: "center",
    lineHeight: 24,
  },
});

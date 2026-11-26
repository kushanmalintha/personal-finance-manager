import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/src/components/common/AppButton";
import { AppCard } from "@/src/components/common/AppCard";
import { ScreenContainer } from "@/src/components/common/ScreenContainer";
import type { AccountLifecycleStatus } from "@/src/features/accounts/application/accountLifecycle";
import {
  activateAccount,
  deactivateAccount,
  deleteAccount,
  updateOpeningBalance,
} from "@/src/features/accounts/application/accountLifecycle";
import { getAccountDetails } from "@/src/features/accounts/application/getAccountDetails";
import {
  activateAccountRecord,
  deactivateAccountRecord,
  deleteAccountRecord,
  getAccountLifecycleStatus,
  updateOpeningBalanceRecord,
} from "@/src/features/accounts/data/accountLifecycleRepository";
import { getAccount } from "@/src/features/accounts/data/accountRepository";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { colors, spacing, typography } from "@/src/theme/tokens";
import type { Account } from "@/src/types/domain";
import { formatMinorUnitsAsLkr, parseLkrToMinorUnits } from "@/src/utils/money";

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
  const [lifecycleStatus, setLifecycleStatus] =
    useState<AccountLifecycleStatus | null>(null);

  const [openingBalanceInput, setOpeningBalanceInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;

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

        if (!result) {
          if (isMounted) {
            setAccount(null);
            setLifecycleStatus(null);
            setError("The requested account could not be found.");
          }
          return;
        }

        const status = await getAccountLifecycleStatus(result.id, result.type);

        if (isMounted) {
          setAccount(result);
          setLifecycleStatus(status);
          setOpeningBalanceInput(minorUnitsToInput(result.openingBalance));
        }
      } catch {
        if (isMounted) {
          setError("Unable to load account details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      isMounted = false;
    };
  }, [accountId, reloadToken]);

  async function executeAction(
    operation: () => Promise<void>,
    successMessage: string,
    returnToAccounts = false,
  ) {
    setIsSaving(true);

    try {
      await operation();

      if (returnToAccounts) {
        Alert.alert("Success", successMessage, [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Success", successMessage);
        setReloadToken((current) => current + 1);
      }
    } catch (operationError) {
      Alert.alert(
        "Operation failed",
        operationError instanceof Error
          ? operationError.message
          : "Unable to complete the operation. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function confirmLifecycleAction(
    title: string,
    message: string,
    operation: () => Promise<void>,
    successMessage: string,
    returnToAccounts = false,
  ) {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          void executeAction(operation, successMessage, returnToAccounts);
        },
      },
    ]);
  }

  function handleActivation() {
    if (!account) return;

    if (account.isActive) {
      confirmLifecycleAction(
        "Deactivate account?",
        "This account will no longer be available for new transactions. Its historical information will be preserved.",
        () => deactivateAccount(account.id, deactivateAccountRecord),
        "Account deactivated successfully.",
      );
    } else {
      confirmLifecycleAction(
        "Activate account?",
        "This account will become available for new transactions.",
        () => activateAccount(account.id, activateAccountRecord),
        "Account activated successfully.",
      );
    }
  }

  function handleDelete() {
    if (!account || account.type !== "BANK") return;

    confirmLifecycleAction(
      "Delete account?",
      `Permanently delete "${account.name}"? This action cannot be undone.`,
      () => deleteAccount(account.id, deleteAccountRecord),
      "Account deleted successfully.",
      true,
    );
  }

  async function handleOpeningBalanceUpdate() {
    if (!account) return;

    let amount: number;

    try {
      amount = parseLkrToMinorUnits(openingBalanceInput);
    } catch (parseError) {
      Alert.alert(
        "Invalid amount",
        parseError instanceof Error
          ? parseError.message
          : "Enter a valid LKR amount.",
      );
      return;
    }

    await executeAction(
      () =>
        updateOpeningBalance(account.id, amount, updateOpeningBalanceRecord),
      "Opening balance updated successfully.",
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

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

            <AppButton onPress={() => setReloadToken((current) => current + 1)}>
              Try again
            </AppButton>
          </View>
        ) : account && lifecycleStatus ? (
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

            <AppCard>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Account lifecycle
              </Text>

              <AppButton
                variant={account.isActive ? "danger" : "primary"}
                disabled={
                  isSaving ||
                  (account.isActive &&
                    lifecycleStatus.hasActiveRecurringReferences)
                }
                onPress={handleActivation}
              >
                {account.isActive ? "Deactivate account" : "Activate account"}
              </AppButton>

              {account.isActive &&
                lifecycleStatus.hasActiveRecurringReferences && (
                  <Text
                    style={[styles.warning, { color: themeColors.warning }]}
                  >
                    An active recurring schedule references this account. Pause
                    or stop that schedule before deactivating this account.
                  </Text>
                )}

              {lifecycleStatus.hasTransactions ? (
                <Text
                  style={[styles.info, { color: themeColors.textSecondary }]}
                >
                  This account has transaction history. Its opening balance
                  cannot be edited. Future corrections must use a balance
                  adjustment.
                </Text>
              ) : (
                <>
                  <Text
                    style={[styles.fieldLabel, { color: themeColors.text }]}
                  >
                    Edit opening balance (LKR)
                  </Text>

                  <TextInput
                    value={openingBalanceInput}
                    onChangeText={setOpeningBalanceInput}
                    keyboardType="decimal-pad"
                    editable={!isSaving}
                    placeholder="0.00"
                    placeholderTextColor={themeColors.textSecondary}
                    style={[
                      styles.input,
                      {
                        color: themeColors.text,
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.surface,
                      },
                    ]}
                  />

                  <AppButton
                    variant="secondary"
                    disabled={isSaving}
                    onPress={() => void handleOpeningBalanceUpdate()}
                  >
                    Save opening balance
                  </AppButton>
                </>
              )}

              {account.type === "WALLET" ? (
                <Text
                  style={[styles.info, { color: themeColors.textSecondary }]}
                >
                  The primary wallet is required for the initial setup and
                  cannot be permanently deleted.
                </Text>
              ) : lifecycleStatus.canDelete ? (
                <AppButton
                  variant="danger"
                  disabled={isSaving}
                  onPress={handleDelete}
                >
                  Delete account
                </AppButton>
              ) : (
                <Text
                  style={[styles.info, { color: themeColors.textSecondary }]}
                >
                  This account cannot be deleted because it has transaction
                  history or is referenced by a recurring schedule.
                </Text>
              )}
            </AppCard>
          </>
        ) : null}
      </ScreenContainer>
    </>
  );
}

function minorUnitsToInput(amount: number): string {
  const rupees = Math.floor(amount / 100);
  const cents = String(amount % 100).padStart(2, "0");

  return `${rupees}.${cents}`;
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
  fieldLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
    marginBottom: spacing.md,
  },
  info: {
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
  warning: {
    fontSize: typography.size.sm,
    lineHeight: 22,
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

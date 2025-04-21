import { firestore } from "@/config/firebase";
import { TransactionType, WalletType, ResponseType } from "@/types";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageServices";
import { createOrUpdateWallet } from "./walletService";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, amount, image } = transactionData;
    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data" };
    }

    if (id) {
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, "transactions", id)
      );

      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
      const shouldRevertOrginal =
        oldTransaction.type != type ||
        oldTransaction.amount != amount ||
        oldTransaction.walletId != walletId;
      if (shouldRevertOrginal) {
        let res = await revertAndUpdateWallets(
          oldTransaction,
          Number(amount),
          type,
          walletId
        );
        if (!res.success) return res;
      }
      //eklendi
      await setDoc(doc(firestore, "transactions", id), transactionData, {
        merge: true,
      });
      return { success: true, data: { ...transactionData, id: id } };
    } else {
      // update wallet for new transaction
      let res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type
      );
      if (!res.success) return res;

      if (image) {
        const imageUploadRes = await uploadFileToCloudinary(
          image,
          "transactions"
        );
        if (!imageUploadRes.success) {
          return {
            success: false,
            msg: imageUploadRes.msg || "Filed to upload receipt",
          };
        }

        transactionData.image = imageUploadRes.data;
      }

      // Convert JavaScript Date to Firestore Timestamp
      if (transactionData.date && transactionData.date instanceof Date) {
        transactionData.date = Timestamp.fromDate(transactionData.date);
      }

      const transactionRef = id
        ? doc(firestore, "transactions", id)
        : doc(collection(firestore, "transactions"));

      await setDoc(transactionRef, transactionData, { merge: true });

      return {
        success: true,
        data: { ...transactionData, id: transactionRef.id },
      };
    }
  } catch (error: any) {
    console.log("error creating or updating transaction: ", error);
    return { success: false, msg: error.message };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);

    const walletSnapShot = await getDoc(walletRef);

    if (!walletSnapShot.exists()) {
      console.log("error updating wallet for new transaction: ");
      return {
        success: false,
        msg: "wallet not found",
      };
    }

    const walletData = walletSnapShot.data() as WalletType;

    if (type == "expense" && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "the selected wallet doesn't have enough balance",
      };
    }

    const updateType = type == "income" ? "totalIncome" : "totalExpenses";

    const updatedWalletAmount =
      type == "income"
        ? Number(walletData.amount) + amount
        : -Number(walletData.totalExpenses) - amount;

    const updatedTotals =
      type == "income"
        ? Number(walletData.totalIncome) + amount
        : Number(walletData.totalExpenses) + amount;

    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotals,
    });

    return { success: true };
  } catch (error: any) {
    console.log("error updating wallet for new transaction: ", error);
    return { success: false, msg: error.message };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string
) => {
  try {
    const orginalWalletSnapshot = await getDoc(
      doc(firestore, "wallets", oldTransaction.walletId)
    );

    const orginalWallet = orginalWalletSnapshot.data() as WalletType;

    let newWalletSnapshot = await getDoc(
      doc(firestore, "wallets", newWalletId)
    );
    let newWallet = newWalletSnapshot.data() as WalletType;

    const revertType =
      oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";

    const revertIncomeExpense: number =
      oldTransaction.type == "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);

    const revertedWalletAmount =
      Number(orginalWallet.amount) + revertIncomeExpense;
    // wallet amount after the transaction is removed

    const revertedIncomeExpenseAmount =
      Number(orginalWallet[revertType]) - Number(oldTransaction.amount);

    if (newTransactionType == "expense") {
      // if user tries to convert income to expense on the same wallet
      // or if the user tries to incriase an expense amount and don't have enough balance
      if (
        oldTransaction.walletId == newWalletId &&
        revertedWalletAmount < newTransactionAmount
      ) {
        return {
          success: false,
          msg: "the selected wallet doesn't have enough balance",
        };
      }
      // if the user tries to add expense from a new wallet but the wallet don't have enough balance
      if (newWallet.amount! < newTransactionAmount) {
        return {
          success: false,
          msg: "the selected wallet doesn't have enough balance",
        };
      }
    }

    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    // revert complated
    /////////////////////////////////////////////////////////////
    // refetch the new wallet because we may have updated it

    const updateType =
      newTransactionType == "income" ? "totalIncome" : "totalExpenses";

    newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
    newWallet = newWalletSnapshot.data() as WalletType;

    const updateTransactionAmount: number =
      newTransactionType == "income"
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newWalletAmount = Number(newWallet.amount) + updateTransactionAmount;

    const newIncomeExpenseAmount = Number(
      newWallet[updateType]! + Number(newTransactionAmount)
    );

    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    return { success: true };
  } catch (error: any) {
    console.log("error updating wallet for new transaction: ", error);
    return { success: false, msg: error.message };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string
) => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);
    const transactionSnapshot = await getDoc(transactionRef);

    if (!transactionSnapshot.exists()) {
      return { success: false, msg: "Transaction not found" };
    }
    const transactionData = transactionSnapshot.data() as TransactionType;

    const transactionType = transactionData?.type;
    const transactionAmount = transactionData?.amount;

    // fetch wallet to update the amount, totalIncome or totalExpenses
    const walletSnapShot = await getDoc(doc(firestore, "wallets", walletId));
    const walletData = walletSnapShot.data() as WalletType;

    // check fields to be updated based on transaction type
    const updateType =
      transactionType == "income" ? "totalIncome" : "totalExpenses";

    const newWalletAmount =
      walletData?.amount! -
      (transactionType == "income" ? transactionAmount : -transactionAmount);

    const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;

    // if its expense and the wallet amount can go below 0
    if (transactionType == "expense" && newWalletAmount < 0) {
      return { success: false, msg: "You cannot delete this transaction" };
    }

    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    await deleteDoc(transactionRef);

    return { success: true };
  } catch (error: any) {
    console.log("error updating wallet for new transaction: ", error);
    return { success: false, msg: error.message };
  }
};

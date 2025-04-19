import { firestore } from "@/config/firebase";
import { TransactionType, WalletType, ResponseType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageServices";

export const createOrUpdateTransaction = async (transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
    try {
        const {id, type, walletId, image, amount} = transactionData;
        if(!amount || amount <= 0 || !walletId || !type) {
            return { success: false, msg: "Invalid transaction data" };
        }

        if(id){
            //todo update existing transaction
        } else {
            // update wallet for new transaction
            let res = await updateWalletForNewTransaction(walletId!, Number(amount!), type);
            if(!res.success) return res;

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

              await setDoc(transactionRef, transactionData, {merge: true});

              return { success: true, data: {...transactionData, id: transactionRef.id}};
              
        }
      } catch (error: any) {
        console.log("error creating or updating transaction: ", error);
        return { success: false, msg: error.message };
      }
}


const updateWalletForNewTransaction = async (walletId: string, amount: number, type: string) => {
    try{
        const walletRef = doc(firestore, "wallets", walletId);
        const walletSnapshot = await getDoc(walletRef);
        if(!walletSnapshot.exists()) {
            console.log("error updating wallet for new transaction");
            return { success: false, msg: "Wallet not found" };
        }

        const walletData = walletSnapshot.data() as WalletType;

        if(type === "expense" && walletData.amount! - amount < 0) {
            return { success: false, msg: "selected wallet don't have enough balance" };
        }

        const updateType = type == 'income' ? 'totalIncome' : 'totalExpenses';
        const updateWalletAmount = type == "income" 
        ? Number(walletData.amount) + amount 
        : Number(walletData.amount) - amount;

        const updateTotals = type == "income"
        ? Number(walletData.totalIncome) + amount
        : Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef, {
            amount: updateWalletAmount,
            [updateType]: updateTotals,
        });
        
        return { success: true};
    } catch (error: any) {
        console.log("error updating wallet for new transaction: ", error);
        return { success: false, msg: error.message };
    }
}
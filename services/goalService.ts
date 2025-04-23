import { ResponseType, GoalType } from "@/types";
import { uploadFileToCloudinary } from "./imageServices";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
  getDoc,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";

export const createOrUpdateGoal = async (
  goalData: Partial<GoalType>
): Promise<ResponseType> => {
  try {
    let goalToSave = { ...goalData };

    // Upload image if provided
    if (goalData.image && typeof goalData.image !== "string") {
      const imageUploadRes = await uploadFileToCloudinary(
        goalData.image,
        "goals"
      );
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload goal image",
        };
      }

      goalToSave.image = imageUploadRes.data;
    }

    // For new goals, set initial values
    if (!goalData?.id) {
      goalToSave.completed = false;
      goalToSave.created = Timestamp.now();
    }

    // Convert JavaScript Date to Firestore Timestamp for targetDate
    if (goalToSave.targetDate && goalToSave.targetDate instanceof Date) {
      goalToSave.targetDate = Timestamp.fromDate(goalToSave.targetDate);
    }

    // Get reference to the goal document
    const goalRef = goalData?.id
      ? doc(firestore, "goals", goalData?.id)
      : doc(collection(firestore, "goals"));

    // Save the goal data
    await setDoc(goalRef, goalToSave, { merge: true });

    return { success: true, data: { ...goalToSave, id: goalRef.id } };
  } catch (error: any) {
    console.log("Error creating or updating goal: ", error);
    return { success: false, msg: error.message };
  }
};

export const deleteGoal = async (goalId: string): Promise<ResponseType> => {
  try {
    const goalRef = doc(firestore, "goals", goalId);
    await deleteDoc(goalRef);

    return { success: true, msg: "Goal deleted successfully" };
  } catch (error: any) {
    console.log("Error deleting goal: ", error);
    return { success: false, msg: error.message };
  }
};

export const completeGoal = async (goalId: string): Promise<ResponseType> => {
  try {
    const goalRef = doc(firestore, "goals", goalId);

    // Get the goal data to extract wallet ID and target amount
    const goalDoc = await getDoc(goalRef);
    if (!goalDoc.exists()) {
      return { success: false, msg: "Goal not found" };
    }

    const goalData = goalDoc.data() as GoalType;
    const { walletId, targetAmount } = goalData;

    // Get the wallet data
    const walletRef = doc(firestore, "wallets", walletId);
    const walletDoc = await getDoc(walletRef);

    if (!walletDoc.exists()) {
      return { success: false, msg: "Associated wallet not found" };
    }

    const walletData = walletDoc.data();

    // Calculate new wallet amount
    const newAmount = Math.max(0, (walletData.amount || 0) - targetAmount);

    // Update the wallet with the new amount
    await setDoc(
      walletRef,
      {
        amount: newAmount,
        totalExpenses: (walletData.totalExpenses || 0) + targetAmount,
      },
      { merge: true }
    );

    // Mark the goal as completed
    await setDoc(
      goalRef,
      {
        completed: true,
        completedDate: Timestamp.now(),
      },
      { merge: true }
    );

    return {
      success: true,
      msg: "Goal marked as completed and wallet updated",
    };
  } catch (error: any) {
    console.log("Error completing goal: ", error);
    return { success: false, msg: error.message };
  }
};

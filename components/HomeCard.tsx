import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Typo from './typo'
import { scale, verticalScale } from '@/utils/styling'
import { colors, spacingX, spacingY } from '@/constants/theme'
import * as Icons from 'phosphor-react-native'
import { orderBy, where } from 'firebase/firestore'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { useAuth } from '@/contexts/authContext'

const HomeCard = () => {
  const { user } = useAuth();

  const { 
    data: wallets, 
    loading: walletLoading, 
    error 
  } = useFetchData<WalletType>("wallets", 
    [
      where("uid", "==", user?.uid), 
      orderBy("created", "desc")
    ]);

    const getTotals = () => {
      return wallets.reduce((totals: any, item: WalletType) => {
        totals.Balance = totals.Balance + Number(item.amount);
        totals.income = totals.income + Number(item.totalIncome);
        totals.Expenses = totals.Expenses + Number(item.totalExpenses);
        return totals;
      }, {
        Balance: 0,
        Income: 0,
        Expenses: 0,
      })
    }
    
  return (
    <ImageBackground
      source={require("@/assets/images/card.png")}
      resizeMode='stretch'
      style={styles.bgImage}
    >
      <View style={styles.container}>
        {/* Total Balance */}
        <View style={styles.totalBalanceRow}>
          <Typo size={17} color={colors.neutral800} fontWeight={'500'}>
            Total Balance
          </Typo>
          <Icons.DotsThreeOutline
            size={verticalScale(22)}
            color={colors.black}
            weight='fill'
          />
        </View>
        <Typo size={30} color={colors.black} fontWeight={"bold"}>
          ${walletLoading ? "----" : getTotals()?.Balance?.toFixed(2)}
        </Typo>

        {/* Total Expense and Income */}
        <View style={styles.stats}>
          {/* Income */}
          <View style={{gap: verticalScale(5)}}>
           <View style={styles.incomeExpense}>
             <View style={styles.statsIcon}>
              <Icons.ArrowDown
              size={verticalScale(15)}
              color={colors.black}
              weight='bold'
              />
             </View>
             <Typo size={16} color={colors.neutral700} fontWeight={'500'}>
              Income
             </Typo>
           </View>
           <View style={{alignItems: 'center'}}>
            <Typo size={17} color={colors.green} fontWeight={'600'}>
              ${walletLoading ? "----" : getTotals()?.Income?.toFixed(2)}
            </Typo>
           </View>
          </View>
          {/* Expense */}
          <View style={{gap: verticalScale(5)}}>
           <View style={styles.incomeExpense}>
             <View style={styles.statsIcon}>
              <Icons.ArrowUp
              size={verticalScale(15)}
              color={colors.black}
              weight='bold'
              />
             </View>
             <Typo size={16} color={colors.neutral700} fontWeight={'500'}>
              Expense
             </Typo>
           </View>
           <View style={{alignItems: 'center'}}>
            <Typo size={17} color={colors.rose} fontWeight={'600'}>
              ${walletLoading ? "----" : getTotals()?.Expenses?.toFixed(2)}
            </Typo>
           </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

export default HomeCard

const styles = StyleSheet.create({
  bgImage:{
    height: scale(210),
    width: "100%",
  },
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: '87%',
    width: '100%',
    justifyContent: 'space-between',
  },
  totalBalanceRow:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._5,
  },
  stats:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsIcon:{
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },
  incomeExpense:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingY._7,
  },
})
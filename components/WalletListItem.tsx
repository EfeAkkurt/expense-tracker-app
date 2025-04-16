import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { verticalScale } from '@/utils/styling'
import { colors, radius, spacingX } from '@/constants/theme'
import { WalletType } from '@/types'
import { Router } from 'expo-router'
import { Image } from 'expo-image'
import Typo from './typo'
import * as Icons from 'phosphor-react-native'

const WalletListItem = ({
    item,
    index,
    router,
}:{
    item: WalletType
    index: number
    router: Router
}) => {
  return (
    <View>
      <TouchableOpacity style={styles.container}>
        <View style={styles.imageContainer}>
            <Image
            style={{flex: 1}}
            source={item?.image}
            contentFit='cover'
            transition={100}
            />
        </View>
        <View style={styles.nameContainer}>
            <Typo size={16}>
                {item?.name}
            </Typo>
            <Typo size={14} color={colors.neutral400}>
                {item?.amount}
            </Typo>
        </View>

        <Icons.CaretRight size={verticalScale(20)} color={colors.white}  weight='bold'/>
        </TouchableOpacity>
    </View>
  )
}

export default WalletListItem

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(17),
    },
    imageContainer: {
        height: verticalScale(40),
        width: verticalScale(40),
        borderWidth: 1,
        borderColor: colors.neutral600,
        borderRadius: radius._12,
        borderCurve: "continuous",
        overflow: "hidden",
    },
    nameContainer: {
        flex: 1,
        gap: 2,
        marginLeft: spacingX._10,
    },
})
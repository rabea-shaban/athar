import React from "react";
import { View, StyleSheet } from "react-native";

interface IslamicDividerProps {
  color?: string;
}

/**
 * Authentic Classical Islamic Geometric Divider (فاصل زخرفي إسلامي)
 * Features side lines, diamond accents, and a central Islamic 8-pointed star (ربع الحزب).
 */
export const IslamicDivider: React.FC<IslamicDividerProps> = ({
  color = "#C9A227",
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: color, opacity: 0.35 }]} />
      <View style={[styles.diamond, { backgroundColor: color }]} />
      <View style={styles.starWrapper}>
        <View style={[styles.starSquare, { backgroundColor: color }]} />
        <View
          style={[
            styles.starSquare,
            { backgroundColor: color, transform: [{ rotate: "45deg" }] },
          ]}
        />
        <View style={styles.starCenterHole} />
      </View>
      <View style={[styles.diamond, { backgroundColor: color }]} />
      <View style={[styles.line, { backgroundColor: color, opacity: 0.35 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  line: {
    width: 32,
    height: 1,
  },
  diamond: {
    width: 5,
    height: 5,
    transform: [{ rotate: "45deg" }],
    borderRadius: 0.5,
  },
  starWrapper: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  starSquare: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 1,
  },
  starCenterHole: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#ffffff",
    zIndex: 2,
  },
});

export default IslamicDivider;

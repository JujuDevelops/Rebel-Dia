import { P5_RED, useFont, useTheme, useThemeSet } from "@/theme";
import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextProps,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import Icon from "./Icon";

export function Txt({
  style,
  mu,
  title,
  ...p
}: TextProps & { mu?: boolean; title?: boolean }) {
  const c = useTheme(),
    font = useFont(title);
  return (
    <Text
      {...p}
      style={[{ color: mu ? c.mu : c.tx, fontSize: 16 }, style, font]}
    />
  );
}
export const Label = ({ children }: { children: React.ReactNode }) => (
  <Txt mu style={{ fontSize: 13 }}>
    {children}
  </Txt>
);

// Texto com contorno externo (o "stroke" do Figma), só no tema Persona 5; nos outros é um texto comum.
// O React Native não tem contorno de texto: o texto é desenhado várias vezes, deslocado em círculo
// (raio = espessura) na cor do contorno, e o texto de verdade fica por cima. A espessura é a do traço
// que aparece para fora das letras.
export function StrokeTxt({
  children,
  style,
  strokeWidth,
  strokeColor,
  title,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
  strokeWidth: number;
  strokeColor: string;
  title?: boolean;
}) {
  const p5 = useThemeSet() === "persona5";
  if (!p5)
    return (
      <Txt title={title} style={style}>
        {children}
      </Txt>
    );
  const n = Math.max(12, Math.min(36, Math.round(strokeWidth * 4))),
    pad = Math.ceil(strokeWidth / 3);
  return (
    <View style={{ alignSelf: "flex-start", paddingVertical: pad }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (2 * Math.PI * i) / n;
        return (
          <Txt
            key={i}
            title={title}
            numberOfLines={1}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={[
              style,
              {
                color: strokeColor,
                position: "absolute",
                left: 0,
                top: pad,
                transform: [
                  { translateX: strokeWidth * Math.cos(a) },
                  { translateY: strokeWidth * Math.sin(a) },
                ],
              },
            ]}
          >
            {children}
          </Txt>
        );
      })}
      <Txt title={title} numberOfLines={1} style={style}>
        {children}
      </Txt>
    </View>
  );
}

function SheetInner({
  onClose,
  lock,
  children,
}: {
  onClose: () => void;
  lock?: boolean;
  children?: React.ReactNode;
}) {
  const c = useTheme(),
    { bottom } = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, justifyContent: "flex-end" }}
    >
      {/* fundo escuro: um Pressable irmão (e não pai) da gaveta, para só ele fechar o modal */}
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,.5)" }]}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: c.card,
          width: "100%",
          maxWidth: 520,
          alignSelf: "center",
          maxHeight: "92%",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
      >
        <ScrollView
          scrollEnabled={!lock}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={{
            padding: 18,
            paddingBottom: 18 + bottom,
            gap: 14,
          }}
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// O Modal é uma janela separada no Android: ele precisa do próprio SafeAreaProvider para medir
// as barras do sistema e de navigationBarTranslucent para o layout edge-to-edge bater com o resto.
export function Sheet({
  visible,
  onClose,
  lock,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  lock?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <SafeAreaProvider>
        <SheetInner onClose={onClose} lock={lock}>{children}</SheetInner>
      </SafeAreaProvider>
    </Modal>
  );
}

export function Chip({
  label,
  on,
  off,
  onRed,
  onPress,
  style,
}: {
  label: string;
  on?: boolean;
  off?: boolean;
  onRed?: boolean; // usado sobre fundo vermelho (cartão "Caminhos do dia" no Persona 5)
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: 7,
          paddingHorizontal: 14,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: onRed
            ? on
              ? "#fff"
              : "rgba(255,255,255,0.65)"
            : on
              ? c.ac
              : c.ln,
          backgroundColor: onRed ? (on ? "#fff" : "transparent") : on ? c.ac : "transparent",
          opacity: off && !on ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Txt
        style={{
          fontSize: 14,
          color: onRed ? (on ? P5_RED : "#fff") : on ? c.ak : c.tx,
        }}
      >
        {label}
      </Txt>
    </Pressable>
  );
}

export function Btn({
  label,
  onPress,
  kind,
}: {
  label: string;
  onPress: () => void;
  kind?: "sv" | "dl";
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: 11,
          paddingHorizontal: 18,
          borderRadius: 14,
          borderWidth: 1,
          borderColor:
            kind === "sv" ? c.ac : kind === "dl" ? "transparent" : c.ln,
          backgroundColor: kind === "sv" ? c.ac : "transparent",
        },
        kind === "dl" && { marginRight: "auto" },
      ]}
    >
      <Txt
        style={{ color: kind === "sv" ? c.ak : kind === "dl" ? c.dg : c.tx }}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
export const Actions = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      flexDirection: "row",
      gap: 10,
      justifyContent: "flex-end",
      alignItems: "center",
    }}
  >
    {children}
  </View>
);

export function Field({
  style,
  ...p
}: TextInputProps & { style?: StyleProp<TextStyle> }) {
  const c = useTheme(),
    font = useFont();
  return (
    <TextInput
      placeholderTextColor={c.mu}
      {...p}
      style={[
        {
          fontSize: 16,
          paddingVertical: 11,
          paddingHorizontal: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.ln,
          backgroundColor: c.bg,
          color: c.tx,
        },
        style,
        font,
      ]}
    />
  );
}

export function Check({
  on,
  onPress,
  size = 24,
  round,
}: {
  on?: boolean;
  onPress?: () => void;
  size?: number;
  round?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: size,
        height: size,
        borderRadius: round ? size / 2 : 6,
        borderWidth: 2,
        borderColor: on ? c.ac : c.mu,
        backgroundColor: on ? c.ac : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {on ? <Icon name="check" size={size * 0.7} color={c.ak} /> : null}
    </Pressable>
  );
}

export function SubList({
  list,
  setList,
  onToggle,
}: {
  list: { id: string; t: string; d?: boolean }[];
  setList: (l: { id: string; t: string; d?: boolean }[]) => void;
  onToggle?: (i: number, v: boolean) => void;
}) {
  const c = useTheme();
  return (
    <>
      <Label>Subtarefas</Label>
      {list.map((u, i) => (
        <View
          key={u.id}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Check
            on={!!u.d}
            onPress={() => {
              setList(list.map((z, j) => (j === i ? { ...z, d: !z.d } : z)));
              onToggle?.(i, !u.d);
            }}
          />
          <Field
            style={{ flex: 1 }}
            value={u.t}
            maxLength={60}
            placeholder="Subtarefa"
            onChangeText={(t) =>
              setList(list.map((z, j) => (j === i ? { ...z, t } : z)))
            }
          />
          <Pressable
            onPress={() => setList(list.filter((_, j) => j !== i))}
            hitSlop={8}
          >
            <Icon name="close" size={18} color={c.mu} />
          </Pressable>
        </View>
      ))}
      <View style={{ alignItems: "flex-start" }}>
        <Chip
          label="+ Subtarefa"
          onPress={() =>
            setList([
              ...list,
              { id: "u" + Date.now() + list.length, t: "", d: false },
            ])
          }
        />
      </View>
    </>
  );
}

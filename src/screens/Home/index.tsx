import Icon from "@/components/Icon";
import Timeline from "@/components/timeline/Timeline";
import { Chip, StrokeTxt, Txt } from "@/components/ui";
import { useSwipe } from "@/hooks/useSwipe";
import useWeather from "@/hooks/useWeather";
import { useApp } from "@/store/RotinaProvider";
import { P5_RED, useTheme, useThemeSet } from "@/theme";
import { MN, PER, WDL, WDN, cap, dk, fromKey, pocc, vis } from "@/utils/rotina";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const Ring = memo(function Ring({
  p,
  sel,
  n,
}: {
  p: number;
  sel: boolean;
  n: number;
}) {
  const c = useTheme(),
    set = useThemeSet(),
    S = 42,
    t = 3.5,
    r = (S - t) / 2,
    L = 2 * Math.PI * r;
  return (
    <View
      style={{
        width: S,
        height: S,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* o tema Persona 5 não mostra o círculo de progresso */}
      {set !== "persona5" && (
        <Svg width={S} height={S} style={{ position: "absolute" }}>
          <Circle
            cx={S / 2}
            cy={S / 2}
            r={r}
            stroke={c.ln}
            strokeWidth={t}
            fill="none"
          />
          {p > 0 && (
            <Circle
              cx={S / 2}
              cy={S / 2}
              r={r}
              stroke={c.cy}
              strokeWidth={t}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${L * Math.min(p, 1)} ${L}`}
              rotation={-90}
              origin={`${S / 2}, ${S / 2}`}
            />
          )}
        </Svg>
      )}
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: sel ? c.ac : c.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Txt style={{ fontSize: 14, color: sel ? c.ak : c.tx }}>{n}</Txt>
      </View>
    </View>
  );
});

export default function Home() {
  const A = useApp(),
    c = useTheme(),
    wx = useWeather(),
    sv = useRef<ScrollView>(null),
    p5 = useThemeSet() === "persona5"; // no Persona 5 o cartão "Caminhos do dia" é vermelho
  const [open, setOpen] = useState(true);
  const pos = useRef({ y: -1, n: -1, done: false });
  useEffect(() => {
    AsyncStorage.getItem("rotina:pt")
      .then((v) => {
        if (v === "0") setOpen(false);
      })
      .catch(() => {});
  }, []);
  const tryScroll = () => {
    const p = pos.current;
    if (!p.done && p.y >= 0 && p.n >= 0) {
      p.done = true;
      sv.current?.scrollTo({
        y: Math.max(0, p.y + p.n - 220),
        animated: false,
      });
    }
  };
  const k = A.sel,
    d = fromKey(k),
    td = dk(new Date());
  const base = new Date(d);
  // primeiro dia da semana exibida, conforme o início escolhido (domingo ou segunda)
  base.setDate(base.getDate() - ((base.getDay() - A.settings.weekStart + 7) % 7));
  const pcts = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const x = new Date(base);
        x.setDate(base.getDate() + i);
        const kk = dk(x),
          day = A.days[kk] ?? { c: {}, d: {} },
          v = vis(A.tasks, A.PA, day, kk);
        return v.length ? v.filter((t) => day.d[t.id]).length / v.length : 0;
      }),
    [A.tasks, A.PA, A.days, k, A.settings.weekStart],
  );
  const shiftDays = (n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    A.setSel(dk(x));
  };
  const week = useSwipe((dir) => shiftDays(7 * dir)),
    day = useSwipe((dir) => shiftDays(dir));
  const an = PER.map(
    ([pk]) => A.PA.find((q) => q.id === A.act(pk, k))?.n,
  ).filter(Boolean) as string[];
  const toggle = () => {
    setOpen(!open);
    AsyncStorage.setItem("rotina:pt", open ? "0" : "1").catch(() => {});
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={sv}
        contentContainerStyle={{
          padding: 14,
          paddingTop: 18,
          paddingBottom: 110,
          flexGrow: 1,
          maxWidth: 520,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View>
            <Txt style={{ fontSize: 34, fontWeight: "800", letterSpacing: -1 }}>
              {k === td ? "Hoje" : cap(WDN[d.getDay()])}
            </Txt>
            <Pressable
              onPress={() => A.openCal({ value: k, onPick: A.setSel })}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Txt mu style={{ fontSize: 15 }}>
                  {d.getDate()} de {MN[d.getMonth()]} de {d.getFullYear()}
                </Txt>
                <Icon name="chevron-down" size={18} color={c.mu} />
              </View>
            </Pressable>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <View
              style={{
                backgroundColor: c.card,
                borderRadius: 16,
                paddingVertical: 6,
                paddingHorizontal: 12,
              }}
            >
              {wx ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Icon name={wx.e} size={18} />
                  <Txt style={{ fontSize: 15, fontWeight: "600" }}>{wx.t}°</Txt>
                </View>
              ) : wx === false ? (
                <Icon name="weather-cloudy-alert" size={18} color={c.mu} />
              ) : (
                <Txt mu style={{ fontSize: 15 }}>
                  …
                </Txt>
              )}
            </View>
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={() => week.go(-1)} hitSlop={6}>
                <View style={{ paddingHorizontal: 6 }}>
                  <Icon name="chevron-left" size={26} color={c.mu} />
                </View>
              </Pressable>
              <Pressable onPress={() => week.go(1)} hitSlop={6}>
                <View style={{ paddingHorizontal: 6 }}>
                  <Icon name="chevron-right" size={26} color={c.mu} />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
        <Animated.View
          {...week.pan.panHandlers}
          style={[
            { flexDirection: "row", marginTop: 18, marginBottom: 14 },
            week.style,
          ]}
        >
          {Array.from({ length: 7 }, (_, i) => {
            const x = new Date(base);
            x.setDate(base.getDate() + i);
            const kk = dk(x),
              on = kk === k;
            return (
              <Pressable
                key={kk}
                onPress={() => A.setSel(kk)}
                style={{ flex: 1, alignItems: "center", gap: 6 }}
              >
                <Txt
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: on ? c.tx : c.mu,
                  }}
                >
                  {WDL[(A.settings.weekStart + i) % 7]}
                </Txt>
                <Ring p={pcts[i]} sel={on} n={x.getDate()} />
              </Pressable>
            );
          })}
        </Animated.View>
        <View
          style={{
            backgroundColor: p5 ? P5_RED : c.card,
            borderRadius: 20,
            padding: 16,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={toggle}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View style={{ flex: 1 }}>
              <StrokeTxt
                title
                strokeWidth={3}
                strokeColor="#000"
                style={p5 ? { fontWeight: "600", color: "#fff" } : { fontWeight: "600" }}
              >
                Caminhos do dia
              </StrokeTxt>
              {!!an.length && (
                <Txt
                  mu
                  style={[
                    { fontSize: 13, marginTop: 2 },
                    p5 && { color: "rgba(255,255,255,0.85)" },
                  ]}
                >
                  {an.join(" · ")}
                </Txt>
              )}
            </View>
            <Chip
              label="Editar"
              onRed={p5}
              onPress={() => A.setPathsOpen(true)}
            />
            <View
              style={{
                marginLeft: 12,
                transform: [{ rotate: open ? "0deg" : "-90deg" }],
              }}
            >
              <Icon name="chevron-down" size={22} color={p5 ? "#fff" : c.mu} />
            </View>
          </Pressable>
          {open && (
            <View>
              {PER.map(([pk, nm]) => {
                const ps = A.PA.filter((q) => q.per === pk && pocc(q, k));
                if (!ps.length) return null;
                return (
                  <View
                    key={pk}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Txt
                      mu
                      style={[
                        { fontSize: 14, width: 52, fontWeight: "600" },
                        p5 && { color: "rgba(255,255,255,0.85)" },
                      ]}
                    >
                      {nm}
                    </Txt>
                    {ps.map((q) => {
                      const on = A.act(pk, k) === q.id;
                      return (
                        <Chip
                          key={q.id}
                          label={q.n}
                          on={on}
                          onRed={p5}
                          onPress={() =>
                            A.upDay(k, (s) => {
                              s.c[pk] = on ? "" : q.id;
                            })
                          }
                        />
                      );
                    })}
                  </View>
                );
              })}
              {!an.length && !A.PA.length && (
                <Txt
                  mu
                  style={[
                    { fontSize: 15, marginTop: 8 },
                    p5 && { color: "rgba(255,255,255,0.85)" },
                  ]}
                >
                  Nenhum caminho para este dia.
                </Txt>
              )}
            </View>
          )}
        </View>
        <Animated.View
          {...day.pan.panHandlers}
          // ocupa o resto da tela: dá para deslizar para trocar de dia em qualquer ponto da lista
          style={[{ flexGrow: 1, minHeight: 320 }, day.style]}
          onLayout={(e) => {
            pos.current.y = e.nativeEvent.layout.y;
            tryScroll();
          }}
        >
          <Timeline
            k={k}
            onNowTop={(n) => {
              pos.current.n = n;
              tryScroll();
            }}
          />
        </Animated.View>
      </ScrollView>
      <Pressable
        onPress={() => A.openForm()}
        style={{
          position: "absolute",
          alignSelf: "center",
          bottom: 16,
          backgroundColor: c.ac,
          borderRadius: 30,
          paddingVertical: 15,
          paddingHorizontal: 26,
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Txt style={{ color: c.ak, fontWeight: "600" }}>+ Nova tarefa</Txt>
      </Pressable>
    </View>
  );
}

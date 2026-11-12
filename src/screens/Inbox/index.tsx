import Icon from "@/components/Icon";
import { Check, StrokeTxt, Txt } from "@/components/ui";
import { useApp } from "@/store/RotinaProvider";
import { P5_RED, useTheme } from "@/theme";
import { reorderPending, type Inb } from "@/utils/rotina";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReorderableList, {
  useReorderableDrag,
} from "react-native-reorderable-list";

// Cartão da tarefa. Nas pendentes, onLongPress inicia o arrasto para reordenar.
function InboxRow({ x, onLongPress }: { x: Inb; onLongPress?: () => void }) {
  const A = useApp(),
    c = useTheme();
  return (
    <View style={{ paddingBottom: 8 }}>
      <Pressable
        onPress={() => A.setView({ id: x.id, kind: "i" })}
        onLongPress={onLongPress}
        delayLongPress={300}
        style={{
          flexDirection: "row",
          gap: 14,
          alignItems: "center",
          backgroundColor: c.card,
          borderRadius: 18,
          padding: 14,
          paddingHorizontal: 16,
        }}
      >
        <Check
          round
          size={28}
          on={x.d}
          onPress={() =>
            A.setIB((p) =>
              p.map((z) => (z.id === x.id ? { ...z, d: !z.d } : z)),
            )
          }
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt
            mu={x.d}
            style={{
              fontWeight: "600",
              textDecorationLine: x.d ? "line-through" : "none",
            }}
          >
            {x.t}
          </Txt>
          {!!x.u?.length && (
            <Txt mu style={{ fontSize: 13 }}>
              {x.u.filter((w) => w.d).length}/{x.u.length} subtarefas
            </Txt>
          )}
        </View>
      </Pressable>
    </View>
  );
}

// useReorderableDrag só funciona dentro de um item da lista: por isso este componente à parte
function PendingRow({ x }: { x: Inb }) {
  const drag = useReorderableDrag();
  return <InboxRow x={x} onLongPress={drag} />;
}

export default function Inbox() {
  const A = useApp(),
    c = useTheme();
  const pend = A.IB.filter((x) => !x.d),
    done = A.IB.filter((x) => x.d);
  const [showDone, setShowDone] = useState(true);

  const header = (
    <View style={{ marginBottom: 18 }}>
      <StrokeTxt
        title
        strokeWidth={9}
        strokeColor={P5_RED}
        style={{ fontSize: 34, fontWeight: "800", letterSpacing: -1 }}
      >
        Inbox
      </StrokeTxt>
      <Txt mu style={{ fontSize: 15, marginTop: 2 }}>
        {pend.length
          ? pend.length + (pend.length === 1 ? " tarefa" : " tarefas")
          : "Nada pendente"}
      </Txt>
      {pend.length > 1 && (
        <Txt mu style={{ fontSize: 12, marginTop: 2, opacity: 0.8 }}>
          Segure uma tarefa e arraste para reordenar
        </Txt>
      )}
    </View>
  );

  const completed = !!done.length && (
    <View style={{ marginTop: pend.length ? 14 : 0 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Pressable
          onPress={() => setShowDone(!showDone)}
          hitSlop={8}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <Icon
            name={showDone ? "chevron-down" : "chevron-right"}
            size={20}
            color={c.mu}
          />
          <Txt title mu style={{ fontSize: 15, fontWeight: "600" }}>
            Concluídas · {done.length}
          </Txt>
        </Pressable>
        <Pressable
          onPress={() => A.setIB((p) => p.filter((x) => !x.d))}
          style={{
            borderWidth: 1,
            borderColor: c.ln,
            borderRadius: 16,
            paddingVertical: 5,
            paddingHorizontal: 12,
          }}
        >
          <Txt mu style={{ fontSize: 13 }}>
            Limpar
          </Txt>
        </Pressable>
      </View>
      {showDone && done.map((x) => <InboxRow key={x.id} x={x} />)}
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReorderableList
        data={pend}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => <PendingRow x={item} />}
        onReorder={({ from, to }) =>
          A.setIB((prev) => reorderPending(prev, from, to))
        }
        ListHeaderComponent={header}
        ListEmptyComponent={
          A.IB.length ? null : (
            <Txt mu style={{ textAlign: "center", paddingVertical: 50 }}>
              Nada por aqui. Anote algo sem pressa.
            </Txt>
          )
        }
        ListFooterComponent={completed || null}
        contentContainerStyle={{
          padding: 14,
          paddingTop: 18,
          paddingBottom: 110,
          maxWidth: 520,
          width: "100%",
          alignSelf: "center",
        }}
      />
      <Pressable
        onPress={() => A.setIbEdit("new")}
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
    </GestureHandlerRootView>
  );
}

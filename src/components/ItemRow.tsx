import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Checkbox } from '@/components/ui/checkbox';
import { UndoRing } from '@/components/UndoRing';
import type { ShoppingItem } from '@/schemas';
import { useTheme } from '@/theme';

type Props = {
  item: ShoppingItem;
  pending: boolean;
  removalDelayMs: number;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUndoRemove: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
};

export const ItemRow = ({
  item,
  pending,
  removalDelayMs,
  onToggle,
  onRemove,
  onUndoRemove,
  onUpdate,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const swipeableRef = useRef<SwipeableMethods>(null);
  const { danger, separator } = useTheme();

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed) onUpdate(item.id, trimmed);
    setEditing(false);
  };

  if (pending) {
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
        <Pressable
          className="flex-row items-center bg-surface rounded-xl min-h-14 pl-3 pr-4"
          onPress={() => onUndoRemove(item.id)}
        >
          <View pointerEvents="none" className="mr-3">
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => {}}
              checkedClassName="border-primary"
              indicatorClassName="bg-primary"
              iconClassName="text-primary-foreground"
            />
          </View>
          <Text className="flex-1 text-base text-muted-foreground line-through">{item.name}</Text>
          <View className="flex-row items-center gap-1.5 ml-2">
            <UndoRing durationMs={removalDelayMs} color={danger} trackColor={separator} />
            <Text className="text-danger text-[13px] font-semibold">Undo</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (editing) {
    return (
      <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
        <View className="flex-row items-center bg-surface rounded-xl min-h-14 pl-3 pr-3">
          <View pointerEvents="none" className="mr-3">
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => {}}
              checkedClassName="border-primary"
              indicatorClassName="bg-primary"
              iconClassName="text-primary-foreground"
            />
          </View>
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={commitEdit}
            onBlur={commitEdit}
            returnKeyType="done"
            className="flex-1 text-base text-foreground py-2.5"
          />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
      <Swipeable
        ref={swipeableRef}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={() => (
          <Pressable
            className="bg-edit items-center justify-center w-20 rounded-xl mr-2 active:opacity-75"
            onPress={() => {
              swipeableRef.current?.close();
              setDraft(item.name);
              setEditing(true);
            }}
          >
            <Text className="text-edit-foreground text-[13px] font-semibold">Edit</Text>
          </Pressable>
        )}
        renderRightActions={() => (
          <Pressable
            className="bg-danger items-center justify-center w-20 rounded-xl ml-2 active:opacity-75"
            onPress={() => {
              swipeableRef.current?.close();
              onRemove(item.id);
            }}
          >
            <Text className="text-white text-[13px] font-semibold">Delete</Text>
          </Pressable>
        )}
      >
        <Pressable
          className="flex-row items-center bg-surface rounded-xl min-h-14 pl-3 pr-3"
          onPress={() => onToggle(item.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.checked }}
        >
          <View pointerEvents="none" className="mr-3">
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => {}}
              checkedClassName="border-primary"
              indicatorClassName="bg-primary"
              iconClassName="text-primary-foreground"
            />
          </View>
          <Text
            className={
              item.checked
                ? 'text-base text-muted-foreground line-through flex-1'
                : 'text-base text-foreground flex-1'
            }
          >
            {item.name}
          </Text>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

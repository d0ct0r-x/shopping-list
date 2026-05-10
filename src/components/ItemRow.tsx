import { Pressable, Text, View } from 'react-native';

import type { ShoppingItem } from '@/schemas';

type Props = {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export const ItemRow = ({ item, onToggle, onRemove }: Props) => (
  <View className="flex-row items-center bg-surface rounded-xl min-h-14 pl-3">
    <Pressable
      className="flex-1 flex-row items-center py-2.5"
      onPress={() => onToggle(item.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.checked }}
    >
      <View
        className={
          item.checked
            ? 'w-6 h-6 rounded-md border-2 border-primary bg-primary items-center justify-center mr-3'
            : 'w-6 h-6 rounded-md border-2 border-primary items-center justify-center mr-3'
        }
      >
        {item.checked && (
          <Text className="text-white text-sm font-bold leading-4">✓</Text>
        )}
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
    <Pressable
      className="w-11 h-14 items-center justify-center active:opacity-50"
      onPress={() => onRemove(item.id)}
      accessibilityLabel={`Remove ${item.name}`}
    >
      <Text className="text-[22px] text-danger leading-6">×</Text>
    </Pressable>
  </View>
);

import { Pressable, Text, View } from 'react-native';

import { Checkbox } from '@/components/ui/checkbox';
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
    <Pressable
      className="w-11 h-14 items-center justify-center active:opacity-50"
      onPress={() => onRemove(item.id)}
      accessibilityLabel={`Remove ${item.name}`}
    >
      <Text className="text-[22px] text-danger leading-6">×</Text>
    </Pressable>
  </View>
);

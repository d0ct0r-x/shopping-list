import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/theme';

type Props = {
  onAdd: (name: string) => void;
};

export const AddItemBar = ({ onAdd }: Props) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { mutedForeground } = useTheme();

  const submit = () => {
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <View className="bg-background px-4 pb-4 pt-2">
      <View className="flex-row items-center rounded-xl bg-surface px-3 py-1 shadow-sm">
        <TextInput
          ref={inputRef}
          className="flex-1 py-2.5 text-base text-foreground"
          value={text}
          onChangeText={setText}
          placeholder="Add item"
          placeholderTextColor={mutedForeground}
          returnKeyType="done"
          onSubmitEditing={submit}
          blurOnSubmit={false}
        />
        <Pressable
          testID="add-button"
          accessibilityLabel="Add"
          className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-primary active:opacity-75"
          onPress={submit}
        >
          <Icon as={Plus} size={18} className="text-white" />
        </Pressable>
      </View>
    </View>
  );
};

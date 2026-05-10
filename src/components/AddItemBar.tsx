import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

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
    <View className="flex-row items-center mx-4 mb-3 bg-surface rounded-xl px-3 py-1 shadow-sm">
      <TextInput
        ref={inputRef}
        className="flex-1 text-base text-foreground py-2.5"
        value={text}
        onChangeText={setText}
        placeholder="Add an item…"
        placeholderTextColor={mutedForeground}
        returnKeyType="done"
        onSubmitEditing={submit}
        blurOnSubmit={false}
      />
      <Pressable
        className="bg-primary rounded-lg px-4 py-2 ml-2 active:opacity-75"
        onPress={submit}
      >
        <Text className="text-white text-[15px] font-semibold">Add</Text>
      </Pressable>
    </View>
  );
};

import * as React from 'react';
import { Text as RNText } from 'react-native';

import { cn } from '@/lib/utils';

export const TextClassContext = React.createContext<string | undefined>(undefined);

export const Text = ({ className, ...props }: React.ComponentProps<typeof RNText>) => (
  <RNText className={cn('text-foreground', className)} {...props} />
);

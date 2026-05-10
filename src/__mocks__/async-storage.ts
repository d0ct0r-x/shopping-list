const store: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => store[key] ?? null,
  setItem: async (key: string, value: string): Promise<void> => {
    store[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete store[key];
  },
  clear: async (): Promise<void> => {
    for (const key of Object.keys(store)) delete store[key];
  },
};

export default AsyncStorage;

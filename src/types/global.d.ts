export {}

declare global {
  interface Window {
    isElectron?: boolean;
    screenShare?: {
      getSource: () => Promise<{
        windowSources: {
          id: string;
          name: string;
          icon: string;
        }[];
        screenSources: {
          id: string;
          name: string;
          icon: string;
        }[];
      }>;
      getStream: (sourceId: string) => Promise<MediaStream>
    }
    
  }
}
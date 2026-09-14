declare module '@xenova/transformers' {
  export const env: {
    allowLocalModels?: boolean;
    allowRemoteModels?: boolean;
  };

  export function pipeline(
    task: string,
    model?: string,
    options?: Record<string, unknown>
  ): Promise<(input: string, options?: Record<string, unknown>) => Promise<unknown>>;
}

// Bentuk action Redux dan thunk yang dipakai di seluruh fitur.
export type AppAction<T = unknown> = { type: string; payload: T };

// Thunk sederhana: menerima fungsi dispatch lalu mengirim action ketika proses selesai.
export type AppThunk = (dispatch: (action: AppAction) => unknown) => Promise<void>;

export type QueryParams = Record<string, string | number | boolean | null | undefined>;
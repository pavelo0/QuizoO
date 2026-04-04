import { createSlice } from '@reduxjs/toolkit';

/** Заготовка под пользователя / сессию; дополни state и reducers по мере внедрения auth. */
type UserState = Record<string, never>;

const initialState: UserState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
});

export default userSlice.reducer;

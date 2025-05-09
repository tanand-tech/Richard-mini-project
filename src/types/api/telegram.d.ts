import type { Controller } from '~/api';
import type * as Telegram from '~/telegram';

export type Refresh = Controller<'/'>;

export type Message = Controller<'/', Telegram.Message, Telegram.Forward>;

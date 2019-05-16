import { ChangeSensitivityStrategy } from './change-sensitivity-strategy';

export interface OnPropertyChangeConfig {
    propNames: string[];
    keepHistory?: boolean;
    changeSensitivity: ChangeSensitivityStrategy;
}

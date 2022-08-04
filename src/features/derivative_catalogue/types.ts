import {DerivativeInfo} from '../../services/series/types';

export interface DerivativeNameIndex {
    [derivative_name: string]: DerivativeInfo
}

export interface DerivativeIndex {
    [platform_source: string]: {
        [platform_code: string]: DerivativeNameIndex
    }
}

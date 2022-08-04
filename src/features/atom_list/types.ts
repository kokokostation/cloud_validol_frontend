import {Column as ApiColumn, Dataset as ApiDataset} from '../../services/atoms/types';

export type Dataset = Omit<ApiDataset, 'columns'> & {
    columns: {
        [name: string]: ApiColumn
    }
}

export interface DatasetIndex {
    [superset_id: string]: Dataset
}